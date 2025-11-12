import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const listDeliverablesSchema = z.object({
  clientId: z.string().cuid(),
})

// GET /api/deliverables?clientId=xxx - List all deliverables for a client
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

    const { clientId: validatedClientId } = listDeliverablesSchema.parse({ clientId })

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

    // Get all deliverables for client, ordered by month
    const deliverables = await db.deliverable.findMany({
      where: { clientId: validatedClientId },
      orderBy: { month: 'asc' },
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
      data: deliverables,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
