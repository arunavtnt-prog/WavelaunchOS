import { NextRequest, NextResponse } from 'next/server';
import { ingestPlaybookFromFile } from '@/lib/services/replies/PlaybookIngestor';
import { db } from '@/lib/db/prisma';
import { assertPrismaModel } from '@/lib/db/assert-prisma-model';

export async function POST(request: NextRequest) {
  try {
    assertPrismaModel(db, 'replyPlaybook');
    const body = await request.json().catch(() => ({}));
    const playbookKey = typeof body?.playbookKey === 'string' ? body.playbookKey.trim().toUpperCase() : 'D26';
    const replace = typeof body?.replace === 'boolean' ? body.replace : true;
    const sourcePath =
      typeof body?.sourcePath === 'string' && body.sourcePath.trim().length
        ? body.sourcePath.trim()
        : process.env.REPLY_AGENT_GUIDE_PATH || '/Users/arunav/Downloads/d26_lead_management_system.md';

    const playbookName = typeof body?.playbookName === 'string' && body.playbookName.trim().length
      ? body.playbookName.trim()
      : playbookKey;

    if (!sourcePath) {
      return NextResponse.json({ success: false, error: 'sourcePath is required' }, { status: 400 });
    }

    const result = await ingestPlaybookFromFile({
      playbookKey,
      playbookName,
      path: sourcePath,
      replace,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to ingest playbook' },
      { status: 500 }
    );
  }
}
