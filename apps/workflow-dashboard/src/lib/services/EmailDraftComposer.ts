import { db } from '@/lib/db/prisma';
import type { Application, EmailDraft, DraftStatus } from '@prisma/client';

export interface EmailDraftData {
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    path: string;
    mimeType: string;
  }>;
}

export interface EmailComposerOptions {
  fromEmail: string;
  fromName: string;
}

export class EmailDraftComposer {
  private options: EmailComposerOptions;

  constructor(options: EmailComposerOptions) {
    this.options = options;
  }

  /**
   * Compose initial email draft from application data
   */
  async compose(workflowId: string): Promise<EmailDraftData> {
    const workflow = await db.workflowState.findUnique({
      where: { id: workflowId },
      include: { application: true },
    });

    if (!workflow) {
      throw new Error('Workflow state not found');
    }

    const application = workflow.application;
    const blueprint = await db.blueprint.findUnique({
      where: { applicationId: workflow.applicationId },
      select: { pdfPath: true, status: true },
    });

    const blueprintEngineUrl = process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010';
    const blueprintPdfUrl =
      blueprint?.pdfPath && blueprint.status === 'COMPLETE'
        ? `${blueprintEngineUrl}${blueprint.pdfPath}`
        : null;

    const subject = `Your Wavelaunch Business Blueprint is ready`;
    const body = this.buildEmailBody(application, blueprintPdfUrl);

    // Prefer a link over file attachments for reliability (manual send / client choice).
    return { subject, body, attachments: [] };
  }

  /**
   * Build personalized email body
   */
  private buildEmailBody(application: Application, blueprintPdfUrl: string | null): string {
    const firstName = application.fullName.split(' ')[0];
    const openingVision = (application.visionForVenture || '').split('.').find(Boolean)?.trim() || application.visionForVenture;
    const differentiation = (application.differentiation || '').split('.').find(Boolean)?.trim() || application.differentiation;

    const pdfLine = blueprintPdfUrl
      ? `Your PDF is ready here:\n${blueprintPdfUrl}\n`
      : `Your PDF is being finalized now. I’ll send the download link as soon as it’s ready.\n`;

    return `Hi ${firstName},

Thank you for your interest in Wavelaunch Studio and for taking the time to share your vision with us.

After reviewing your application for the D26 Cohort, we prepared a personalized Business Blueprint based on your Vision Form responses (strategy, market framing, and a recommended direction).

${pdfLine}

Your Unique Market Position
Based on your background in ${application.industryNiche} and your vision to ${openingVision || 'build a scalable brand'}, we see a credible path to a focused offer and a clear go-to-market plan.

Key highlights from our analysis:
- Your audience of ${application.targetAudience} represents a substantial market opportunity
- Your differentiation around ${differentiation || 'your core positioning'} can create a real edge
- Your brand values of ${application.brandValues} resonate strongly with your target demographic

Inside the blueprint you’ll find:
- Detailed market analysis and sizing
- Product strategy tailored to your audience
- 12-month launch roadmap
- Investment allocation framework
- Key success metrics

Next Steps
1. Skim the Executive Summary + “Business Directions & Recommendation”
2. Reply with 2–3 times for a 30-min call so we can walk through the recommendation and answer questions
3. If it’s a fit, we’ll begin with the $5,000 onboarding to start the Discovery Phase and execution plan

This is tailored to your exact Vision Form responses and your current channel context in ${application.country}.

If you have any constraints (timeline, capacity, budget, product preference) that should shape the recommendation, reply with them and we’ll incorporate them into the kickoff.

Best regards,
The Wavelaunch Studio Team

---
Questions? Just reply to this email—happy to help.`;
  }

  /**
   * Save email draft to database
   */
  async saveDraft(workflowId: string, draftData: EmailDraftData): Promise<EmailDraft> {
    return db.emailDraft.create({
      data: {
        workflowId,
        subject: draftData.subject,
        body: draftData.body,
        attachments: draftData.attachments || [],
        status: 'PENDING_REVIEW',
      },
    });
  }

  /**
   * Update existing draft
   */
  async updateDraft(draftId: string, updates: Partial<EmailDraftData>): Promise<EmailDraft> {
    return db.emailDraft.update({
      where: { id: draftId },
      data: {
        ...(updates.subject && { subject: updates.subject }),
        ...(updates.body && { body: updates.body }),
        ...(updates.attachments && { attachments: updates.attachments }),
        status: 'MODIFIED' as DraftStatus,
      },
    });
  }

  /**
   * Approve draft for sending
   */
  async approveDraft(draftId: string, userId: string): Promise<EmailDraft> {
    return db.emailDraft.update({
      where: { id: draftId },
      data: {
        status: 'APPROVED',
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });
  }

  /**
   * Send approved email via CRM email service
   */
  async sendEmail(draftId: string, userId: string): Promise<boolean> {
    const draft = await db.emailDraft.findUnique({
      where: { id: draftId },
      include: {
        workflow: {
          include: {
            application: true,
          },
        },
      },
    });

    if (!draft) {
      throw new Error('Email draft not found');
    }

    if (draft.status !== 'APPROVED') {
      throw new Error('Email must be approved before sending');
    }

    try {
      // Call CRM email service to send
      const response = await fetch(`${process.env.CRM_API_URL}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: draft.workflow.application.email,
          subject: draft.subject,
          body: draft.body,
          attachments: draft.attachments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email via CRM service');
      }

      // Update draft status
      await db.emailDraft.update({
        where: { id: draftId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          sentBy: userId,
        },
      });

      // Update workflow state
      await db.workflowState.update({
        where: { id: draft.workflowId },
        data: {
          status: 'EMAIL_SENT',
          emailSentAt: new Date(),
          emailSentBy: userId,
          draftEmailSubject: draft.subject,
          draftEmailBody: draft.body,
        },
      });

      // Log the action
      await db.workflowAuditLog.create({
        data: {
          workflowId: draft.workflowId,
          action: 'SEND_EMAIL',
          performedBy: userId,
          oldStatus: 'EMAIL_REVIEW_PENDING',
          newStatus: 'EMAIL_SENT',
          metadata: {
            draftId,
            to: draft.workflow.application.email,
            subject: draft.subject,
          },
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Get pending review drafts
   */
  async getPendingDrafts(): Promise<Array<EmailDraft & { workflow: { application: Application } }>> {
    return db.emailDraft.findMany({
      where: {
        status: {
          in: ['PENDING_REVIEW', 'MODIFIED'],
        },
      },
      include: {
        workflow: {
          include: {
            application: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get draft by workflow ID
   */
  async getDraftByWorkflow(workflowId: string): Promise<EmailDraft | null> {
    return db.emailDraft.findFirst({
      where: { workflowId },
      include: {
        workflow: {
          include: {
            application: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
