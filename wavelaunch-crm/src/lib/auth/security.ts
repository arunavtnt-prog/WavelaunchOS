/**
 * Authentication Security
 *
 * Implements account lockout, session management, and login attempt tracking.
 * Prevents brute force attacks and manages user session security.
 */

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Security constants
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15
const SESSION_DURATION_HOURS = 24
const LOGIN_ATTEMPT_WINDOW_MINUTES = 15

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (cfConnectingIp) return cfConnectingIp
  if (realIp) return realIp
  if (forwarded) return forwarded.split(',')[0].trim()

  return 'unknown'
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Check if user account is currently locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { lockedUntil: true },
  })

  if (!user || !user.lockedUntil) {
    return false
  }

  // Check if lock has expired
  if (new Date() > user.lockedUntil) {
    // Unlock the account
    await prisma.user.update({
      where: { email },
      data: {
        lockedUntil: null,
        failedLoginCount: 0,
      },
    })
    return false
  }

  return true
}

/**
 * Check if session has expired
 */
export async function isSessionExpired(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sessionExpiry: true },
  })

  if (!user || !user.sessionExpiry) {
    return false // No session expiry set, consider valid
  }

  return new Date() > user.sessionExpiry
}

/**
 * Log login attempt (success or failure)
 */
export async function logLoginAttempt(data: {
  email: string
  ip: string
  userAgent: string
  success: boolean
  reason?: string
  userId?: string
}): Promise<void> {
  await prisma.loginAttempt.create({
    data: {
      email: data.email,
      ip: data.ip,
      userAgent: data.userAgent,
      success: data.success,
      reason: data.reason,
      userId: data.userId,
    },
  })
}

/**
 * Get recent failed login attempts for an email
 */
export async function getRecentFailedAttempts(email: string): Promise<number> {
  const windowStart = new Date(
    Date.now() - LOGIN_ATTEMPT_WINDOW_MINUTES * 60 * 1000
  )

  const count = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: windowStart,
      },
    },
  })

  return count
}

/**
 * Handle failed login attempt
 * Increments failed count and locks account if threshold reached
 */
export async function handleFailedLogin(
  email: string,
  ip: string,
  userAgent: string,
  reason: string
): Promise<{ locked: boolean; remainingAttempts: number }> {
  // Log the failed attempt
  await logLoginAttempt({
    email,
    ip,
    userAgent,
    success: false,
    reason,
  })

  // Get user
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, failedLoginCount: true },
  })

  if (!user) {
    // Don't reveal that user doesn't exist
    return { locked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS }
  }

  // Increment failed login count
  const newCount = user.failedLoginCount + 1

  // Lock account if threshold reached
  if (newCount >= MAX_LOGIN_ATTEMPTS) {
    const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: newCount,
        lockedUntil: lockUntil,
      },
    })

    return { locked: true, remainingAttempts: 0 }
  }

  // Update failed count
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: newCount,
    },
  })

  return {
    locked: false,
    remainingAttempts: MAX_LOGIN_ATTEMPTS - newCount,
  }
}

/**
 * Handle successful login
 * Resets failed count and sets session expiry
 */
export async function handleSuccessfulLogin(
  userId: string,
  email: string,
  ip: string,
  userAgent: string
): Promise<void> {
  const sessionExpiry = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000)

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      sessionExpiry,
    },
  })

  // Log successful attempt
  await logLoginAttempt({
    email,
    ip,
    userAgent,
    success: true,
    userId,
  })
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check for common passwords
  const commonPasswords = [
    'password',
    'password123',
    '12345678',
    'qwerty',
    'abc123',
    'letmein',
    'welcome',
    'admin',
  ]

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12) // 12 rounds for strong hashing
  return bcrypt.hash(password, salt)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Get lockout time remaining in minutes
 */
export async function getLockoutTimeRemaining(email: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { lockedUntil: true },
  })

  if (!user || !user.lockedUntil) {
    return null
  }

  const remaining = user.lockedUntil.getTime() - Date.now()
  if (remaining <= 0) {
    return null
  }

  return Math.ceil(remaining / 60000) // Convert to minutes
}

/**
 * Extend session expiry (called on user activity)
 */
export async function extendSession(userId: string): Promise<void> {
  const newExpiry = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: userId },
    data: {
      sessionExpiry: newExpiry,
    },
  })
}

/**
 * Invalidate session (logout)
 */
export async function invalidateSession(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      sessionExpiry: new Date(), // Set to past date
    },
  })
}

/**
 * Clean up old login attempts (should be run periodically)
 */
export async function cleanupOldLoginAttempts(): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const result = await prisma.loginAttempt.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  })

  return result.count
}

/**
 * Get login statistics for a user
 */
export async function getLoginStats(userId: string) {
  const [totalAttempts, successfulLogins, failedAttempts, lastLogin] = await Promise.all([
    prisma.loginAttempt.count({
      where: { userId },
    }),
    prisma.loginAttempt.count({
      where: { userId, success: true },
    }),
    prisma.loginAttempt.count({
      where: { userId, success: false },
    }),
    prisma.loginAttempt.findFirst({
      where: { userId, success: true },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, ip: true },
    }),
  ])

  return {
    totalAttempts,
    successfulLogins,
    failedAttempts,
    lastLogin: lastLogin
      ? {
          timestamp: lastLogin.createdAt,
          ip: lastLogin.ip,
        }
      : null,
  }
}
