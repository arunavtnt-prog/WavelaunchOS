import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { updateBusinessPlanSchema } from '@/schemas/business-plan'

// GET /api/business-plans/[id] - Get specific business plan with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessPlan = await db.businessPlan.findUnique({
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

    if (!businessPlan) {
      return NextResponse.json(
        { success: false, error: 'Business plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: businessPlan,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// PATCH /api/business-plans/[id] - Update business plan content or status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get existing business plan
    const existingPlan = await db.businessPlan.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    })

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Business plan not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = updateBusinessPlanSchema.parse(body)

    // Update business plan
    const updatedPlan = await db.businessPlan.update({
      where: { id: params.id },
      data: {
        contentMarkdown: data.contentMarkdown,
        status: data.status,
        rejectionReason: data.rejectionReason,
        updatedAt: new Date(),
      },
    })

    // Log activity
    let activityDescription = 'Updated business plan'
    if (data.status && data.status !== existingPlan.status) {
      activityDescription = `Changed business plan status: ${existingPlan.status} → ${data.status}`
      if (data.status === 'REJECTED' && data.rejectionReason) {
        activityDescription += ` (Reason: ${data.rejectionReason})`
      }
    }

    await db.activity.create({
      data: {
        clientId: existingPlan.clientId,
        type: 'BUSINESS_PLAN_UPDATED',
        description: activityDescription,
        userId,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: 'Business plan updated successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
