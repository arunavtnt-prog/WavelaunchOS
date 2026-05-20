import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

/**
 * GET /api/blueprints
 * Fetch all blueprints and business plans merged together
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch blueprints from the workflow system
    const blueprints = await db.blueprint.findMany({
      include: {
        application: {
          select: {
            id: true,
            fullName: true,
            email: true,
            industryNiche: true,
          },
        },
        researchStages: {
          orderBy: { stage: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch business plans from the CRM system
    const businessPlans = await db.businessPlan.findMany({
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            industryNiche: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform business plans to match blueprint structure
    const transformedBusinessPlans = businessPlans.map((bp) => ({
      id: bp.id,
      type: 'business-plan' as const,
      application: {
        id: bp.client.id,
        fullName: bp.client.fullName,
        email: bp.client.email,
        industryNiche: bp.client.industryNiche,
      },
      status: bp.status,
      progress: bp.status === 'APPROVED' || bp.status === 'DELIVERED' ? 100 : 50,
      currentBatch: 1,
      startedAt: bp.generatedAt,
      completedAt: bp.approvedAt || bp.deliveredAt || undefined,
      lastStageAt: bp.updatedAt,
      markdown: bp.contentMarkdown,
      pdfPath: bp.pdfPath,
      totalTokensUsed: 0,
      researchStages: [],
      version: bp.version,
      generatedBy: bp.generatedBy,
      generatedAt: bp.generatedAt,
      approvedAt: bp.approvedAt,
      deliveredAt: bp.deliveredAt,
    }))

    // Add type to blueprints
    const transformedBlueprints = blueprints.map((bp) => ({
      ...bp,
      type: 'blueprint' as const,
    }))

    // Merge and sort by creation date
    const mergedData = [...transformedBlueprints, ...transformedBusinessPlans].sort(
      (a, b) => new Date(b.createdAt || b.generatedAt).getTime() - new Date(a.createdAt || a.generatedAt).getTime()
    )

    return NextResponse.json({
      success: true,
      data: mergedData,
    })
  } catch (error) {
    console.error('Failed to fetch blueprints:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blueprints',
      },
      { status: 500 }
    )
  }
}
