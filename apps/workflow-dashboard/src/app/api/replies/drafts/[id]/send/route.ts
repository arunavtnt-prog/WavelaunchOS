import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { InstantlyClient } from '@/lib/instantly/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: draftId } = await params;

    // Fetch draft with conversation details
    const draft = await db.replyDraft.findUnique({
      where: { id: draftId },
      include: {
        conversation: true,
      },
    });

    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    if (draft.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Draft must be approved before sending' },
        { status: 400 }
      );
    }

    // Get the latest inbound message's provider message ID to reply to
    const latestInbound = await db.instantlyMessage.findFirst({
      where: {
        conversationId: draft.conversationId,
        direction: 'INBOUND',
      },
      orderBy: { receivedAt: 'desc' },
    });

    if (!latestInbound?.providerMessageId) {
      return NextResponse.json(
        { success: false, error: 'No inbound message found to reply to' },
        { status: 400 }
      );
    }

    // Send via Instantly API
    const apiKey = process.env.INSTANTLY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'INSTANTLY_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const client = new InstantlyClient(apiKey);
    const sendResult = await client.sendReply({
      replyToUuid: latestInbound.providerMessageId,
      eaccount: draft.conversation.mailboxEmail || '',
      subject: draft.subject,
      body: draft.body,
      isHtml: false,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: sendResult.error || 'Failed to send via Instantly' },
        { status: 500 }
      );
    }

    // Update draft with send details
    const updatedDraft = await db.replyDraft.update({
      where: { id: draftId },
      data: {
        status: 'SENT',
        sentMessageId: sendResult.messageId || null,
        sentAt: new Date(),
        autoSent: false,
      },
    });

    return NextResponse.json({ success: true, data: updatedDraft });
  } catch (error) {
    console.error('Error sending draft:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
