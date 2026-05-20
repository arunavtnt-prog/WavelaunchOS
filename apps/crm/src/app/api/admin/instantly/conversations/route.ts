import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorize';

const WORKFLOW_DASHBOARD_URL = process.env.WORKFLOW_DASHBOARD_URL || 'http://localhost:3007';

/**
 * Proxy endpoint to workflow-dashboard's /api/replies/conversations
 * Lists conversations with pagination support
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();

    // Forward request to workflow-dashboard
    const workflowUrl = `${WORKFLOW_DASHBOARD_URL}/api/replies/conversations`;
    const { searchParams } = new URL(request.url);

    const response = await fetch(`${workflowUrl}?${searchParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch conversations',
      },
      { status: 500 }
    );
  }
}
