import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerifiedPortalSession } from '@/lib/auth/portal-auth'

// Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const auth = await getVerifiedPortalSession()

    if (!auth?.session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.portalNotification.updateMany({
      where: {
        clientUserId: auth.session.userId,
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    })
  } catch (error) {
    console.error('Mark all as read error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark all as read' },
      { status: 500 }
    )
  }
}
