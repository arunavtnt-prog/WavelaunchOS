import { NextRequest, NextResponse } from 'next/server';
import { QueueManager } from '@/lib/services/QueueManager';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, reason } = body;

    if (action === 'approve') {
      await QueueManager.approve(params.id, 'system');
    } else if (action === 'reject') {
      await QueueManager.reject(params.id, 'system', reason);
    } else {
      return NextResponse.json(
        { error: 'Invalid action', success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application', success: false },
      { status: 500 }
    );
  }
}
