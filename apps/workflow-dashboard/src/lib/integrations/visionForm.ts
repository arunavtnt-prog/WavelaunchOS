import { z } from 'zod';
import { db } from '@/lib/db/prisma';
import fs from 'node:fs';
import path from 'node:path';

const VISION_FORM_SOURCE_URL_KEY = 'vision_form_source_url';

export const VisionFormPayloadSchema = z.object({
  id: z.string().min(1).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  fullName: z.string().min(1),
  email: z.string().email(),
  instagramHandle: z.string().optional().nullable(),
  tiktokHandle: z.string().optional().nullable(),
  country: z.string().default(''),
  industryNiche: z.string().default(''),
  age: z.number().int().nonnegative().default(0),

  professionalMilestones: z.string().default(''),
  personalTurningPoints: z.string().default(''),
  visionForVenture: z.string().default(''),
  hopeToAchieve: z.string().default(''),

  targetAudience: z.string().default(''),
  demographicProfile: z.string().default(''),
  targetDemographicAge: z.string().default(''),
  audienceGenderSplit: z.string().default(''),
  audienceMaritalStatus: z.string().optional().nullable(),
  currentChannels: z.string().default(''),

  keyPainPoints: z.string().default(''),
  brandValues: z.string().default(''),

  differentiation: z.string().default(''),
  uniqueValueProps: z.string().default(''),
  emergingCompetitors: z.string().optional().nullable(),

  idealBrandImage: z.string().default(''),
  inspirationBrands: z.string().optional().nullable(),
  brandingAesthetics: z.string().default(''),
  emotionsBrandEvokes: z.string().optional().nullable(),
  brandPersonality: z.string().default(''),
  preferredFont: z.string().optional().nullable(),

  productCategories: z.string().default(''),
  otherProductIdeas: z.string().optional().nullable(),

  scalingGoals: z.string().default(''),
  growthStrategies: z.string().optional().nullable(),
  longTermVision: z.string().default(''),
  specificDeadlines: z.string().optional().nullable(),
  additionalInfo: z.string().optional().nullable(),

  zipFilePath: z.string().optional().nullable(),
  zipFileName: z.string().optional().nullable(),
  zipFileSize: z.number().int().nonnegative().optional().nullable(),

  termsAccepted: z.boolean().optional().default(false),
  status: z.string().optional().default('PENDING'),
  reviewedAt: z.string().datetime().optional().nullable(),
  reviewNotes: z.string().optional().nullable(),
});

export type VisionFormPayload = z.infer<typeof VisionFormPayloadSchema>;

export async function getVisionFormSourceUrl(): Promise<string | null> {
  const env = (process.env.VISION_FORM_SOURCE_URL || '').trim();
  if (env) return env;

  try {
    const row = await db.settings.findUnique({ where: { key: VISION_FORM_SOURCE_URL_KEY } });
    const value = (row?.value || '').trim();
    if (value) return value;
  } catch {
    // ignore
  }

  const fallback = (process.env.VISION_FORM_SOURCE_URL_DEFAULT || '').trim();
  if (fallback) return fallback;

  // Local dev convenience: if a CRM env or token is present, default to the CRM domain.
  const hasExternalToken = Boolean((process.env.VISION_FORM_EXTERNAL_TOKEN || '').trim());
  const hasSourceDbUrl = Boolean((process.env.VISION_FORM_SOURCE_DATABASE_URL || '').trim());
  const hasRepoCrmDb = Boolean(getRepoCrmEnvDatabaseUrl());
  if (hasExternalToken || hasSourceDbUrl || hasRepoCrmDb) {
    return 'https://login.wavelaunch.org';
  }

  return null;
}

