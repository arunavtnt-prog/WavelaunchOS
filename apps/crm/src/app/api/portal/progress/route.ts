import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerifiedPortalSession } from '@/lib/auth/portal-auth'

// Get progress data for authenticated client
export async function GET(request: NextRequest) {
  try {
    const auth = await getVerifiedPortalSession()

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Get client deliverables
    const deliverables = await prisma.deliverable.findMany({
      where: { clientId: auth.portalUser?.clientId },
      orderBy: { month: 'asc' },
    })

    // Get client data
    const client = await prisma.client.findUnique({
      where: { id: auth.portalUser?.clientId },
    })

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client not found',
        },
        { status: 404 }
      )
    }

    // Build milestones array (all 8 months)
    const monthsData = [
      {
        month: 'M1',
        title: 'Foundation Excellence',
        description:
          'Establishing your brand foundation and core business strategy',
      },
      {
        month: 'M2',
        title: 'Brand Readiness & Productization',
        description:
          'Building your product suite and solidifying your brand identity',
      },
      {
        month: 'M3',
        title: 'Market Entry Preparation',
        description:
          'Preparing for market entry with content strategy and positioning',
      },
      {
        month: 'M4',
        title: 'Sales Engine & Launch Infrastructure',
        description:
          'Building your sales funnel and establishing launch systems',
      },
      {
        month: 'M5',
        title: 'Pre-Launch Mastery',
        description:
          'Final preparations and audience building before launch',
      },
      {
        month: 'M6',
        title: 'Soft Launch Execution',
        description: 'Testing your offer with a limited audience',
      },
      {
        month: 'M7',
        title: 'Scaling & Growth Systems',
        description: 'Implementing systems for sustainable growth',
      },
      {
        month: 'M8',
        title: 'Full Launch & Market Domination',
        description: 'Full market launch and scaling operations',
      },
    ]

    const milestones = monthsData.map((monthData) => {
      const deliverable = deliverables.find((d) => d.month === parseInt(monthData.month.replace('M', '')))

      return {
        month: monthData.month,
        title: deliverable?.title || monthData.title,
        description: monthData.description,
        status: deliverable?.status || 'PENDING',
        deliveredAt: deliverable?.deliveredAt || null,
        createdAt: deliverable?.createdAt || null,
      }
    })

    // Calculate statistics
    const stats = {
      totalMonths: 8,
      completedCount: milestones.filter(
        (m) => m.status === 'DELIVERED' || m.status === 'APPROVED'
      ).length,
      inProgressCount: milestones.filter((m) => m.status === 'IN_PROGRESS')
        .length,
      pendingCount: milestones.filter((m) => m.status === 'PENDING').length,
      progressPercentage: Math.round(
        (milestones.filter(
          (m) => m.status === 'DELIVERED' || m.status === 'APPROVED'
        ).length /
          8) *
          100
      ),
    }

    // Calculate timeline info
    const firstCompletedDate = deliverables
      .filter((d) => d.deliveredAt)
      .sort(
        (a, b) =>
          new Date(a.deliveredAt!).getTime() -
          new Date(b.deliveredAt!).getTime()
      )[0]?.deliveredAt

    const lastCompletedDate = deliverables
      .filter((d) => d.deliveredAt)
      .sort(
        (a, b) =>
          new Date(b.deliveredAt!).getTime() -
          new Date(a.deliveredAt!).getTime()
      )[0]?.deliveredAt

    const startDate = client.onboardedAt || firstCompletedDate || new Date()
    const daysSinceStart = Math.floor(
      (new Date().getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    const timeline = {
      startDate,
      firstCompletedDate,
      lastCompletedDate,
      daysSinceStart,
      estimatedCompletionDate: new Date(
        new Date(startDate).getTime() + 8 * 30 * 24 * 60 * 60 * 1000
      ), // ~8 months from start
    }

    return NextResponse.json({
      success: true,
      data: {
        milestones,
        stats,
        timeline,
      },
    })
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching progress data',
      },
      { status: 500 }
    )
  }
}
