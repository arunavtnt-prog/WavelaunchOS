import { db } from '@/lib/db/prisma';
import type { LeadType, ReplyIntent } from '@prisma/client';

function isCloseIntent(intent: ReplyIntent | null | undefined) {
  return intent === 'UNSUBSCRIBE' || intent === 'NOT_INTERESTED';
}

export class LeadStateEngine {
  static async recompute(conversationId: string) {
    const conversation = await db.instantlyConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { receivedAt: 'asc' },
          select: {
            id: true,
            direction: true,
            receivedAt: true,
            ueType: true,
            emailType: true,
          },
        },
        drafts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, createdAt: true, category: true, status: true },
        },
      },
    });

    if (!conversation) throw new Error('Conversation not found');

    const email = conversation.leadEmail;
    const [client, contact] = await Promise.all([
      db.client.findUnique({ where: { email }, select: { id: true } }),
      db.contact.findUnique({ where: { email }, select: { kind: true } }),
    ]);

    const manualOverride = conversation.leadTypeManualOverride;
    const computed: { leadType: LeadType; needsReply: boolean } = {
      leadType: conversation.leadType,
      needsReply: conversation.needsReply,
    };

    if (client || contact?.kind === 'CLIENT') {
      computed.leadType = 'CLIENT';
    } else if (manualOverride) {
      computed.leadType = manualOverride;
    } else {
      // Determine if we have sent a manual reply (Instantly ue_type=3 or email_type=manual)
      const firstInbound = conversation.messages.find((m) => m.direction === 'INBOUND')?.receivedAt || null;
      const manualOutbound = conversation.messages.find((m) => {
        if (m.direction !== 'OUTBOUND') return false;
        const ue = typeof m.ueType === 'number' ? m.ueType : null;
        if (ue === 3) return true;
        const t = (m.emailType || '').toLowerCase();
        return t === 'manual';
      });

      const hasManualReply = Boolean(manualOutbound && (!firstInbound || manualOutbound.receivedAt >= firstInbound));
      const manualOutboundAt = manualOutbound?.receivedAt || null;
      const inboundAfterManual = hasManualReply
        ? conversation.messages.some((m) => m.direction === 'INBOUND' && manualOutboundAt && m.receivedAt > manualOutboundAt)
        : false;

      computed.leadType = inboundAfterManual ? 'FOLLOWUP' : 'COLD';
    }

    // Close detection: auto-close when a close-intent has a fresh draft after last inbound.
    const latestDraft = conversation.drafts[0] || null;
    const lastInboundAt = conversation.lastInboundAt;
    const closeByIntent = isCloseIntent(conversation.intent);
    const hasCloseDraft =
      Boolean(latestDraft) &&
      (latestDraft?.category === 'UNSUBSCRIBE' || latestDraft?.category === 'NOT_INTERESTED') &&
      (!lastInboundAt || latestDraft!.createdAt > lastInboundAt);

    if (!manualOverride && closeByIntent && hasCloseDraft) {
      computed.leadType = 'CLOSED';
    }

    // needsReply semantics: true when there's an inbound newer than the latest draft, and not CLOSED.
    let needsReply = false;
    if (conversation.lastInboundAt && computed.leadType !== 'CLOSED') {
      if (!latestDraft) {
        needsReply = true;
      } else {
        needsReply = latestDraft.createdAt <= conversation.lastInboundAt;
      }
    }

    if (manualOverride === 'PIPELINE') computed.leadType = 'PIPELINE';

    await db.instantlyConversation.update({
      where: { id: conversationId },
      data: {
        leadType: computed.leadType,
        needsReply,
      },
    });

    return { leadType: computed.leadType, needsReply };
  }
}
