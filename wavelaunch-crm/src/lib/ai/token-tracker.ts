import { db } from '@/lib/db'

// Token cost per 1K tokens (approximate Claude pricing)
const COST_PER_1K_INPUT = 0.003 // $3 per 1M input tokens
const COST_PER_1K_OUTPUT = 0.015 // $15 per 1M output tokens

export interface TokenUsageData {
  operation: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cacheHit: boolean
  cacheKey?: string
  clientId?: string
  userId?: string
  metadata?: Record<string, any>
}

/**
 * Log token usage to database
 */
export async function logTokenUsage(data: TokenUsageData): Promise<void> {
  try {
    const estimatedCost =
      (data.promptTokens / 1000) * COST_PER_1K_INPUT +
      (data.completionTokens / 1000) * COST_PER_1K_OUTPUT

    await db.tokenUsage.create({
      data: {
        operation: data.operation,
        model: data.model,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        estimatedCost,
        cacheHit: data.cacheHit,
        cacheKey: data.cacheKey,
        clientId: data.clientId,
        userId: data.userId,
      },
    })

    // Update daily budget if exists
    await updateBudgetUsage('DAILY', data.totalTokens, estimatedCost)
    await updateBudgetUsage('WEEKLY', data.totalTokens, estimatedCost)
    await updateBudgetUsage('MONTHLY', data.totalTokens, estimatedCost)
  } catch (error) {
    console.error('Log token usage error:', error)
  }
}

/**
 * Update budget usage and check for alerts
 */
async function updateBudgetUsage(
  period: string,
  tokens: number,
  cost: number
): Promise<void> {
  try {
    // Get active budget for this period
    const budget = await db.tokenBudget.findFirst({
      where: {
        period,
        isActive: true,
      },
    })

    if (!budget) {
      return
    }

    // Update usage
    const newTokensUsed = budget.tokensUsed + tokens
    const newCostUsed = budget.costUsed + cost

    await db.tokenBudget.update({
      where: { id: budget.id },
      data: {
        tokensUsed: newTokensUsed,
        costUsed: newCostUsed,
      },
    })

    // Check for alerts
    const tokenPercentage = (newTokensUsed / budget.tokenLimit) * 100
    const costPercentage = (newCostUsed / budget.costLimit) * 100
    const maxPercentage = Math.max(tokenPercentage, costPercentage)

    // Send alerts
    if (maxPercentage >= 100 && budget.alertAt100) {
      await sendBudgetAlert(budget.id, 100, period, newTokensUsed, newCostUsed)
    } else if (maxPercentage >= 90 && budget.alertAt90) {
      await sendBudgetAlert(budget.id, 90, period, newTokensUsed, newCostUsed)
    } else if (maxPercentage >= 75 && budget.alertAt75) {
      await sendBudgetAlert(budget.id, 75, period, newTokensUsed, newCostUsed)
    } else if (maxPercentage >= 50 && budget.alertAt50) {
      await sendBudgetAlert(budget.id, 50, period, newTokensUsed, newCostUsed)
    }

    // Auto-pause if enabled and limit reached
    if (maxPercentage >= 100 && budget.autoPauseAtLimit && !budget.isPaused) {
      await db.tokenBudget.update({
        where: { id: budget.id },
        data: { isPaused: true },
      })
    }
  } catch (error) {
    console.error('Update budget usage error:', error)
  }
}

/**
 * Send budget alert (log to database, could also send email)
 */
async function sendBudgetAlert(
  budgetId: string,
  threshold: number,
  period: string,
  tokensUsed: number,
  costUsed: number
): Promise<void> {
  try {
    // Log alert to activity using SETTINGS_UPDATED as a system-level activity type
    await db.activity.create({
      data: {
        type: 'SETTINGS_UPDATED',
        description: `Token budget alert: ${period} budget ${threshold}% threshold reached. Used ${tokensUsed.toLocaleString()} tokens ($${costUsed.toFixed(2)})`,
      },
    })

    // TODO: Send email notification here
    console.warn(
      `⚠️  Token Budget Alert: ${period} budget ${threshold}% threshold reached`
    )
  } catch (error) {
    console.error('Send budget alert error:', error)
  }
}

