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

    // Calculate start and end dates based on period
    const now = new Date()
    let startDate = new Date(now)
    let endDate = new Date(now)

    if (data.period === 'DAILY') {
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
    } else if (data.period === 'WEEKLY') {
      const dayOfWeek = now.getDay()
      startDate.setDate(now.getDate() - dayOfWeek)
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
    } else if (data.period === 'MONTHLY') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    }

    // Create new budget
    const budget = await db.tokenBudget.create({
      data: {
        ...data,
        startDate,
        endDate,
        isActive: true,
        tokensUsed: 0,
        costUsed: 0,
        isPaused: false,
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
