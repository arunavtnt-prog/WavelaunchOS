import { NextResponse } from 'next/server'
import { requirePortalAuth, getPortalUser } from '@/lib/auth/portal-auth'

export async function GET() {
  try {
    // Check authentication
    const auth = await requirePortalAuth()

    if (!auth.authorized || !auth.session) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: auth.error || 'Not authenticated',
        },
        { status: 401 }
      )
    }

    // Get full user data with client info
    const portalUser = await getPortalUser(auth.session.userId)

    if (!portalUser) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: 'User not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        user: {
          id: portalUser.id,
          email: portalUser.email,
          emailVerified: portalUser.emailVerified,
          lastLoginAt: portalUser.lastLoginAt,
        },
        client: {
          id: portalUser.client.id,
          fullName: portalUser.client.fullName,
          email: portalUser.client.email,
          industryNiche: portalUser.client.industryNiche,
          status: portalUser.client.status,
          onboardedAt: portalUser.client.onboardedAt,
        },
        preferences: {
          notifyNewDeliverable: portalUser.notifyNewDeliverable,
          notifyNewMessage: portalUser.notifyNewMessage,
          notifyMilestoneReminder: portalUser.notifyMilestoneReminder,
          notifyWeeklySummary: portalUser.notifyWeeklySummary,
        },
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: 'An error occurred while checking session.',
      },
      { status: 500 }
    )
  }
}
