/**
 * Report Generator
 *
 * Generates various reports in different formats (CSV, PDF, JSON).
 * Supports filtering, sorting, and custom date ranges.
 */

import { prisma } from '@/lib/db'
import { logInfo } from '@/lib/logging/logger'

export type ReportType =
  | 'clients'
  | 'deliverables'
  | 'business-plans'
  | 'activities'
  | 'jobs'
  | 'tickets'
  | 'token-usage'

export type ExportFormat = 'csv' | 'json' | 'pdf'

export interface ReportFilters {
  startDate?: Date
  endDate?: Date
  status?: string
  clientId?: string
  userId?: string
  type?: string
}

export interface ReportOptions {
  type: ReportType
  format: ExportFormat
  filters?: ReportFilters
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
}

export interface GeneratedReport {
  filename: string
  content: string | Buffer
  contentType: string
  rowCount: number
}

/**
 * Report Generator Class
 */
export class ReportGenerator {
  /**
   * Generate a report
   */
  async generate(options: ReportOptions): Promise<GeneratedReport> {
    logInfo('Generating report', { type: options.type, format: options.format })

    // Fetch data based on report type
    const data = await this.fetchReportData(options)

    // Convert to requested format
    let content: string | Buffer
    let contentType: string
    let extension: string

    switch (options.format) {
      case 'csv':
        content = this.convertToCSV(data, options.type)
        contentType = 'text/csv'
        extension = 'csv'
        break
      case 'json':
        content = JSON.stringify(data, null, 2)
        contentType = 'application/json'
        extension = 'json'
        break
      case 'pdf':
        content = await this.convertToPDF(data, options.type)
        contentType = 'application/pdf'
        extension = 'pdf'
        break
      default:
        throw new Error(`Unsupported format: ${options.format}`)
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${options.type}-report-${timestamp}.${extension}`

    return {
      filename,
      content,
      contentType,
      rowCount: Array.isArray(data) ? data.length : 0,
    }
  }

  /**
   * Fetch data for report
   */
  private async fetchReportData(options: ReportOptions): Promise<any[]> {
    const { type, filters, sortBy, sortOrder, limit } = options

    switch (type) {
      case 'clients':
        return this.fetchClientsReport(filters, sortBy, sortOrder, limit)
      case 'deliverables':
        return this.fetchDeliverablesReport(filters, sortBy, sortOrder, limit)
      case 'business-plans':
        return this.fetchBusinessPlansReport(filters, sortBy, sortOrder, limit)
      case 'activities':
        return this.fetchActivitiesReport(filters, sortBy, sortOrder, limit)
      case 'jobs':
        return this.fetchJobsReport(filters, sortBy, sortOrder, limit)
      case 'tickets':
        return this.fetchTicketsReport(filters, sortBy, sortOrder, limit)
      case 'token-usage':
        return this.fetchTokenUsageReport(filters, sortBy, sortOrder, limit)
      default:
        throw new Error(`Unknown report type: ${type}`)
    }
  }

  /**
   * Fetch clients report data
   */
  private async fetchClientsReport(
    filters?: ReportFilters,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    limit?: number
  ) {
    const where: any = { deletedAt: null }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.startDate || filters?.endDate) {
      where.onboardedAt = {}
      if (filters.startDate) where.onboardedAt.gte = filters.startDate
      if (filters.endDate) where.onboardedAt.lte = filters.endDate
    }

    const clients = await prisma.client.findMany({
      where,
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
      },
      orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
      take: limit,
    })

    return clients.map((c) => ({
      id: c.id,
      name: c.fullName,
      brandName: c.fullName,
      email: c.email,
      status: c.status,
      niche: c.industryNiche,
      onboardedAt: c.onboardedAt,
      businessPlansCount: c._count.businessPlans,
      deliverablesCount: c._count.deliverables,
      filesCount: c._count.files,
      notesCount: c._count.notes,
      ticketsCount: c._count.tickets,
    }))
  }

  /**
   * Fetch deliverables report data
   */
  private async fetchDeliverablesReport(
    filters?: ReportFilters,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    limit?: number
  ) {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    const deliverables = await prisma.deliverable.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
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
      orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
      take: limit,
    })

    return deliverables.map((d) => ({
      id: d.id,
      title: d.title,
      month: d.month,
      status: d.status,
      clientName: d.client.fullName,
      clientEmail: d.client.email,
      generatedBy: d.generatedByUser.name,
      generatedAt: d.generatedAt,
      approvedAt: d.approvedAt,
      deliveredAt: d.deliveredAt,
    }))
  }

  /**
   * Fetch business plans report data
   */
  private async fetchBusinessPlansReport(
    filters?: ReportFilters,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    limit?: number
  ) {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId
    }

    if (filters?.startDate || filters?.endDate) {
      where.generatedAt = {}
      if (filters.startDate) where.generatedAt.gte = filters.startDate
      if (filters.endDate) where.generatedAt.lte = filters.endDate
    }

    const plans = await prisma.businessPlan.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
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
      orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { generatedAt: 'desc' },
      take: limit,
    })

    return plans.map((p) => ({
      id: p.id,
      version: p.version,
      status: p.status,
      clientName: p.client.fullName,
      clientEmail: p.client.email,
      generatedBy: p.generatedByUser.name,
      generatedAt: p.generatedAt,
      approvedAt: p.approvedAt,
      deliveredAt: p.deliveredAt,
    }))
  }

  /**
   * Fetch activities report data
   */
  private async fetchActivitiesReport(
    filters?: ReportFilters,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    limit?: number
  ) {
    const where: any = {}

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId
    }

    if (filters?.userId) {
      where.userId = filters.userId
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
      take: limit,
    })

    return activities.map((a) => ({
      id: a.id,
      type: a.type,
      description: a.description,
      clientName: a.client?.fullName || null,
      userName: a.user?.name || null,
      createdAt: a.createdAt,
    }))
  }

  /**
   * Fetch jobs report data
   */
  private async fetchJobsReport(
    filters?: ReportFilters,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    limit?: number
  ) {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
      take: limit,
    })

    return jobs.map((j) => ({
      id: j.id,
      type: j.type,
      status: j.status,
      attempts: j.attempts,
      createdAt: j.createdAt,
      startedAt: j.startedAt,
      completedAt: j.completedAt,
      error: j.error,
    }))
  }

  /**
   * Fetch tickets report data
   */
  private async fetchTicketsReport(
    filters?: ReportFilters,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    limit?: number
  ) {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
      take: limit,
    })

    return tickets.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      category: t.category,
      clientName: t.client.fullName,
      assignedTo: t.assignedUser?.name || 'Unassigned',
      commentsCount: t._count.comments,
      createdAt: t.createdAt,
      resolvedAt: t.resolvedAt,
      closedAt: t.closedAt,
    }))
  }

  /**
   * Fetch token usage report data
   */
  private async fetchTokenUsageReport(
    filters?: ReportFilters,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    limit?: number
  ) {
    const where: any = {}

    if (filters?.clientId) {
      where.clientId = filters.clientId
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    const usage = await prisma.tokenUsage.findMany({
      where,
      orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
      take: limit,
    })

    return usage.map((u) => ({
      id: u.id,
      operation: u.operation,
      model: u.model,
      promptTokens: u.promptTokens,
      completionTokens: u.completionTokens,
      totalTokens: u.totalTokens,
      estimatedCost: u.estimatedCost,
      clientId: u.clientId,
      createdAt: u.createdAt,
    }))
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[], reportType: ReportType): string {
    if (data.length === 0) {
      return ''
    }

    // Get headers from first object
    const headers = Object.keys(data[0])
    const csvRows = []

    // Add header row
    csvRows.push(headers.join(','))

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header]
        // Handle nulls, dates, and escape commas
        if (value === null || value === undefined) return ''
        if (value instanceof Date) return value.toISOString()
        const escaped = String(value).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    }

    return csvRows.join('\n')
  }

  /**
   * Convert data to PDF format
   */
  private async convertToPDF(data: any[], reportType: ReportType): Promise<Buffer> {
    // Simplified PDF generation - would use a proper PDF library in production
    // For now, return a basic text representation
    const text = `WavelaunchOS CRM Report\nType: ${reportType}\nGenerated: ${new Date().toISOString()}\nRows: ${data.length}\n\n${JSON.stringify(data, null, 2)}`
    return Buffer.from(text, 'utf-8')
  }
}

// Singleton instance
export const reportGenerator = new ReportGenerator()
