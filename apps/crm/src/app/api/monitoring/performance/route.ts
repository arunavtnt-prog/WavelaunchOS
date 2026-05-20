import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/authorize'
import { performanceMonitor } from '@/lib/middleware/performance'
import { apiCache } from '@/lib/cache/api-cache'
import { successResponse, handleError } from '@/lib/api/responses'

/**
 * GET /api/monitoring/performance - Get performance metrics (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const stats = performanceMonitor.getStats()
    const slowQueries = performanceMonitor.getSlowQueries(20)
    const health = performanceMonitor.getHealthSummary()
    const cacheStats = await apiCache.getStats()

    return successResponse({
      health,
      performance: {
        endpoints: stats.endpoints,
        slowestEndpoints: stats.slowest,
        totalEndpoints: stats.totalEndpoints,
      },
      database: {
        slowQueries,
      },
      cache: cacheStats,
      recommendations: generateRecommendations(stats, slowQueries),
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/monitoring/performance - Clear performance metrics (Admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    performanceMonitor.clear()

    return successResponse(null, 'Performance metrics cleared')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(
  stats: ReturnType<typeof performanceMonitor.getStats>,
  slowQueries: ReturnType<typeof performanceMonitor.getSlowQueries>
): string[] {
  const recommendations: string[] = []

  // Check for slow endpoints
  const verySlow = stats.slowest.filter((e) => e.avgTime > 3000)
  if (verySlow.length > 0) {
    recommendations.push(
      `${verySlow.length} endpoint(s) averaging >3s response time - consider optimization or caching`
    )
  }

  // Check for slow queries
  const criticalQueries = slowQueries.filter((q) => q.duration > 500)
  if (criticalQueries.length > 0) {
    recommendations.push(
      `${criticalQueries.length} database queries taking >500ms - add indexes or optimize queries`
    )
  }

  // Check endpoint consistency
  for (const [endpoint, stat] of Object.entries(stats.endpoints)) {
    if (!stat) continue
    if (stat.p99 > stat.p50 * 5) {
      recommendations.push(
        `${endpoint} has high variance (p99: ${Math.round(stat.p99)}ms, p50: ${Math.round(stat.p50)}ms) - investigate inconsistent performance`
      )
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('No performance issues detected - system is healthy')
  }

  return recommendations
}
