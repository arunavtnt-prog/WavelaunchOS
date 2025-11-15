import { NextResponse } from 'next/server'
import { clearPortalCookie } from '@/lib/auth/portal-auth'

export async function POST() {
  try {
    // Clear the portal auth cookie
    await clearPortalCookie()

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Portal logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during logout. Please try again.',
      },
      { status: 500 }
    )
  }
}
