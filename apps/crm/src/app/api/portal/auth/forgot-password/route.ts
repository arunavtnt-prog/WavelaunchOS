import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createPasswordResetToken } from '@/lib/auth/portal-auth'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 attempts per hour per IP
    const clientId = getClientIdentifier(request)
    const rateLimitResult = checkRateLimit({
      identifier: clientId,
      endpoint: 'forgot-password',
      maxRequests: 3,
      windowSeconds: 60 * 60, // 1 hour
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many password reset requests. Please try again in ${Math.ceil(rateLimitResult.resetIn / 60)} minutes.`,
          resetIn: rateLimitResult.resetIn,
        },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Create reset token
    const token = await createPasswordResetToken(email)

    // Always return success to prevent email enumeration
    // In production, send email with reset link here
    if (token) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/reset-password?token=${token}`

      console.log('Password reset link:', resetUrl)
      // TODO: Send email using Resend or similar service
      // await sendPasswordResetEmail(email, resetUrl)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred. Please try again.',
      },
      { status: 500 }
    )
  }
}
