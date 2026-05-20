import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

/**
 * GET /api/blueprints/[id]/email-status
 * Check if an email draft exists for this blueprint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blueprintId = params.id

    // Get workflow state for this blueprint's application
    const blueprint = await db.blueprint.findUnique({
      where: { id: blueprintId },
      include: {
        application: {
          include: {
            workflowState: true,
          },
        },
      },
    })

    if (!blueprint) {
      return NextResponse.json(
        { success: false, error: 'Blueprint not found' },
        { status: 404 }
      )
    }

    if (!blueprint.application.workflowState) {
      return NextResponse.json({
        success: true,
        data: { emailDraft: null },
      })
    }

    // Find email draft for this blueprint
    const emailDraft = await db.emailDraft.findFirst({
      where: {
        workflowId: blueprint.application.workflowState.id,
        blueprintId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { emailDraft },
    })
  } catch (error) {
    console.error('Failed to check email status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check email status',
      },
      { status: 500 }
    )
  }
}
