import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NotFoundError, handleError } from '@/lib/utils/errors'

// GET /api/clients/[id]/activity - Get client activity log
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: params.id, deletedAt: null },
    })

    if (!client) {
      throw new NotFoundError('Client', params.id)
    }

    const activities = await db.activity.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: activities,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
