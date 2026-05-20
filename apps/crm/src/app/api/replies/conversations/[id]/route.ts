import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorize';

const WORKFLOW_DASHBOARD_URL = process.env.WORKFLOW_DASHBOARD_URL || 'http://localhost:3007';

/**
 * Proxy endpoint to workflow-dashboard's /api/replies/conversations/[id]
 * Fetches conversation details with all messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin();

    const { id } = params;
    const workflowUrl = `${WORKFLOW_DASHBOARD_URL}/api/replies/conversations/${id}`;

    const response = await fetch(workflowUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch conversation',
      },
      { status: 500 }
    );
  }
}
