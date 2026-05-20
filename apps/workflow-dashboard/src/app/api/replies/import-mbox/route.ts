import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { db } from '@/lib/db/prisma';
import crypto from 'crypto';

type ParsedMessage = {
  message_id: string | null;
  in_reply_to: string | null;
  references: string | null;
  subject: string | null;
  from_email: string | null;
  to_emails: string[];
  cc_emails: string[];
  date: string | null;
  body_text: string;
  body_html: string | null;
};

function runPythonParse(params: {
  mboxPath: string;
  filterEmail?: string;
  limit?: number;
}): Promise<{ count: number; messages: ParsedMessage[] }> {
  return new Promise((resolve, reject) => {
    const args = [
      'scripts/parse_mbox.py',
      '--mbox',
      params.mboxPath,
      '--limit',
      String(params.limit ?? 5000),
    ];
    if (params.filterEmail) {
      args.push('--filter-email', params.filterEmail);
    }

    const proc = spawn('python3', args, {
      cwd: process.cwd(),
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('error', (err) => reject(err));
    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`parse_mbox.py failed (code ${code}): ${stderr}`));
      }
      try {
        const json = JSON.parse(stdout);
        resolve(json);
      } catch (e) {
        reject(new Error(`Failed to parse parser output: ${stderr || String(e)}`));
      }
    });
  });
}

function clampText(text: string, max = 50_000) {
  if (text.length <= max) return text;
  return text.slice(0, max) + '\n\n[TRUNCATED]';
}

function hashId(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 32);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const mboxPath = typeof body?.mboxPath === 'string' ? body.mboxPath : '';
    const correspondentEmail = typeof body?.correspondentEmail === 'string' ? body.correspondentEmail.trim().toLowerCase() : '';
    const contactKind = typeof body?.contactKind === 'string' ? body.contactKind : 'CLIENT';
    const limit = typeof body?.limit === 'number' ? Math.max(1, Math.min(20_000, body.limit)) : 5000;

    if (!mboxPath) {
      return NextResponse.json({ success: false, error: 'mboxPath is required' }, { status: 400 });
    }
    if (!correspondentEmail) {
      return NextResponse.json(
        { success: false, error: 'correspondentEmail is required (e.g. graciethompson971@gmail.com)' },
        { status: 400 }
      );
    }

    const parsed = await runPythonParse({ mboxPath, filterEmail: correspondentEmail, limit });
    const messages = parsed.messages || [];

    // Upsert contact
    await db.contact.upsert({
      where: { email: correspondentEmail },
      create: { email: correspondentEmail, kind: contactKind },
      update: { kind: contactKind },
    });

    const providerConversationId = `mbox:${correspondentEmail}`;

    // Determine mailboxEmail (most common other participant email)
    const mailboxCounts = new Map<string, number>();
    for (const m of messages) {
      const isInbound = (m.from_email || '') === correspondentEmail;
      const others = isInbound ? m.to_emails : [m.from_email || '', ...m.to_emails];
      for (const e of others) {
        const email = (e || '').toLowerCase().trim();
        if (!email || email === correspondentEmail) continue;
        mailboxCounts.set(email, (mailboxCounts.get(email) || 0) + 1);
      }
    }
    const mailboxEmail =
      [...mailboxCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || undefined;

    const conversation = await db.instantlyConversation.upsert({
      where: { providerConversationId },
      create: {
        providerConversationId,
        campaignName: 'Imported (mbox)',
        mailboxEmail,
        leadEmail: correspondentEmail,
        leadName: body?.leadName && typeof body.leadName === 'string' ? body.leadName : undefined,
        lastMessageAt: new Date(0),
      },
      update: {
        mailboxEmail,
        leadName: body?.leadName && typeof body.leadName === 'string' ? body.leadName : undefined,
      },
    });

    let appendedMessages = 0;
    let latestMessageAt = conversation.lastMessageAt;
    let latestInboundAt: Date | null = conversation.lastInboundAt ?? null;

    // Insert messages
    for (const m of messages) {
      const from = (m.from_email || '').toLowerCase().trim() || null;
      const direction = from === correspondentEmail ? 'INBOUND' : 'OUTBOUND';
      const to = direction === 'INBOUND' ? mailboxEmail || (m.to_emails[0] || null) : correspondentEmail;

      const receivedAt = m.date ? new Date(m.date) : new Date();
      const providerMessageId = m.message_id ? `mbox:${m.message_id}` : `mbox:${hashId(`${from}|${m.subject || ''}|${receivedAt.toISOString()}`)}`;

      const exists = await db.instantlyMessage.findUnique({
        where: { providerMessageId },
        select: { id: true },
      });
      if (exists) continue;

      await db.instantlyMessage.create({
        data: {
          conversationId: conversation.id,
          providerMessageId,
          providerServerMessageId: m.message_id,
          direction,
          fromEmail: from,
          toEmail: to,
          subject: m.subject || null,
          bodyText: clampText(m.body_text || ''),
          bodyHtml: m.body_html ? clampText(m.body_html, 200_000) : null,
          isUnread: false,
          isFocused: true,
          receivedAt,
          raw: {
            source: 'mbox',
            in_reply_to: m.in_reply_to,
            references: m.references,
            to: m.to_emails,
            cc: m.cc_emails,
          },
        },
      });

      appendedMessages += 1;
      if (receivedAt > latestMessageAt) latestMessageAt = receivedAt;
      if (direction === 'INBOUND' && (!latestInboundAt || receivedAt > latestInboundAt)) {
        latestInboundAt = receivedAt;
      }
    }

    await db.instantlyConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: latestMessageAt,
        lastInboundAt: latestInboundAt ?? undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation.id,
        matchedMessages: parsed.count,
        appendedMessages,
      },
    });
  } catch (error) {
    console.error('MBOX import error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to import mbox' },
      { status: 500 }
    );
  }
}