/**
 * Check if budget allows more token usage
 */
export async function checkBudget(): Promise<{
  allowed: boolean
  reason?: string
}> {
  try {
    // Check if any active budget is paused
    const pausedBudget = await db.tokenBudget.findFirst({
      where: {
        isActive: true,
        isPaused: true,
      },
    })

    if (pausedBudget) {
      return {
        allowed: false,
        reason: `${pausedBudget.period} budget limit reached and auto-pause is enabled`,
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Check budget error:', error)
    return { allowed: true } // Allow by default if check fails
  }
}

/**
 * Get token usage statistics
 */
export async function getTokenStats(period?: {
  start?: Date
  end?: Date
}): Promise<{
  totalTokens: number
  totalCost: number
  totalRequests: number
  cacheHitRate: number
  byOperation: Record<string, { tokens: number; cost: number; count: number }>
  byModel: Record<string, { tokens: number; cost: number; count: number }>
}> {
  try {
    const where: any = {}

    if (period?.start || period?.end) {
      where.createdAt = {}
      if (period.start) where.createdAt.gte = period.start
      if (period.end) where.createdAt.lte = period.end
    }

    const usages = await db.tokenUsage.findMany({
      where,
    })

    const totalTokens = usages.reduce((sum, u) => sum + u.totalTokens, 0)
    const totalCost = usages.reduce((sum, u) => sum + u.estimatedCost, 0)
    const totalRequests = usages.length
    const cacheHits = usages.filter((u) => u.cacheHit).length
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0

    // Group by operation
    const byOperation: Record<
      string,
      { tokens: number; cost: number; count: number }
    > = {}
    for (const usage of usages) {
      if (!byOperation[usage.operation]) {
        byOperation[usage.operation] = { tokens: 0, cost: 0, count: 0 }
      }
      byOperation[usage.operation].tokens += usage.totalTokens
      byOperation[usage.operation].cost += usage.estimatedCost
      byOperation[usage.operation].count += 1
    }

    // Group by model
    const byModel: Record<string, { tokens: number; cost: number; count: number }> =
      {}
    for (const usage of usages) {
      if (!byModel[usage.model]) {
        byModel[usage.model] = { tokens: 0, cost: 0, count: 0 }
      }
      byModel[usage.model].tokens += usage.totalTokens
      byModel[usage.model].cost += usage.estimatedCost
      byModel[usage.model].count += 1
    }

    return {
      totalTokens,
      totalCost,
      totalRequests,
      cacheHitRate,
      byOperation,
      byModel,
    }
  } catch (error) {
    console.error('Get token stats error:', error)
    return {
      totalTokens: 0,
      totalCost: 0,
      totalRequests: 0,
      cacheHitRate: 0,
      byOperation: {},
      byModel: {},
    }
  }
}

/**
 * Reset budget usage (for new period)
 */
export async function resetBudget(budgetId: string): Promise<void> {
  try {
    await db.tokenBudget.update({
      where: { id: budgetId },
      data: {
        tokensUsed: 0,
        costUsed: 0,
        isPaused: false,
      },
    })
  } catch (error) {
    console.error('Reset budget error:', error)
  }
}

/**
 * Get current budget status
 */
export async function getBudgetStatus(): Promise<{
  daily?: {
    limit: number
    used: number
    percentage: number
    isPaused: boolean
  }
  weekly?: {
    limit: number
    used: number
    percentage: number
    isPaused: boolean
  }
  monthly?: {
    limit: number
    used: number
    percentage: number
    isPaused: boolean
  }
}> {
  try {
    const budgets = await db.tokenBudget.findMany({
      where: { isActive: true },
    })

    const status: any = {}

    for (const budget of budgets) {
      const key = budget.period.toLowerCase() as 'daily' | 'weekly' | 'monthly'
      status[key] = {
        limit: budget.tokenLimit,
        used: budget.tokensUsed,
        percentage: (budget.tokensUsed / budget.tokenLimit) * 100,
        isPaused: budget.isPaused,
      }
    }

    return status
  } catch (error) {
    console.error('Get budget status error:', error)
    return {}
  }
}
