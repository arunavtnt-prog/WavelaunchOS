import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  authenticatePortalUser,
  createPortalToken,
  setPortalCookie,
} from '@/lib/auth/portal-auth'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes per IP
    const clientId = getClientIdentifier(request)
    const rateLimitResult = checkRateLimit({
      identifier: clientId,
      endpoint: 'portal-login',
      maxRequests: 5,
      windowSeconds: 15 * 60, // 15 minutes
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please try again in ${Math.ceil(rateLimitResult.resetIn / 60)} minutes.`,
          resetIn: rateLimitResult.resetIn,
        },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Authenticate user
    const authResult = await authenticatePortalUser(email, password)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Authentication failed',
        },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await createPortalToken({
      userId: authResult.user.id,
      clientId: authResult.user.clientId,
      email: authResult.user.email,
    })

    // Set cookie
    await setPortalCookie(token)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          email: authResult.user.email,
          clientId: authResult.user.clientId,
        },
      },
    })
  } catch (error) {
    console.error('Portal login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login. Please try again.',
      },
      { status: 500 }
    )
  }
}
