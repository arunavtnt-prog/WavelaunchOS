import { NextRequest, NextResponse } from 'next/server';
import { fetchVisionFormApplications, upsertVisionFormSubmission } from '@/lib/integrations/visionForm';
import { db } from '@/lib/db/prisma';

function requireSyncSecret(request: NextRequest): NextResponse | null {
  const expected = process.env.VISION_FORM_SYNC_SECRET;
  if (!expected) return null;
  const provided = request.headers.get('x-sync-secret') || '';
  if (provided !== expected) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * Pull the last N applications from the intake form API and upsert into this DB.
 *
 * POST /api/integrations/vision-form/sync
 * Env:
 * - VISION_FORM_SOURCE_URL (required) e.g. http://localhost:3000
 * - VISION_FORM_SYNC_SECRET (optional) require header x-sync-secret
 */
export async function POST(request: NextRequest) {
  const auth = requireSyncSecret(request);
  if (auth) return auth;

  try {
    const nowIso = new Date().toISOString();
    await db.settings.upsert({
      where: { key: 'vision_form_last_sync_at' },
      update: { value: nowIso },
      create: { key: 'vision_form_last_sync_at', value: nowIso },
    });
    await db.settings.upsert({
      where: { key: 'vision_form_last_sync_error' },
      update: { value: '' },
      create: { key: 'vision_form_last_sync_error', value: '' },
    });

    const applications = await fetchVisionFormApplications();

    const results = {
      fetched: applications.length,
      upserted: 0,
      failed: 0,
      errors: [] as Array<{ index: number; error: string }>,
    };

    for (let i = 0; i < applications.length; i++) {
      try {
        await upsertVisionFormSubmission(applications[i]);
        results.upserted++;
      } catch (e) {
        results.failed++;
        results.errors.push({
          index: i,
          error: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }

    await db.settings.upsert({
      where: { key: 'vision_form_last_sync_summary' },
      update: { value: JSON.stringify(results) },
      create: { key: 'vision_form_last_sync_summary', value: JSON.stringify(results) },
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('vision-form sync error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    try {
      await db.settings.upsert({
        where: { key: 'vision_form_last_sync_error' },
        update: { value: message },
        create: { key: 'vision_form_last_sync_error', value: message },
      });
    } catch {
      // ignore secondary failures
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
