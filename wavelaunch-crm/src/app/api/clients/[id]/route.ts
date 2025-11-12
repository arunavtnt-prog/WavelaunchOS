import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateClientSchema } from '@/schemas/client'
import { NotFoundError, handleError } from '@/lib/utils/errors'

// GET /api/clients/[id] - Get single client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateClientSchema.parse(body)

    const client = await db.client.findUnique({
      where: { id: params.id, deletedAt: null },
    })

    if (!client) {
      throw new NotFoundError('Client', params.id)
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
        description: `Updated client: ${updated.creatorName}`,
        userId: session.user.id,
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
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await db.client.findUnique({
      where: { id: params.id, deletedAt: null },
    })

    if (!client) {
      throw new NotFoundError('Client', params.id)
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
        description: `Deleted client: ${client.creatorName}`,
        userId: session.user.id,
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
