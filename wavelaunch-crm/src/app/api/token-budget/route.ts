import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const createBudgetSchema = z.object({
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  tokenLimit: z.number().int().positive(),
  costLimit: z.number().positive(),
  alertAt50: z.boolean().optional(),
  alertAt75: z.boolean().optional(),
  alertAt90: z.boolean().optional(),
  alertAt100: z.boolean().optional(),
  autoPauseAtLimit: z.boolean().optional(),
})

// GET /api/token-budget - Get all token budgets
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const budgets = await db.tokenBudget.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: budgets,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// POST /api/token-budget - Create a new token budget
// Helper function to get period duration in days
function getPeriodDuration(period: string): number {
  switch (period) {
    case 'DAILY':
      return 1
    case 'WEEKLY':
      return 7
    case 'MONTHLY':
      return 30
    default:
      return 30
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createBudgetSchema.parse(body)

    // Deactivate existing budget for this period
    await db.tokenBudget.updateMany({
      where: {
        period: data.period,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    // Create new budget
    const budget = await db.tokenBudget.create({
      data: {
        ...data,
        isActive: true,
        tokensUsed: 0,
        costUsed: 0,
        isPaused: false,
        startDate: new Date(),
        endDate: new Date(Date.now() + getPeriodDuration(data.period) * 24 * 60 * 60 * 1000),
      },
    })

    return NextResponse.json({
      success: true,
      data: budget,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
