import { db } from '@/lib/db/prisma';
import { BlueprintGenerator } from './BlueprintGenerator';
import { BlueprintEmailComposer } from './BlueprintEmailComposer';
import type { BlueprintStage, BlueprintResearchStatus, Application } from '@prisma/client';

export interface BlueprintOrchestratorOptions {
  apiUrl?: string; // Local proxy URL
  tavilyApiKey?: string;
}

export interface BlueprintGenerationResult {
  success: boolean;
  blueprintId?: string;
  error?: string;
  message?: string;
  progress?: number;
  currentBatch?: number;
  status?: BlueprintResearchStatus;
}

/**
 * Orchestrates the multi-stage Blueprint generation process
 *
 * The Blueprint is a 15-25 page McKinsey/BCG-caliber business plan
 * generated through 5 parallel batches of research stages.
 */
export class BlueprintOrchestrator {
  private generator: BlueprintGenerator;
  private tavilyApiKey?: string;
  private maxStageAttempts: number;

  constructor(options: BlueprintOrchestratorOptions = {}) {
    this.generator = new BlueprintGenerator({
      apiUrl: options.apiUrl,
      tavilyApiKey: options.tavilyApiKey,
    });
    this.tavilyApiKey = options.tavilyApiKey;
    this.maxStageAttempts = Number(process.env.BLUEPRINT_STAGE_MAX_ATTEMPTS || 2);
  }

  private isSynthesisStage(stage: BlueprintStage): boolean {
    return stage === 'EXECUTIVE_SUMMARY' || stage === 'COMPILATION';
  }

  /**
   * Initialize a Blueprint for an application
   */
  async initialize(applicationId: string): Promise<BlueprintGenerationResult> {
    try {
      // Check if application exists
      const application = await db.application.findUnique({
        where: { id: applicationId },
        include: { workflowState: true },
      });

      if (!application) {
        return { success: false, error: 'Application not found' };
      }

      // Check if blueprint already exists
      const existing = await db.blueprint.findUnique({
        where: { applicationId },
      });

      if (existing) {
        return { success: false, error: 'Blueprint already exists for this application' };
      }

      // Check if snapshot is complete
      if (!application.workflowState?.snapshotMarkdown) {
        return { success: false, error: 'Snapshot must be completed before generating Blueprint' };
      }

      // Create Blueprint record
      const blueprint = await db.blueprint.create({
        data: {
          applicationId,
          status: 'PENDING',
          currentBatch: 1,
          progress: 0,
          startedAt: new Date(),
        },
      });

      // Create all 12 BlueprintResearch records
      const stages: BlueprintStage[] = [
        // Batch 1
        'MARKET_SIZING',
        'COMPETITIVE_INTELLIGENCE',
        'INDUSTRY_TRENDS',
        // Batch 2
        'AUDIENCE_DEEP_DIVE',
        'BRAND_POSITIONING',
        // Batch 3
        'PRODUCT_ARCHITECTURE',
        'FINANCIAL_PROJECTIONS',
        // Batch 4
        'GO_TO_MARKET',
        'OPERATIONAL_FRAMEWORK',
        'IMPLEMENTATION_ROADMAP',
        // Batch 5
        'EXECUTIVE_SUMMARY',
        'COMPILATION',
      ];

      for (const stage of stages) {
        const batchNumber = this.getBatchNumber(stage);
        await db.blueprintResearch.create({
          data: {
            blueprintId: blueprint.id,
            stage,
            batch: batchNumber,
            status: 'PENDING',
          },
        });
      }

      // Update blueprint status
      await db.blueprint.update({
        where: { id: blueprint.id },
        data: { status: 'IN_PROGRESS' },
      });

      // Log the action
      await db.workflowAuditLog.create({
        data: {
          workflowId: application.workflowState.id,
          action: 'BLUEPRINT_INITIALIZED',
          performedBy: 'SYSTEM',
          metadata: {
            blueprintId: blueprint.id,
            applicationId,
          },
        },
      });

      return {
        success: true,
        blueprintId: blueprint.id,
        status: 'IN_PROGRESS',
      };
    } catch (error) {
      console.error('Failed to initialize Blueprint:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize Blueprint',
      };
    }
  }

