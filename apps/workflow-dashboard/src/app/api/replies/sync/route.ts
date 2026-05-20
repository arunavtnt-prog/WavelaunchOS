import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { InstantlyClient, type InstantlyEmail } from '@/lib/instantly/client';
import { LeadStateEngine } from '@/lib/services/replies/LeadStateEngine';

const MOCK_CONVERSATIONS = [
  {
    campaignId: 'instantly-campaign-001',
    campaignName: 'Wavelaunch Studio — Cohort Outreach',
    mailboxEmail: 'team@wavelaunch.studio',
    leadEmail: 'sarah@example.com',
    leadName: 'Sarah',
    inbound: {
      subject: 'Re: Wavelaunch',
      bodyText:
        "Hey Arunav — this sounds interesting. What does the engagement look like and what's the timeline to launch?",
    },
  },
  {
    campaignId: 'instantly-campaign-001',
    campaignName: 'Wavelaunch Studio — Cohort Outreach',
    mailboxEmail: 'team@wavelaunch.studio',
    leadEmail: 'mike@example.com',
    leadName: 'Mike',
    inbound: {
      subject: 'Re: Quick question',
      bodyText:
        "Not sure I'm the right fit. I already have a brand idea but I'm not looking to give up equity. How does that work?",
    },
  },
  {
    campaignId: 'instantly-campaign-002',
    campaignName: 'Wavelaunch Studio — Follow-ups',
    mailboxEmail: 'team@wavelaunch.studio',
    leadEmail: 'julia@example.com',
    leadName: 'Julia',
    inbound: {
      subject: 'Stop',
      bodyText: 'Please remove me from this list.',
    },
  },
] as const;

