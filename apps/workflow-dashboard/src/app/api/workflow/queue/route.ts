import { NextRequest, NextResponse } from 'next/server';
import { QueueManager } from '@/lib/services/QueueManager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: searchParams.get('status') as any || undefined,
      country: searchParams.get('country') || undefined,
      industryNiche: searchParams.get('industry') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const items = await QueueManager.getQueue(filters);

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue', success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, applicationIds, reason } = body;

    if (action === 'approve') {
      if (Array.isArray(applicationIds)) {
        await QueueManager.bulkApprove(applicationIds, 'system');
      } else {
        await QueueManager.approve(applicationIds, 'system');
      }
    } else if (action === 'reject') {
      if (Array.isArray(applicationIds)) {
        await QueueManager.bulkReject(applicationIds, 'system', reason);
      } else {
        await QueueManager.reject(applicationIds, 'system', reason);
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action', success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating queue:', error);
    return NextResponse.json(
      { error: 'Failed to update queue', success: false },
      { status: 500 }
    );
  }
}
