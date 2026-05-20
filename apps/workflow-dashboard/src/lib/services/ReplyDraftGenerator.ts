import { db } from '@/lib/db/prisma';
import { generateText } from '@/lib/ai/client';
import { ensureDefaultPlaybooks, getCampaignPolicy, getPlaybookByKey, selectPlaybookSections } from '@/lib/services/replies/PlaybookStore';
import { ReplyThreadAnalyzer } from '@/lib/services/replies/ReplyThreadAnalyzer';
import { LeadStateEngine } from '@/lib/services/replies/LeadStateEngine';
import { ObjectionHandler } from '@/lib/services/replies/ObjectionHandler';
import type { LeadType, ReplyIntent } from '@prisma/client';

export type GeneratedReplyDraft = {
  subject: string;
  body: string;
  category?: string;
  confidence?: number;
  model?: string;
  prompt?: string;
  rawResponse?: string;
  tokensUsed?: number;
};

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function tryParseJson<T>(text: string): T | null {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

async function loadAgentContext(): Promise<{
  companyContext: string;
  styleGuide: string;
  defaultCta: string;
  communicationPrinciples: string;
}> {
  const keys = [
    'REPLY_AGENT_COMPANY_CONTEXT',
    'REPLY_AGENT_STYLE_GUIDE',
    'REPLY_AGENT_DEFAULT_CTA',
    'REPLY_AGENT_COMMUNICATION_PRINCIPLES',
  ] as const;

  const rows = await db.settings.findMany({
    where: { key: { in: [...keys] } },
  });

  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  return {
    companyContext:
      byKey.get('REPLY_AGENT_COMPANY_CONTEXT') ||
      'Wavelaunch Studio manages creator leads for the D26 Cohort and helps creators build and launch scalable brands.',
    styleGuide:
      byKey.get('REPLY_AGENT_STYLE_GUIDE') ||
      'Warm but professional. Data-driven. No hype. Async-only (no calls/meetings). Sign as "Warmly, Chhavi".',
    defaultCta:
      byKey.get('REPLY_AGENT_DEFAULT_CTA') ||
      'If helpful, I can share the next step by email—what\'s the best way to proceed from your side?',
    communicationPrinciples:
      byKey.get('REPLY_AGENT_COMMUNICATION_PRINCIPLES') ||
      `COMMUNICATION PRINCIPLES:
- Never mention calls, meetings, or video chats - We operate 100% via email/async communication
- Always maintain warm but professional tone - Avoid overly "buttery" language
- Use data-driven responses - Reference market research and industry standards
- Be transparent about processes - Explain steps clearly without being defensive
- Personalize every email - Use creator's name and reference their specific situation
- Be concise - Respect their time with focused, relevant information
- Be helpful but not pushy - Let them drive the pace when appropriate`,
  };
}

function clamp(text: string, maxChars: number): string {
  const t = (text || '').trim();
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars) + '\n\n[TRUNCATED]';
}

function formatThread(messages: Array<{ direction: string; fromEmail: string | null; toEmail: string | null; subject: string | null; bodyText: string; receivedAt: Date }>): string {
  return messages
    .map((m) => {
      const headerParts = [
        m.direction,
        m.receivedAt.toISOString(),
        m.fromEmail ? `from:${m.fromEmail}` : null,
        m.toEmail ? `to:${m.toEmail}` : null,
        m.subject ? `subject:${m.subject}` : null,
      ].filter(Boolean);

      return `---\n${headerParts.join(' | ')}\n${m.bodyText}\n`;
    })
    .join('\n');
}

export class ReplyDraftGenerator {
  constructor() {}

