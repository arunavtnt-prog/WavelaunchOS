import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/authorize'
import { analyticsService } from '@/lib/analytics/service'
import { successResponse, handleError } from '@/lib/api/responses'

/**
 * GET /api/analytics/dashboard - Get comprehensive dashboard analytics
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const analytics = await analyticsService.getDashboardAnalytics()

    return successResponse(analytics, 'Dashboard analytics retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}
