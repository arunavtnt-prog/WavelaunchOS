import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePortalAuth, changePassword } from '@/lib/auth/portal-auth'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const auth = await requirePortalAuth()
    if (!auth.authorized || !auth.session) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error || 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = changePasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validation.data

    // Change password
    const result = await changePassword(
      auth.session.userId,
      currentPassword,
      newPassword
    )

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to change password',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been changed successfully.',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while changing password. Please try again.',
      },
      { status: 500 }
    )
  }
}
