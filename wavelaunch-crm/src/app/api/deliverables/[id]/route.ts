import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const updateDeliverableSchema = z.object({
  contentMarkdown: z.string().min(100, 'Content must be at least 100 characters'),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'DELIVERED', 'REJECTED']).optional(),
  rejectionReason: z.string().optional(),
})

// GET /api/deliverables/[id] - Get specific deliverable with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deliverable = await db.deliverable.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            creatorName: true,
            brandName: true,
            email: true,
          },
        },
        generatedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!deliverable) {
      return NextResponse.json(
        { success: false, error: 'Deliverable not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deliverable,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// PATCH /api/deliverables/[id] - Update deliverable content or status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get existing deliverable
    const existingDeliverable = await db.deliverable.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    })

    if (!existingDeliverable) {
      return NextResponse.json(
        { success: false, error: 'Deliverable not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = updateDeliverableSchema.parse(body)

    // Update deliverable
    const updatedDeliverable = await db.deliverable.update({
      where: { id: params.id },
      data: {
        contentMarkdown: data.contentMarkdown,
        status: data.status,
        rejectionReason: data.rejectionReason,
        updatedAt: new Date(),
      },
    })

    // Log activity
    let activityDescription = `Updated Month ${existingDeliverable.month} deliverable`
    if (data.status && data.status !== existingDeliverable.status) {
      activityDescription = `Changed Month ${existingDeliverable.month} deliverable status: ${existingDeliverable.status} → ${data.status}`
      if (data.status === 'REJECTED' && data.rejectionReason) {
        activityDescription += ` (Reason: ${data.rejectionReason})`
      }
    }

    await db.activity.create({
      data: {
        clientId: existingDeliverable.clientId,
        type: 'DELIVERABLE_UPDATED',
        description: activityDescription,
        userId: session.user?.id || '',
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedDeliverable,
      message: 'Deliverable updated successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
