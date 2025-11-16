import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalSession } from '@/lib/auth/portal-auth'

// Get unread message count
export async function GET(request: NextRequest) {
  try {
    const session = await getPortalSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const unreadCount = await prisma.portalMessage.count({
      where: {
        clientId: session.clientId,
        isFromAdmin: true,
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      data: { unreadCount },
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get unread count' },
      { status: 500 }
    )
  }
}
