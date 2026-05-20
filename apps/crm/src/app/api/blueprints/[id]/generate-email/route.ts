import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

/**
 * POST /api/blueprints/[id]/generate-email
 * Generate an approval email draft for a completed blueprint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blueprintId = params.id

    // Fetch blueprint with application data
    const blueprint = await db.blueprint.findUnique({
      where: { id: blueprintId },
      include: {
        application: {
          include: {
            workflowState: true,
          },
        },
      },
    })

    if (!blueprint) {
      return NextResponse.json(
        { success: false, error: 'Blueprint not found' },
        { status: 404 }
      )
    }

    // Check if blueprint is in a valid state for email generation
    if (blueprint.status !== 'COMPLETE' && blueprint.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: `Blueprint must be COMPLETE or APPROVED to generate approval email. Current status: ${blueprint.status}`,
        },
        { status: 400 }
      )
    }

    // Check if workflow state exists
    if (!blueprint.application.workflowState) {
      return NextResponse.json(
        { success: false, error: 'Workflow state not found for this application' },
        { status: 404 }
      )
    }

    const workflowState = blueprint.application.workflowState
    const application = blueprint.application
    const firstName = application.fullName.split(' ')[0]

    // Extract key data for email
    const visionSummary = (application.visionForVenture || '')
      .split('.')
      .filter(Boolean)
      .slice(0, 2)
      .join('. ')
      .trim() || application.visionForVenture

    const differentiation = (application.differentiation || '')
      .split('.')
      .filter(Boolean)
      .slice(0, 1)
      .join('. ')
      .trim() || application.differentiation

    // Build PDF URL if available
    const blueprintEngineUrl = process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010'
    let pdfUrl: string | undefined
    if (blueprint.pdfPath) {
      pdfUrl = `${blueprintEngineUrl}${blueprint.pdfPath}`
    }

    // Generate email content
    const subject = 'Your Business Blueprint is Ready for Review 📊'

    const body = `Hi ${firstName},

Great news! Your comprehensive Business Blueprint has been completed and is ready for your review.

This McKinsey-caliber 15-25 page business plan includes:
- Market Sizing & Competitive Intelligence
- Audience Deep Dive & Brand Positioning
- Product Architecture & Financial Projections
- Go-to-Market Strategy & Implementation Roadmap

YOUR UNIQUE MARKET POSITION:
Based on your background in ${application.industryNiche} and your vision to ${visionSummary}, we see a credible path to building a scalable brand in the ${application.targetAudience} market.

KEY METRICS:
- Development Timeline: 8 months
- Investment Range: $150K-$200K

KEY HIGHLIGHTS FROM YOUR BLUEPRINT:
- Your audience of ${application.targetAudience} represents a substantial market opportunity
- Your differentiation around ${differentiation} can create a real competitive edge
- Your brand values of ${application.brandValues} resonate strongly with your target demographic

INVESTMENT STRUCTURE:
- Equity Split: 90% Creator / 10% Wavelaunch
- Commitment Fee: $5,000
- Investment Range: $150K-$200K

${pdfUrl ? `DOWNLOAD YOUR BLUEPRINT:
${pdfUrl}

` : ''}NEXT STEPS:
1. Review the Executive Summary and Strategic Recommendations
2. Check the Financial Projections and Go-to-Market Strategy
3. Reply with 2-3 times for a 30-min call to discuss the blueprint
4. If aligned, we'll begin with the onboarding to start execution

This blueprint is tailored to your exact Vision Form responses and your current context in ${application.country}.

If you have any constraints (timeline, capacity, budget, product preferences) that should shape our recommendation, reply with them and we'll incorporate them into our discussion.

Best regards,
The Wavelaunch Studio Team

---
Wavelaunch Studio | Building Brands for Creators
${process.env.NEXT_PUBLIC_APP_URL || 'https://login.wavelaunch.org'}
`

    // Build attachments
    const attachments: Array<{ filename: string; path: string; mimeType: string }> = []
    if (blueprint.pdfPath) {
      const sanitizedName = application.fullName
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')

      attachments.push({
        filename: `${sanitizedName}_Blueprint.pdf`,
        path: blueprint.pdfPath,
        mimeType: 'application/pdf',
      })
    }

    // Check if a draft already exists
    const existingDraft = await db.emailDraft.findFirst({
      where: {
        workflowId: workflowState.id,
        blueprintId,
      },
    })

    let savedDraft
    if (existingDraft) {
      // Update existing draft
      savedDraft = await db.emailDraft.update({
        where: { id: existingDraft.id },
        data: {
          subject,
          body,
          attachments,
          status: 'PENDING_REVIEW',
          autoGenerated: true,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new draft
      savedDraft = await db.emailDraft.create({
        data: {
          workflowId: workflowState.id,
          blueprintId,
          subject,
          body,
          attachments,
          status: 'PENDING_REVIEW',
          autoGenerated: true,
        },
      })
    }

    // Log the email generation
    await db.workflowAuditLog.create({
      data: {
        workflowId: workflowState.id,
        action: 'APPROVAL_EMAIL_GENERATED',
        performedBy: 'SYSTEM',
        metadata: {
          blueprintId,
          draftId: savedDraft.id,
          subject,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Approval email draft generated successfully',
      data: {
        draftId: savedDraft.id,
        subject: savedDraft.subject,
        status: savedDraft.status,
        createdAt: savedDraft.createdAt,
      },
    })
  } catch (error) {
    console.error('Failed to generate approval email:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate approval email',
      },
      { status: 500 }
    )
  }
}
