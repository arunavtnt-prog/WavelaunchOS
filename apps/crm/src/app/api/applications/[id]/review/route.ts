import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'REVIEWED']),
  reviewNotes: z.string().optional(),
})

// PATCH /api/applications/[id]/review - Review an application
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, reviewNotes } = reviewSchema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 })
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: {
        status,
        reviewNotes,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Application reviewed successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Review application error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to review application' },
      { status: 500 }
    )
  }
}
