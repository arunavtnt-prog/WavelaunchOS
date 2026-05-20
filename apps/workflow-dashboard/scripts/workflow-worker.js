/* eslint-disable no-console */

// Usage:
//   DOTENV_CONFIG_PATH=.env.local node -r dotenv/config scripts/workflow-worker.js
//
// Requires:
// - workflow-dashboard dev server running (default http://127.0.0.1:3007)
// - blueprint-engine running for PDF generation (default http://127.0.0.1:3001)

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BASE_URL = process.env.WORKFLOW_WORKER_BASE_URL || 'http://127.0.0.1:3007';
const POLL_MS = Number(process.env.WORKFLOW_WORKER_POLL_MS || 5000);
const MAX_PER_TICK = Number(process.env.WORKFLOW_WORKER_MAX_PER_TICK || 3);
const VISION_FORM_AUTO_SYNC = String(process.env.VISION_FORM_AUTO_SYNC || '1') !== '0';
const VISION_FORM_SYNC_INTERVAL_MS = Number(
  process.env.VISION_FORM_SYNC_INTERVAL_MS || 5 * 60 * 1000
);

const HEARTBEAT_INTERVAL_MS = Number(process.env.WORKFLOW_WORKER_HEARTBEAT_MS || 10_000);
let lastHeartbeatAt = 0;
let lastVisionFormSyncAt = 0;

async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text().catch(() => '');
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error(
      `POST ${path} failed (${res.status}): ${json?.error || text || res.statusText}`
    );
  }
  if (json && json.success === false) {
    throw new Error(`POST ${path} error: ${json.error || 'Unknown error'}`);
  }
  return json;
}

async function heartbeat(extra = {}) {
  const now = Date.now();
  if (now - lastHeartbeatAt < HEARTBEAT_INTERVAL_MS) return;
  lastHeartbeatAt = now;

  const nowIso = new Date(now).toISOString();
  await prisma.settings.upsert({
    where: { key: 'workflow_worker_last_tick_at' },
    update: { value: nowIso },
    create: { key: 'workflow_worker_last_tick_at', value: nowIso },
  });

  if (extra && Object.keys(extra).length > 0) {
    await prisma.settings.upsert({
      where: { key: 'workflow_worker_last_tick_meta' },
      update: { value: JSON.stringify(extra) },
      create: { key: 'workflow_worker_last_tick_meta', value: JSON.stringify(extra) },
    });
  }
}

async function maybeSyncVisionForm() {
  if (!VISION_FORM_AUTO_SYNC) return;
  const now = Date.now();
  if (now - lastVisionFormSyncAt < VISION_FORM_SYNC_INTERVAL_MS) return;

  lastVisionFormSyncAt = now;
  try {
    console.log('[workflow-worker] Vision Form: syncing submissions...');
    await postJson('/api/integrations/vision-form/sync', {});
  } catch (err) {
    const message = err && err.message ? err.message : String(err || '');
    // Common case: not configured. Don’t fail the tick.
    if (message.toLowerCase().includes('not configured')) return;
    console.warn('[workflow-worker] Vision Form: sync failed:', message);
  }
}

async function generateSnapshot(applicationId) {
  return postJson('/api/workflow/snapshots', { action: 'generate', applicationId });
}

async function initializeBlueprint(applicationId) {
  return postJson('/api/workflow/blueprints', { action: 'initialize', applicationId });
}

async function processBlueprintBatch(blueprintId) {
  return postJson('/api/workflow/blueprints', { action: 'process-batch', blueprintId });
}

async function ensureBlueprintPdf(blueprintId) {
  return postJson('/api/workflow/blueprints', { action: 'download-pdf', blueprintId });
}

async function composeEmailDraft(workflowId) {
  return postJson('/api/workflow/emails', { action: 'compose', workflowId });
}

