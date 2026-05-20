import { db } from '@/lib/db/prisma';
import { SnapshotGenerator } from './SnapshotGenerator';
import { EmailDraftComposer } from './EmailDraftComposer';
import { BlueprintOrchestrator } from './BlueprintOrchestrator';
import type { WorkflowStatus, WorkflowState } from '@prisma/client';

export interface OrchestratorOptions {
  anthropicApiKey: string;
  snapshotEngineUrl: string;
}

export class WorkflowOrchestrator {
  private snapshotGenerator: SnapshotGenerator;
  private emailComposer: EmailDraftComposer;

  constructor(options: OrchestratorOptions) {
    this.snapshotGenerator = new SnapshotGenerator({
      anthropicApiKey: options.anthropicApiKey,
      snapshotEngineUrl: options.snapshotEngineUrl,
    });

    this.emailComposer = new EmailDraftComposer({
      fromEmail: 'team@wavelaunch.studio',
      fromName: 'Wavelaunch Studio',
    });
  }

  /**
   * Process a workflow state through its next automated step
   */
  async processWorkflow(workflowId: string): Promise<void> {
    const workflowState = await db.workflowState.findUnique({
      where: { id: workflowId },
      include: {
        application: true,
      },
    });

    if (!workflowState) {
      throw new Error('Workflow state not found');
    }

    const currentStatus = workflowState.status;

    switch (currentStatus) {
      case 'SNAPSHOT_QUEUED':
        await this.processSnapshotGeneration(workflowId);
        break;

      case 'SNAPSHOT_COMPLETE':
        await this.processBlueprintPipeline(workflowId);
        break;

      case 'EMAIL_SENT':
        await this.scheduleFollowUp(workflowId);
        break;

      default:
        console.log(`No automated action for status: ${currentStatus}`);
    }
  }

