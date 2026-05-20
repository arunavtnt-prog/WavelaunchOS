import { NextRequest, NextResponse } from 'next/server';
import { upsertVisionFormSubmission } from '@/lib/integrations/visionForm';

function requireWebhookSecret(request: NextRequest): NextResponse | null {
  const expected = process.env.VISION_FORM_WEBHOOK_SECRET;
  if (!expected) return null;
  const provided = request.headers.get('x-webhook-secret') || '';
  if (provided !== expected) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * Webhook to ingest Vision Form submissions into workflow-dashboard.
 *
 * POST /api/webhooks/vision-form
 * Headers: x-webhook-secret (optional; enforced if VISION_FORM_WEBHOOK_SECRET is set)
 * Body: Application-like object (created by apps/apply)
 */
export async function POST(request: NextRequest) {
  const auth = requireWebhookSecret(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const result = await upsertVisionFormSubmission(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('vision-form webhook error:', error);
    const details = (error as any)?.details;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        ...(details ? { details } : {}),
      },
      { status: 500 }
    );
  }
}
