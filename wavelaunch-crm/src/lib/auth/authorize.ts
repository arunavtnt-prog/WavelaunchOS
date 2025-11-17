/**
 * Authorization Helpers
 *
 * Provides row-level security checks to ensure users can only access their own data.
 * Used across all API routes to prevent unauthorized access.
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export type AuthorizedUser = {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'CLIENT'
}

/**
 * Get the current authenticated user from session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthorizedUser | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  return user
}

/**
 * Require authentication - throws 401 if not authenticated
 */
export async function requireAuth(): Promise<AuthorizedUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError('Authentication required')
  }

  return user
}

/**
 * Require admin role - throws 403 if not admin
 */
export async function requireAdmin(): Promise<AuthorizedUser> {
  const user = await requireAuth()

  if (user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required')
  }

  return user
}

/**
 * Check if user owns or has access to a client
 * Admins have access to all clients
 * Portal users only have access to their own client
 */
export async function authorizeClientAccess(
  userId: string,
  clientId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    return false
  }

  // Admins have access to all clients
  if (user.role === 'ADMIN') {
    return true
  }

  // Portal users can only access their own client
  if (user.role === 'CLIENT') {
    const portalUser = await prisma.portalUser.findFirst({
      where: {
        userId,
        clientId,
        status: 'ACTIVE',
      },
    })

    return !!portalUser
  }

  return false
}

/**
 * Verify user owns a specific resource (file, note, etc.)
 */
export async function authorizeResourceOwnership(
  userId: string,
  resourceType: 'file' | 'note' | 'businessPlan' | 'deliverable',
  resourceId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    return false
  }

  // Admins have access to all resources
  if (user.role === 'ADMIN') {
    return true
  }

  // For portal users, check if resource belongs to their client
  if (user.role === 'CLIENT') {
    const portalUser = await prisma.portalUser.findFirst({
      where: { userId, status: 'ACTIVE' },
      select: { clientId: true },
    })

    if (!portalUser) {
      return false
    }

    // Check ownership based on resource type
    switch (resourceType) {
      case 'file': {
        const file = await prisma.file.findUnique({
          where: { id: resourceId },
          select: { clientId: true },
        })
        return file?.clientId === portalUser.clientId
      }

      case 'note': {
        const note = await prisma.note.findUnique({
          where: { id: resourceId },
          select: { clientId: true },
        })
        return note?.clientId === portalUser.clientId
      }

      case 'businessPlan': {
        const plan = await prisma.businessPlan.findUnique({
          where: { id: resourceId },
          select: { clientId: true },
        })
        return plan?.clientId === portalUser.clientId
      }

      case 'deliverable': {
        const deliverable = await prisma.deliverable.findUnique({
          where: { id: resourceId },
          select: { clientId: true },
        })
        return deliverable?.clientId === portalUser.clientId
      }

      default:
        return false
    }
  }

  return false
}

/**
 * Get client ID for current portal user
 * Returns null if user is not a portal user or not active
 */
export async function getPortalUserClientId(userId: string): Promise<string | null> {
  const portalUser = await prisma.portalUser.findFirst({
    where: { userId, status: 'ACTIVE' },
    select: { clientId: true },
  })

  return portalUser?.clientId || null
}

/**
 * Middleware wrapper for API routes requiring authentication
 */
export function withAuth(
  handler: (req: NextRequest, user: AuthorizedUser) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      return await handler(req, user)
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 401 }
        )
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 403 }
        )
      }
      throw error
    }
  }
}

/**
 * Middleware wrapper for API routes requiring admin access
 */
export function withAdmin(
  handler: (req: NextRequest, user: AuthorizedUser) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const user = await requireAdmin()
      return await handler(req, user)
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 401 }
        )
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 403 }
        )
      }
      throw error
    }
  }
}

// Custom error classes
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ForbiddenError'
  }
}