  /**
   * Process the post-snapshot pipeline:
   * snapshot → blueprint → PDF → email draft (review only)
   */
  private async processBlueprintPipeline(workflowId: string): Promise<void> {
    const workflowState = await db.workflowState.findUnique({
      where: { id: workflowId },
      include: { application: true },
    });

    if (!workflowState) {
      throw new Error('Workflow state not found');
    }

    const applicationId = workflowState.applicationId;

    const blueprintOrchestrator = new BlueprintOrchestrator({
      apiUrl: process.env.AI_PROXY_URL || 'http://localhost:3003',
      tavilyApiKey: process.env.TAVILY_API_KEY,
    });

    // Ensure a blueprint exists.
    let blueprint = await db.blueprint.findUnique({ where: { applicationId } });
    if (!blueprint) {
      const init = await blueprintOrchestrator.initialize(applicationId);
      if (!init.success) {
        throw new Error(init.error || 'Failed to initialize blueprint');
      }
      return;
    }

    // Progress one batch at a time until complete.
    if (blueprint.status === 'IN_PROGRESS') {
      const result = await blueprintOrchestrator.processBatch(blueprint.id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to process blueprint batch');
      }
      return;
    }

    // If complete, ensure a PDF exists.
    if (blueprint.status === 'COMPLETE' && !blueprint.pdfPath && blueprint.markdown) {
      const blueprintEngineUrl = process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010';
      const application = workflowState.application;

      const response = await fetch(`${blueprintEngineUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: blueprint.markdown,
          options: {
            outputFilename: `${application.fullName.replace(/\s+/g, '_')}_Blueprint.pdf`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Blueprint PDF generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result?.success || !result.pdfUrl) {
        throw new Error(result?.error || 'Blueprint PDF generation failed');
      }

      await db.blueprint.update({
        where: { id: blueprint.id },
        data: { pdfPath: result.pdfUrl },
      });

      return;
    }

    // Once PDF exists, create an email draft (only if one doesn't exist yet).
    blueprint = await db.blueprint.findUnique({ where: { applicationId } });
    if (blueprint?.status === 'COMPLETE' && blueprint.pdfPath) {
      const existingDraft = await db.emailDraft.findFirst({
        where: { workflowId },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!existingDraft) {
        await this.processEmailDraftPreparation(workflowId);
      }
    }
  }

  /**
   * Process snapshot generation step
   */
  private async processSnapshotGeneration(workflowId: string): Promise<void> {
    const workflowState = await db.workflowState.findUnique({
      where: { id: workflowId },
    });

    if (!workflowState) {
      throw new Error('Workflow state not found');
    }

    try {
      // Generate snapshot
      const result = await this.snapshotGenerator.generate(workflowState.applicationId);

      if (!result.success) {
        throw new Error(result.error || 'Snapshot generation failed');
      }

      // Convert to PDF
      if (result.markdown) {
        await this.snapshotGenerator.convertToPdf(result.markdown, workflowState.applicationId);
      }

      // Log completion
      await db.workflowAuditLog.create({
        data: {
          workflowId,
          action: 'PROCESS_SNAPSHOT_GENERATION',
          performedBy: 'SYSTEM',
          oldStatus: 'SNAPSHOT_QUEUED',
          newStatus: 'SNAPSHOT_COMPLETE',
          metadata: {
            tokensUsed: result.tokensUsed,
          },
        },
      });
    } catch (error) {
      console.error('Snapshot generation failed:', error);

      // Update workflow state to failed
      await db.workflowState.update({
        where: { id: workflowId },
        data: {
          status: 'SNAPSHOT_FAILED',
          generationError: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Process email draft preparation step
   */
  private async processEmailDraftPreparation(workflowId: string): Promise<void> {
    const workflowState = await db.workflowState.findUnique({
      where: { id: workflowId },
    });

    if (!workflowState) {
      throw new Error('Workflow state not found');
    }

    try {
      // Compose email draft
      const draftData = await this.emailComposer.compose(workflowId);

      // Save draft
      await this.emailComposer.saveDraft(workflowId, draftData);

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

      // Log completion
      await db.workflowAuditLog.create({
        data: {
          workflowId,
          action: 'PREPARE_EMAIL_DRAFT',
          performedBy: 'SYSTEM',
          oldStatus: 'SNAPSHOT_COMPLETE',
          newStatus: 'EMAIL_REVIEW_PENDING',
          metadata: {
            subject: draftData.subject,
          },
        },
      });
    } catch (error) {
      console.error('Email draft preparation failed:', error);
      throw error;
    }
  }

  /**
   * Schedule follow-up after email sent
   */
  private async scheduleFollowUp(workflowId: string): Promise<void> {
    const workflowState = await db.workflowState.findUnique({
      where: { id: workflowId },
    });

    if (!workflowState) {
      throw new Error('Workflow state not found');
    }

    // Calculate follow-up date (7 days from now)
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 7);

    await db.workflowState.update({
      where: { id: workflowId },
      data: {
        nextFollowUpAt: followUpDate,
      },
    });

    // Log scheduling
    await db.workflowAuditLog.create({
      data: {
        workflowId,
        action: 'SCHEDULE_FOLLOW_UP',
        performedBy: 'SYSTEM',
        newStatus: 'AWAITING_RESPONSE',
        metadata: {
          followUpDate: followUpDate.toISOString(),
        },
      },
    });
  }

  /**
   * Process all queued workflows
   */
  async processQueuedWorkflows(): Promise<{
    processed: number;
    failed: number;
    errors: Array<{ workflowId: string; error: string }>;
  }> {
    const queuedWorkflows = await db.workflowState.findMany({
      where: {
        status: {
          in: ['SNAPSHOT_QUEUED', 'SNAPSHOT_COMPLETE'],
        },
      },
    });

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as Array<{ workflowId: string; error: string }>,
    };

    for (const workflow of queuedWorkflows) {
      try {
        await this.processWorkflow(workflow.id);
        results.processed++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          workflowId: workflow.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get workflows ready for follow-up
   */
  async getDueFollowUps(): Promise<WorkflowState[]> {
    const now = new Date();

    return db.workflowState.findMany({
      where: {
        status: 'AWAITING_RESPONSE',
        nextFollowUpAt: {
          lte: now,
        },
      },
      include: {
        application: true,
      },
    });
  }

  /**
   * Manually trigger workflow transition
   */
  async transition(
    workflowId: string,
    newStatus: WorkflowStatus,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<WorkflowState> {
    const workflowState = await db.workflowState.findUnique({
      where: { id: workflowId },
    });

    if (!workflowState) {
      throw new Error('Workflow state not found');
    }

    const oldStatus = workflowState.status;

    // Update workflow state
    const updated = await db.workflowState.update({
      where: { id: workflowId },
      data: {
        status: newStatus,
        statusHistory: {
          push: {
            from: oldStatus,
            to: newStatus,
            at: new Date().toISOString(),
            by: userId || 'SYSTEM',
            ...metadata,
          },
        },
      },
    });

    // Log the transition
    await db.workflowAuditLog.create({
      data: {
        workflowId,
        action: 'MANUAL_TRANSITION',
        performedBy: userId || 'SYSTEM',
        oldStatus,
        newStatus,
        metadata,
      },
    });

    return updated;
  }

  /**
   * Get workflow statistics
   */
  async getStats(): Promise<Record<string, number>> {
    const stats = await db.workflowState.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return stats.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);
  }
}
