import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/authorize'
import { db } from '@/lib/db'
import { createTicketCommentSchema } from '@/schemas/ticket'
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  validationErrorResponse,
  handleError,
} from '@/lib/api/responses'
import { logInfo } from '@/lib/logging/logger'

/**
 * POST /api/tickets/[id]/comments - Add a comment to a ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Validate input
    const validation = createTicketCommentSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid comment data', validation.error.errors)
    }

    const data = validation.data

    // Check if ticket exists
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    })

    if (!ticket) {
      return notFoundResponse('Ticket')
    }

    // Create comment
    const comment = await db.ticketComment.create({
      data: {
        ticketId: params.id,
        authorId: user.id,
        content: data.content,
        isInternal: data.isInternal,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Update ticket's updatedAt timestamp
    await db.ticket.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    })

    logInfo('Ticket comment added', {
      ticketId: params.id,
      commentId: comment.id,
      authorId: user.id,
      isInternal: data.isInternal,
    })

    // TODO: Send notification to relevant parties
    // - If admin comments, notify client
    // - If client comments, notify assigned admin
    // This will be implemented when notification system is complete

    return createdResponse(comment, 'Comment added successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/tickets/[id]/comments - Get all comments for a ticket
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Check if ticket exists
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
    })

    if (!ticket) {
      return notFoundResponse('Ticket')
    }

    // Get comments
    // Note: Filter internal comments if user is not admin
    const where: any = { ticketId: params.id }
    if (user.role !== 'ADMIN') {
      where.isInternal = false
    }

    const comments = await db.ticketComment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return successResponse(comments, 'Comments retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}