  /**
   * Process the next batch of stages for a Blueprint
   */
  async processBatch(blueprintId: string): Promise<BlueprintGenerationResult> {
    try {
      const blueprint = await db.blueprint.findUnique({
        where: { id: blueprintId },
        include: {
          application: {
            include: { workflowState: true },
          },
          researchStages: true,
        },
      });

      if (!blueprint) {
        return { success: false, error: 'Blueprint not found' };
      }

      // If already complete but any stages failed, the blueprint is inconsistent.
      // Flag it for review so it can be retried instead of silently showing "Complete".
      if (blueprint.status === 'COMPLETE') {
        const hasFailedStages = blueprint.researchStages.some((s) => s.status === 'FAILED');
        if (!hasFailedStages) {
          return { success: true, blueprintId, progress: 100, currentBatch: 5, status: 'COMPLETE' };
        }

        await db.blueprint.update({
          where: { id: blueprintId },
          data: { status: 'REVIEW_REQUIRED', lastStageAt: new Date() },
        });

        return {
          success: true,
          blueprintId,
          progress: blueprint.progress,
          currentBatch: blueprint.currentBatch,
          status: 'REVIEW_REQUIRED',
          message: 'Blueprint completed with failed stages. Retry failed stages to generate real content.',
        };
      }

      const currentBatch = blueprint.currentBatch;

      // Batch 5 is synthesized in completeBlueprint(). Only proceed if Batches 1–4 are fully complete.
      if (currentBatch >= 5) {
        const nonSynthesisIncomplete = blueprint.researchStages.filter(
          (s) => !this.isSynthesisStage(s.stage) && s.status !== 'COMPLETE'
        );

        if (nonSynthesisIncomplete.length > 0) {
          await db.blueprint.update({
            where: { id: blueprintId },
            data: { status: 'REVIEW_REQUIRED', lastStageAt: new Date() },
          });

          return {
            success: true,
            blueprintId,
            progress: blueprint.progress,
            currentBatch,
            status: 'REVIEW_REQUIRED',
            message: 'Some stages failed. Fix errors and retry before generating the final blueprint.',
          };
        }

        await this.completeBlueprint(blueprintId);
        return { success: true, blueprintId, progress: 100, currentBatch: 5, status: 'COMPLETE' };
      }

      const batchStages = blueprint.researchStages.filter(
        (s) => s.batch === currentBatch && !this.isSynthesisStage(s.stage)
      );

      const inProgressStages = batchStages.filter((s) => s.status === 'IN_PROGRESS');
      if (inProgressStages.length > 0) {
        return {
          success: true,
          blueprintId,
          progress: blueprint.progress,
          currentBatch,
          status: blueprint.status,
          message: 'Stages are currently running.',
        };
      }

      const pendingStages = batchStages.filter((s) => s.status === 'PENDING');
      const failedStages = batchStages.filter((s) => s.status === 'FAILED');

      if (pendingStages.length === 0) {
        if (failedStages.length > 0) {
          const retryable = failedStages.filter((s) => (s.attempts || 0) < this.maxStageAttempts);
          if (retryable.length > 0) {
            // Reset retryable stages and try the batch again.
            await db.blueprintResearch.updateMany({
              where: { id: { in: retryable.map((s) => s.id) } },
              data: {
                status: 'PENDING',
                prompt: null,
                response: null,
                markdown: null,
                metadata: null,
                error: null,
                startedAt: null,
                completedAt: null,
              },
            });

            await db.blueprint.update({
              where: { id: blueprintId },
              data: { status: 'IN_PROGRESS', lastStageAt: new Date() },
            });

            return this.processBatch(blueprintId);
          }

          await db.blueprint.update({
            where: { id: blueprintId },
            data: { status: 'REVIEW_REQUIRED', lastStageAt: new Date() },
          });

          return {
            success: true,
            blueprintId,
            progress: blueprint.progress,
            currentBatch,
            status: 'REVIEW_REQUIRED',
            message: 'Some stages failed repeatedly. Review the errors and retry.',
          };
        }

        // Move to next batch
        const nextBatch = currentBatch + 1;
        await db.blueprint.update({
          where: { id: blueprintId },
          data: { currentBatch: nextBatch, lastStageAt: new Date() },
        });

        return this.processBatch(blueprintId);
      }

      // Process all pending stages in current batch in parallel
      const results = await Promise.allSettled(
        pendingStages.map((stage) =>
          this.processStage(blueprintId, stage.id, stage.stage, blueprint.application)
        )
      );

      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        console.error(`Failed to process ${failures.length} stages in batch ${currentBatch}`);
      }

      // Recompute progress from DB to avoid stale in-memory status.
      const stageStatuses = await db.blueprintResearch.findMany({
        where: { blueprintId },
        select: { status: true },
      });
      const completedCount = stageStatuses.filter((s) => s.status === 'COMPLETE').length;
      const progress = stageStatuses.length > 0 ? Math.round((completedCount / stageStatuses.length) * 100) : 0;

      await db.blueprint.update({
        where: { id: blueprintId },
        data: {
          progress,
          lastStageAt: new Date(),
        },
      });

      return {
        success: true,
        blueprintId,
        progress,
        currentBatch,
        status: 'IN_PROGRESS',
      };
    } catch (error) {
      console.error('Failed to process batch:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process batch',
      };
    }
  }

  /**
   * Process a single stage
   */
  private async processStage(
    blueprintId: string,
    researchId: string,
    stage: BlueprintStage,
    application: Application & { workflowState: any }
  ): Promise<void> {
    try {
      const now = new Date();
      // Update status to IN_PROGRESS
      await db.blueprintResearch.update({
        where: { id: researchId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: now,
          error: null,
          attempts: { increment: 1 },
        },
      });
      await db.blueprint.update({
        where: { id: blueprintId },
        data: { lastStageAt: now },
      });

      // Get previous research for context (if any)
      const previousResearch = await this.getPreviousResearch(blueprintId, stage);

      // Generate content for this stage
      const result = await this.generator.generateStage({
        stage,
        application,
        snapshotMarkdown: application.workflowState.snapshotMarkdown || '',
        previousResearch,
      });

      if (!result.success) {
        throw new Error(result.error || 'Stage generation failed');
      }

      // Double-check that markdown is not empty before saving
      if (!result.markdown || result.markdown.trim().length < 50) {
        throw new Error(`Generated markdown is too short or empty (${result.markdown?.length || 0} chars). Stage: ${stage}`);
      }

      // Save results
      await db.blueprintResearch.update({
        where: { id: researchId },
        data: {
          status: 'COMPLETE',
          prompt: result.prompt,
          response: result.response,
          markdown: result.markdown,
          metadata: result.metadata,
          completedAt: new Date(),
        },
      });
      await db.blueprint.update({
        where: { id: blueprintId },
        data: {
          lastStageAt: new Date(),
          ...(typeof result.tokensUsed === 'number'
            ? { totalTokensUsed: { increment: result.tokensUsed } }
            : {}),
        },
      });

      // Sources are no longer saved to avoid fake citations
      // Real data integration with web search API would be needed for verified sources
    } catch (error) {
      // Update status to FAILED with detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      await db.blueprintResearch.update({
        where: { id: researchId },
        data: {
          status: 'FAILED',
          error: `${errorMessage}\n\n${errorStack || 'No stack trace'}`,
          completedAt: new Date(),
        },
      });
      await db.blueprint.update({
        where: { id: blueprintId },
        data: { lastStageAt: new Date() },
      });

      throw error;
    }
  }

  /**
   * Complete the Blueprint by generating Executive Summary and compiling
   */
  private async completeBlueprint(blueprintId: string): Promise<void> {
    const blueprint = await db.blueprint.findUnique({
      where: { id: blueprintId },
      include: {
        application: {
          include: { workflowState: true },
        },
      },
    });

    if (!blueprint) return;

    // Safety gate: never compile if any non-synthesis stage is incomplete/failed.
    const nonSynthesisStages = await db.blueprintResearch.findMany({
      where: {
        blueprintId,
        stage: { notIn: ['EXECUTIVE_SUMMARY', 'COMPILATION'] },
      },
      select: { stage: true, status: true },
    });
    const nonSynthesisIncomplete = nonSynthesisStages.filter((s) => s.status !== 'COMPLETE');
    if (nonSynthesisIncomplete.length > 0) {
      await db.blueprint.update({
        where: { id: blueprintId },
        data: {
          status: 'REVIEW_REQUIRED',
          lastStageAt: new Date(),
        },
      });
      return;
    }

    // Fetch completed research stages (Batches 1-4)
    const completedResearch = await db.blueprintResearch.findMany({
      where: {
        blueprintId,
        status: 'COMPLETE',
        stage: { notIn: ['EXECUTIVE_SUMMARY', 'COMPILATION'] },
      },
      orderBy: [{ batch: 'asc' }, { stage: 'asc' }],
    });

    // Generate Executive Summary (written last, synthesizing Batches 1-4)
    const executiveSummaryResult = await this.generator.generateExecutiveSummary({
      application: blueprint.application,
      researchStages: completedResearch.map((s) => ({
        stage: s.stage,
        markdown: s.markdown || '',
      })),
    });

    // Persist Executive Summary stage
    await db.blueprintResearch.updateMany({
      where: { blueprintId, stage: 'EXECUTIVE_SUMMARY' },
      data: {
        status: executiveSummaryResult.success ? 'COMPLETE' : 'FAILED',
        markdown: executiveSummaryResult.markdown || null,
        response: executiveSummaryResult.response || null,
        error: executiveSummaryResult.success ? null : (executiveSummaryResult.error || 'Executive Summary failed'),
        completedAt: executiveSummaryResult.success ? new Date() : null,
      },
    });

    if (!executiveSummaryResult.success) {
      // Keep the blueprint editable/retryable instead of marking it complete with empty output.
      const fallback = await this.compileBlueprint(blueprintId).catch(() => null);
      await db.blueprint.update({
        where: { id: blueprintId },
        data: {
          status: 'REVIEW_REQUIRED',
          progress: Math.min(99, blueprint.progress || 0),
          markdown: fallback,
          lastStageAt: new Date(),
        },
      });
      return;
    }

    // Generate final conversion-optimized compilation
    let compiledMarkdown: string | null = null;
    try {
      const compilationInputs = [
        ...completedResearch.map((s) => ({ stage: s.stage, markdown: s.markdown || '' })),
        ...(executiveSummaryResult.markdown
          ? [{ stage: 'EXECUTIVE_SUMMARY' as any, markdown: executiveSummaryResult.markdown }]
          : []),
      ];

      const compilationResult = await this.generator.generateStage({
        stage: 'COMPILATION',
        application: blueprint.application,
        snapshotMarkdown: blueprint.application.workflowState?.snapshotMarkdown || '',
        previousResearch: compilationInputs as any,
      });

      if (!compilationResult.success || !compilationResult.markdown) {
        throw new Error(compilationResult.error || 'Compilation failed');
      }

      compiledMarkdown = compilationResult.markdown;

      await db.blueprintResearch.updateMany({
        where: { blueprintId, stage: 'COMPILATION' },
        data: {
          status: 'COMPLETE',
          prompt: compilationResult.prompt || null,
          response: compilationResult.response || null,
          markdown: compilationResult.markdown,
          metadata: compilationResult.metadata || null,
          completedAt: new Date(),
          error: null,
        },
      });
    } catch (error) {
      console.error('Compilation stage failed, falling back to deterministic compiler:', error);
      compiledMarkdown = await this.compileBlueprint(blueprintId);

      await db.blueprintResearch.updateMany({
        where: { blueprintId, stage: 'COMPILATION' },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Compilation failed',
        },
      });
    }

    // Update Blueprint as complete
    await db.blueprint.update({
      where: { id: blueprintId },
      data: {
        status: 'COMPLETE',
        progress: 100,
        markdown: compiledMarkdown,
        completedAt: new Date(),
        currentBatch: 5,
      },
    });

    // Log completion (best effort)
    if (blueprint.application.workflowState?.id) {
      await db.workflowAuditLog.create({
        data: {
          workflowId: blueprint.application.workflowState.id,
          action: 'BLUEPRINT_COMPLETED',
          performedBy: 'SYSTEM',
          metadata: {
            blueprintId,
          },
        },
      });
    }

    // Auto-generate approval email draft (best effort, non-blocking)
    this.generateApprovalEmail(blueprintId).catch((error) => {
      console.error('Failed to auto-generate approval email:', error);
    });
  }

  /**
   * Generate approval email draft for completed blueprint
   * This is a non-blocking operation that runs in the background
   */
  private async generateApprovalEmail(blueprintId: string): Promise<void> {
    try {
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
        console.log(`Approval email already exists for blueprint ${blueprintId}`);
        return;
      }

      // Generate the draft
      const draftData = await composer.generateApprovalDraft(blueprintId);

      if (!draftData.workflowId) {
        console.error('No workflow ID found for blueprint:', blueprintId);
        return;
      }

      // Save to database
      await composer.saveDraft(draftData.workflowId, blueprintId, draftData);

      // Log the email generation
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

      if (blueprint?.application.workflowState?.id) {
        await db.workflowAuditLog.create({
          data: {
            workflowId: blueprint.application.workflowState.id,
            action: 'APPROVAL_EMAIL_GENERATED',
            performedBy: 'SYSTEM',
            metadata: {
              blueprintId,
              subject: draftData.subject,
            },
          },
        });
      }

      console.log(`Approval email generated for blueprint ${blueprintId}`);
    } catch (error) {
      console.error('Failed to generate approval email:', error);
      throw error;
    }
  }

  /**
   * Compile all sections into final Blueprint markdown
   */
  private async compileBlueprint(blueprintId: string): Promise<string> {
    const researchStages = await db.blueprintResearch.findMany({
      where: {
        blueprintId,
        status: 'COMPLETE',
      },
      orderBy: { stage: 'asc' },
    });

    const blueprint = await db.blueprint.findUnique({
      where: { id: blueprintId },
      include: { application: true },
    });

    if (!blueprint) throw new Error('Blueprint not found');

    const { fullName } = blueprint.application;

    const stageMarkdown = new Map<BlueprintStage, string>();
    for (const stage of researchStages) {
      if (stage.markdown) stageMarkdown.set(stage.stage, stage.markdown);
    }

    // Deterministic fallback compilation (no anchor links; minimal, PDF-friendly structure)
    let markdown = `# ${fullName}\n*Strategic Business Plan & Brand Vision*\nWavelaunch Studio | McKinsey-Caliber Analysis\n\n---\n\n`;

    markdown += `## 1. Executive Summary\n\n${stageMarkdown.get('EXECUTIVE_SUMMARY') || 'RESEARCH NEEDED: Executive Summary was not generated.'}\n\n`;
    markdown += `<div class="page-break"></div>\n\n`;

    markdown += `## 2. Contents\n\n`;
    markdown += `1. Executive Summary\n`;
    markdown += `2. Contents\n`;
    markdown += `3. Creator Brand Assessment\n`;
    markdown += `4. Market & Competitive Analysis\n`;
    markdown += `5. Product & Revenue Strategy\n`;
    markdown += `6. Go-to-Market Strategy\n`;
    markdown += `7. Operational Framework\n`;
    markdown += `8. Implementation Roadmap\n`;
    markdown += `\n---\n\n`;

    markdown += `## 3. Creator Brand Assessment\n\n`;
    markdown += [stageMarkdown.get('AUDIENCE_DEEP_DIVE'), stageMarkdown.get('BRAND_POSITIONING')]
      .filter(Boolean)
      .join('\n\n---\n\n');
    markdown += `\n\n---\n\n`;

    markdown += `## 4. Market & Competitive Analysis\n\n`;
    markdown += [
      stageMarkdown.get('MARKET_SIZING'),
      stageMarkdown.get('COMPETITIVE_INTELLIGENCE'),
      stageMarkdown.get('INDUSTRY_TRENDS'),
    ]
      .filter(Boolean)
      .join('\n\n---\n\n');
    markdown += `\n\n---\n\n`;

    markdown += `## 5. Product & Revenue Strategy\n\n`;
    markdown += [stageMarkdown.get('PRODUCT_ARCHITECTURE'), stageMarkdown.get('FINANCIAL_PROJECTIONS')]
      .filter(Boolean)
      .join('\n\n---\n\n');
    markdown += `\n\n---\n\n`;

    markdown += `## 6. Go-to-Market Strategy\n\n${stageMarkdown.get('GO_TO_MARKET') || ''}\n\n---\n\n`;

    markdown += `## 7. Operational Framework\n\n${stageMarkdown.get('OPERATIONAL_FRAMEWORK') || ''}\n\n---\n\n`;

    markdown += `## 8. Implementation Roadmap\n\n${stageMarkdown.get('IMPLEMENTATION_ROADMAP') || ''}\n\n---\n\n`;

    markdown += `Prepared by Wavelaunch Studio | ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n`;
    markdown += `Confidential — For the exclusive use of ${fullName}\n`;

    return markdown;
  }

  /**
   * Get previous research stages for context
   */
  private async getPreviousResearch(
    blueprintId: string,
    currentStage: BlueprintStage
  ): Promise<Array<{ stage: BlueprintStage; markdown: string }>> {
    const currentBatch = this.getBatchNumber(currentStage);

    const previousStages = await db.blueprintResearch.findMany({
      where: {
        blueprintId,
        status: 'COMPLETE',
        batch: { lt: currentBatch },
      },
      orderBy: { stage: 'asc' },
    });

    return previousStages.map((s) => ({
      stage: s.stage,
      markdown: s.markdown || '',
    }));
  }

  /**
   * Get the batch number for a stage
   */
  private getBatchNumber(stage: BlueprintStage): number {
    if (['MARKET_SIZING', 'COMPETITIVE_INTELLIGENCE', 'INDUSTRY_TRENDS'].includes(stage)) {
      return 1;
    }
    if (['AUDIENCE_DEEP_DIVE', 'BRAND_POSITIONING'].includes(stage)) {
      return 2;
    }
    if (['PRODUCT_ARCHITECTURE', 'FINANCIAL_PROJECTIONS'].includes(stage)) {
      return 3;
    }
    if (['GO_TO_MARKET', 'OPERATIONAL_FRAMEWORK', 'IMPLEMENTATION_ROADMAP'].includes(stage)) {
      return 4;
    }
    return 5; // Executive Summary and Compilation
  }

  /**
   * Get Blueprint status
   */
  async getStatus(blueprintId: string) {
    const blueprint = await db.blueprint.findUnique({
      where: { id: blueprintId },
      include: {
        researchStages: {
          orderBy: { stage: 'asc' },
        },
      },
    });

    if (!blueprint) return null;

    return {
      id: blueprint.id,
      status: blueprint.status,
      progress: blueprint.progress,
      currentBatch: blueprint.currentBatch,
      startedAt: blueprint.startedAt,
      completedAt: blueprint.completedAt,
      totalTokensUsed: blueprint.totalTokensUsed,
      stages: blueprint.researchStages.map((s) => ({
        stage: s.stage,
        status: s.status,
        batch: s.batch,
        completedAt: s.completedAt,
      })),
    };
  }

  /**
   * Regenerate a specific stage
   */
  async regenerateStage(blueprintId: string, stage: BlueprintStage): Promise<BlueprintGenerationResult> {
    try {
      const blueprint = await db.blueprint.findUnique({
        where: { id: blueprintId },
        include: {
          application: {
            include: { workflowState: true },
          },
        },
      });

      if (!blueprint) {
        return { success: false, error: 'Blueprint not found' };
      }

      // Find the research stage
      const researchStage = await db.blueprintResearch.findFirst({
        where: {
          blueprintId,
          stage,
        },
      });

      if (!researchStage) {
        return { success: false, error: 'Stage not found' };
      }

      // Reset and process
      await db.blueprintResearch.update({
        where: { id: researchStage.id },
        data: {
          status: 'PENDING',
          response: null,
          markdown: null,
          error: null,
          attempts: { increment: 1 },
        },
      });

      await this.processStage(
        blueprintId,
        researchStage.id,
        stage,
        blueprint.application
      );

      return { success: true, blueprintId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to regenerate stage',
      };
    }
  }
}
