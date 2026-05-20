import { NextRequest, NextResponse } from 'next/server';
import { EmailDraftComposer } from '@/lib/services/EmailDraftComposer';
import { db } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const composer = new EmailDraftComposer({
      fromEmail: 'team@wavelaunch.studio',
      fromName: 'Wavelaunch Studio',
    });

    const drafts = await composer.getPendingDrafts();

    return NextResponse.json({
      success: true,
      data: drafts,
    });
  } catch (error) {
    console.error('Error fetching email drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email drafts', success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workflowId, draftId, subject, body: emailBody } = body;

    const composer = new EmailDraftComposer({
      fromEmail: 'team@wavelaunch.studio',
      fromName: 'Wavelaunch Studio',
    });

    if (action === 'compose') {
      // Compose new draft
      const draftData = await composer.compose(workflowId);
      const draft = await composer.saveDraft(workflowId, draftData);

      // Update workflow state
      await db.workflowState.update({
        where: { id: workflowId },
        data: {
          status: 'EMAIL_REVIEW_PENDING',
          draftEmailSubject: draftData.subject,
          draftEmailBody: draftData.body,
          draftEmailPreparedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: draft,
      });
    } else if (action === 'update') {
      // Update existing draft
      if (!draftId) {
        return NextResponse.json(
          { error: 'Draft ID is required', success: false },
          { status: 400 }
        );
      }

      const draft = await composer.updateDraft(draftId, {
        subject,
        body: emailBody,
      });

      return NextResponse.json({
        success: true,
        data: draft,
      });
    } else if (action === 'approve') {
      // Approve draft for sending
      if (!draftId) {
        return NextResponse.json(
          { error: 'Draft ID is required', success: false },
          { status: 400 }
        );
      }

      const draft = await composer.approveDraft(draftId, 'system');

      return NextResponse.json({
        success: true,
        data: draft,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action', success: false },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in emails API:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
