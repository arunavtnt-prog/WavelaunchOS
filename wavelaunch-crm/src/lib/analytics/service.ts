/**
 * Analytics Service
 *
 * Provides comprehensive analytics and insights for the CRM system.
 * Includes client metrics, deliverable tracking, AI usage, and performance stats.
 */

import { db } from '@/lib/db'
import { logDebug } from '@/lib/logging/logger'
import { apiCache, cacheKeys, CACHE_TTL } from '@/lib/cache/api-cache'

export interface DashboardAnalytics {
  overview: {
    totalClients: number
    activeClients: number
    totalBusinessPlans: number
    totalDeliverables: number
    completionRate: number
  }
  clientMetrics: {
    byStatus: Record<string, number>
    byNiche: Record<string, number>
    recentlyOnboarded: number // Last 30 days
    averageDeliverablesPerClient: number
  }
  deliverableMetrics: {
    byMonth: Record<string, number>
    byStatus: Record<string, number>
    completedThisMonth: number
    overdueCount: number
    averageCompletionTime: number // days
  }
  aiUsage: {
    totalTokensUsed: number
    estimatedCost: number
    businessPlansGenerated: number
    deliverablesGenerated: number
    averageTokensPerPlan: number
    averageTokensPerDeliverable: number
  }
  systemHealth: {
    totalJobs: number
    queuedJobs: number
    failedJobs: number
    successRate: number
    storageUsed: number
    storageLimit: number
  }
  activity: {
    recentActivities: Array<{
      type: string
      count: number
      lastOccurred: Date
    }>
    activeUsersToday: number
    actionsToday: number
  }
}

export interface ClientAnalytics {
  clientId: string
  clientName: string
  onboardedAt: Date
  status: string
  metrics: {
    businessPlansCount: number
    deliverablesCount: number
    deliverablesCompleted: number
    completionRate: number
    filesCount: number
    notesCount: number
    ticketsCount: number
    daysActive: number
  }
  timeline: Array<{
    date: Date
    event: string
    type: string
  }>
  deliverableProgress: {
    completed: number[]
    inProgress: number[]
    pending: number[]
  }
}

export interface TimeSeriesData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
  }>
}

/**
 * Analytics Service Class
 */
