import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerifiedPortalSession } from '@/lib/auth/portal-auth'

// Get all notifications for authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = await getVerifiedPortalSession()

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { clientUserId: auth.session.userId }
    if (unreadOnly) {
      where.isRead = false
    }

    const notifications = await prisma.portalNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const unreadCount = await prisma.portalNotification.count({
      where: {
        clientUserId: auth.session.userId,
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// Create a notification (internal use, could be called from other APIs)
export async function POST(request: NextRequest) {
  try {
    const auth = await getVerifiedPortalSession()

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, title, message, actionUrl } = body

    const notification = await prisma.portalNotification.create({
      data: {
        clientUserId: auth.session.userId,
        type,
        title,
        message,
        actionUrl,
      },
    })

    return NextResponse.json({
      success: true,
      data: { notification },
    })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
