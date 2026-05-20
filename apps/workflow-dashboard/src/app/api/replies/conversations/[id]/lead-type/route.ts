import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { LEAD_TYPES } from '@/lib/services/replies/ReplyTypes';
import { LeadStateEngine } from '@/lib/services/replies/LeadStateEngine';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => ({}));
    const leadType = typeof body?.leadType === 'string' ? body.leadType.trim().toUpperCase() : '';
    const clear = body?.clear === true || leadType === '';

    if (!params.id) {
      return NextResponse.json({ success: false, error: 'Missing conversation id' }, { status: 400 });
    }

    await db.instantlyConversation.update({
      where: { id: params.id },
      data: {
        leadTypeManualOverride: clear
          ? null
          : (LEAD_TYPES.includes(leadType as any) ? (leadType as any) : null),
      },
    });

    const state = await LeadStateEngine.recompute(params.id);
    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to set lead type' },
      { status: 500 }
    );
  }
}