export class AnalyticsService {
  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    return apiCache.getOrSet(
      cacheKeys.dashboardStats(),
      async () => {
        const [
          overview,
          clientMetrics,
          deliverableMetrics,
          aiUsage,
          systemHealth,
          activity,
        ] = await Promise.all([
          this.getOverviewMetrics(),
          this.getClientMetrics(),
          this.getDeliverableMetrics(),
          this.getAIUsageMetrics(),
          this.getSystemHealthMetrics(),
          this.getActivityMetrics(),
        ])

        return {
          overview,
          clientMetrics,
          deliverableMetrics,
          aiUsage,
          systemHealth,
          activity,
        }
      },
      CACHE_TTL.MEDIUM
    )
  }

  /**
   * Get overview metrics
   */
  private async getOverviewMetrics() {
    const [totalClients, activeClients, totalBusinessPlans, totalDeliverables] =
      await Promise.all([
        db.client.count({ where: { deletedAt: null } }),
        db.client.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        db.businessPlan.count(),
        db.deliverable.count(),
      ])

    const completedDeliverables = await db.deliverable.count({
      where: { status: { in: ['APPROVED', 'DELIVERED'] } },
    })

    const completionRate =
      totalDeliverables > 0
        ? Math.round((completedDeliverables / totalDeliverables) * 100)
        : 0

    return {
      totalClients,
      activeClients,
      totalBusinessPlans,
      totalDeliverables,
      completionRate,
    }
  }

  /**
   * Get client metrics
   */
  private async getClientMetrics() {
    const clients = await db.client.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { deliverables: true },
        },
      },
    })

    const byStatus: Record<string, number> = {}
    const byNiche: Record<string, number> = {}
    let totalDeliverables = 0

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    let recentlyOnboarded = 0

    for (const client of clients) {
      // Count by status
      byStatus[client.status] = (byStatus[client.status] || 0) + 1

      // Count by niche
      const niche = client.industryNiche || 'Unknown'
      byNiche[niche] = (byNiche[niche] || 0) + 1

      // Total deliverables
      totalDeliverables += client._count.deliverables

      // Recently onboarded
      if (client.onboardedAt >= thirtyDaysAgo) {
        recentlyOnboarded++
      }
    }

    const averageDeliverablesPerClient =
      clients.length > 0 ? Math.round((totalDeliverables / clients.length) * 10) / 10 : 0

    return {
      byStatus,
      byNiche,
      recentlyOnboarded,
      averageDeliverablesPerClient,
    }
  }

  /**
   * Get deliverable metrics
   */
  private async getDeliverableMetrics() {
    const deliverables = await db.deliverable.findMany({
      select: {
        month: true,
        status: true,
        createdAt: true,
        approvedAt: true,
      },
    })

    const byMonth: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    let totalCompletionTime = 0
    let completedCount = 0

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    let completedThisMonth = 0

    for (const deliverable of deliverables) {
      // Count by month
      const monthKey = `M${deliverable.month}`
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1

      // Count by status
      byStatus[deliverable.status] = (byStatus[deliverable.status] || 0) + 1

      // Completed this month
      if (
        deliverable.status === 'APPROVED' &&
        deliverable.approvedAt &&
        deliverable.approvedAt >= startOfMonth
      ) {
        completedThisMonth++
      }

      // Average completion time
      if (deliverable.status === 'APPROVED' && deliverable.approvedAt) {
        const days = Math.floor(
          (deliverable.approvedAt.getTime() - deliverable.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        )
        totalCompletionTime += days
        completedCount++
      }
    }

    const averageCompletionTime =
      completedCount > 0 ? Math.round((totalCompletionTime / completedCount) * 10) / 10 : 0

    // Count overdue (simplified - would need dueDate field for accuracy)
    const overdueCount = await db.deliverable.count({
      where: { status: { in: ['DRAFT', 'PENDING_REVIEW'] } },
    })

    return {
      byMonth,
      byStatus,
      completedThisMonth,
      overdueCount,
      averageCompletionTime,
    }
  }

  /**
   * Get AI usage metrics
   */
  private async getAIUsageMetrics() {
    const tokenUsage = await db.tokenUsage.aggregate({
      _sum: {
        totalTokens: true,
        estimatedCost: true,
      },
      _count: true,
    })

    const [businessPlansCount, deliverablesCount] = await Promise.all([
      db.tokenUsage.count({ where: { operation: 'GENERATE_BUSINESS_PLAN' } }),
      db.tokenUsage.count({ where: { operation: 'GENERATE_DELIVERABLE' } }),
    ])

    const totalTokensUsed = tokenUsage._sum.totalTokens || 0
    const estimatedCost = tokenUsage._sum.estimatedCost || 0

    const averageTokensPerPlan =
      businessPlansCount > 0 ? Math.round(totalTokensUsed / businessPlansCount) : 0

    const averageTokensPerDeliverable =
      deliverablesCount > 0 ? Math.round(totalTokensUsed / deliverablesCount) : 0

    return {
      totalTokensUsed,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      businessPlansGenerated: businessPlansCount,
      deliverablesGenerated: deliverablesCount,
      averageTokensPerPlan,
      averageTokensPerDeliverable,
    }
  }

  /**
   * Get system health metrics
   */
  private async getSystemHealthMetrics() {
    const [totalJobs, queuedJobs, failedJobs] = await Promise.all([
      db.job.count(),
      db.job.count({ where: { status: 'QUEUED' } }),
      db.job.count({ where: { status: 'FAILED' } }),
    ])

    const completedJobs = await db.job.count({ where: { status: 'COMPLETED' } })
    const successRate =
      completedJobs + failedJobs > 0
        ? Math.round((completedJobs / (completedJobs + failedJobs)) * 100)
        : 100

    // Storage metrics (simplified)
    const storageLimit = parseInt(process.env.STORAGE_LIMIT_GB || '50') * 1024 * 1024 * 1024
    const files = await db.file.aggregate({
      _sum: { filesize: true },
    })
    const storageUsed = files._sum.filesize || 0

    return {
      totalJobs,
      queuedJobs,
      failedJobs,
      successRate,
      storageUsed,
      storageLimit,
    }
  }

  /**
   * Get activity metrics
   */
  private async getActivityMetrics() {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [activitiesGrouped, actionsToday, uniqueUsersToday] = await Promise.all([
      db.activity.groupBy({
        by: ['type'],
        _count: true,
        _max: { createdAt: true },
        orderBy: { _count: { type: 'desc' } },
        take: 10,
      }),
      db.activity.count({ where: { createdAt: { gte: startOfDay } } }),
      db.activity.findMany({
        where: { createdAt: { gte: startOfDay }, userId: { not: null } },
        select: { userId: true },
        distinct: ['userId'],
      }),
    ])

    const recentActivities = activitiesGrouped.map((a) => ({
      type: a.type,
      count: a._count,
      lastOccurred: a._max.createdAt!,
    }))

    return {
      recentActivities,
      activeUsersToday: uniqueUsersToday.length,
      actionsToday,
    }
  }

  /**
   * Get client-specific analytics
   */
  async getClientAnalytics(clientId: string): Promise<ClientAnalytics> {
    return apiCache.getOrSet(
      `${cacheKeys.client(clientId)}:analytics`,
      async () => {
        const client = await db.client.findUnique({
          where: { id: clientId },
          include: {
            _count: {
              select: {
                businessPlans: true,
                deliverables: true,
                files: true,
                notes: true,
                tickets: true,
              },
            },
            deliverables: {
              select: { month: true, status: true },
              orderBy: { month: 'asc' },
            },
            activities: {
              select: { type: true, createdAt: true, description: true },
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        })

        if (!client) {
          throw new Error('Client not found')
        }

        const completedDeliverables = client.deliverables.filter((d) =>
          ['APPROVED', 'DELIVERED'].includes(d.status)
        ).length

        const completionRate =
          client._count.deliverables > 0
            ? Math.round((completedDeliverables / client._count.deliverables) * 100)
            : 0

        const daysActive = Math.floor(
          (Date.now() - client.onboardedAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        const timeline = client.activities.map((a) => ({
          date: a.createdAt,
          event: a.description,
          type: a.type,
        }))

        const deliverableProgress = {
          completed: client.deliverables
            .filter((d) => ['APPROVED', 'DELIVERED'].includes(d.status))
            .map((d) => d.month),
          inProgress: client.deliverables
            .filter((d) => ['PENDING_REVIEW'].includes(d.status))
            .map((d) => d.month),
          pending: client.deliverables
            .filter((d) => ['DRAFT'].includes(d.status))
            .map((d) => d.month),
        }

        return {
          clientId: client.id,
          clientName: client.name,
          onboardedAt: client.onboardedAt,
          status: client.status,
          metrics: {
            businessPlansCount: client._count.businessPlans,
            deliverablesCount: client._count.deliverables,
            deliverablesCompleted: completedDeliverables,
            completionRate,
            filesCount: client._count.files,
            notesCount: client._count.notes,
            ticketsCount: client._count.tickets,
            daysActive,
          },
          timeline,
          deliverableProgress,
        }
      },
      CACHE_TTL.SHORT
    )
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(
    metric: 'clients' | 'deliverables' | 'revenue',
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<TimeSeriesData> {
    const cacheKey = `${cacheKeys.stats('timeseries')}:${metric}:${period}`

    return apiCache.getOrSet(
      cacheKey,
      async () => {
        const now = new Date()
        let startDate = new Date()
        let groupBy: 'day' | 'week' | 'month' = 'day'

        switch (period) {
          case 'week':
            startDate.setDate(now.getDate() - 7)
            groupBy = 'day'
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            groupBy = 'day'
            break
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3)
            groupBy = 'week'
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            groupBy = 'month'
            break
        }

        if (metric === 'clients') {
          return this.getClientTimeSeriesData(startDate, groupBy)
        } else if (metric === 'deliverables') {
          return this.getDeliverableTimeSeriesData(startDate, groupBy)
        }

        return { labels: [], datasets: [] }
      },
      CACHE_TTL.LONG
    )
  }

  /**
   * Get client growth time series
   */
  private async getClientTimeSeriesData(
    startDate: Date,
    groupBy: 'day' | 'week' | 'month'
  ): Promise<TimeSeriesData> {
    const clients = await db.client.findMany({
      where: {
        onboardedAt: { gte: startDate },
        deletedAt: null,
      },
      select: { onboardedAt: true, status: true },
      orderBy: { onboardedAt: 'asc' },
    })

    // Group clients by date
    const grouped = this.groupByDate(
      clients.map((c) => ({ date: c.onboardedAt, value: 1 })),
      groupBy
    )

    return {
      labels: grouped.labels,
      datasets: [
        {
          label: 'New Clients',
          data: grouped.data,
        },
      ],
    }
  }

  /**
   * Get deliverable completion time series
   */
  private async getDeliverableTimeSeriesData(
    startDate: Date,
    groupBy: 'day' | 'week' | 'month'
  ): Promise<TimeSeriesData> {
    const deliverables = await db.deliverable.findMany({
      where: {
        approvedAt: { gte: startDate },
        status: { in: ['APPROVED', 'DELIVERED'] },
      },
      select: { approvedAt: true },
      orderBy: { approvedAt: 'asc' },
    })

    const grouped = this.groupByDate(
      deliverables.map((d) => ({ date: d.approvedAt!, value: 1 })),
      groupBy
    )

    return {
      labels: grouped.labels,
      datasets: [
        {
          label: 'Completed Deliverables',
          data: grouped.data,
        },
      ],
    }
  }

  /**
   * Helper: Group data by date period
   */
  private groupByDate(
    data: Array<{ date: Date; value: number }>,
    groupBy: 'day' | 'week' | 'month'
  ): { labels: string[]; data: number[] } {
    const grouped = new Map<string, number>()

    for (const item of data) {
      let key: string

      if (groupBy === 'day') {
        key = item.date.toISOString().split('T')[0]
      } else if (groupBy === 'week') {
        const weekStart = new Date(item.date)
        weekStart.setDate(item.date.getDate() - item.date.getDay())
        key = weekStart.toISOString().split('T')[0]
      } else {
        key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`
      }

      grouped.set(key, (grouped.get(key) || 0) + item.value)
    }

    const sortedKeys = Array.from(grouped.keys()).sort()

    return {
      labels: sortedKeys,
      data: sortedKeys.map((k) => grouped.get(k) || 0),
    }
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService()
