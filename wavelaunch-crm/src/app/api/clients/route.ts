import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createClientSchema, clientFilterSchema } from '@/schemas/client'
import { MAX_CLIENTS } from '@/lib/utils/constants'
import { CapacityError, ConflictError, handleError } from '@/lib/utils/errors'

// GET /api/clients - List clients with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())

    const filters = clientFilterSchema.parse(params)

    const where: any = {}

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { industryNiche: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.niche) {
      where.industryNiche = { contains: filters.niche, mode: 'insensitive' }
    }

    
    const [clients, total] = await Promise.all([
      db.client.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        include: {
          _count: {
            select: {
              businessPlans: true,
              deliverables: true,
              files: true,
              notes: true,
            },
          },
        },
      }),
      db.client.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: clients,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check capacity
    const clientCount = await db.client.count()

    if (clientCount >= MAX_CLIENTS) {
      throw new CapacityError('Client', MAX_CLIENTS)
    }

    const body = await request.json()
    const data = createClientSchema.parse(body)

    // Check for duplicate email
    const existing = await db.client.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      throw new ConflictError(
        'A client with this email already exists. Use a different email or update the existing client.'
      )
    }

    // Create client
    const client = await db.client.create({
      data: {
        ...data,
        status: 'ACTIVE',
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        clientId: client.id,
        type: 'CLIENT_CREATED',
        description: `Created client: ${client.fullName}`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Client created successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
