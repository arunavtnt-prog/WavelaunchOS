import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// Get all messages (admin view) - supports filtering by clientId and threadId
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const threadId = searchParams.get('threadId')

    // If both clientId and threadId provided, get messages for that specific thread
    if (clientId && threadId) {
      const messages = await prisma.portalMessage.findMany({
        where: {
          clientId,
          threadId,
        },
        orderBy: { createdAt: 'asc' },
      })

      return NextResponse.json({
        success: true,
        data: { messages },
      })
    }

    // Build where clause
    const whereClause: any = {}
    if (clientId) {
      whereClause.clientId = clientId
    }

    // Get all messages (across all clients or for specific client)
    const messages = await prisma.portalMessage.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            creatorName: true,
            brandName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group messages by threadId (and clientId for cross-client view)
    const threadsMap = new Map()

    for (const message of messages) {
      const key = `${message.clientId}_${message.threadId}`

      if (!threadsMap.has(key)) {
        threadsMap.set(key, {
          threadId: message.threadId,
          clientId: message.clientId,
          client: message.client,
          subject: message.subject,
          latestMessage: message,
          unreadCount: 0,
          messageCount: 0,
        })
      }

      const thread = threadsMap.get(key)
      thread.messageCount++

      // Count unread messages (from client, not read by admin)
      if (!message.isFromAdmin && !message.isRead) {
        thread.unreadCount++
      }

      // Update latest message
      if (
        new Date(message.createdAt) >
        new Date(thread.latestMessage.createdAt)
      ) {
        thread.latestMessage = message
      }
    }

    const threads = Array.from(threadsMap.values()).sort(
      (a, b) =>
        new Date(b.latestMessage.createdAt).getTime() -
        new Date(a.latestMessage.createdAt).getTime()
    )

    return NextResponse.json({
      success: true,
      data: { threads },
      count: threads.length,
    })
  } catch (error) {
    console.error('Get admin messages error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// Send message as admin
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { clientId, threadId, subject, body: messageBody, attachmentUrl, attachmentName } = body

    if (!clientId || !messageBody) {
      return NextResponse.json(
        { success: false, error: 'Client ID and message body are required' },
        { status: 400 }
      )
    }

    // Create message
    const message = await prisma.portalMessage.create({
      data: {
        clientId,
        threadId: threadId || `thread_${Date.now()}`,
        subject: subject || 'Message from Admin',
        body: messageBody,
        isFromAdmin: true,
        isRead: false, // Client hasn't read it yet
        attachmentUrl,
        attachmentName,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        clientId,
        userId: session.user?.id || '',
        type: 'CLIENT_UPDATED',
        description: `Sent message: ${subject || 'Message from Admin'}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message },
      message: 'Message sent successfully',
    })
  } catch (error) {
    console.error('Send admin message error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
