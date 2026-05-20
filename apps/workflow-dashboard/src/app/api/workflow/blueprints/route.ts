import { NextRequest, NextResponse } from 'next/server';
import { BlueprintOrchestrator } from '@/lib/services/BlueprintOrchestrator';
import { db } from '@/lib/db/prisma';

/**
 * GET /api/workflow/blueprints
 * List all blueprints or get a specific one
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blueprintId = searchParams.get('blueprintId');
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status');

    // Get specific blueprint
    if (blueprintId) {
      const blueprint = await db.blueprint.findUnique({
        where: { id: blueprintId },
        include: {
          application: true,
          researchStages: {
            orderBy: { stage: 'asc' },
          },
        },
      });

      if (!blueprint) {
        return NextResponse.json({ success: false, error: 'Blueprint not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: blueprint });
    }

    // Get blueprints by application
    if (applicationId) {
      const blueprint = await db.blueprint.findUnique({
        where: { applicationId },
        include: {
          researchStages: {
            orderBy: { stage: 'asc' },
          },
        },
      });

      return NextResponse.json({ success: true, data: blueprint });
    }

    // List all blueprints with optional status filter
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const blueprints = await db.blueprint.findMany({
      where,
      include: {
        application: true,
        researchStages: {
          orderBy: { stage: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: blueprints });
  } catch (error) {
    console.error('Failed to fetch blueprints:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch blueprints' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflow/blueprints
 * Create a new blueprint or trigger batch processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, applicationId, blueprintId } = body;

    const orchestrator = new BlueprintOrchestrator({
      apiUrl: process.env.AI_PROXY_URL || 'http://localhost:3003',
      tavilyApiKey: process.env.TAVILY_API_KEY,
    });

    if (action === 'initialize') {
      // Initialize a new blueprint for an application
      const result = await orchestrator.initialize(applicationId);

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: { blueprintId: result.blueprintId },
        });
      }

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    if (action === 'process-batch') {
      // Process the next batch of stages
      if (!blueprintId) {
        return NextResponse.json(
          { success: false, error: 'blueprintId is required' },
          { status: 400 }
        );
      }

      const result = await orchestrator.processBatch(blueprintId);

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            blueprintId: result.blueprintId,
            progress: result.progress,
            currentBatch: result.currentBatch,
          },
        });
      }

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    if (action === 'regenerate-stage') {
      // Regenerate a specific stage
      const { stage } = body;

      if (!blueprintId || !stage) {
        return NextResponse.json(
          { success: false, error: 'blueprintId and stage are required' },
          { status: 400 }
        );
      }

      const result = await orchestrator.regenerateStage(blueprintId, stage);

      if (result.success) {
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    if (action === 'update-stage') {
      // Update a specific stage's markdown
      const { stageId, markdown } = body;

      if (!stageId || markdown === undefined) {
        return NextResponse.json(
          { success: false, error: 'stageId and markdown are required' },
          { status: 400 }
        );
      }

      const updatedStage = await db.blueprintResearch.update({
        where: { id: stageId },
        data: { markdown },
      });

      return NextResponse.json({ success: true, data: updatedStage });
    }

    if (action === 'download-pdf') {
      // Download or generate PDF for a blueprint
      if (!blueprintId) {
        return NextResponse.json(
          { success: false, error: 'blueprintId is required' },
          { status: 400 }
        );
      }

      const blueprint = await db.blueprint.findUnique({
        where: { id: blueprintId },
        include: { application: true },
      });

      if (!blueprint) {
        return NextResponse.json(
          { success: false, error: 'Blueprint not found' },
          { status: 404 }
        );
      }

      // If PDF exists, return the download URL
      if (blueprint.pdfPath) {
        const blueprintEngineUrl = process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010';
        return NextResponse.json({
          success: true,
          pdfUrl: `${blueprintEngineUrl}${blueprint.pdfPath}`,
          filename: `${blueprint.application.fullName.replace(/\s+/g, '_')}_Blueprint.pdf`,
        });
      }

      // Generate PDF from markdown
      if (blueprint.markdown) {
        try {
          const blueprintEngineUrl = process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010';
          const response = await fetch(`${blueprintEngineUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              markdown: blueprint.markdown,
              options: {
                outputFilename: `${blueprint.application.fullName.replace(/\s+/g, '_')}_Blueprint.pdf`,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`PDF conversion failed: ${response.statusText}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'PDF generation failed');
          }

          // Update blueprint with PDF path
          await db.blueprint.update({
            where: { id: blueprintId },
            data: { pdfPath: result.pdfUrl },
          });

          // Return the download URL
          return NextResponse.json({
            success: true,
            pdfUrl: `${blueprintEngineUrl}${result.pdfUrl}`,
            filename: result.filename,
          });
        } catch (error) {
          console.error('PDF generation error:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to generate PDF. Make sure blueprint-engine is running on port 3001.' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(
        { success: false, error: 'No markdown content to convert' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to process blueprint request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
