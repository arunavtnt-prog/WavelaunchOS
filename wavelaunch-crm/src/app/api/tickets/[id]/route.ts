import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/authorize'
import { db } from '@/lib/db'
import { updateTicketSchema } from '@/schemas/ticket'
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  handleError,
} from '@/lib/api/responses'
import { logInfo } from '@/lib/logging/logger'

/**
 * GET /api/tickets/[id] - Get ticket details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            creatorName: true,
            email: true,
            company: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
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
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedByUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!ticket) {
      return notFoundResponse('Ticket')
    }

    return successResponse(ticket, 'Ticket retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PATCH /api/tickets/[id] - Update ticket
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Validate input
    const validation = updateTicketSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid ticket data', validation.error.errors)
    }

    const data = validation.data

    // Check if ticket exists
    const existingTicket = await db.ticket.findUnique({
      where: { id: params.id },
    })

    if (!existingTicket) {
      return notFoundResponse('Ticket')
    }

    // Update ticket
    const updateData: any = { ...data }

    // Track when ticket is closed or resolved
    if (data.status === 'CLOSED' && existingTicket.status !== 'CLOSED') {
      updateData.closedAt = new Date()
    }
    if (data.status === 'RESOLVED' && existingTicket.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date()
    }

    const ticket = await db.ticket.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            creatorName: true,
            email: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    logInfo('Support ticket updated', {
      ticketId: ticket.id,
      changes: data,
      userId: user.id,
    })

    // TODO: Send notification if status changed
    // This will be implemented when notification system is complete

    return successResponse(ticket, 'Ticket updated successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/tickets/[id] - Delete ticket
 */
export async function DELETE(
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

    // Delete ticket (cascade will delete comments and attachments)
    await db.ticket.delete({
      where: { id: params.id },
    })

    logInfo('Support ticket deleted', {
      ticketId: params.id,
      userId: user.id,
    })

    return successResponse({ id: params.id }, 'Ticket deleted successfully')
  } catch (error) {
    return handleError(error)
  }
}