  async prepare(conversationId: string): Promise<{ prompt: string; model: string }> {
    await ensureDefaultPlaybooks();

    const conversation = await db.instantlyConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { receivedAt: 'desc' },
          take: 25,
          select: {
            direction: true,
            fromEmail: true,
            toEmail: true,
            subject: true,
            bodyText: true,
            receivedAt: true,
            ueType: true,
            emailType: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Ensure analysis + lead type are up to date when a reply is needed.
    await ReplyThreadAnalyzer.analyzeIfNeeded(conversationId, { force: true });
    const state = await LeadStateEngine.recompute(conversationId);

    const refreshed = await db.instantlyConversation.findUnique({
      where: { id: conversationId },
      select: {
        leadType: true,
        intent: true,
        summaryText: true,
        pipelineSuggested: true,
        campaignId: true,
        conversationStage: true,
        stageUpdatedAt: true,
      },
    });
    const leadType = (refreshed?.leadType || state.leadType) as LeadType;
    const intent = (refreshed?.intent || 'OTHER') as ReplyIntent;
    const conversationStage = refreshed?.conversationStage || 'INITIAL_CONTACT';

    const campaignPolicy = await getCampaignPolicy(conversation.campaignId || null);
    const policyKey = campaignPolicy?.policyKey || 'GENERAL';
    const allowCalls = leadType === 'CLIENT' ? true : campaignPolicy?.allowCalls ?? policyKey !== 'D26';

    const playbookKey = leadType === 'CLIENT' ? 'CLIENT' : (policyKey === 'D26' ? 'D26' : 'GENERAL');
    let playbook = await getPlaybookByKey(playbookKey);
    if (!playbook) playbook = await getPlaybookByKey('GENERAL');
    if (!playbook) throw new Error('Missing playbook configuration');

    const latestInbound = [...conversation.messages].find((m) => m.direction === 'INBOUND') || null;
    const lastManualOutbound = [...conversation.messages].find((m) => {
      if (m.direction !== 'OUTBOUND') return false;
      const ue = typeof m.ueType === 'number' ? m.ueType : null;
      if (ue === 3) return true;
      return (m.emailType || '').toLowerCase() === 'manual';
    }) || null;

    const summaryText = refreshed?.summaryText || '';
    const queryText = [latestInbound?.bodyText || '', summaryText].join('\n\n');

    // Detect objection type for enhanced scoring
    const objectionType = ObjectionHandler.detectObjectionType(queryText);
    const finalIntent = objectionType || intent;

    const selectedSections = selectPlaybookSections({
      playbook,
      leadType,
      intent: finalIntent,
      queryText,
      maxSections: 6,
    });

    const sectionsText = selectedSections
      .map((s) => `### ${s.title}\n${clamp(s.content, 4000)}`)
      .join('\n\n');

    const { companyContext, styleGuide, defaultCta, communicationPrinciples } = await loadAgentContext();

    const prompt = [
      'You are an email reply assistant for Wavelaunch Studio.',
      '',
      'COMMUNICATION PRINCIPLES (follow these strictly):',
      communicationPrinciples,
      '',
      'Additional hard rules:',
      '- Do not invent facts, links, pricing, outcomes, or claims.',
      '- If you need info, ask 1-2 short clarifying questions.',
      '- Keep it concise and natural.',
      '- Respect unsubscribe/stop requests: write a short confirmation and do not pitch.',
      '- If intent is NOT_INTERESTED: politely close and stop pitching.',
      allowCalls ? '- Calls/meetings are allowed if truly necessary.' : '- Do not propose calls/meetings. Keep it async-only.',
      '',
      'Output JSON ONLY, with keys:',
      '{ "subject": string, "body": string, "category": string, "confidence": number }',
      '',
      'Set category to the detected intent (e.g., PRICING, SCHEDULING, UNSUBSCRIBE, PRICE_NEGOTIATION, TIMELINE_CONCERNS, OTHER).',
      '',
      'Company context:',
      clamp(companyContext, 6000),
      '',
      `Playbook: ${playbook.key}`,
      sectionsText || '(no sections)',
      '',
      'Writing style:',
      clamp(styleGuide, 4000),
      '',
      'Default CTA (use only if appropriate):',
      clamp(defaultCta, 1200),
      '',
      'Conversation metadata:',
      `- leadName: ${conversation.leadName || 'N/A'}`,
      `- leadEmail: ${conversation.leadEmail}`,
      `- campaignName: ${conversation.campaignName || 'N/A'}`,
      `- campaignId: ${conversation.campaignId || 'N/A'}`,
      `- mailboxEmail: ${conversation.mailboxEmail || 'N/A'}`,
      `- leadType: ${leadType}`,
      `- intent: ${finalIntent}`,
      `- conversationStage: ${conversationStage}`,
      '',
      'Thread summary (if present):',
      clamp(summaryText || '(none)', 1800),
      '',
      'Previous manual reply (if any):',
      lastManualOutbound ? clamp(lastManualOutbound.bodyText || '', 1800) : '(none)',
      '',
      'Latest inbound message:',
      latestInbound ? clamp(latestInbound.bodyText || '', 2500) : '(no inbound message found)',
      '',
      'Signature: end with "— Wavelaunch Studio" unless the playbook says otherwise.',
      '',
      'Now write the best next reply.',
    ].join('\n');

    return { prompt, model: 'glm-4.7' };
  }

  async generate(conversationId: string): Promise<GeneratedReplyDraft> {
    const { prompt, model } = await this.prepare(conversationId);

    const result = await generateText({
      messages: [{ role: 'user', content: prompt }],
      model,
      maxTokens: 1200,
      temperature: 0.4,
    });

    const rawText = result.text;
    const parsed = tryParseJson<{ subject?: unknown; body?: unknown; category?: unknown; confidence?: unknown }>(rawText);

    const subject = typeof parsed?.subject === 'string' ? parsed.subject : 'Quick follow-up';
    const body = typeof parsed?.body === 'string' ? parsed.body : rawText;

    const category = typeof parsed?.category === 'string' ? parsed.category : undefined;
    const confidence =
      typeof parsed?.confidence === 'number' && Number.isFinite(parsed.confidence)
        ? Math.max(0, Math.min(1, parsed.confidence))
        : undefined;

    const tokensUsed =
      (result.usage?.inputTokens || 0) + (result.usage?.outputTokens || 0) || undefined;

    return {
      subject,
      body,
      category,
      confidence,
      model: result.model || 'glm-4.7',
      prompt,
      rawResponse: rawText,
      tokensUsed,
    };
  }
}
