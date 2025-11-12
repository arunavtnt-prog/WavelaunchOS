import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const listBusinessPlansSchema = z.object({
  clientId: z.string().cuid(),
})

// GET /api/business-plans?clientId=xxx - List all business plans for a client
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
        { status: 400 }
      )
    }

    const { clientId: validatedClientId } = listBusinessPlansSchema.parse({ clientId })

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: validatedClientId, deletedAt: null },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get all business plans for client, ordered by version (newest first)
    const businessPlans = await db.businessPlan.findMany({
      where: { clientId: validatedClientId },
      orderBy: { version: 'desc' },
      include: {
        generatedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: businessPlans,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
