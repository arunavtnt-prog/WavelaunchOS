import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { assertPrismaModel } from '@/lib/db/assert-prisma-model';

export async function GET(_request: NextRequest) {
  try {
    assertPrismaModel(db, 'replyCampaignPolicy');
    const rows = await db.replyCampaignPolicy.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list policies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    assertPrismaModel(db, 'replyCampaignPolicy');
    const body = await request.json().catch(() => ({}));
    const providerCampaignId = typeof body?.providerCampaignId === 'string' ? body.providerCampaignId.trim() : '';
    const policyKey = typeof body?.policyKey === 'string' ? body.policyKey.trim() : '';
    const allowCalls = typeof body?.allowCalls === 'boolean' ? body.allowCalls : true;

    if (!providerCampaignId) {
      return NextResponse.json(
        { success: false, error: 'providerCampaignId is required' },
        { status: 400 }
      );
    }
    if (!policyKey) {
      return NextResponse.json({ success: false, error: 'policyKey is required' }, { status: 400 });
    }

    const row = await db.replyCampaignPolicy.upsert({
      where: { providerCampaignId },
      create: { providerCampaignId, policyKey, allowCalls },
      update: { policyKey, allowCalls },
    });

    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upsert policy' },
      { status: 500 }
    );
  }
}
