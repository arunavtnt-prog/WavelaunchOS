import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerifiedPortalSession } from '@/lib/auth/portal-auth'

// Get all documents for authenticated client
export async function GET(request: NextRequest) {
  try {
    const auth = await getVerifiedPortalSession()

    if (!auth?.portalUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'business-plans' | 'deliverables' | 'all'
    const status = searchParams.get('status') // Filter by status
    const sortBy = searchParams.get('sortBy') || 'updatedAt' // 'updatedAt' | 'createdAt' | 'version' | 'month'
    const sortOrder = searchParams.get('sortOrder') || 'desc' // 'asc' | 'desc'

    let businessPlans: Awaited<ReturnType<typeof prisma.businessPlan.findMany>> = []
    let deliverables: Awaited<ReturnType<typeof prisma.deliverable.findMany>> = []

    // Fetch business plans
    if (!type || type === 'all' || type === 'business-plans') {
      const planWhere: any = { clientId: auth.portalUser.clientId }
      if (status) {
        planWhere.status = status
      }

      businessPlans = await prisma.businessPlan.findMany({
        where: planWhere,
        orderBy: { [sortBy === 'month' ? 'version' : sortBy]: sortOrder },
      })
    }

    // Fetch deliverables
    if (!type || type === 'all' || type === 'deliverables') {
      const deliverableWhere: any = { clientId: auth.portalUser.clientId }
      if (status) {
        deliverableWhere.status = status
      }

      deliverables = await prisma.deliverable.findMany({
        where: deliverableWhere,
        orderBy: { [sortBy === 'version' ? 'month' : sortBy]: sortOrder },
      })
    }

    // Get statistics
    const stats = {
      totalBusinessPlans: businessPlans.length,
      totalDeliverables: deliverables.length,
      completedDeliverables: deliverables.filter(
        (d) => d.status === 'DELIVERED' || d.status === 'APPROVED'
      ).length,
      inProgressDeliverables: deliverables.filter(
        (d) => d.status === 'PENDING_REVIEW'
      ).length,
      pendingDeliverables: deliverables.filter((d) => d.status === 'DRAFT')
        .length,
    }

    return NextResponse.json({
      success: true,
      data: {
        businessPlans,
        deliverables,
        stats,
      },
    })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching documents',
      },
      { status: 500 }
    )
  }
}
