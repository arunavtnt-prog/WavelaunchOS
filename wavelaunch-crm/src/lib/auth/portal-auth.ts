/**
 * Client Portal Authentication Utilities
 *
 * Handles authentication and authorization for the client portal
 * Separate from admin auth system
 */

import { hash, compare } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

// Ensure JWT_SECRET is configured - fail fast if missing
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    'NEXTAUTH_SECRET environment variable is required for portal authentication. ' +
    'Please set it in your .env file.'
  )
}

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

const PORTAL_TOKEN_NAME = 'portal-token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface PortalSession {
  userId: string
  clientId: string
  email: string
  iat: number
  exp: number
}

/**
 * Hash a password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

/**
 * Create a JWT token for portal authentication
 */
export async function createPortalToken(payload: {
  userId: string
  clientId: string
  email: string
}): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify a JWT token and return the payload
 */
export async function verifyPortalToken(
  token: string
): Promise<PortalSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as unknown as PortalSession
  } catch (error) {
    return null
  }
}

/**
 * Set portal auth cookie
 */
export async function setPortalCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(PORTAL_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/portal',
  })
}

/**
 * Get portal auth cookie
 */
export async function getPortalCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(PORTAL_TOKEN_NAME)
  return token?.value || null
}

/**
 * Remove portal auth cookie
 */
export async function clearPortalCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(PORTAL_TOKEN_NAME)
}

/**
 * Get current portal session from cookie
 */
export async function getPortalSession(): Promise<PortalSession | null> {
  const token = await getPortalCookie()
  if (!token) return null

  return verifyPortalToken(token)
}

/**
 * Get and verify portal session with database validation
 * This ensures the session's userId and clientId match what's in the database
 * Use this for all portal API routes that access client data
 */
export async function getVerifiedPortalSession(): Promise<{
  session: PortalSession
  portalUser: Awaited<ReturnType<typeof getPortalUser>>
} | null> {
  const session = await getPortalSession()
  if (!session) return null

  // Verify the session data matches the database
  const portalUser = await getPortalUser(session.userId)

  if (!portalUser) {
    // Session is invalid - user doesn't exist
    return null
  }

  if (portalUser.clientId !== session.clientId) {
    // Session data has been tampered with - clientId doesn't match
    console.error('Session validation failed: clientId mismatch', {
      sessionUserId: session.userId,
      sessionClientId: session.clientId,
      actualClientId: portalUser.clientId,
    })
    return null
  }

  if (!portalUser.isActive) {
    // User account is deactivated
    return null
  }

  return { session, portalUser }
}

/**
 * Get portal user with client data
 */
export async function getPortalUser(userId: string) {
  return prisma.clientPortalUser.findUnique({
    where: { id: userId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          industryNiche: true,
          status: true,
          onboardedAt: true,
        },
      },
    },
  })
}

/**
 * Authenticate portal user (login)
 */
export async function authenticatePortalUser(
  email: string,
  password: string
): Promise<{
  success: boolean
  user?: {
    id: string
    clientId: string
    email: string
  }
  error?: string
}> {
  try {
    // Find portal user
    const portalUser = await prisma.clientPortalUser.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        client: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (!portalUser) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Check if portal account is active
    if (!portalUser.isActive) {
      return {
        success: false,
        error: 'Portal account is not activated. Please check your email for the invitation link.',
      }
    }

    // Check if client is archived
    if (portalUser.client.status === 'ARCHIVED') {
      return {
        success: false,
        error: 'Account has been archived. Please contact support.',
      }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, portalUser.passwordHash)

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Update last login
    await prisma.clientPortalUser.update({
      where: { id: portalUser.id },
      data: { lastLoginAt: new Date() },
    })

    return {
      success: true,
      user: {
        id: portalUser.id,
        clientId: portalUser.clientId,
        email: portalUser.email,
      },
    }
  } catch (error) {
    console.error('Portal auth error:', error)
    return {
      success: false,
      error: 'Authentication failed. Please try again.',
    }
  }
}

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const portalUser = await prisma.clientPortalUser.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!portalUser) return null

  // Create a short-lived token (1 hour)
  const token = await new SignJWT({ userId: portalUser.id, type: 'reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const payload = verified.payload as { userId: string; type: string }

    if (payload.type !== 'reset') return null

    return { userId: payload.userId }
  } catch (error) {
    return null
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const verification = await verifyPasswordResetToken(token)

  if (!verification) {
    return {
      success: false,
      error: 'Invalid or expired reset token',
    }
  }

  try {
    const hashedPassword = await hashPassword(newPassword)

    await prisma.clientPortalUser.update({
      where: { id: verification.userId },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: 'Failed to reset password. Please try again.',
    }
  }
}

/**
 * Change password (authenticated user)
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await prisma.clientPortalUser.findUnique({
      where: { id: userId },
    })

    if (!portalUser) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Verify current password
    const isValidPassword = await verifyPassword(
      currentPassword,
      portalUser.passwordHash
    )

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Current password is incorrect',
      }
    }

    // Hash and save new password
    const hashedPassword = await hashPassword(newPassword)

    await prisma.clientPortalUser.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Change password error:', error)
    return {
      success: false,
      error: 'Failed to change password. Please try again.',
    }
  }
}

/**
 * Generate a random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

/**
 * Require portal authentication middleware
 * Use this in API routes that need portal auth
 */
export async function requirePortalAuth(): Promise<{
  authorized: boolean
  session?: PortalSession
  error?: string
}> {
  const session = await getPortalSession()

  if (!session) {
    return {
      authorized: false,
      error: 'Unauthorized',
    }
  }

  // Verify user still exists and is active
  const portalUser = await prisma.clientPortalUser.findUnique({
    where: { id: session.userId },
    select: {
      isActive: true,
      client: {
        select: {
          status: true,
        },
      },
    },
  })

  if (!portalUser || !portalUser.isActive || portalUser.client.status === 'ARCHIVED') {
    await clearPortalCookie()
    return {
      authorized: false,
      error: 'Session expired or account deactivated',
    }
  }

  return {
    authorized: true,
    session,
  }
}
