import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/utils/errors'
import { getTokenStats, getBudgetStatus } from '@/lib/ai/token-tracker'
import { getCacheStats } from '@/lib/ai/cache'

// GET /api/token-stats - Get token usage statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period')

    // Parse period if provided
    let periodFilter: { start?: Date; end?: Date } | undefined
    if (period) {
      const now = new Date()
      if (period === 'today') {
        periodFilter = {
          start: new Date(now.setHours(0, 0, 0, 0)),
          end: new Date(now.setHours(23, 59, 59, 999)),
        }
      } else if (period === 'week') {
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        periodFilter = { start: weekAgo }
      } else if (period === 'month') {
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        periodFilter = { start: monthAgo }
      }
    }

    // Get all stats
    const [tokenStats, budgetStatus, cacheStats] = await Promise.all([
      getTokenStats(periodFilter),
      getBudgetStatus(),
      getCacheStats(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        tokenUsage: tokenStats,
        budgets: budgetStatus,
        cache: cacheStats,
      },
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
