import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

/**
 * GET /api/email-drafts
 * Fetch all email drafts with application data
 */
export async function GET(request: NextRequest) {
  try {
    const drafts = await db.emailDraft.findMany({
      include: {
        workflow: {
          include: {
            application: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        blueprint: {
          select: {
            id: true,
            status: true,
            pdfPath: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: drafts,
    })
  } catch (error) {
    console.error('Failed to fetch email drafts:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch email drafts',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/email-drafts
 * Update or approve email drafts
 */
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const { action, draftId, subject, body } = requestBody

    if (action === 'update') {
      if (!draftId || !subject || body === undefined) {
        return NextResponse.json(
          { success: false, error: 'draftId, subject, and body are required' },
          { status: 400 }
        )
      }

      const updatedDraft = await db.emailDraft.update({
        where: { id: draftId },
        data: {
          subject,
          body,
          status: 'MODIFIED',
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedDraft,
      })
    }

    if (action === 'approve') {
      if (!draftId) {
        return NextResponse.json(
          { success: false, error: 'draftId is required' },
          { status: 400 }
        )
      }

      const updatedDraft = await db.emailDraft.update({
        where: { id: draftId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedDraft,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to process email draft request:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process request',
      },
      { status: 500 }
    )
  }
}
