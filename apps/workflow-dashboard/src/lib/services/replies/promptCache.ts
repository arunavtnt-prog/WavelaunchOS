import * as crypto from 'crypto';
import { db } from '@/lib/db/prisma';

export function sha256(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

export async function getPromptCache(cacheKey: string) {
  const row = await db.promptCache.findUnique({ where: { cacheKey } });
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  await db.promptCache.update({
    where: { cacheKey },
    data: {
      hitCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });
  return row;
}

export async function putPromptCache(params: {
  cacheKey: string;
  prompt: string;
  response: string;
  model: string;
  ttlSeconds: number;
}) {
  const promptHash = sha256(params.prompt);
  const expiresAt = new Date(Date.now() + params.ttlSeconds * 1000);
  await db.promptCache.upsert({
    where: { cacheKey: params.cacheKey },
    create: {
      cacheKey: params.cacheKey,
      promptHash,
      response: params.response,
      model: params.model,
      expiresAt,
      tokensSaved: 0,
      hitCount: 0,
    },
    update: {
      promptHash,
      response: params.response,
      model: params.model,
      expiresAt,
    },
  });
}

export function cacheKeyFor(parts: Array<string | number | null | undefined>) {
  return parts.filter((p) => p !== null && p !== undefined).join(':');
}
