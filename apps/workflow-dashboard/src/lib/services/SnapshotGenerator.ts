import { db } from '@/lib/db/prisma';
import type { Application, WorkflowState } from '@prisma/client';

export interface SnapshotGenerationOptions {
  anthropicApiKey?: string;
  snapshotEngineUrl: string;
}

export interface SnapshotResult {
  success: boolean;
  markdown?: string;
  pdfUrl?: string;
  error?: string;
  tokensUsed?: number;
}

export class SnapshotGenerator {
  private snapshotEngineUrl: string;

  constructor(options: SnapshotGenerationOptions) {
    this.snapshotEngineUrl = options.snapshotEngineUrl;
  }

  /**
   * Generate snapshot (deterministic Vision Echo)
   */
  async generate(applicationId: string): Promise<SnapshotResult> {
    try {
      // Fetch application with workflow state
      const application = await db.application.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        return { success: false, error: 'Application not found' };
      }

      // Update workflow state to GENERATING
      const workflowState = await db.workflowState.findUnique({
        where: { applicationId },
      });

      if (!workflowState) {
        return { success: false, error: 'Workflow state not found' };
      }

      await db.workflowState.update({
        where: { id: workflowState.id },
        data: {
          status: 'SNAPSHOT_GENERATING',
          generationStartedAt: new Date(),
          statusHistory: [
            ...(workflowState.statusHistory as any[]),
            {
              from: workflowState.status,
              to: 'SNAPSHOT_GENERATING',
              at: new Date().toISOString(),
              by: 'SYSTEM',
            },
          ],
        },
      });

      // Deterministic "Vision Echo" (low risk: no new facts, no hallucinations)
      const markdown = this.generateVisionEcho(application);
      const tokensUsed = 0;

      // Store the markdown
      await db.workflowState.update({
        where: { id: workflowState.id },
        data: {
          snapshotMarkdown: markdown,
          generationCompletedAt: new Date(),
          status: 'SNAPSHOT_COMPLETE',
          statusHistory: [
            ...(workflowState.statusHistory as any[]),
            {
              from: 'SNAPSHOT_GENERATING',
              to: 'SNAPSHOT_COMPLETE',
              at: new Date().toISOString(),
              by: 'SYSTEM',
              tokensUsed,
            },
          ],
        },
      });

      // Log the generation
      await db.workflowAuditLog.create({
        data: {
          workflowId: workflowState.id,
          action: 'GENERATE_SNAPSHOT',
          performedBy: 'SYSTEM',
          oldStatus: 'SNAPSHOT_QUEUED',
          newStatus: 'SNAPSHOT_COMPLETE',
          metadata: {
            applicationId,
            tokensUsed,
            model: 'mock-generator',
          },
        },
      });

      return {
        success: true,
        markdown,
        tokensUsed,
      };
    } catch (error) {
      console.error('Snapshot generation error:', error);

      // Update workflow state to FAILED
      const workflowState = await db.workflowState.findUnique({
        where: { applicationId },
      });

      if (workflowState) {
        await db.workflowState.update({
          where: { id: workflowState.id },
          data: {
            status: 'SNAPSHOT_FAILED',
            generationError: error instanceof Error ? error.message : 'Unknown error',
            statusHistory: [
              ...(workflowState.statusHistory as any[]),
              {
                from: workflowState.status,
                to: 'SNAPSHOT_FAILED',
                at: new Date().toISOString(),
                by: 'SYSTEM',
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            ],
          },
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate snapshot',
      };
    }
  }

  /**
   * Generate a deterministic "Vision Echo" snapshot.
   * - No new facts
   * - No market claims
   * - Purely an organized reflection of the Vision Form
   */
  private generateVisionEcho(application: Application): string {
    const lines: string[] = [];
    const add = (value: string) => lines.push(value);

    const safe = (value: string | null | undefined, fallback = 'Not specified') =>
      (value ?? '').trim() ? String(value).trim() : fallback;

    add(`# Vision Echo (Snapshot)`);
    add(``);
    add(`This snapshot is an organized reflection of the Vision Form submission. It intentionally introduces no new facts, market claims, or outside research.`);
    add(``);

    add(`## Identity & Context`);
    add(`- **Name**: ${safe(application.fullName)}`);
    add(`- **Email**: ${safe(application.email)}`);
    add(`- **Country**: ${safe(application.country)}`);
    add(`- **Industry/Niche**: ${safe(application.industryNiche)}`);
    add(`- **Age**: ${application.age}`);
    add(`- **Current Channels**: ${safe(application.currentChannels)}`);
    add(`- **Instagram**: ${safe(application.instagramHandle, 'N/A')}`);
    add(`- **TikTok**: ${safe(application.tiktokHandle, 'N/A')}`);
    add(``);

    add(`## Creator Story & Vision (In Your Words)`);
    add(`- **Professional Milestones**: ${safe(application.professionalMilestones)}`);
    add(`- **Personal Turning Points**: ${safe(application.personalTurningPoints)}`);
    add(`- **Vision for Venture**: ${safe(application.visionForVenture)}`);
    add(`- **Hope to Achieve**: ${safe(application.hopeToAchieve)}`);
    add(`- **Long-term Vision**: ${safe(application.longTermVision)}`);
    add(`- **Specific Deadlines**: ${safe(application.specificDeadlines, 'None stated')}`);
    add(``);

    add(`## Audience (Who We Serve)`);
    add(`- **Target Audience**: ${safe(application.targetAudience)}`);
    add(`- **Demographic Profile**: ${safe(application.demographicProfile)}`);
    add(`- **Target Demographic Age**: ${safe(application.targetDemographicAge)}`);
    add(`- **Audience Gender Split**: ${safe(application.audienceGenderSplit)}`);
    add(`- **Audience Marital Status**: ${safe(application.audienceMaritalStatus, 'Not specified')}`);
    add(`- **Key Pain Points**: ${safe(application.keyPainPoints)}`);
    add(``);

    add(`## Brand & Differentiation`);
    add(`- **Brand Values**: ${safe(application.brandValues)}`);
    add(`- **Differentiation**: ${safe(application.differentiation)}`);
    add(`- **Unique Value Props**: ${safe(application.uniqueValueProps)}`);
    add(`- **Ideal Brand Image**: ${safe(application.idealBrandImage)}`);
    add(`- **Brand Personality**: ${safe(application.brandPersonality)}`);
    add(`- **Branding Aesthetics**: ${safe(application.brandingAesthetics)}`);
    add(`- **Emotions Brand Evokes**: ${safe(application.emotionsBrandEvokes, 'Not specified')}`);
    add(`- **Preferred Font**: ${safe(application.preferredFont, 'Not specified')}`);
    add(`- **Inspiration Brands**: ${safe(application.inspirationBrands, 'Not specified')}`);
    add(`- **Emerging Competitors**: ${safe(application.emergingCompetitors, 'Not specified')}`);
    add(``);

    add(`## Product Direction`);
    add(`- **Product Categories**: ${safe(application.productCategories)}`);
    add(`- **Other Product Ideas**: ${safe(application.otherProductIdeas, 'None stated')}`);
    add(``);

    add(`## Growth Goals`);
    add(`- **Scaling Goals**: ${safe(application.scalingGoals)}`);
    add(`- **Growth Strategies**: ${safe(application.growthStrategies, 'Not specified')}`);
    add(``);

    add(`## Research Needed (During Onboarding)`);
    add(`- Validate market sizing, pricing benchmarks, and competitor details with verified sources.`);
    add(`- Clarify offer format, constraints (time, budget, capacity), and success metrics for the first 90 days.`);
    add(``);

    add(`*Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.*`);

    return lines.join('\n');
  }

  /**
   * Convert markdown to PDF using snapshot-engine
   */
  async convertToPdf(markdown: string, applicationId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.snapshotEngineUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown,
          options: {
            outputFilename: `snapshot-${applicationId}.pdf`,
            includeCover: false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Snapshot engine error: ${response.statusText}`);
      }

      const result = await response.json();

      // Update workflow state with PDF path
      const workflowState = await db.workflowState.findUnique({
        where: { applicationId },
      });

      if (workflowState && result.pdfUrl) {
        await db.workflowState.update({
          where: { id: workflowState.id },
          data: {
            snapshotPdfPath: result.pdfUrl,
          },
        });
      }

      return result.pdfUrl || null;
    } catch (error) {
      console.error('PDF conversion error:', error);
      return null;
    }
  }

  /**
   * Regenerate snapshot for an application
   */
  async regenerate(applicationId: string): Promise<SnapshotResult> {
    // Reset workflow state to allow regeneration
    const workflowState = await db.workflowState.findUnique({
      where: { applicationId },
    });

    if (!workflowState) {
      return { success: false, error: 'Workflow state not found' };
    }

    await db.workflowState.update({
      where: { id: workflowState.id },
      data: {
        status: 'SNAPSHOT_QUEUED',
        snapshotMarkdown: null,
        snapshotPdfPath: null,
        generationStartedAt: null,
        generationCompletedAt: null,
        generationError: null,
      },
    });

    // Generate again
    return this.generate(applicationId);
  }

  /**
   * Get snapshot markdown for preview
   */
  async getSnapshot(applicationId: string): Promise<string | null> {
    const workflowState = await db.workflowState.findUnique({
      where: { applicationId },
    });

    return workflowState?.snapshotMarkdown || null;
  }

  /**
   * List all snapshots, optionally filtered by status
   */
  async listSnapshots(status?: string): Promise<Array<{ id: string; application: Application; workflowState: WorkflowState | null }>> {
    const where: any = {
      workflowState: {
        isNot: null,
      },
    };

    if (status) {
      where.workflowState = {
        status,
      };
    } else {
      // If no status filter, show all snapshots that have markdown
      where.workflowState = {
        snapshotMarkdown: {
          not: null,
        },
      };
    }

    const applications = await db.application.findMany({
      where,
      include: {
        workflowState: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return applications.map((app) => ({
      id: app.id,
      application: app,
      workflowState: app.workflowState,
    }));
  }
}
