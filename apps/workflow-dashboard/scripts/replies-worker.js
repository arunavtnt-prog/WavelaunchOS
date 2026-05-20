/* eslint-disable no-console */

// Usage:
//   DOTENV_CONFIG_PATH=.env.local node -r dotenv/config scripts/replies-worker.js
//
// Requires workflow-dashboard dev server running (default http://127.0.0.1:3007)

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BASE_URL = process.env.REPLIES_WORKER_BASE_URL || 'http://127.0.0.1:3007';
const POLL_MS = Number(process.env.REPLIES_WORKER_POLL_MS || 1500);

// Auto-send configuration (can be overridden via environment variables)
const AUTO_SEND_ENABLED = process.env.AUTO_SEND_ENABLED !== 'false';
const AUTO_SEND_CONFIDENCE_THRESHOLD = Number(process.env.AUTO_SEND_CONFIDENCE_THRESHOLD || 0.9);
const AUTO_SEND_INTENTS = (process.env.AUTO_SEND_INTENTS || 'INTERESTED').split(',').map(s => s.trim().toUpperCase());

async function claimNextJob() {
  // Not perfectly atomic, but good enough for a single worker (v1).
  const job = await prisma.job.findFirst({
    where: {
      status: 'QUEUED',
      type: { in: ['REPLY_GENERATE_DRAFT', 'REPLY_SEND'] },
    },
    orderBy: { createdAt: 'asc' },
  });
  if (!job) return null;

  const updated = await prisma.job.update({
    where: { id: job.id },
    data: {
      status: 'PROCESSING',
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });
  return updated;
}

async function runGenerateDraftJob(job) {
  let payload = {};
  try {
    payload = JSON.parse(job.payload || '{}');
  } catch {
    payload = {};
  }

  const conversationId = payload.conversationId;
  if (!conversationId) {
    throw new Error('Missing conversationId in job payload');
  }

  const res = await fetch(`${BASE_URL}/api/replies/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generate', conversationId }),
  });

  const text = await res.text().catch(() => '');
  if (!res.ok) {
    throw new Error(`Draft API failed (${res.status}): ${text}`);
  }

  // Check if we should auto-send this draft
  const jsonResponse = JSON.parse(text);
  const draft = jsonResponse.data;

  if (AUTO_SEND_ENABLED && draft) {
    const shouldAutoSend =
      draft.confidence >= AUTO_SEND_CONFIDENCE_THRESHOLD &&
      AUTO_SEND_INTENTS.includes((draft.category || '').toUpperCase());

    if (shouldAutoSend) {
      console.log(`📤 Auto-sending draft ${draft.id} (confidence: ${draft.confidence}, intent: ${draft.category})`);

      // Queue a send job
      await prisma.job.create({
        data: {
          type: 'REPLY_SEND',
          status: 'QUEUED',
          payload: JSON.stringify({ draftId: draft.id, autoSend: true }),
        },
      });
    }
  }

  return text;
}

async function runSendJob(job) {
  let payload = {};
  try {
    payload = JSON.parse(job.payload || '{}');
  } catch {
    payload = {};
  }

  const { draftId, autoSend = false } = payload;
  if (!draftId) {
    throw new Error('Missing draftId in job payload');
  }

  // Get the latest inbound message to reply to
  const draft = await prisma.replyDraft.findUnique({
    where: { id: draftId },
    include: {
      conversation: true,
    },
  });

  if (!draft) {
    throw new Error('Draft not found');
  }

  if (draft.status === 'SENT') {
    console.log(`Draft ${draftId} already sent, skipping`);
    return JSON.stringify({ success: true, alreadySent: true });
  }

  // Get the latest inbound message's provider message ID
  const latestInbound = await prisma.instantlyMessage.findFirst({
    where: {
      conversationId: draft.conversationId,
      direction: 'INBOUND',
    },
    orderBy: { receivedAt: 'desc' },
  });

  if (!latestInbound || !latestInbound.providerMessageId) {
    throw new Error('No inbound message found to reply to');
  }

  // Send via Instantly API directly (no need to call our own API)
  const apiKey = process.env.INSTANTLY_API_KEY;
  if (!apiKey) {
    throw new Error('INSTANTLY_API_KEY is not configured');
  }

  const sendResult = await fetch(`${BASE_URL}/api/replies/drafts/${draftId}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const text = await sendResult.text().catch(() => '');
  if (!sendResult.ok) {
    throw new Error(`Send API failed (${sendResult.status}): ${text}`);
  }

  // If auto-sending, also update the draft to reflect it was auto-sent
  if (autoSend) {
    await prisma.replyDraft.update({
      where: { id: draftId },
      data: { autoSent: true },
    });
  }

  return text;
}

async function runJob(job) {
  if (job.type === 'REPLY_GENERATE_DRAFT') {
    return await runGenerateDraftJob(job);
  } else if (job.type === 'REPLY_SEND') {
    return await runSendJob(job);
  } else {
    throw new Error(`Unknown job type: ${job.type}`);
  }
}

async function markDone(jobId, resultText) {
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      result: resultText?.slice(0, 50_000) || null,
      error: null,
    },
  });
}

async function markFailed(jobId, err) {
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'FAILED',
      completedAt: new Date(),
      error: String(err && err.message ? err.message : err),
    },
  });
}

async function main() {
  console.log(`Replies worker running. Base URL: ${BASE_URL}`);
  console.log(`Auto-send: ${AUTO_SEND_ENABLED ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Auto-send threshold: ${AUTO_SEND_CONFIDENCE_THRESHOLD}`);
  console.log(`Auto-send intents: ${AUTO_SEND_INTENTS.join(', ')}`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const job = await claimNextJob();
    if (!job) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      continue;
    }

    console.log(`Processing job ${job.id} (${job.type})...`);
    try {
      const resultText = await runJob(job);
      await markDone(job.id, resultText);
      console.log(`✅ Job ${job.id} completed`);
    } catch (err) {
      await markFailed(job.id, err);
      console.error(`❌ Job ${job.id} failed:`, err && err.message ? err.message : err);
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

