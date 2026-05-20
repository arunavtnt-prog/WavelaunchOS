import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'
import { emailService } from '@/lib/email/service'

/**
 * POST /api/email-drafts/[id]/send
 * Send an approved email draft
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const draftId = params.id

    // Fetch the draft with all related data
    const draft = await db.emailDraft.findUnique({
      where: { id: draftId },
      include: {
        workflow: {
          include: {
            application: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        },
        blueprint: {
          select: {
            application: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    })

    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Email draft not found' },
        { status: 404 }
      )
    }

    if (draft.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Email draft must be approved before sending' },
        { status: 400 }
      )
    }

    // Send the email using the email service
    await emailService.sendEmail({
      to: draft.workflow.application.email,
      subject: draft.subject,
      html: draft.body.replace(/\n/g, '<br>'),
      text: draft.body,
      attachments: draft.attachments.map((att: any) => ({
        filename: att.filename,
        path: att.path,
      })),
    })

    // Update draft status
    await db.emailDraft.update({
      where: { id: draftId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 }
    )
  }
}
