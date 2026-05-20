import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const campaignId = typeof body?.campaignId === 'string' ? body.campaignId.trim() : '';
    const limit = typeof body?.limit === 'number' ? Math.max(1, Math.min(200, body.limit)) : 50;

    const conversations = await db.instantlyConversation.findMany({
      where: {
        ...(campaignId ? { campaignId } : {}),
        needsReply: true,
        leadType: { not: 'CLOSED' },
      },
      orderBy: { lastInboundAt: 'desc' },
      take: limit,
      include: {
        drafts: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
      },
    });

    const toEnqueue: Array<{ conversationId: string; lastInboundAt: string | null }> = [];
    for (const c of conversations) {
      const lastInboundAt = c.lastInboundAt ? c.lastInboundAt.toISOString() : null;
      const lastDraftAt = c.drafts?.[0]?.createdAt || null;
      if (c.lastInboundAt && lastDraftAt && lastDraftAt > c.lastInboundAt) continue;
      toEnqueue.push({ conversationId: c.id, lastInboundAt });
    }

    const jobs = await db.job.createMany({
      data: toEnqueue.map((j) => ({
        type: 'REPLY_GENERATE_DRAFT',
        status: 'QUEUED',
        payload: JSON.stringify(j),
      })),
      skipDuplicates: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        matched: conversations.length,
        enqueued: jobs.count,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to enqueue drafts' },
      { status: 500 }
    );
  }
}

