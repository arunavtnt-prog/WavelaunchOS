import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorize';

const WORKFLOW_DASHBOARD_URL = process.env.WORKFLOW_DASHBOARD_URL || 'http://localhost:3007';

/**
 * Proxy endpoint to workflow-dashboard's /api/replies/drafts
 * Handles draft operations: generate, approve, send, approve-and-send
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    const workflowUrl = `${WORKFLOW_DASHBOARD_URL}/api/replies/drafts?conversationId=${conversationId}`;

    const response = await fetch(workflowUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch drafts',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const workflowUrl = `${WORKFLOW_DASHBOARD_URL}/api/replies/drafts`;

    const response = await fetch(workflowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error processing draft action:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process draft action',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const workflowUrl = `${WORKFLOW_DASHBOARD_URL}/api/replies/drafts`;

    const response = await fetch(workflowUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update draft',
      },
      { status: 500 }
    );
  }
}
