import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorize';

const WORKFLOW_DASHBOARD_URL = process.env.WORKFLOW_DASHBOARD_URL || 'http://localhost:3007';

/**
 * Instantly settings endpoint
 * GET: Fetch auto-send settings
 * PUT: Update auto-send settings
 * POST: Test Instantly API connection
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Return current settings (from env or workflow-dashboard)
    const settings = {
      autoSend: {
        enabled: process.env.AUTO_SEND_ENABLED !== 'false',
        confidenceThreshold: Number(process.env.AUTO_SEND_CONFIDENCE_THRESHOLD || 0.9),
        intents: (process.env.AUTO_SEND_INTENTS || 'INTERESTED').split(',').map((s: string) => s.trim().toUpperCase()),
      },
      workflowDashboard: {
        url: WORKFLOW_DASHBOARD_URL,
        connected: true, // Could actually test connection
      },
      instantlyApi: {
        configured: !!process.env.INSTANTLY_API_KEY,
      },
    };

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    // Update settings in workflow-dashboard
    const workflowUrl = `${WORKFLOW_DASHBOARD_URL}/api/replies/config`;
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
    console.error('Error updating settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { action } = body;

    if (action === 'test-connection') {
      // Test connection to workflow-dashboard
      const workflowUrl = `${WORKFLOW_DASHBOARD_URL}/api/replies/ai/health`;
      const response = await fetch(workflowUrl);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          data: {
            workflowDashboard: { connected: true, health: data },
            instantlyApi: { configured: !!process.env.INSTANTLY_API_KEY },
          },
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to connect to workflow-dashboard',
        }, { status: 500 });
      }
    }

    if (action === 'test-instantly-api') {
      // Test Instantly API connection
      const apiKey = process.env.INSTANTLY_API_KEY;
      if (!apiKey) {
        return NextResponse.json({
          success: false,
          error: 'INSTANTLY_API_KEY is not configured',
        }, { status: 400 });
      }

      // Try to list a small batch of emails to test connection
      const workflowUrl = `${WORKFLOW_DASHBOARD_URL}/api/replies/sync`;
      const response = await fetch(workflowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'instantly', limit: 1 }),
      });

      const text = await response.text();
      const data = JSON.parse(text);

      return NextResponse.json({
        success: response.ok,
        data: { connected: response.ok, result: data },
      }, { status: response.ok ? 200 : 500 });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test connection',
      },
      { status: 500 }
    );
  }
}
