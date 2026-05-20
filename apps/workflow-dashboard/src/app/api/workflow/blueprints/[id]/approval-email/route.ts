import { NextRequest, NextResponse } from 'next/server';
import { BlueprintEmailComposer } from '@/lib/services/BlueprintEmailComposer';
import { db } from '@/lib/db/prisma';

/**
 * POST /api/workflow/blueprints/[id]/approval-email
 * Generate an approval email draft for a completed blueprint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blueprintId = params.id;

    // Verify blueprint exists
    const blueprint = await db.blueprint.findUnique({
      where: { id: blueprintId },
      include: {
        application: {
          include: {
            workflowState: true,
          },
        },
      },
    });

    if (!blueprint) {
      return NextResponse.json(
        { success: false, error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    // Check if blueprint is in a valid state for email generation
    if (blueprint.status !== 'COMPLETE' && blueprint.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: `Blueprint must be COMPLETE or APPROVED to generate approval email. Current status: ${blueprint.status}`,
        },
        { status: 400 }
      );
    }

    // Check if workflow state exists
    if (!blueprint.application.workflowState) {
      return NextResponse.json(
        { success: false, error: 'Workflow state not found for this application' },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3007';
    const blueprintEngineUrl = process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010';

    const composer = new BlueprintEmailComposer({
      fromEmail: 'team@wavelaunch.studio',
      fromName: 'Wavelaunch Studio',
      appUrl,
      blueprintEngineUrl,
    });

    // Check if draft already exists
    const hasDraft = await composer.hasDraft(blueprintId);
    if (hasDraft) {
      const existingDraft = await composer.getDraftByBlueprint(blueprintId);
      return NextResponse.json({
        success: true,
        message: 'Approval email already exists',
        data: existingDraft,
      });
    }

    // Generate the draft
    const draftData = await composer.generateApprovalDraft(blueprintId);

    if (!draftData.workflowId) {
      return NextResponse.json(
        { success: false, error: 'Failed to determine workflow ID' },
        { status: 500 }
      );
    }

    // Save to database
    const savedDraft = await composer.saveDraft(
      draftData.workflowId,
      blueprintId,
      draftData
    );

    // Log the email generation
    await db.workflowAuditLog.create({
      data: {
        workflowId: blueprint.application.workflowState.id,
        action: 'APPROVAL_EMAIL_GENERATED',
        performedBy: 'SYSTEM', // Could be replaced with actual user ID if auth is added
        metadata: {
          blueprintId,
          draftId: savedDraft.id,
          subject: draftData.subject,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Approval email draft generated successfully',
      data: {
        draftId: savedDraft.id,
        subject: savedDraft.subject,
        status: savedDraft.status,
        createdAt: savedDraft.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to generate approval email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate approval email',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflow/blueprints/[id]/approval-email
 * Check if an approval email exists for this blueprint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blueprintId = params.id;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3007';
    const blueprintEngineUrl = process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010';

    const composer = new BlueprintEmailComposer({
      fromEmail: 'team@wavelaunch.studio',
      fromName: 'Wavelaunch Studio',
      appUrl,
      blueprintEngineUrl,
    });

    const draft = await composer.getDraftByBlueprint(blueprintId);
    const hasDraft = await composer.hasDraft(blueprintId);

    return NextResponse.json({
      success: true,
      data: {
        hasDraft,
        draft,
      },
    });
  } catch (error) {
    console.error('Failed to check approval email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check approval email',
      },
      { status: 500 }
    );
  }
}
