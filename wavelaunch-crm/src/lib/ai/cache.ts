import { db } from '@/lib/db'
import crypto from 'crypto'

/**
 * Generate a cache key from a prompt and parameters
 * Normalizes the prompt to catch semantically similar prompts
 */
export function generateCacheKey(
  prompt: string,
  model: string,
  params: {
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  }
): string {
  const normalized = {
    prompt: normalizePrompt(prompt),
    model,
    temperature: params.temperature ?? 1.0,
    maxTokens: params.maxTokens ?? 4096,
    system: params.systemPrompt ? normalizePrompt(params.systemPrompt) : '',
  }

  const content = JSON.stringify(normalized)
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Normalize a prompt for caching
 * - Convert to lowercase
 * - Normalize whitespace
 * - Remove articles (the, a, an) for better matching
 */
function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\b(the|a|an)\b/g, '') // Remove articles
    .trim()
}

/**
 * Generate a hash of the exact prompt (for storage)
 */
export function generatePromptHash(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex')
}

/**
 * Check if a cached response exists and is still valid
 */
export async function checkCache(cacheKey: string): Promise<string | null> {
  try {
    const cached = await db.promptCache.findUnique({
      where: { cacheKey },
    })

    if (!cached) {
      return null
    }

    // Check if expired
    if (new Date() > cached.expiresAt) {
      // Delete expired cache
      await db.promptCache.delete({
        where: { id: cached.id },
      })
      return null
    }

    // Update hit count and last used
    await db.promptCache.update({
      where: { id: cached.id },
      data: {
        hitCount: cached.hitCount + 1,
        lastUsedAt: new Date(),
      },
    })

    return cached.response
  } catch (error) {
    console.error('Cache check error:', error)
    return null
  }
}

/**
 * Store a response in cache
 */
export async function storeCache(
  cacheKey: string,
  promptHash: string,
  response: string,
  model: string,
  ttlHours: number = 168 // 7 days default
): Promise<void> {
  try {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + ttlHours)

    await db.promptCache.upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        promptHash,
        response,
        model,
        expiresAt,
        hitCount: 0,
        tokensSaved: 0,
      },
      update: {
        response,
        expiresAt,
        lastUsedAt: new Date(),
      },
    })

    // Evict old entries if cache is too large
    await evictOldCacheEntries()
  } catch (error) {
    console.error('Cache store error:', error)
  }
}

/**
 * Update tokens saved by a cache hit
 */
export async function updateTokensSaved(cacheKey: string, tokens: number): Promise<void> {
  try {
    const cached = await db.promptCache.findUnique({
      where: { cacheKey },
    })

    if (cached) {
      await db.promptCache.update({
        where: { id: cached.id },
        data: {
          tokensSaved: cached.tokensSaved + tokens,
        },
      })
    }
  } catch (error) {
    console.error('Update tokens saved error:', error)
  }
}

/**
 * Evict old cache entries using LRU strategy
 * Keeps the 1000 most recently used entries
 */
async function evictOldCacheEntries(): Promise<void> {
  try {
    const MAX_CACHE_SIZE = 1000

    const count = await db.promptCache.count()

    if (count > MAX_CACHE_SIZE) {
      // Get the oldest entries (LRU)
      const toDelete = await db.promptCache.findMany({
        orderBy: { lastUsedAt: 'asc' },
        take: count - MAX_CACHE_SIZE,
        select: { id: true },
      })

      // Delete them
      await db.promptCache.deleteMany({
        where: {
          id: {
            in: toDelete.map((c) => c.id),
          },
        },
      })
    }
  } catch (error) {
    console.error('Cache eviction error:', error)
  }
}

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  try {
    const result = await db.promptCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    return result.count
  } catch (error) {
    console.error('Clear expired cache error:', error)
    return 0
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number
  totalHits: number
  totalTokensSaved: number
  cacheHitRate: number
}> {
  try {
    const caches = await db.promptCache.findMany({
      select: {
        hitCount: true,
        tokensSaved: true,
      },
    })

    const totalEntries = caches.length
    const totalHits = caches.reduce((sum, c) => sum + c.hitCount, 0)
    const totalTokensSaved = caches.reduce((sum, c) => sum + c.tokensSaved, 0)

    // Get total token usage to calculate hit rate
    const tokenUsage = await db.tokenUsage.findMany({
      select: {
        cacheHit: true,
      },
    })

    const totalRequests = tokenUsage.length
    const cacheHits = tokenUsage.filter((t) => t.cacheHit).length
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0

    return {
      totalEntries,
      totalHits,
      totalTokensSaved,
      cacheHitRate,
    }
  } catch (error) {
    console.error('Get cache stats error:', error)
    return {
      totalEntries: 0,
      totalHits: 0,
      totalTokensSaved: 0,
      cacheHitRate: 0,
    }
  }
}
