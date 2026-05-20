import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all applications that have a workflow state (approved or in progress)
    const applications = await db.application.findMany({
      where: {
        workflowState: {
          isNot: null,
        },
      },
      include: {
        workflowState: true,
        blueprints: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    const items = applications.map((app) => ({
      id: app.id,
      application: app,
      workflowState: app.workflowState,
    }));

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching workflow items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow items', success: false },
      { status: 500 }
    );
  }
}
