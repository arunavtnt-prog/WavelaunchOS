import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalSession } from '@/lib/auth/portal-auth'

// Mark thread as read
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getPortalSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mark all admin messages in this thread as read
    await prisma.portalMessage.updateMany({
      where: {
        threadId: params.threadId,
        clientId: session.clientId,
        isFromAdmin: true,
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Thread marked as read',
    })
  } catch (error) {
    console.error('Mark thread as read error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark thread as read' },
      { status: 500 }
    )
  }
}
