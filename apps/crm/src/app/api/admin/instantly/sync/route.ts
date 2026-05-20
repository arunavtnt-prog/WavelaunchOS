import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorize';

const WORKFLOW_DASHBOARD_URL = process.env.WORKFLOW_DASHBOARD_URL || 'http://localhost:3007';

/**
 * Proxy endpoint to workflow-dashboard's /api/replies/sync
 * Fetches latest emails from Instantly
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    // Forward request to workflow-dashboard
    const workflowUrl = `${WORKFLOW_DASHBOARD_URL}/api/replies/sync`;
    const body = await request.json();

    const response = await fetch(workflowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        // If syncAll is not specified, default to false to only sync new emails
        syncAll: typeof body?.syncAll === 'boolean' ? body.syncAll : false,
      }),
    });

    const text = await response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error syncing Instantly:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync',
      },
      { status: 500 }
    );
  }
}
