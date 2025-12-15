/**
 * Simple in-memory rate limiter
 * In production, this should use Redis or a persistent store
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Store rate limit data in memory
// Key format: `${identifier}:${endpoint}`
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number

  /**
   * Time window in seconds
   */
  windowSeconds: number

  /**
   * Unique identifier for the requester (IP address, user ID, etc.)
   */
  identifier: string

  /**
   * Endpoint identifier (e.g., 'portal-login', 'password-reset')
   */
  endpoint: string
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean

  /**
   * Current request count in this window
   */
  current: number

  /**
   * Maximum allowed requests
   */
  limit: number

  /**
   * Time until the rate limit resets (in seconds)
   */
  resetIn: number

  /**
   * Timestamp when the rate limit resets
   */
  resetAt: number
}

/**
 * Check if a request should be rate limited
 *
 * @example
 * const result = checkRateLimit({
 *   identifier: req.ip || 'unknown',
 *   endpoint: 'portal-login',
 *   maxRequests: 5,
 *   windowSeconds: 60
 * })
 *
 * if (!result.allowed) {
 *   return res.status(429).json({
 *     error: 'Too many requests. Please try again later.',
 *     resetIn: result.resetIn
 *   })
 * }
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { identifier, endpoint, maxRequests, windowSeconds } = config
  const key = `${identifier}:${endpoint}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)

  // If no entry exists or window has expired, create new entry
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(key, entry)

    return {
      allowed: true,
      current: 1,
      limit: maxRequests,
      resetIn: windowSeconds,
      resetAt: entry.resetAt,
    }
  }

  // Increment count
  entry.count++

  // Check if limit exceeded
  const allowed = entry.count <= maxRequests
  const resetIn = Math.ceil((entry.resetAt - now) / 1000)

  return {
    allowed,
    current: entry.count,
    limit: maxRequests,
    resetIn,
    resetAt: entry.resetAt,
  }
}

/**
 * Reset rate limit for a specific identifier and endpoint
 * Useful for testing or manual overrides
 */
export function resetRateLimit(identifier: string, endpoint: string): void {
  const key = `${identifier}:${endpoint}`
  rateLimitStore.delete(key)
}

/**
 * Get client identifier from request
 * Tries to get IP from various headers (for proxies) or falls back to connection
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from common proxy headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a generic identifier
  // In a real production app, you'd want to get this from the connection
  return 'unknown-client'
}
