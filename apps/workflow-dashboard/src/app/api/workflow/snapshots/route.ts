import { NextRequest, NextResponse } from 'next/server';
import { SnapshotGenerator } from '@/lib/services/SnapshotGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required', success: false },
        { status: 400 }
      );
    }

    const generator = new SnapshotGenerator({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
      snapshotEngineUrl: process.env.SNAPSHOT_ENGINE_URL || process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010',
    });

    let result;

    if (action === 'generate') {
      result = await generator.generate(applicationId);
    } else if (action === 'regenerate') {
      result = await generator.regenerate(applicationId);
    } else if (action === 'convert-pdf') {
      const markdown = body.markdown;
      if (!markdown) {
        return NextResponse.json(
          { error: 'Markdown is required for PDF conversion', success: false },
          { status: 400 }
        );
      }
      const pdfUrl = await generator.convertToPdf(markdown, applicationId);
      result = { success: true, pdfUrl };
    } else {
      return NextResponse.json(
        { error: 'Invalid action', success: false },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in snapshots API:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status');

    const generator = new SnapshotGenerator({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
      snapshotEngineUrl: process.env.SNAPSHOT_ENGINE_URL || process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010',
    });

    // If applicationId is provided, fetch a single snapshot
    if (applicationId) {
      const markdown = await generator.getSnapshot(applicationId);

      if (!markdown) {
        return NextResponse.json(
          { error: 'Snapshot not found', success: false },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { markdown },
      });
    }

    // Otherwise, list all snapshots (optionally filtered by status)
    const snapshots = await generator.listSnapshots(status || undefined);

    return NextResponse.json({
      success: true,
      data: snapshots,
    });
  } catch (error) {
    console.error('Error in snapshots API:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
