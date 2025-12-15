/**
 * Enhanced Rate Limiter with Redis Support
 *
 * Provides distributed rate limiting using Redis when available,
 * with automatic fallback to in-memory storage for development.
 */

import {
  isRedisAvailable,
  incrementWithExpiry,
  getCount,
  getTTL,
} from './redis/client'

// In-memory fallback store
interface RateLimitEntry {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of Array.from(memoryStore.entries())) {
    if (now > entry.resetAt) {
      memoryStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  identifier: string // IP address, user ID, etc.
  endpoint: string // Endpoint identifier
  maxRequests: number // Max requests in window
  windowSeconds: number // Time window in seconds
}

export interface RateLimitResult {
  allowed: boolean
  current: number
  limit: number
  resetIn: number
  resetAt: number
  remaining: number
}

/**
 * Check rate limit using Redis (distributed) or in-memory (fallback)
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { identifier, endpoint, maxRequests, windowSeconds } = config
  const key = `ratelimit:${identifier}:${endpoint}`

  // Try Redis first
  if (isRedisAvailable()) {
    return await checkRateLimitRedis(key, maxRequests, windowSeconds)
  }

  // Fallback to in-memory
  return checkRateLimitMemory(key, maxRequests, windowSeconds)
}

/**
 * Check rate limit using Redis
 */
async function checkRateLimitRedis(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    // Get current count
    const currentCount = await getCount(key)

    // If over limit, don't increment
    if (currentCount >= maxRequests) {
      const ttl = await getTTL(key)
      return {
        allowed: false,
        current: currentCount,
        limit: maxRequests,
        resetIn: ttl > 0 ? ttl : windowSeconds,
        resetAt: Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000),
        remaining: 0,
      }
    }

    // Increment and set expiry
    const newCount = await incrementWithExpiry(key, windowSeconds)
    const ttl = await getTTL(key)

    return {
      allowed: newCount <= maxRequests,
      current: newCount,
      limit: maxRequests,
      resetIn: ttl > 0 ? ttl : windowSeconds,
      resetAt: Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000),
      remaining: Math.max(0, maxRequests - newCount),
    }
  } catch (error) {
    console.error('Redis rate limit error, falling back to memory:', error)
    return checkRateLimitMemory(key, maxRequests, windowSeconds)
  }
}

/**
 * Check rate limit using in-memory storage (fallback)
 */
function checkRateLimitMemory(
  key: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  let entry = memoryStore.get(key)

  // Create new entry if expired or doesn't exist
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    }
    memoryStore.set(key, entry)

    return {
      allowed: true,
      current: 1,
      limit: maxRequests,
      resetIn: windowSeconds,
      resetAt: entry.resetAt,
      remaining: maxRequests - 1,
    }
  }

  // Increment count
  entry.count++

  const allowed = entry.count <= maxRequests
  const resetIn = Math.ceil((entry.resetAt - now) / 1000)

  return {
    allowed,
    current: entry.count,
    limit: maxRequests,
    resetIn,
    resetAt: entry.resetAt,
    remaining: Math.max(0, maxRequests - entry.count),
  }
}

/**
 * Global rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication endpoints (strict)
  AUTH_LOGIN: { maxRequests: 5, windowSeconds: 15 * 60 }, // 5 per 15 min
  AUTH_REGISTER: { maxRequests: 3, windowSeconds: 60 * 60 }, // 3 per hour
  AUTH_PASSWORD_RESET: { maxRequests: 3, windowSeconds: 60 * 60 }, // 3 per hour
  AUTH_FORGOT_PASSWORD: { maxRequests: 3, windowSeconds: 60 * 60 }, // 3 per hour

  // API endpoints (moderate)
  API_POST: { maxRequests: 100, windowSeconds: 15 * 60 }, // 100 per 15 min
  API_PUT: { maxRequests: 100, windowSeconds: 15 * 60 }, // 100 per 15 min
  API_PATCH: { maxRequests: 100, windowSeconds: 15 * 60 }, // 100 per 15 min
  API_DELETE: { maxRequests: 50, windowSeconds: 15 * 60 }, // 50 per 15 min
  API_GET: { maxRequests: 300, windowSeconds: 15 * 60 }, // 300 per 15 min

  // File operations (limited)
  FILE_UPLOAD: { maxRequests: 20, windowSeconds: 15 * 60 }, // 20 per 15 min
  FILE_DOWNLOAD: { maxRequests: 100, windowSeconds: 15 * 60 }, // 100 per 15 min

  // General (lenient)
  GENERAL: { maxRequests: 500, windowSeconds: 15 * 60 }, // 500 per 15 min
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Check Cloudflare header
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp

  // Check X-Real-IP
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  // Check X-Forwarded-For (take first IP)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  return 'unknown-client'
}

/**
 * Rate limit middleware helper
 */
export async function rateLimit(
  identifier: string,
  endpoint: string,
  config: { maxRequests: number; windowSeconds: number }
): Promise<RateLimitResult> {
  return checkRateLimit({
    identifier,
    endpoint,
    ...config,
  })
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', Math.floor(result.resetAt / 1000).toString())

  if (!result.allowed) {
    headers.set('Retry-After', result.resetIn.toString())
  }
}