async function tick() {
  let processed = 0;

  await heartbeat({ phase: 'tick-start' });

  // 0) Keep the Queue synced from the deployed intake form (best-effort).
  await maybeSyncVisionForm();

  // 1) Generate snapshots for approved applications.
  const snapshotQueued = await prisma.workflowState.findMany({
    where: { status: 'SNAPSHOT_QUEUED' },
    orderBy: { updatedAt: 'asc' },
    take: MAX_PER_TICK,
  });

  for (const wf of snapshotQueued) {
    console.log(`[workflow-worker] Snapshot: generating for application ${wf.applicationId}...`);
    await heartbeat({ phase: 'snapshot', applicationId: wf.applicationId });
    await generateSnapshot(wf.applicationId);
    processed += 1;
  }

  if (processed >= MAX_PER_TICK) return processed;

  // 2) Initialize blueprints after snapshot completion.
  const snapshotComplete = await prisma.workflowState.findMany({
    where: { status: 'SNAPSHOT_COMPLETE' },
    select: {
      id: true,
      applicationId: true,
      application: {
        select: {
          blueprints: { select: { id: true } },
        },
      },
    },
    orderBy: { updatedAt: 'asc' },
    take: MAX_PER_TICK,
  });

  for (const wf of snapshotComplete) {
    if (processed >= MAX_PER_TICK) break;
    const hasBlueprint = (wf.application.blueprints || []).length > 0;
    if (hasBlueprint) continue;
    console.log(`[workflow-worker] Blueprint: initializing for application ${wf.applicationId}...`);
    await heartbeat({ phase: 'blueprint-init', applicationId: wf.applicationId });
    await initializeBlueprint(wf.applicationId);
    processed += 1;
  }

  if (processed >= MAX_PER_TICK) return processed;

  // 3) Process one batch for in-progress blueprints.
  const blueprintsInProgress = await prisma.blueprint.findMany({
    where: { status: 'IN_PROGRESS' },
    select: { id: true, applicationId: true, currentBatch: true, progress: true },
    orderBy: { updatedAt: 'asc' },
    take: MAX_PER_TICK,
  });

  for (const bp of blueprintsInProgress) {
    if (processed >= MAX_PER_TICK) break;
    console.log(
      `[workflow-worker] Blueprint: processing batch (blueprint=${bp.id}, batch=${bp.currentBatch}, progress=${bp.progress}%)...`
    );
    await heartbeat({ phase: 'blueprint-batch', blueprintId: bp.id, batch: bp.currentBatch, progress: bp.progress });
    await processBlueprintBatch(bp.id);
    processed += 1;
  }

  if (processed >= MAX_PER_TICK) return processed;

  // 4) Generate PDFs for completed blueprints without a stored pdfPath.
  const blueprintsNeedingPdf = await prisma.blueprint.findMany({
    where: { status: 'COMPLETE', pdfPath: null },
    select: { id: true, applicationId: true },
    orderBy: { updatedAt: 'asc' },
    take: MAX_PER_TICK,
  });

  for (const bp of blueprintsNeedingPdf) {
    if (processed >= MAX_PER_TICK) break;
    console.log(`[workflow-worker] Blueprint: generating PDF (blueprint=${bp.id})...`);
    await heartbeat({ phase: 'blueprint-pdf', blueprintId: bp.id });
    await ensureBlueprintPdf(bp.id);
    processed += 1;
  }

  if (processed >= MAX_PER_TICK) return processed;

  // 5) Compose email drafts once the blueprint PDF exists.
  const workflowsReadyForEmail = await prisma.workflowState.findMany({
    where: {
      status: 'SNAPSHOT_COMPLETE',
      application: {
        blueprints: {
          some: { status: 'COMPLETE', pdfPath: { not: null } },
        },
      },
    },
    select: { id: true },
    orderBy: { updatedAt: 'asc' },
    take: MAX_PER_TICK,
  });

  for (const wf of workflowsReadyForEmail) {
    if (processed >= MAX_PER_TICK) break;

    const existingDraft = await prisma.emailDraft.findFirst({
      where: { workflowId: wf.id },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
    });
    if (existingDraft) continue;

    console.log(`[workflow-worker] Email: composing draft (workflow=${wf.id})...`);
    await heartbeat({ phase: 'email-draft', workflowId: wf.id });
    await composeEmailDraft(wf.id);
    processed += 1;
  }

  await heartbeat({ phase: 'tick-end', processed });
  return processed;
}

async function main() {
  console.log(`[workflow-worker] Running. Base URL: ${BASE_URL} (poll=${POLL_MS}ms)`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const processed = await tick();
      await prisma.settings.upsert({
        where: { key: 'workflow_worker_last_error' },
        update: { value: '' },
        create: { key: 'workflow_worker_last_error', value: '' },
      });
      if (processed === 0) {
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } catch (err) {
      console.error('[workflow-worker] Tick failed:', err && err.message ? err.message : err);
      const message = err && err.message ? err.message : String(err || 'Unknown error');
      await prisma.settings.upsert({
        where: { key: 'workflow_worker_last_error' },
        update: { value: message },
        create: { key: 'workflow_worker_last_error', value: message },
      });
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
