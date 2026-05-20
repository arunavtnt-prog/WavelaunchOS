import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/authorize'
import { analyticsService } from '@/lib/analytics/service'
import { successResponse, notFoundResponse, handleError } from '@/lib/api/responses'

/**
 * GET /api/analytics/clients/[clientId] - Get client-specific analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    await requireAuth()

    const analytics = await analyticsService.getClientAnalytics(params.clientId)

    return successResponse(analytics, 'Client analytics retrieved successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Client not found') {
      return notFoundResponse('Client')
    }
    return handleError(error)
  }
}
