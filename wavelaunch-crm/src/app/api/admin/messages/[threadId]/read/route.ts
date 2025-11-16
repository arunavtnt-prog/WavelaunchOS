import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mark thread as read (admin side - marks client messages as read)
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mark all client messages in this thread as read
    await prisma.portalMessage.updateMany({
      where: {
        threadId: params.threadId,
        isFromAdmin: false,
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
