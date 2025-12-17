import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { resetBudget } from '@/lib/ai/token-tracker'
import { z } from 'zod'

const updateBudgetSchema = z.object({
  tokenLimit: z.number().int().positive().optional(),
  costLimit: z.number().positive().optional(),
  alertAt50: z.boolean().optional(),
  alertAt75: z.boolean().optional(),
  alertAt90: z.boolean().optional(),
  alertAt100: z.boolean().optional(),
  autoPauseAtLimit: z.boolean().optional(),
  isPaused: z.boolean().optional(),
})

// PATCH /api/token-budget/[id] - Update a token budget
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateBudgetSchema.parse(body)

    const budget = await prisma.tokenBudget.update({
      where: { id: params.id },
      data,
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

// POST /api/token-budget/[id]/reset - Reset a budget
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await resetBudget(params.id)

    const budget = await prisma.tokenBudget.findUnique({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      data: budget,
      message: 'Budget reset successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// DELETE /api/token-budget/[id] - Delete a budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.tokenBudget.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