function toDate(value: unknown): Date | null {
  if (typeof value === 'string' && value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Accept seconds or milliseconds
    const ms = value > 1_000_000_000_000 ? value : value * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function extractFirstToEmail(toList: InstantlyEmail['to_address_email_list']): string | null {
  if (!toList) return null;
  if (typeof toList === 'string') return toList || null;
  const arr = Array.isArray(toList) ? toList : [];
  for (const item of arr) {
    if (typeof item === 'string' && item) return item;
    if (item && typeof item === 'object' && typeof (item as any).email === 'string' && (item as any).email) {
      return (item as any).email;
    }
  }
  return null;
}

function normalizeEmailType(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  return v.length ? v : null;
}

function inferDirection(email: InstantlyEmail): 'INBOUND' | 'OUTBOUND' {
  const ue = Number((email as any).ue_type);
  if (Number.isFinite(ue) && ue === 2) return 'INBOUND';
  const emailType = normalizeEmailType((email as any).email_type);
  if (emailType === 'received') return 'INBOUND';
  return 'OUTBOUND';
}

function extractBodyText(body: InstantlyEmail['body']): { text: string; html?: string } {
  if (!body) return { text: '' };
  if (typeof body === 'string') return { text: body };
  if (typeof body === 'object') {
    const text = typeof (body as any).text === 'string' ? (body as any).text : '';
    const html = typeof (body as any).html === 'string' ? (body as any).html : undefined;
    return { text, html };
  }
  return { text: '' };
}

function toBoolish(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return false;
}

function nonEmpty(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v.length ? v : null;
}

async function seedMock() {
  const existingCount = await db.instantlyConversation.count();

  if (existingCount === 0) {
    const created = await Promise.all(
      MOCK_CONVERSATIONS.map(async (c) => {
        const conversation = await db.instantlyConversation.create({
          data: {
            campaignId: c.campaignId,
            campaignName: c.campaignName,
            mailboxEmail: c.mailboxEmail,
            leadEmail: c.leadEmail,
            leadName: c.leadName,
            lastInboundAt: new Date(),
            lastMessageAt: new Date(),
          },
        });

        await db.instantlyMessage.create({
          data: {
            conversationId: conversation.id,
            direction: 'INBOUND',
            fromEmail: c.leadEmail,
            toEmail: c.mailboxEmail,
            subject: c.inbound.subject,
            bodyText: c.inbound.bodyText,
            receivedAt: new Date(),
            raw: {
              mock: true,
              source: 'sync',
            },
          },
        });

        return conversation.id;
      })
    );

    return { createdConversations: created.length, appendedMessages: created.length };
  }

  const latest = await db.instantlyConversation.findFirst({
    orderBy: { lastMessageAt: 'desc' },
  });

  if (!latest) return { createdConversations: 0, appendedMessages: 0 };

  const now = new Date();
  await db.instantlyMessage.create({
    data: {
      conversationId: latest.id,
      direction: 'INBOUND',
      fromEmail: latest.leadEmail,
      toEmail: latest.mailboxEmail || null,
      subject: 'Re: following up',
      bodyText: "Quick follow-up — can you share pricing and a couple examples of creators you've helped?",
      receivedAt: now,
      raw: { mock: true, source: 'sync' },
    },
  });

  await db.instantlyConversation.update({
    where: { id: latest.id },
    data: {
      lastInboundAt: now,
      lastMessageAt: now,
    },
  });

  return { createdConversations: 0, appendedMessages: 1 };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode = body?.mode === 'mock' ? 'mock' : 'instantly';

    if (mode === 'mock') {
      const result = await seedMock();
      return NextResponse.json({ success: true, data: result });
    }

    const apiKey = process.env.INSTANTLY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'INSTANTLY_API_KEY is not set. Add it to workflow-dashboard/.env.local to enable Instantly sync.',
        },
        { status: 400 }
      );
    }

    const campaignId = typeof body?.campaignId === 'string' ? body.campaignId : undefined;
    const eaccount = typeof body?.eaccount === 'string' ? body.eaccount : undefined;
    const syncAll = typeof body?.syncAll === 'boolean' ? body.syncAll : false;
    const maxPages = typeof body?.maxPages === 'number' ? Math.max(1, Math.min(60, body.maxPages)) : (syncAll ? 60 : 3);
    const limit = typeof body?.limit === 'number' ? Math.max(1, Math.min(100, body.limit)) : 50;
    const unreadOnly = typeof body?.unreadOnly === 'boolean' ? body.unreadOnly : false;
    const resolveCampaignNames = typeof body?.resolveCampaignNames === 'boolean' ? body.resolveCampaignNames : true;
    const maxCampaignLookups =
      typeof body?.maxCampaignLookups === 'number' ? Math.max(0, Math.min(20, body.maxCampaignLookups)) : 5;
    const debug = typeof body?.debug === 'boolean' ? body.debug : false;
    const pageDelayMs =
      typeof body?.pageDelayMs === 'number'
        ? Math.max(0, Math.min(10_000, body.pageDelayMs))
        : (syncAll ? 3200 : 0);
    const apiEmailType =
      body?.emailType === 'all'
        ? undefined
        : typeof body?.emailType === 'string' && body.emailType.length
          ? body.emailType
          : undefined;

    const client = new InstantlyClient(apiKey);

    let createdConversations = 0;
    let appendedMessages = 0;
    let pagesFetched = 0;
    let campaignsResolved = 0;
    let fetchedTotal = 0;
    let fetchedReceived = 0;

    const campaignNameCache = new Map<string, string>();
    let firstPageRaw: unknown = undefined;
    const debugSamples: Array<{
      id?: string;
      thread_id?: string;
      ue_type?: number;
      subject?: string;
      eaccount?: string;
      lead?: string;
      from_address_email?: string;
      to_address_email_list?: unknown;
      timestamp_email?: unknown;
    }> = [];

    let startingAfter: string | undefined;
    const touchedConversationIds = new Set<string>();
    for (let page = 0; page < maxPages; page++) {
      pagesFetched += 1;
      const listRes = await client.listEmails({
        limit,
        startingAfter,
        ...(apiEmailType ? { emailType: apiEmailType as any } : {}),
        sortOrder: 'desc',
        ...(campaignId ? { campaignId } : {}),
        ...(eaccount ? { eaccount } : {}),
        ...(unreadOnly ? { isUnread: true } : {}),
        mode: 'emode_all',
      });
      const { emails, nextStartingAfter, raw } = listRes;
      if (debug && page === 0) firstPageRaw = raw;

      if (!emails.length) break;
      fetchedTotal += emails.length;

      if (debug && debugSamples.length < 5) {
        for (const e of emails) {
          if (debugSamples.length >= 5) break;
          debugSamples.push({
            id: e.id,
            thread_id: e.thread_id,
            ue_type: e.ue_type,
            subject: e.subject,
            eaccount: e.eaccount,
            lead: (e as any).lead,
            from_address_email: e.from_address_email,
            to_address_email_list: e.to_address_email_list,
            timestamp_email: e.timestamp_email,
          });
        }
      }

      const receivedEmails = emails.filter((e) => Number((e as any).ue_type) === 2);
      fetchedReceived += receivedEmails.length;

      const providerMessageIds = emails.map((e) => e.id).filter(Boolean) as string[];
      // Always check for existing messages to avoid duplicates, even in syncAll mode
      const existing = providerMessageIds.length
        ? await db.instantlyMessage.findMany({
            where: { providerMessageId: { in: providerMessageIds } },
            select: { providerMessageId: true },
          })
        : [];
      const existingSet = new Set(existing.map((m) => m.providerMessageId).filter(Boolean) as string[]);

      let newThisPage = 0;

      for (const email of emails) {
        const threadId = email.thread_id;
        const messageId = email.id;

        if (!threadId) continue;
        if (!messageId) continue;

        // Skip creating duplicate messages, but still update conversation metadata
        const messageExists = existingSet.has(messageId);
        if (messageExists) continue;

        const receivedAt =
          toDate(email.timestamp_email) ||
          toDate(email.timestamp_created) ||
          new Date();

        const direction = inferDirection(email);
        const mailboxEmail =
          email.eaccount ||
          (direction === 'INBOUND'
            ? extractFirstToEmail(email.to_address_email_list)
            : nonEmpty(email.from_address_email));
        const leadEmail = email.lead || null;

        const externalEmail =
          leadEmail ||
          (direction === 'INBOUND'
            ? nonEmpty(email.from_address_email)
            : extractFirstToEmail(email.to_address_email_list)) ||
          null;

        const fromEmail =
          direction === 'INBOUND'
            ? (externalEmail || email.from_address_email || null)
            : (mailboxEmail || email.from_address_email || null);

        const toEmail =
          direction === 'INBOUND'
            ? (mailboxEmail || extractFirstToEmail(email.to_address_email_list))
            : (externalEmail || extractFirstToEmail(email.to_address_email_list));

        const { text: bodyText, html: bodyHtml } = extractBodyText(email.body);
        const finalBodyText = bodyText || (typeof email.content_preview === 'string' ? email.content_preview : '') || '';
        const isUnread = toBoolish((email as any).is_unread);
        const isFocused = toBoolish((email as any).is_focused);
        const ueType = Number.isFinite(Number((email as any).ue_type)) ? Number((email as any).ue_type) : null;
        const emailType = normalizeEmailType((email as any).email_type);

        const conversationExists = await db.instantlyConversation.findUnique({
          where: { providerConversationId: threadId },
          select: { id: true, lastInboundAt: true, lastMessageAt: true },
        });

        let campaignName: string | undefined;
        if (email.campaign_id && resolveCampaignNames) {
          const cachedRun = campaignNameCache.get(email.campaign_id);
          if (cachedRun) {
            campaignName = cachedRun;
          } else {
          const cached = await db.instantlyCampaign.findUnique({
            where: { providerCampaignId: email.campaign_id },
            select: { name: true },
          });
          if (cached?.name) {
            campaignName = cached.name || undefined;
            if (campaignName) campaignNameCache.set(email.campaign_id, campaignName);
          } else if (campaignsResolved < maxCampaignLookups) {
            try {
              const campaign = await client.getCampaign(email.campaign_id);
              if (campaign?.name) {
                campaignName = campaign.name;
                campaignNameCache.set(email.campaign_id, campaign.name);
                await db.instantlyCampaign.upsert({
                  where: { providerCampaignId: email.campaign_id },
                  create: { providerCampaignId: email.campaign_id, name: campaign.name },
                  update: { name: campaign.name },
                });
                campaignsResolved += 1;
              }
            } catch (err) {
              // Non-fatal; keep syncing emails even if campaign lookup fails.
            }
          }
          }
        }

        const lastInboundAtUpdate =
          direction === 'INBOUND'
            ? (conversationExists?.lastInboundAt
                ? (receivedAt > conversationExists.lastInboundAt ? receivedAt : conversationExists.lastInboundAt)
                : receivedAt)
            : (conversationExists?.lastInboundAt || null);

        const conversation = conversationExists
          ? await db.instantlyConversation.update({
              where: { providerConversationId: threadId },
              data: {
                campaignId: email.campaign_id || undefined,
                campaignName: campaignName || undefined,
                mailboxEmail: mailboxEmail || undefined,
                ...(direction === 'INBOUND'
                  ? { lastInboundAt: lastInboundAtUpdate, needsReply: true }
                  : {}),
                lastMessageAt: receivedAt > conversationExists.lastMessageAt ? receivedAt : conversationExists.lastMessageAt,
              },
            })
          : await db.instantlyConversation.create({
              data: {
                providerConversationId: threadId,
                campaignId: email.campaign_id || undefined,
                campaignName: campaignName || undefined,
                mailboxEmail: mailboxEmail || undefined,
                leadEmail: externalEmail || 'unknown@example.com',
                ...(direction === 'INBOUND' ? { lastInboundAt: receivedAt, needsReply: true } : {}),
                lastMessageAt: receivedAt,
              },
            });

        if (!conversationExists) createdConversations += 1;

        // Use upsert to handle duplicates gracefully
        await db.instantlyMessage.upsert({
          where: { providerMessageId: messageId },
          create: {
            conversationId: conversation.id,
            providerMessageId: messageId,
            providerServerMessageId: email.message_id || null,
            ueType,
            emailType: emailType || null,
            direction,
            fromEmail,
            toEmail,
            subject: email.subject || null,
            bodyHtml: bodyHtml || null,
            bodyText: finalBodyText,
            isUnread,
            isFocused,
            receivedAt,
            raw: email as any,
          },
          update: {
            fromEmail,
            toEmail,
            subject: email.subject || null,
            bodyHtml: bodyHtml || null,
            bodyText: finalBodyText,
            isUnread,
            isFocused,
            receivedAt,
            raw: email as any,
          },
        });

        touchedConversationIds.add(conversation.id);
        newThisPage += 1;
        appendedMessages += 1;
      }

      if (newThisPage === 0) {
        // With descending sort, if a page has no new messages, older pages are very likely also fully ingested.
        break;
      }

      if (!nextStartingAfter) break;
      startingAfter = nextStartingAfter || undefined;

      if (pageDelayMs > 0) {
        await new Promise((r) => setTimeout(r, pageDelayMs));
      }
    }

    for (const id of [...touchedConversationIds]) {
      try {
        await LeadStateEngine.recompute(id);
      } catch {
        // best-effort; do not fail sync if a single thread can't be recomputed
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        createdConversations,
        appendedMessages,
        pagesFetched,
        campaignsResolved,
        fetchedTotal,
        fetchedReceived,
        ...(debug
          ? {
              debug: {
                note:
                  'If fetchedTotal > 0 but fetchedReceived == 0, you are likely filtering out non-reply email types. Try syncing without emailType or verify ue_type values.',
                emailTypeParam: apiEmailType || 'none',
                rawKeys:
                  pagesFetched >= 1 &&
                  typeof (firstPageRaw as any) === 'object' &&
                  firstPageRaw &&
                  !Array.isArray(firstPageRaw)
                    ? Object.keys(firstPageRaw as any)
                    : undefined,
                samples: debugSamples,
              },
            }
          : {}),
      },
    });
  } catch (error) {
    console.error('Error syncing Instantly:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to sync' },
      { status: 500 }
    );
  }
}
