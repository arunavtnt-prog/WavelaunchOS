/* eslint-disable no-console */

// Usage:
//   DOTENV_CONFIG_PATH=.env.local APPLICATION_FORM_URL=http://127.0.0.1:3008 \
//     node -r dotenv/config scripts/import-vision-form.js
//
// Notes:
// - Imports submissions from the Vision Application Form API (`/api/applications`)
// - Upserts them into workflow-dashboard's DB and creates a `workflowState` (SUBMITTED)

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const APPLICATION_FORM_URL = process.env.APPLICATION_FORM_URL;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

async function fetchAllApplications() {
  const baseUrl = requireEnv('APPLICATION_FORM_URL');
  const res = await fetch(`${baseUrl}/api/applications`, { method: 'GET' });
  const text = await res.text().catch(() => '');
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error(`Vision form API failed (${res.status}): ${json?.error || text || res.statusText}`);
  }
  if (!json?.success || !Array.isArray(json.data)) {
    throw new Error('Vision form API returned unexpected payload');
  }
  return json.data;
}

async function upsertApplication(data) {
  if (!data?.id || !data?.email || !data?.fullName) {
    throw new Error('Invalid application: missing id/fullName/email');
  }

  const existing = await prisma.application.findUnique({ where: { id: data.id } });
  const reviewedAt = data.reviewedAt ? new Date(data.reviewedAt) : null;

  const payload = {
    id: data.id,
    fullName: data.fullName,
    email: data.email,
    instagramHandle: data.instagramHandle ?? null,
    tiktokHandle: data.tiktokHandle ?? null,
    country: data.country ?? '',
    industryNiche: data.industryNiche ?? '',
    age: Number.isFinite(data.age) ? Number(data.age) : 0,

    professionalMilestones: data.professionalMilestones ?? '',
    personalTurningPoints: data.personalTurningPoints ?? '',
    visionForVenture: data.visionForVenture ?? '',
    hopeToAchieve: data.hopeToAchieve ?? '',

    targetAudience: data.targetAudience ?? '',
    demographicProfile: data.demographicProfile ?? '',
    targetDemographicAge: data.targetDemographicAge ?? '',
    audienceGenderSplit: data.audienceGenderSplit ?? '',
    audienceMaritalStatus: data.audienceMaritalStatus ?? null,
    currentChannels: data.currentChannels ?? '',

    keyPainPoints: data.keyPainPoints ?? '',
    brandValues: data.brandValues ?? '',

    differentiation: data.differentiation ?? '',
    uniqueValueProps: data.uniqueValueProps ?? '',
    emergingCompetitors: data.emergingCompetitors ?? null,

    idealBrandImage: data.idealBrandImage ?? '',
    inspirationBrands: data.inspirationBrands ?? null,
    brandingAesthetics: data.brandingAesthetics ?? '',
    emotionsBrandEvokes: data.emotionsBrandEvokes ?? null,
    brandPersonality: data.brandPersonality ?? '',
    preferredFont: data.preferredFont ?? null,

    productCategories: data.productCategories ?? '',
    otherProductIdeas: data.otherProductIdeas ?? null,

    scalingGoals: data.scalingGoals ?? '',
    growthStrategies: data.growthStrategies ?? null,
    longTermVision: data.longTermVision ?? '',
    specificDeadlines: data.specificDeadlines ?? null,
    additionalInfo: data.additionalInfo ?? null,

    zipFilePath: data.zipFilePath ?? null,
    zipFileName: data.zipFileName ?? null,
    zipFileSize: data.zipFileSize ?? null,

    termsAccepted: Boolean(data.termsAccepted),
    status: data.status ?? 'PENDING',
    reviewedAt,
    reviewNotes: data.reviewNotes ?? null,
  };

  if (existing) {
    await prisma.application.update({ where: { id: data.id }, data: payload });
  } else {
    const createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    await prisma.application.create({ data: { ...payload, ...(createdAt ? { createdAt } : {}) } });
  }

  await prisma.workflowState.upsert({
    where: { applicationId: data.id },
    update: {},
    create: { applicationId: data.id, status: 'SUBMITTED' },
  });
}

async function main() {
  if (!APPLICATION_FORM_URL) {
    console.error('Missing APPLICATION_FORM_URL.\nExample: APPLICATION_FORM_URL=http://127.0.0.1:3008');
    process.exit(1);
  }

  console.log(`[import-vision-form] Fetching submissions from ${APPLICATION_FORM_URL}...`);
  const applications = await fetchAllApplications();
  console.log(`[import-vision-form] Found ${applications.length} submissions. Importing...`);

  let ok = 0;
  let failed = 0;

  for (const a of applications) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await upsertApplication(a);
      ok += 1;
    } catch (err) {
      failed += 1;
      console.error(`[import-vision-form] Failed for id=${a?.id || 'unknown'}:`, err && err.message ? err.message : err);
    }
  }

  console.log(`[import-vision-form] Done. Imported=${ok}, Failed=${failed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

