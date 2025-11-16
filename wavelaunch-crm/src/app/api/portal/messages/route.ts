import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalSession } from '@/lib/auth/portal-auth'
import { z } from 'zod'

// Get all messages for authenticated client
export async function GET(request: NextRequest) {
  try {
    const session = await getPortalSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')

    // If threadId provided, get messages for that thread
    if (threadId) {
      const messages = await prisma.portalMessage.findMany({
        where: {
          threadId,
          clientId: session.clientId,
        },
        orderBy: { createdAt: 'asc' },
      })

      // Mark messages as read when viewing thread
      await prisma.portalMessage.updateMany({
        where: {
          threadId,
          clientId: session.clientId,
          isFromAdmin: true,
          isRead: false,
        },
        data: { isRead: true },
      })

      return NextResponse.json({
        success: true,
        data: { messages },
      })
    }

    // Otherwise, get all threads (grouped by threadId)
    const messages = await prisma.portalMessage.findMany({
      where: { clientId: session.clientId },
      orderBy: { createdAt: 'desc' },
    })

    // Group by threadId and get latest message for each thread
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

      if (message.isFromAdmin && !message.isRead) {
        thread.unreadCount++
      }

      // Keep the latest message
      if (new Date(message.createdAt) > new Date(thread.latestMessage.createdAt)) {
        thread.latestMessage = message
      }
    }

    const threads = Array.from(threadsMap.values())

    return NextResponse.json({
      success: true,
      data: { threads },
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getPortalSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const messageSchema = z.object({
      threadId: z.string().optional(),
      subject: z.string().min(1, 'Subject is required'),
      body: z.string().min(1, 'Message body is required'),
      attachmentUrl: z.string().optional(),
      attachmentName: z.string().optional(),
    })

    const validation = messageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { threadId, subject, body: messageBody, attachmentUrl, attachmentName } = validation.data

    // Generate threadId if creating new thread
    const finalThreadId = threadId || `thread_${Date.now()}_${Math.random().toString(36).slice(2)}`

    // Create message
    const message = await prisma.portalMessage.create({
      data: {
        threadId: finalThreadId,
        clientUserId: session.userId,
        clientId: session.clientId,
        subject,
        body: messageBody,
        isFromAdmin: false,
        attachmentUrl,
        attachmentName,
      },
    })

    // Create notification for admin (could be implemented later)
    // TODO: Notify admin of new message

    // Log activity
    await prisma.activity.create({
      data: {
        clientId: session.clientId,
        type: 'MESSAGE_SENT',
        description: `Client sent a message: ${subject}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message },
      message: 'Message sent successfully',
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
