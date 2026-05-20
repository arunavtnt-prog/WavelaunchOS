import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { jobQueue } from '@/lib/jobs'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const generateDeliverableSchema = z.object({
  clientId: z.string().cuid(),
  month: z.number().int().min(1).max(8),
})

// POST /api/deliverables/generate - Queue deliverable generation
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, month } = generateDeliverableSchema.parse(body)

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId, deletedAt: null },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Check if deliverable already exists
    const existing = await prisma.deliverable.findFirst({
      where: { clientId, month, type: 'MAIN' },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Deliverable for Month ${month} already exists` },
        { status: 409 }
      )
    }

    // Enqueue generation job
    const jobId = await jobQueue.enqueue('GENERATE_DELIVERABLE', {
      clientId,
      month,
      userId: session.user?.id || '',
    })

    return NextResponse.json({
      success: true,
      data: { jobId },
      message: 'Deliverable generation queued',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
