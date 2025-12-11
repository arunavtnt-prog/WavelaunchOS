import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/authorize'
import { reportGenerator, ReportType, ExportFormat } from '@/lib/reports/generator'
import { validationErrorResponse, handleError } from '@/lib/api/responses'
import { z } from 'zod'

const generateReportSchema = z.object({
  type: z.enum([
    'clients',
    'deliverables',
    'business-plans',
    'activities',
    'jobs',
    'tickets',
    'token-usage',
  ]),
  format: z.enum(['csv', 'json', 'pdf']),
  filters: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.string().optional(),
      clientId: z.string().optional(),
      userId: z.string().optional(),
      type: z.string().optional(),
    })
    .optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().positive().max(10000).optional(),
})

/**
 * POST /api/reports/generate - Generate and download a report (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const validation = generateReportSchema.safeParse(body)

    if (!validation.success) {
      return validationErrorResponse('Invalid report parameters', validation.error.errors)
    }

    const { type, format, filters, sortBy, sortOrder, limit } = validation.data

    // Parse date strings if provided
    const parsedFilters = filters
      ? {
          ...filters,
          startDate: filters.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        }
      : undefined

    const report = await reportGenerator.generate({
      type: type as ReportType,
      format: format as ExportFormat,
      filters: parsedFilters,
      sortBy,
      sortOrder,
      limit,
    })

    // Return file as download
    const bodyContent = typeof report.content === 'string' ? report.content : new Uint8Array(report.content)
    const response = new NextResponse(bodyContent, {
      status: 200,
      headers: {
        'Content-Type': report.contentType,
        'Content-Disposition': `attachment; filename="${report.filename}"`,
        'X-Row-Count': report.rowCount.toString(),
      },
    })

    return response
  } catch (error) {
    return handleError(error)
  }
}
