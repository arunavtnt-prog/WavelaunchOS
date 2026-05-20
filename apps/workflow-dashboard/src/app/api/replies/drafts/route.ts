import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { ReplyDraftGenerator } from '@/lib/services/ReplyDraftGenerator';
import { getAiConfig } from '@/lib/ai/client';
import { LeadStateEngine } from '@/lib/services/replies/LeadStateEngine';
import { REPLY_INTENTS } from '@/lib/services/replies/ReplyTypes';
import { InstantlyClient } from '@/lib/instantly/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body || {};

    if (action === 'prepare') {
      const { conversationId } = body;
      if (!conversationId) {
        return NextResponse.json(
          { success: false, error: 'conversationId is required' },
          { status: 400 }
        );
      }

      const generator = new ReplyDraftGenerator();
      const prepared = await generator.prepare(conversationId);
      return NextResponse.json({ success: true, data: prepared });
    }

    if (action === 'generate') {
      const { conversationId } = body;
      if (!conversationId) {
        return NextResponse.json(
          { success: false, error: 'conversationId is required' },
          { status: 400 }
        );
      }

      const startedAt = Date.now();
      const generator = new ReplyDraftGenerator();
      const generated = await generator.generate(conversationId);
      const elapsedMs = Date.now() - startedAt;
      const cfg = getAiConfig();

      const draft = await db.replyDraft.create({
        data: {
          conversationId,
          subject: generated.subject,
          body: generated.body,
          status: 'PENDING_REVIEW',
          model: generated.model,
          prompt: generated.prompt,
          rawResponse: generated.rawResponse,
          tokensUsed: generated.tokensUsed,
          confidence: generated.confidence,
          category: generated.category,
        },
      });

      await db.instantlyConversation.update({
        where: { id: conversationId },
        data: {
          category: generated.category || undefined,
          // Once a draft exists, this thread no longer "needsReply" for bulk drafting purposes.
          needsReply: false,
          ...(generated.category && REPLY_INTENTS.includes(generated.category as any)
            ? { intent: generated.category as any }
            : {}),
        },
      });

      await LeadStateEngine.recompute(conversationId);

      return NextResponse.json({
        success: true,
        data: {
          ...draft,
          debug: {
            provider: cfg.provider,
            elapsedMs,
            promptChars: (generated.prompt || '').length,
          },
        },
      });
    }

    if (action === 'save') {
      const { conversationId, subject, body: draftBody, model, prompt, rawResponse, tokensUsed, confidence, category } = body || {};
      if (!conversationId) {
        return NextResponse.json(
          { success: false, error: 'conversationId is required' },
          { status: 400 }
        );
      }
      if (typeof subject !== 'string' || typeof draftBody !== 'string') {
        return NextResponse.json(
          { success: false, error: 'subject and body are required' },
          { status: 400 }
        );
      }

      const draft = await db.replyDraft.create({
        data: {
          conversationId,
          subject,
          body: draftBody,
          status: 'PENDING_REVIEW',
          model: typeof model === 'string' ? model : undefined,
          prompt: typeof prompt === 'string' ? prompt : undefined,
          rawResponse: typeof rawResponse === 'string' ? rawResponse : undefined,
          tokensUsed: typeof tokensUsed === 'number' ? tokensUsed : undefined,
          confidence: typeof confidence === 'number' ? confidence : undefined,
          category: typeof category === 'string' ? category : undefined,
        },
      });

      return NextResponse.json({ success: true, data: draft });
    }

    if (action === 'update') {
      const { draftId, subject, body: draftBody } = body;
      if (!draftId) {
        return NextResponse.json(
          { success: false, error: 'draftId is required' },
          { status: 400 }
        );
      }

      const draft = await db.replyDraft.update({
        where: { id: draftId },
        data: {
          ...(typeof subject === 'string' ? { subject } : {}),
          ...(typeof draftBody === 'string' ? { body: draftBody } : {}),
          status: 'MODIFIED',
        },
      });

      return NextResponse.json({ success: true, data: draft });
    }

    if (action === 'approve') {
      const { draftId } = body;
      if (!draftId) {
        return NextResponse.json(
          { success: false, error: 'draftId is required' },
          { status: 400 }
        );
      }

      const draft = await db.replyDraft.update({
        where: { id: draftId },
        data: {
          status: 'APPROVED',
        },
      });

      return NextResponse.json({ success: true, data: draft });
    }

    if (action === 'send') {
      const { draftId } = body;
      if (!draftId) {
        return NextResponse.json(
          { success: false, error: 'draftId is required' },
          { status: 400 }
        );
      }

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

      if (draft.status !== 'APPROVED' && draft.status !== 'SENT') {
        return NextResponse.json(
          { success: false, error: 'Draft must be approved before sending' },
          { status: 400 }
        );
      }

      // Already sent?
      if (draft.status === 'SENT' && draft.sentMessageId) {
        return NextResponse.json({ success: true, data: draft });
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
    }

    if (action === 'approve-and-send') {
      const { draftId } = body;
      if (!draftId) {
        return NextResponse.json(
          { success: false, error: 'draftId is required' },
          { status: 400 }
        );
      }

      // First approve the draft
      let draft = await db.replyDraft.update({
        where: { id: draftId },
        data: {
          status: 'APPROVED',
        },
      });

      // Then send it
      const body = { action: 'send', draftId };
      const requestObj = new Request(new URL(request.url), {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(body),
      });

      // Call the send action recursively (we could refactor this)
      const apiKey = process.env.INSTANTLY_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: 'INSTANTLY_API_KEY is not configured' },
          { status: 500 }
        );
      }

      const draftWithConversation = await db.replyDraft.findUnique({
        where: { id: draftId },
        include: {
          conversation: true,
        },
      });

      if (!draftWithConversation) {
        return NextResponse.json(
          { success: false, error: 'Draft not found' },
          { status: 404 }
        );
      }

      const latestInbound = await db.instantlyMessage.findFirst({
        where: {
          conversationId: draftWithConversation.conversationId,
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

      const client = new InstantlyClient(apiKey);
      const sendResult = await client.sendReply({
        replyToUuid: latestInbound.providerMessageId,
        eaccount: draftWithConversation.conversation.mailboxEmail || '',
        subject: draftWithConversation.subject,
        body: draftWithConversation.body,
        isHtml: false,
      });

      if (!sendResult.success) {
        return NextResponse.json(
          { success: false, error: sendResult.error || 'Failed to send via Instantly' },
          { status: 500 }
        );
      }

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
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in reply drafts API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, subject, body: draftBody } = body || {};

    if (!draftId) {
      return NextResponse.json(
        { success: false, error: 'draftId is required' },
        { status: 400 }
      );
    }

    if (typeof subject !== 'string' || typeof draftBody !== 'string') {
      return NextResponse.json(
        { success: false, error: 'subject and body are required' },
        { status: 400 }
      );
    }

    const draft = await db.replyDraft.update({
      where: { id: draftId },
      data: {
        ...(typeof subject === 'string' ? { subject } : {}),
        ...(typeof draftBody === 'string' ? { body: draftBody } : {}),
        status: 'MODIFIED',
      },
    });

    return NextResponse.json({ success: true, data: draft });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
