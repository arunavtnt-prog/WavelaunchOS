/**
 * API Response Caching with Redis
 *
 * Provides intelligent caching for API responses with automatic invalidation.
 * Falls back to in-memory caching when Redis is unavailable.
 */

import { redis, isRedisAvailable } from '@/lib/redis/client'
import { logDebug, logInfo, logWarn } from '@/lib/logging/logger'

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  SHORT: 60,           // 1 minute - frequently changing data
  MEDIUM: 300,         // 5 minutes - moderate update frequency
  LONG: 1800,          // 30 minutes - rarely changing data
  VERY_LONG: 3600,     // 1 hour - static data
} as const

// Cache key prefixes for organization
export const CACHE_PREFIX = {
  CLIENT: 'client:',
  BUSINESS_PLAN: 'bp:',
  DELIVERABLE: 'del:',
  FILE: 'file:',
  NOTE: 'note:',
  ACTIVITY: 'activity:',
  STATS: 'stats:',
  HEALTH: 'health:',
  LIST: 'list:',
} as const

// In-memory cache fallback (LRU cache)
class InMemoryCache {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map()
  private maxSize = 1000 // Prevent memory bloat

  set(key: string, value: any, ttl: number): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    // Check expiration
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  deleteByPrefix(prefix: string): void {
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

const memCache = new InMemoryCache()

/**
 * API Cache Service
 * Provides caching with automatic fallback
 */
export class APICache {
  private useRedis: boolean

  constructor() {
    this.useRedis = isRedisAvailable()

    if (this.useRedis) {
      logInfo('API Cache using Redis')
    } else {
      logWarn('API Cache using in-memory fallback (Redis not available)')
    }
  }

  /**
   * Get cached value
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (this.useRedis && redis) {
        const value = await redis.get(key)
        if (value) {
          logDebug(`Cache HIT: ${key}`)
          return JSON.parse(value)
        }
        logDebug(`Cache MISS: ${key}`)
        return null
      } else {
        const value = memCache.get(key)
        if (value) {
          logDebug(`Memory cache HIT: ${key}`)
        } else {
          logDebug(`Memory cache MISS: ${key}`)
        }
        return value
      }
    } catch (error) {
      logWarn(`Cache get error for ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }
  }

  /**
   * Set cached value
   */
  async set(key: string, value: any, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    try {
      if (this.useRedis && redis) {
        await redis.setex(key, ttl, JSON.stringify(value))
        logDebug(`Cache SET: ${key} (TTL: ${ttl}s)`)
      } else {
        memCache.set(key, value, ttl)
        logDebug(`Memory cache SET: ${key} (TTL: ${ttl}s)`)
      }
    } catch (error) {
      logWarn(`Cache set error for ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.useRedis && redis) {
        await redis.del(key)
        logDebug(`Cache DELETE: ${key}`)
      } else {
        memCache.delete(key)
        logDebug(`Memory cache DELETE: ${key}`)
      }
    } catch (error) {
      logWarn(`Cache delete error for ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete all keys with prefix
   * Useful for bulk invalidation (e.g., all client-related caches)
   */
  async deleteByPrefix(prefix: string): Promise<void> {
    try {
      if (this.useRedis && redis) {
        const keys = await redis.keys(`${prefix}*`)
        if (keys.length > 0) {
          await redis.del(...keys)
          logDebug(`Cache DELETE by prefix: ${prefix} (${keys.length} keys)`)
        }
      } else {
        memCache.deleteByPrefix(prefix)
        logDebug(`Memory cache DELETE by prefix: ${prefix}`)
      }
    } catch (error) {
      logWarn(`Cache deleteByPrefix error for ${prefix}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Clear all caches
   * Use with caution!
   */
  async clear(): Promise<void> {
    try {
      if (this.useRedis && redis) {
        await redis.flushdb()
        logInfo('Redis cache cleared')
      } else {
        memCache.clear()
        logInfo('Memory cache cleared')
      }
    } catch (error) {
      logWarn(`Cache clear error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get or set pattern
   * Fetches from cache or executes function and caches result
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Cache miss - fetch data
    const data = await fetcher()

    // Cache the result
    await this.set(key, data, ttl)

    return data
  }

  /**
   * Check if using Redis
   */
  isUsingRedis(): boolean {
    return this.useRedis
  }

  /**
   * Get cache stats
   */
  async getStats(): Promise<{
    backend: 'redis' | 'memory'
    size?: number
    memory?: string
  }> {
    if (this.useRedis && redis) {
      try {
        const info = await redis.info('memory')
        const memory = info.match(/used_memory_human:([^\r\n]+)/)?.[1]
        const keys = await redis.dbsize()
        return {
          backend: 'redis',
          size: keys,
          memory: memory || 'unknown',
        }
      } catch (error) {
        return { backend: 'redis', size: 0, memory: 'unknown' }
      }
    } else {
      return {
        backend: 'memory',
        size: memCache.size(),
      }
    }
  }
}

// Singleton instance
export const apiCache = new APICache()

/**
 * Cache key builders
 * Consistent key naming across the app
 */
export const cacheKeys = {
  // Client keys
  client: (id: string) => `${CACHE_PREFIX.CLIENT}${id}`,
  clientList: (filters?: string) =>
    `${CACHE_PREFIX.LIST}clients${filters ? `:${filters}` : ''}`,

  // Business plan keys
  businessPlan: (id: string) => `${CACHE_PREFIX.BUSINESS_PLAN}${id}`,
  businessPlanByClient: (clientId: string) =>
    `${CACHE_PREFIX.BUSINESS_PLAN}client:${clientId}`,

  // Deliverable keys
  deliverable: (id: string) => `${CACHE_PREFIX.DELIVERABLE}${id}`,
  deliverablesByClient: (clientId: string) =>
    `${CACHE_PREFIX.DELIVERABLE}client:${clientId}`,
  deliverableByMonth: (clientId: string, month: number) =>
    `${CACHE_PREFIX.DELIVERABLE}client:${clientId}:m${month}`,

  // File keys
  file: (id: string) => `${CACHE_PREFIX.FILE}${id}`,
  filesByClient: (clientId: string) =>
    `${CACHE_PREFIX.FILE}client:${clientId}`,

  // Note keys
  note: (id: string) => `${CACHE_PREFIX.NOTE}${id}`,
  notesByClient: (clientId: string) =>
    `${CACHE_PREFIX.NOTE}client:${clientId}`,

  // Activity keys
  activity: (id: string) => `${CACHE_PREFIX.ACTIVITY}${id}`,
  activitiesByClient: (clientId: string) =>
    `${CACHE_PREFIX.ACTIVITY}client:${clientId}`,

  // Stats keys
  stats: (type: string) => `${CACHE_PREFIX.STATS}${type}`,
  dashboardStats: () => `${CACHE_PREFIX.STATS}dashboard`,

  // Health keys
  health: () => `${CACHE_PREFIX.HEALTH}check`,
}

/**
 * Cache invalidation helpers
 * Call these when data changes
 */
export const invalidateCache = {
  // Invalidate all caches for a client
  client: async (clientId: string) => {
    await Promise.all([
      apiCache.delete(cacheKeys.client(clientId)),
      apiCache.deleteByPrefix(`${CACHE_PREFIX.BUSINESS_PLAN}client:${clientId}`),
      apiCache.deleteByPrefix(`${CACHE_PREFIX.DELIVERABLE}client:${clientId}`),
      apiCache.deleteByPrefix(`${CACHE_PREFIX.FILE}client:${clientId}`),
      apiCache.deleteByPrefix(`${CACHE_PREFIX.NOTE}client:${clientId}`),
      apiCache.deleteByPrefix(`${CACHE_PREFIX.ACTIVITY}client:${clientId}`),
      apiCache.deleteByPrefix(CACHE_PREFIX.LIST), // Invalidate list caches
      apiCache.deleteByPrefix(CACHE_PREFIX.STATS), // Invalidate stats
    ])
    logInfo(`Invalidated all caches for client: ${clientId}`)
  },

  // Invalidate business plan caches
  businessPlan: async (id: string, clientId: string) => {
    await Promise.all([
      apiCache.delete(cacheKeys.businessPlan(id)),
      apiCache.deleteByPrefix(`${CACHE_PREFIX.BUSINESS_PLAN}client:${clientId}`),
      apiCache.delete(cacheKeys.client(clientId)),
    ])
  },

  // Invalidate deliverable caches
  deliverable: async (id: string, clientId: string, month: number) => {
    await Promise.all([
      apiCache.delete(cacheKeys.deliverable(id)),
      apiCache.delete(cacheKeys.deliverableByMonth(clientId, month)),
      apiCache.deleteByPrefix(`${CACHE_PREFIX.DELIVERABLE}client:${clientId}`),
      apiCache.delete(cacheKeys.client(clientId)),
    ])
  },

  // Invalidate list caches
  lists: async () => {
    await apiCache.deleteByPrefix(CACHE_PREFIX.LIST)
  },

  // Invalidate stats caches
  stats: async () => {
    await apiCache.deleteByPrefix(CACHE_PREFIX.STATS)
  },

  // Invalidate everything
  all: async () => {
    await apiCache.clear()
    logInfo('All caches invalidated')
  },
}
