import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateClientSchema } from '@/schemas/client'
import { NotFoundError, handleError } from '@/lib/utils/errors'
import { requireAuth, authorizeClientAccess } from '@/lib/auth/authorize'
import { forbiddenResponse, notFoundResponse } from '@/lib/api/responses'

// GET /api/clients/[id] - Get single client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await requireAuth()

    // Verify authorization to access this client
    const hasAccess = await authorizeClientAccess(user.id, params.id)
    if (!hasAccess) {
      return forbiddenResponse('You do not have permission to access this client')
    }

    const client = await db.client.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        businessPlans: {
          orderBy: { version: 'desc' },
          take: 5,
        },
        deliverables: {
          orderBy: { month: 'asc' },
        },
        files: {
          where: { deletedAt: null },
          orderBy: { uploadedAt: 'desc' },
          take: 10,
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            businessPlans: true,
            deliverables: true,
            files: true,
            notes: true,
          },
        },
      },
    })

    if (!client) {
      throw new NotFoundError('Client', params.id)
    }

    return NextResponse.json({
      success: true,
      data: client,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// PATCH /api/clients/[id] - Update client
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin role (only admins can update clients)
    const user = await requireAuth()

    if (user.role !== 'ADMIN') {
      return forbiddenResponse('Only administrators can update clients')
    }

    const body = await request.json()
    const data = updateClientSchema.parse(body)

    const client = await db.client.findUnique({
      where: { id: params.id, deletedAt: null },
    })

    if (!client) {
      return notFoundResponse('Client')
    }

    const updated = await db.client.update({
      where: { id: params.id },
      data,
    })

    // Log activity
    await db.activity.create({
      data: {
        clientId: updated.id,
        type: 'CLIENT_UPDATED',
        description: `Updated client: ${updated.name}`,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Client updated successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// DELETE /api/clients/[id] - Soft delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin role (only admins can delete clients)
    const user = await requireAuth()

    if (user.role !== 'ADMIN') {
      return forbiddenResponse('Only administrators can delete clients')
    }

    const client = await db.client.findUnique({
      where: { id: params.id, deletedAt: null },
    })

    if (!client) {
      return notFoundResponse('Client')
    }

    // Soft delete
    await db.client.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    // Log activity
    await db.activity.create({
      data: {
        clientId: client.id,
        type: 'CLIENT_DELETED',
        description: `Deleted client: ${client.name}`,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
