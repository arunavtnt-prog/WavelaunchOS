import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { z } from 'zod'

const completeRegistrationSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

    // Find portal user by invite token
    const portalUser = await prisma.clientPortalUser.findUnique({
      where: { inviteToken: token },
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Activate account
    const updatedUser = await prisma.clientPortalUser.update({
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

    // Create session token
    const secret = new TextEncoder().encode(process.env.PORTAL_JWT_SECRET || 'portal-secret-key')
    const sessionToken = await new SignJWT({
      userId: updatedUser.id,
      clientId: updatedUser.clientId,
      email: updatedUser.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret)

    // Log activity
    await prisma.activity.create({
      data: {
        clientId: portalUser.clientId,
        description: `Client activated portal account: ${portalUser.email}`,
      },
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
