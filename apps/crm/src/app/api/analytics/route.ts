import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get all clients
    const allClients = await prisma.client.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        createdAt: true,
        status: true,
      },
    })

    const activeClients = allClients.filter((c) => c.status === 'ACTIVE')

    // Get all deliverables
    const allDeliverables = await prisma.deliverable.findMany({
      select: {
        status: true,
        month: true,
        createdAt: true,
      },
    })

    const completedDeliverables = allDeliverables.filter(
      (d) => d.status === 'DELIVERED' || d.status === 'APPROVED'
    )

    // Get all files
    const allFiles = await prisma.file.findMany({
      where: { deletedAt: null },
      select: {
        filesize: true,
        category: true,
      },
    })

    const totalStorage = allFiles.reduce((sum, file) => sum + (file.filesize || 0), 0)

    // Get activities
    const activities = await prisma.activity.findMany({
      select: {
        createdAt: true,
      },
    })

    // Calculate client growth (last 6 months)
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      const clientsUpToDate = allClients.filter(
        (c) => new Date(c.createdAt) <= date
      ).length
      months.push({
        month: monthName,
        count: clientsUpToDate,
      })
    }

    // Deliverable status distribution
    const statusCounts: Record<string, number> = {}
    allDeliverables.forEach((d) => {
      statusCounts[d.status] = (statusCounts[d.status] || 0) + 1
    })

    const deliverableStatus = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }))

    // Files by category
    const categoryCounts: Record<string, number> = {}
    allFiles.forEach((f) => {
      categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1
    })

    const filesByCategory = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }))

    // Monthly activity (last 6 months)
    const monthlyActivity = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })

      const activitiesInMonth = activities.filter((a) => {
        const activityDate = new Date(a.createdAt)
        return activityDate >= date && activityDate < nextDate
      }).length

      monthlyActivity.push({
        month: monthName,
        activities: activitiesInMonth,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        clientGrowth: months,
        deliverableStatus,
        filesByCategory,
        monthlyActivity,
        stats: {
          totalClients: allClients.length,
          activeClients: activeClients.length,
          totalDeliverables: allDeliverables.length,
          completedDeliverables: completedDeliverables.length,
          totalFiles: allFiles.length,
          totalStorage,
        },
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
