import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';

export async function GET(_request: NextRequest) {
  try {
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24);
    const jobs = await db.job.findMany({
      where: { createdAt: { gte: since }, type: { in: ['REPLY_GENERATE_DRAFT'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const counts = jobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.status] = (acc[j.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: { counts, recent: jobs } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load jobs' },
      { status: 500 }
    );
  }
}

