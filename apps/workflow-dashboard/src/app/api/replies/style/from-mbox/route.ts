import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { db } from '@/lib/db/prisma';
import { generateText } from '@/lib/ai/client';

type ParsedMessage = {
  subject: string | null;
  from_name?: string | null;
  from_email: string | null;
  to_emails: string[];
  date: string | null;
  body_text: string;
};

function runPythonParse(mboxPath: string, limit: number): Promise<{ count: number; messages: ParsedMessage[] }> {
  return new Promise((resolve, reject) => {
    const args = ['scripts/parse_mbox.py', '--mbox', mboxPath, '--limit', String(limit)];
    const proc = spawn('python3', args, { cwd: process.cwd(), env: process.env });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('error', (err) => reject(err));
    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error(`parse_mbox.py failed (code ${code}): ${stderr}`));
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error(`Failed to parse parser output: ${stderr || String(e)}`));
      }
    });
  });
}

function looksLikeMyMessage(m: ParsedMessage, hints: string[]): boolean {
  const fromEmail = (m.from_email || '').toLowerCase();
  const fromName = (m.from_name || '').toLowerCase();
  if (fromName.includes('arunav')) return true;
  for (const h of hints) {
    if (!h) continue;
    if (fromEmail.includes(h)) return true;
    if (fromName.includes(h)) return true;
  }
  return false;
}

function clamp(text: string, max = 4000) {
  const t = (text || '').trim();
  if (t.length <= max) return t;
  return t.slice(0, max) + '\n[TRUNCATED]';
}

function stripCodeFences(text: string): string {
  return (text || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function tryParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(stripCodeFences(text)) as T;
  } catch {
    return null;
  }
}

function buildStylePrompt(samples: ParsedMessage[]): string {
  return [
    'You analyze an email sender’s writing voice.',
    '',
    'Task: infer Arunav’s tone and style from real sent emails.',
    'Output JSON ONLY:',
    '{ "styleGuide": string, "do": string[], "dont": string[], "signature": string, "length": string }',
    '',
    'Constraints:',
    '- Do not include personal data or email addresses in the style guide.',
    '- Keep it actionable (rules a model can follow).',
    '',
    'Samples:',
    ...samples.map((m, idx) => {
      const subj = m.subject ? `Subject: ${m.subject}` : 'Subject: (none)';
      return `--- SAMPLE ${idx + 1} ---\n${subj}\n${clamp(m.body_text)}\n`;
    }),
  ].join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = typeof body?.action === 'string' ? body.action : 'prepare';

    if (action === 'save') {
      const styleGuide = typeof body?.styleGuide === 'string' ? body.styleGuide.trim() : '';
      if (!styleGuide) {
        return NextResponse.json({ success: false, error: 'styleGuide is required' }, { status: 400 });
      }

      await db.settings.upsert({
        where: { key: 'REPLY_AGENT_STYLE_GUIDE' },
        create: { key: 'REPLY_AGENT_STYLE_GUIDE', value: styleGuide },
        update: { value: styleGuide },
      });

      return NextResponse.json({ success: true, data: { styleGuide } });
    }

    const mboxPath = typeof body?.mboxPath === 'string' ? body.mboxPath : '';
    const limit = typeof body?.limit === 'number' ? Math.max(100, Math.min(50_000, body.limit)) : 10_000;
    const maxSamples = typeof body?.maxSamples === 'number' ? Math.max(10, Math.min(120, body.maxSamples)) : 50;
    const hintList =
      typeof body?.myEmailHints === 'string'
        ? body.myEmailHints.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean)
        : ['wavelaunch', 'emerinfoguild', 'arunav'];

    if (!mboxPath) {
      return NextResponse.json({ success: false, error: 'mboxPath is required' }, { status: 400 });
    }

    const parsed = await runPythonParse(mboxPath, limit);
    const candidates = (parsed.messages || []).filter((m) => looksLikeMyMessage(m, hintList));

    const samples = candidates
      .filter((m) => (m.body_text || '').trim().length >= 80 && (m.to_emails?.length || 0) > 0)
      .slice(0, maxSamples);

    if (samples.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No suitable outbound messages found. Provide myEmailHints or increase limit.',
        },
        { status: 400 }
      );
    }

    const prompt = buildStylePrompt(samples);

    if (action === 'prepare') {
      return NextResponse.json({
        success: true,
        data: {
          samplesUsed: samples.length,
          prompt,
        },
      });
    }

    // Default: generate + save server-side (no local proxy needed when using direct z.ai mode).
    const result = await generateText({
      messages: [{ role: 'user', content: prompt }],
      model: 'glm-4.7',
      maxTokens: 1200,
      temperature: 0.2,
    });

    const rawText = result.text;
    const parsedJson = tryParseJson<{ styleGuide?: unknown }>(rawText);
    const styleGuide = typeof parsedJson?.styleGuide === 'string' ? parsedJson.styleGuide : rawText;

    await db.settings.upsert({
      where: { key: 'REPLY_AGENT_STYLE_GUIDE' },
      create: { key: 'REPLY_AGENT_STYLE_GUIDE', value: styleGuide },
      update: { value: styleGuide },
    });

    return NextResponse.json({
      success: true,
      data: {
        samplesUsed: samples.length,
        styleGuide,
      },
    });
  } catch (error) {
    console.error('Style import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to infer style',
      },
      { status: 500 }
    );
  }
}
