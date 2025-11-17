import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jobQueue } from '@/lib/jobs'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const generatePDFSchema = z.object({
  quality: z.enum(['draft', 'final']).default('final'),
})

// POST /api/business-plans/[id]/generate-pdf - Queue PDF generation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify business plan exists
    const businessPlan = await db.businessPlan.findUnique({
      where: { id: params.id },
    })

    if (!businessPlan) {
      return NextResponse.json(
        { success: false, error: 'Business plan not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { quality } = generatePDFSchema.parse(body)

    // Enqueue PDF generation job
    const jobId = await jobQueue.enqueue('GENERATE_PDF', {
      businessPlanId: params.id,
      quality,
      userId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      data: { jobId },
      message: 'PDF generation queued',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
