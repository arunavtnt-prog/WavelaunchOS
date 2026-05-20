import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { LeadStateEngine } from '@/lib/services/replies/LeadStateEngine';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ success: false, error: 'Missing conversation id' }, { status: 400 });
    }

    await db.instantlyConversation.update({
      where: { id: params.id },
      data: { leadTypeManualOverride: 'PIPELINE' },
    });

    const state = await LeadStateEngine.recompute(params.id);
    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to mark pipeline' },
      { status: 500 }
    );
  }
}

