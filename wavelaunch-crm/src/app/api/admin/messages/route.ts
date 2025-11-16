import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get all messages for a specific client (admin view)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const threadId = searchParams.get('threadId')

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // If threadId provided, get messages for that thread
    if (threadId) {
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

    // Otherwise, get all threads for the client
    const messages = await prisma.portalMessage.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    })

    // Group messages by threadId
    const threadsMap = new Map()

    for (const message of messages) {
      if (!threadsMap.has(message.threadId)) {
        threadsMap.set(message.threadId, {
          threadId: message.threadId,
          subject: message.subject,
          latestMessage: message,
          unreadCount: 0,
          messageCount: 0,
        })
      }

      const thread = threadsMap.get(message.threadId)
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
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { clientId, threadId, subject, body: messageBody } = body

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
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        clientId,
        userId: session.user.id,
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
