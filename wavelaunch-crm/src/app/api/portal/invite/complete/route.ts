import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createHash } from 'crypto'
import { createPortalToken } from '@/lib/auth/portal-auth'

/**
 * Hash a token for secure storage
 * Uses SHA-256 to create a one-way hash
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

const completeRegistrationSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = completeRegistrationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { token, password } = validation.data

    // Hash the token to compare with stored hash
    const tokenHash = hashToken(token)

    // Find portal user by hashed invite token
    const portalUser = await prisma.clientPortalUser.findUnique({
      where: { inviteToken: tokenHash },
      include: {
        client: true,
      },
    })

    if (!portalUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid invite link' },
        { status: 400 }
      )
    }

    // Check if already activated
    if (portalUser.isActive && portalUser.activatedAt) {
      return NextResponse.json(
        { success: false, error: 'This account has already been activated' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (portalUser.inviteTokenExpiry && new Date() > portalUser.inviteTokenExpiry) {
      return NextResponse.json(
        { success: false, error: 'This invite link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash password with 12 rounds (consistent with portal-auth)
    const passwordHash = await bcrypt.hash(password, 12)

    // Wrap database operations in a transaction for atomicity
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Activate account
      const user = await tx.clientPortalUser.update({
        where: { id: portalUser.id },
        data: {
          passwordHash,
          isActive: true,
          activatedAt: new Date(),
          emailVerified: true, // Auto-verify since they came from invite
          inviteToken: null, // Clear token so it can't be reused
          inviteTokenExpiry: null,
        },
      })

      // Log activity
      await tx.activity.create({
        data: {
          clientId: portalUser.clientId,
          type: 'CLIENT_CREATED',
          description: `Client activated portal account: ${portalUser.email}`,
        },
      })

      return user
    })

    // Create session token using centralized auth utility
    const sessionToken = await createPortalToken({
      userId: updatedUser.id,
      clientId: updatedUser.clientId,
      email: updatedUser.email,
    })

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account activated successfully',
      data: {
        redirectTo: '/portal/onboarding', // Redirect to onboarding
      },
    })

    // Set session cookie
    response.cookies.set('portal-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Complete registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete registration' },
      { status: 500 }
    )
  }
}
