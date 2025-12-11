import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerifiedPortalSession } from '@/lib/auth/portal-auth'

// Mark notification as read
export async function POST(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  try {
    const auth = await getVerifiedPortalSession()

    if (!auth?.session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify notification belongs to user
    const notification = await prisma.portalNotification.findUnique({
      where: { id: params.notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.clientUserId !== auth.session.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Mark as read
    await prisma.portalNotification.update({
      where: { id: params.notificationId },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    })
  } catch (error) {
    console.error('Mark notification as read error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}
