import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth/authorize'
import { db } from '@/lib/db'
import { assignTicketSchema } from '@/schemas/ticket'
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  handleError,
} from '@/lib/api/responses'
import { logInfo } from '@/lib/logging/logger'

/**
 * POST /api/tickets/[id]/assign - Assign ticket to a user
 * Requires admin role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const body = await request.json()

    // Validate input
    const validation = assignTicketSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid assignment data', validation.error.errors)
    }

    const { assignedTo } = validation.data

    // Check if ticket exists
    const existingTicket = await db.ticket.findUnique({
      where: { id: params.id },
    })

    if (!existingTicket) {
      return notFoundResponse('Ticket')
    }

    // If assigning to someone, verify user exists
    if (assignedTo) {
      const assignee = await db.user.findUnique({
        where: { id: assignedTo },
      })

      if (!assignee) {
        return notFoundResponse('User to assign')
      }
    }

    // Update ticket assignment
    const ticket = await db.ticket.update({
      where: { id: params.id },
      data: {
        assignedTo,
        // Auto-update status when assigning
        status: assignedTo ? 'IN_PROGRESS' : existingTicket.status,
      },
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

    logInfo('Support ticket assigned', {
      ticketId: ticket.id,
      assignedTo: assignedTo || 'unassigned',
      assignedBy: user.id,
    })

    // TODO: Send notification to assigned user
    // This will be implemented when notification system is complete

    return successResponse(
      ticket,
      assignedTo ? 'Ticket assigned successfully' : 'Ticket unassigned'
    )
  } catch (error) {
    return handleError(error)
  }
}
