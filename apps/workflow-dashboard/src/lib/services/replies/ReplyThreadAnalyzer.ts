import { db } from '@/lib/db/prisma';
import { generateText } from '@/lib/ai/client';
import type { ReplyIntent } from '@prisma/client';
import { cacheKeyFor, getPromptCache, putPromptCache } from './promptCache';
import { REPLY_INTENTS } from './ReplyTypes';

function stripCodeFences(text: string): string {
  return (text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

function tryParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(stripCodeFences(text)) as T;
  } catch {
    return null;
  }
}

function clamp(text: string, max = 2000) {
  const t = (text || '').trim();
  if (t.length <= max) return t;
  return t.slice(0, max) + '\n[TRUNCATED]';
}

type AnalysisResult = {
  intent: ReplyIntent;
  summary: string;
  pipelineSuggested: boolean;
  closeSuggested: boolean;
};

export class ReplyThreadAnalyzer {
  static async analyzeIfNeeded(
    conversationId: string,
    options: { force?: boolean } = {}
  ): Promise<AnalysisResult | null> {
    const conversation = await db.instantlyConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { receivedAt: 'asc' },
          take: 30,
          select: {
            direction: true,
            receivedAt: true,
            subject: true,
            bodyText: true,
            ueType: true,
            emailType: true,
          },
        },
      },
    });
    if (!conversation) throw new Error('Conversation not found');

    if (!conversation.lastInboundAt) return null;

    const shouldRun =
      Boolean(options.force) ||
      (conversation.needsReply &&
        (!conversation.lastAiProcessedAt ||
          conversation.lastAiProcessedAt.getTime() < conversation.lastInboundAt.getTime() ||
          !conversation.intent ||
          !conversation.summaryText));
    if (!shouldRun) {
      return {
        intent: conversation.intent || 'OTHER',
        summary: conversation.summaryText || '',
        pipelineSuggested: Boolean(conversation.pipelineSuggested),
        closeSuggested: conversation.intent === 'UNSUBSCRIBE' || conversation.intent === 'NOT_INTERESTED',
      };
    }

    const latestInbound = [...conversation.messages]
      .reverse()
      .find((m) => m.direction === 'INBOUND');
    if (!latestInbound) return null;

    const lastManualOutbound = [...conversation.messages]
      .reverse()
      .find((m) => {
        if (m.direction !== 'OUTBOUND') return false;
        const ue = typeof m.ueType === 'number' ? m.ueType : null;
        if (ue === 3) return true;
        return (m.emailType || '').toLowerCase() === 'manual';
      });

    const cacheKey = cacheKeyFor([
      'reply',
      'analyze',
      conversationId,
      conversation.lastInboundAt.toISOString(),
    ]);
    const cached = await getPromptCache(cacheKey);
    if (cached) {
      const parsed = tryParseJson<AnalysisResult>(cached.response);
      if (parsed) {
        await db.instantlyConversation.update({
          where: { id: conversationId },
          data: {
            intent: parsed.intent,
            summaryText: parsed.summary,
            pipelineSuggested: parsed.pipelineSuggested,
            lastAiProcessedAt: new Date(),
          },
        });
        return parsed;
      }
    }

    const prompt = [
      'You classify and summarize email threads for a reply assistant.',
      '',
      'Return JSON ONLY with keys:',
      '{ "intent": string, "summary": string, "pipelineSuggested": boolean, "closeSuggested": boolean }',
      '',
      `Allowed intents: ${REPLY_INTENTS.join(', ')}`,
      '',
      'Rules:',
      '- intent is about the latest inbound message.',
      '- summary is 3–6 bullet points, short, no fluff.',
      '- pipelineSuggested=true only when they are clearly moving toward conversion (asking for pricing/next steps, ready to proceed).',
      '- closeSuggested=true for unsubscribe/stop/wrong person/hard no.',
      '',
      'Context:',
      `Campaign: ${conversation.campaignName || conversation.campaignId || 'N/A'}`,
      `Mailbox: ${conversation.mailboxEmail || 'N/A'}`,
      `Lead: ${conversation.leadEmail}`,
      '',
      'Previous manual reply (if any):',
      lastManualOutbound ? clamp(lastManualOutbound.bodyText || '', 1500) : '(none)',
      '',
      'Latest inbound message:',
      `Subject: ${latestInbound.subject || '(none)'}`,
      clamp(latestInbound.bodyText || '', 2000),
    ].join('\n');

    const result = await generateText({
      messages: [{ role: 'user', content: prompt }],
      model: 'glm-4.7',
      maxTokens: 700,
      temperature: 0.1,
    });

    const raw = result.text;
    const parsed = tryParseJson<Partial<AnalysisResult>>(raw) || {};
    const intentRaw = typeof parsed.intent === 'string' ? parsed.intent : 'OTHER';
    const intent = (REPLY_INTENTS.includes(intentRaw as any) ? intentRaw : 'OTHER') as ReplyIntent;
    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : clamp(raw, 1200);
    const pipelineSuggested = Boolean((parsed as any).pipelineSuggested);
    const closeSuggested = Boolean((parsed as any).closeSuggested);

    const normalized: AnalysisResult = { intent, summary, pipelineSuggested, closeSuggested };

    await putPromptCache({
      cacheKey,
      prompt,
      response: JSON.stringify(normalized),
      model: result.model || 'glm-4.7',
      ttlSeconds: 60 * 60 * 24 * 30,
    });

    await db.instantlyConversation.update({
      where: { id: conversationId },
      data: {
        intent,
        summaryText: summary,
        pipelineSuggested,
        lastAiProcessedAt: new Date(),
      },
    });

    return normalized;
  }
}
