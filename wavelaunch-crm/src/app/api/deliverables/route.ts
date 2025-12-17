import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const listDeliverablesSchema = z.object({
  clientId: z.string().cuid().optional(),
})

// GET /api/deliverables - List all deliverables (optionally filtered by clientId)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || undefined

    const { clientId: validatedClientId } = listDeliverablesSchema.parse({ clientId })

    // Build where clause
    const where: any = {}

    // If clientId provided, filter by client and verify it exists
    if (validatedClientId) {
      const client = await db.client.findUnique({
        where: { id: validatedClientId, deletedAt: null },
      })

      if (!client) {
        return NextResponse.json(
          { success: false, error: 'Client not found' },
          { status: 404 }
        )
      }

      where.clientId = validatedClientId
    }

    // Get deliverables
    const deliverables = await db.deliverable.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
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
