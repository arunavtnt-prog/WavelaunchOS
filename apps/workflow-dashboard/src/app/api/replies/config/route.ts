import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';

const CONFIG_KEYS = [
  'REPLY_AGENT_COMPANY_CONTEXT',
  'REPLY_AGENT_STYLE_GUIDE',
  'REPLY_AGENT_DEFAULT_CTA',
] as const;

export async function GET(_request: NextRequest) {
  try {
    const rows = await db.settings.findMany({
      where: { key: { in: [...CONFIG_KEYS] } },
    });

    const byKey = new Map(rows.map((r) => [r.key, r.value]));

    return NextResponse.json({
      success: true,
      data: {
        companyContext: byKey.get('REPLY_AGENT_COMPANY_CONTEXT') || '',
        styleGuide: byKey.get('REPLY_AGENT_STYLE_GUIDE') || '',
        defaultCta: byKey.get('REPLY_AGENT_DEFAULT_CTA') || '',
      },
    });
  } catch (error) {
    console.error('Error fetching reply agent config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyContext = typeof body?.companyContext === 'string' ? body.companyContext : '';
    const styleGuide = typeof body?.styleGuide === 'string' ? body.styleGuide : '';
    const defaultCta = typeof body?.defaultCta === 'string' ? body.defaultCta : '';

    await Promise.all([
      db.settings.upsert({
        where: { key: 'REPLY_AGENT_COMPANY_CONTEXT' },
        create: { key: 'REPLY_AGENT_COMPANY_CONTEXT', value: companyContext },
        update: { value: companyContext },
      }),
      db.settings.upsert({
        where: { key: 'REPLY_AGENT_STYLE_GUIDE' },
        create: { key: 'REPLY_AGENT_STYLE_GUIDE', value: styleGuide },
        update: { value: styleGuide },
      }),
      db.settings.upsert({
        where: { key: 'REPLY_AGENT_DEFAULT_CTA' },
        create: { key: 'REPLY_AGENT_DEFAULT_CTA', value: defaultCta },
        update: { value: defaultCta },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving reply agent config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save config' },
      { status: 500 }
    );
  }
}
