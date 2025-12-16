import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/authorize'
import { db } from '@/lib/db'
import { createTicketSchema, ticketFilterSchema } from '@/schemas/ticket'
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  handleError,
} from '@/lib/api/responses'
import { logInfo } from '@/lib/logging/logger'

/**
 * POST /api/tickets - Create a new support ticket
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Validate input
    const validation = createTicketSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid ticket data', validation.error.errors)
    }

    const data = validation.data

    // Create ticket
    const ticket = await db.ticket.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        status: 'OPEN',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    logInfo('Support ticket created', {
      ticketId: ticket.id,
      clientId: ticket.clientId,
      priority: ticket.priority,
      userId: user.id,
    })

    // TODO: Send notification to admins about new ticket
    // This will be implemented when notification system is complete

    return createdResponse(ticket, 'Ticket created successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/tickets - List tickets with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)

    // Parse and validate filters
    const filters = ticketFilterSchema.parse({
      clientId: searchParams.get('clientId') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      category: searchParams.get('category') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    // Build where clause
    const where: any = {}
    if (filters.clientId) where.clientId = filters.clientId
    if (filters.assignedTo) where.assignedTo = filters.assignedTo
    if (filters.status) where.status = filters.status
    if (filters.priority) where.priority = filters.priority
    if (filters.category) where.category = filters.category

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit
    const take = filters.limit

    // Get tickets with pagination
    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        skip,
        take,
        orderBy: {
          [filters.sortBy]: filters.sortOrder,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
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
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
      }),
      db.ticket.count({ where }),
    ])

    return successResponse(
      {
        tickets,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit),
        },
      },
      'Tickets retrieved successfully'
    )
  } catch (error) {
    return handleError(error)
  }
}
