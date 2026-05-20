import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { VisionFormTracker } from '@/lib/services/replies/VisionFormTracker';
import type { ConversationStage } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { stage } = body || {};

    if (!stage) {
      return NextResponse.json(
        { success: false, error: 'stage is required' },
        { status: 400 }
      );
    }

    // Validate stage
    const validStages: ConversationStage[] = [
      'INITIAL_CONTACT',
      'VISION_FORM_SENT',
      'VISION_FORM_COMPLETE',
      'ROADMAP_DELIVERED',
      'VC_SUBMITTED',
      'VC_APPROVED',
      'ONBOARDING_STARTED',
      'ONBOARDING_COMPLETE',
    ];

    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { success: false, error: 'Invalid stage' },
        { status: 400 }
      );
    }

    // Get current conversation to check if transition is valid
    const currentConversation = await db.instantlyConversation.findUnique({
      where: { id: params.id },
      select: { conversationStage: true },
    });

    if (!currentConversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Validate transition
    if (!VisionFormTracker.isValidTransition(currentConversation.conversationStage, stage)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid stage transition',
          currentStage: currentConversation.conversationStage,
        },
        { status: 400 }
      );
    }

    // Update conversation stage
    const updated = await db.instantlyConversation.update({
      where: { id: params.id },
      data: {
        conversationStage: stage,
        stageUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        conversation: updated,
        stageDescription: VisionFormTracker.getStageDescription(stage),
      },
    });
  } catch (error) {
    console.error('Error updating conversation stage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update conversation stage' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await db.instantlyConversation.findUnique({
      where: { id: params.id },
      select: {
        conversationStage: true,
        stageUpdatedAt: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const timeInStage = conversation.stageUpdatedAt
      ? Math.floor((Date.now() - conversation.stageUpdatedAt.getTime()) / (1000 * 60 * 60))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        stage: conversation.conversationStage,
        stageUpdatedAt: conversation.stageUpdatedAt,
        timeInStage,
        stageDescription: VisionFormTracker.getStageDescription(conversation.conversationStage),
      },
    });
  } catch (error) {
    console.error('Error fetching conversation stage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation stage' },
      { status: 500 }
    );
  }
}
