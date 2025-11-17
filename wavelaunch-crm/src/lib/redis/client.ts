/**
 * Redis Client Configuration
 *
 * Provides Redis connection for caching and rate limiting.
 * Falls back gracefully if Redis is not available.
 */

import Redis from 'ioredis'

let redis: Redis | null = null
let redisAvailable = false

/**
 * Initialize Redis connection
 */
export function initRedis(): Redis | null {
  if (redis) {
    return redis
  }

  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    console.warn('REDIS_URL not configured. Rate limiting will use in-memory storage.')
    return null
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          // Reconnect when Redis is in readonly mode
          return true
        }
        return false
      },
    })

    redis.on('connect', () => {
      console.log('✅ Redis connected')
      redisAvailable = true
    })

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message)
      redisAvailable = false
    })

    redis.on('close', () => {
      console.warn('⚠️ Redis connection closed')
      redisAvailable = false
    })

    return redis
  } catch (error) {
    console.error('Failed to initialize Redis:', error)
    return null
  }
}

/**
 * Get Redis client instance
 */
export function getRedis(): Redis | null {
  return redis || initRedis()
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisAvailable && redis !== null
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
    redisAvailable = false
  }
}

/**
 * Redis cache helper with TTL
 */
export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  const client = getRedis()
  if (client && redisAvailable) {
    await client.setex(key, ttlSeconds, value)
  }
}

/**
 * Redis cache get helper
 */
export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedis()
  if (client && redisAvailable) {
    return await client.get(key)
  }
  return null
}

/**
 * Redis cache delete helper
 */
export async function cacheDelete(key: string): Promise<void> {
  const client = getRedis()
  if (client && redisAvailable) {
    await client.del(key)
  }
}

/**
 * Redis increment with expiry (for rate limiting)
 */
export async function incrementWithExpiry(
  key: string,
  ttlSeconds: number
): Promise<number> {
  const client = getRedis()
  if (!client || !redisAvailable) {
    throw new Error('Redis not available')
  }

  const pipeline = client.pipeline()
  pipeline.incr(key)
  pipeline.expire(key, ttlSeconds)
  const results = await pipeline.exec()

  if (!results || !results[0] || results[0][0]) {
    throw new Error('Failed to increment key')
  }

  return results[0][1] as number
}

/**
 * Get current count for rate limiting
 */
export async function getCount(key: string): Promise<number> {
  const client = getRedis()
  if (!client || !redisAvailable) {
    return 0
  }

  const value = await client.get(key)
  return value ? parseInt(value, 10) : 0
}

/**
 * Get TTL for a key
 */
export async function getTTL(key: string): Promise<number> {
  const client = getRedis()
  if (!client || !redisAvailable) {
    return -1
  }

  return await client.ttl(key)
}

// Initialize Redis on module load
initRedis()