export async function setVisionFormSourceUrl(input: string): Promise<string> {
  const schema = z
    .string()
    .trim()
    .min(1)
    .refine((v) => {
      try {
        const u = new URL(v);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'Must be a valid http(s) URL');

  const value = schema.parse(input);

  // Normalize (no trailing slash).
  const normalized = value.replace(/\/+$/, '');

  await db.settings.upsert({
    where: { key: VISION_FORM_SOURCE_URL_KEY },
    update: { value: normalized },
    create: { key: VISION_FORM_SOURCE_URL_KEY, value: normalized },
  });

  return normalized;
}

function parseDotenvValue(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function findEnvVarInFile(contents: string, key: string): string | null {
  const lines = contents.split(/\r?\n/);
  for (const line of lines) {
    const l = line.trim();
    if (!l || l.startsWith('#')) continue;
    const idx = l.indexOf('=');
    if (idx < 1) continue;
    const k = l.slice(0, idx).trim();
    if (k !== key) continue;
    const v = l.slice(idx + 1);
    return parseDotenvValue(v);
  }
  return null;
}

function getRepoCrmEnvDatabaseUrl(): string | null {
  try {
    const candidates = [
      path.join(process.cwd(), '..', 'crm', '.env'),
      path.join(process.cwd(), '..', 'crm', '.env.local'),
    ];
    for (const candidate of candidates) {
      if (!fs.existsSync(candidate)) continue;
      const contents = fs.readFileSync(candidate, 'utf-8');
      const dbUrl = findEnvVarInFile(contents, 'DATABASE_URL');
      if (dbUrl) return dbUrl.trim();
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchApplicationsFromDatabase(databaseUrl: string): Promise<unknown[]> {
  const { PrismaClient } = await import('@prisma/client');

  const remoteDb = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: ['error'],
  });

  try {
    const apps = await remoteDb.application.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    // Normalize Dates to ISO strings for Zod parsing later.
    return JSON.parse(JSON.stringify(apps));
  } finally {
    await remoteDb.$disconnect();
  }
}

export async function fetchVisionFormApplications(): Promise<unknown[]> {
  const sourceUrl = await getVisionFormSourceUrl();
  if (!sourceUrl) {
    throw new Error('Vision Form source URL is not configured');
  }

  const errors: string[] = [];

  // 1) Try unauthenticated list endpoint (works if the source is public).
  try {
    const res = await fetch(new URL('/api/applications', sourceUrl), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      const apps: unknown[] = Array.isArray((json as any)?.data) ? (json as any).data : [];
      return apps;
    }

    const text = await res.text().catch(() => '');
    errors.push(
      `/api/applications → ${res.status} ${text.slice(0, 160) || res.statusText || ''}`.trim()
    );
  } catch (e) {
    errors.push(`/api/applications → ${e instanceof Error ? e.message : 'Request failed'}`);
  }

  // 2) Token-authenticated list endpoint (for login.wavelaunch.org which requires auth).
  const token = (process.env.VISION_FORM_EXTERNAL_TOKEN || '').trim();
  if (token) {
    try {
      const res = await fetch(new URL('/api/applications/external/list?take=100', sourceUrl), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const apps: unknown[] = Array.isArray((json as any)?.data) ? (json as any).data : [];
        return apps;
      }

      const text = await res.text().catch(() => '');
      errors.push(
        `/api/applications/external/list → ${res.status} ${text.slice(0, 160) || res.statusText || ''}`.trim()
      );
    } catch (e) {
      errors.push(`/api/applications/external/list → ${e instanceof Error ? e.message : 'Request failed'}`);
    }
  } else {
    errors.push('VISION_FORM_EXTERNAL_TOKEN not set');
  }

  // 3) Database fallback (useful when the source is behind auth and the external endpoint isn't deployed).
  const sourceDbUrl = (process.env.VISION_FORM_SOURCE_DATABASE_URL || '').trim() || getRepoCrmEnvDatabaseUrl();
  if (sourceDbUrl) {
    try {
      return await fetchApplicationsFromDatabase(sourceDbUrl);
    } catch (e) {
      errors.push(`DB fallback → ${e instanceof Error ? e.message : 'Failed to query source database'}`);
    }
  } else {
    errors.push('VISION_FORM_SOURCE_DATABASE_URL not set and no ../crm/.env DATABASE_URL found');
  }

  throw new Error(
    `Failed to fetch submissions from Vision Form source (${sourceUrl}).\n` +
      errors.map((m) => `- ${m}`).join('\n')
  );
}

export async function upsertVisionFormSubmission(payload: unknown): Promise<{ id: string }> {
  const parsed = VisionFormPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const error = new Error('Invalid vision form payload');
    (error as any).details = parsed.error.flatten();
    throw error;
  }

  const data = parsed.data;

  const existingById = data.id
    ? await db.application.findUnique({ where: { id: data.id } })
    : null;
  const existingByEmail = !existingById
    ? await db.application.findFirst({ where: { email: data.email }, orderBy: { createdAt: 'desc' } })
    : null;
  const targetId = existingById?.id || existingByEmail?.id;

  const createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
  const updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
  const reviewedAt = data.reviewedAt ? new Date(data.reviewedAt) : undefined;

  const upserted = targetId
    ? await db.application.update({
        where: { id: targetId },
        data: {
          ...(createdAt ? { createdAt } : {}),
          ...(updatedAt ? { updatedAt } : {}),
          fullName: data.fullName,
          email: data.email,
          instagramHandle: data.instagramHandle ?? null,
          tiktokHandle: data.tiktokHandle ?? null,
          country: data.country,
          industryNiche: data.industryNiche,
          age: data.age,

          professionalMilestones: data.professionalMilestones,
          personalTurningPoints: data.personalTurningPoints,
          visionForVenture: data.visionForVenture,
          hopeToAchieve: data.hopeToAchieve,

          targetAudience: data.targetAudience,
          demographicProfile: data.demographicProfile,
          targetDemographicAge: data.targetDemographicAge,
          audienceGenderSplit: data.audienceGenderSplit,
          audienceMaritalStatus: data.audienceMaritalStatus ?? null,
          currentChannels: data.currentChannels,

          keyPainPoints: data.keyPainPoints,
          brandValues: data.brandValues,

          differentiation: data.differentiation,
          uniqueValueProps: data.uniqueValueProps,
          emergingCompetitors: data.emergingCompetitors ?? null,

          idealBrandImage: data.idealBrandImage,
          inspirationBrands: data.inspirationBrands ?? null,
          brandingAesthetics: data.brandingAesthetics,
          emotionsBrandEvokes: data.emotionsBrandEvokes ?? null,
          brandPersonality: data.brandPersonality,
          preferredFont: data.preferredFont ?? null,

          productCategories: data.productCategories,
          otherProductIdeas: data.otherProductIdeas ?? null,

          scalingGoals: data.scalingGoals,
          growthStrategies: data.growthStrategies ?? null,
          longTermVision: data.longTermVision,
          specificDeadlines: data.specificDeadlines ?? null,
          additionalInfo: data.additionalInfo ?? null,

          zipFilePath: data.zipFilePath ?? null,
          zipFileName: data.zipFileName ?? null,
          zipFileSize: data.zipFileSize ?? null,

          termsAccepted: data.termsAccepted,
          status: data.status,
          reviewedAt: reviewedAt ?? null,
          reviewNotes: data.reviewNotes ?? null,
        },
      })
    : await db.application.create({
        data: {
          ...(data.id ? { id: data.id } : {}),
          ...(createdAt ? { createdAt } : {}),
          ...(updatedAt ? { updatedAt } : {}),
          fullName: data.fullName,
          email: data.email,
          instagramHandle: data.instagramHandle ?? null,
          tiktokHandle: data.tiktokHandle ?? null,
          country: data.country,
          industryNiche: data.industryNiche,
          age: data.age,

          professionalMilestones: data.professionalMilestones,
          personalTurningPoints: data.personalTurningPoints,
          visionForVenture: data.visionForVenture,
          hopeToAchieve: data.hopeToAchieve,

          targetAudience: data.targetAudience,
          demographicProfile: data.demographicProfile,
          targetDemographicAge: data.targetDemographicAge,
          audienceGenderSplit: data.audienceGenderSplit,
          audienceMaritalStatus: data.audienceMaritalStatus ?? null,
          currentChannels: data.currentChannels,

          keyPainPoints: data.keyPainPoints,
          brandValues: data.brandValues,

          differentiation: data.differentiation,
          uniqueValueProps: data.uniqueValueProps,
          emergingCompetitors: data.emergingCompetitors ?? null,

          idealBrandImage: data.idealBrandImage,
          inspirationBrands: data.inspirationBrands ?? null,
          brandingAesthetics: data.brandingAesthetics,
          emotionsBrandEvokes: data.emotionsBrandEvokes ?? null,
          brandPersonality: data.brandPersonality,
          preferredFont: data.preferredFont ?? null,

          productCategories: data.productCategories,
          otherProductIdeas: data.otherProductIdeas ?? null,

          scalingGoals: data.scalingGoals,
          growthStrategies: data.growthStrategies ?? null,
          longTermVision: data.longTermVision,
          specificDeadlines: data.specificDeadlines ?? null,
          additionalInfo: data.additionalInfo ?? null,

          zipFilePath: data.zipFilePath ?? null,
          zipFileName: data.zipFileName ?? null,
          zipFileSize: data.zipFileSize ?? null,

          termsAccepted: data.termsAccepted,
          status: data.status,
          reviewedAt: reviewedAt ?? null,
          reviewNotes: data.reviewNotes ?? null,
        },
      });

  await db.workflowState.upsert({
    where: { applicationId: upserted.id },
    update: {},
    create: { applicationId: upserted.id, status: 'SUBMITTED' },
  });

  return { id: upserted.id };
}
