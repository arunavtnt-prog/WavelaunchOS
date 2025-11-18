import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/authorize'
import { analyticsService } from '@/lib/analytics/service'
import { successResponse, validationErrorResponse, handleError } from '@/lib/api/responses'
import { z } from 'zod'

const timeSeriesSchema = z.object({
  metric: z.enum(['clients', 'deliverables', 'revenue']),
  period: z.enum(['week', 'month', 'quarter', 'year']),
})

/**
 * GET /api/analytics/timeseries - Get time series data for charts
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const params = {
      metric: searchParams.get('metric'),
      period: searchParams.get('period'),
    }

    const validation = timeSeriesSchema.safeParse(params)
    if (!validation.success) {
      return validationErrorResponse('Invalid query parameters', validation.error.errors)
    }

    const { metric, period } = validation.data

    const data = await analyticsService.getTimeSeriesData(metric, period)

    return successResponse(data, 'Time series data retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}
