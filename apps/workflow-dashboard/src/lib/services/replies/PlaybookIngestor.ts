import { promises as fs } from 'fs';
import { db } from '@/lib/db/prisma';
import { generateText } from '@/lib/ai/client';
import { assertPrismaModel } from '@/lib/db/assert-prisma-model';
import { LEAD_TYPES, REPLY_INTENTS } from './ReplyTypes';
import type { LeadType, ReplyIntent } from '@prisma/client';

type SectionInput = { order: number; title: string; content: string };
type TaggedSection = SectionInput & { intents: ReplyIntent[]; leadTypes: LeadType[]; keywords: string[] };

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

function clamp(text: string, max = 2400) {
  const t = (text || '').trim();
  if (t.length <= max) return t;
  return t.slice(0, max) + '\n[TRUNCATED]';
}

export function parseMarkdownSections(markdown: string): SectionInput[] {
  const lines = (markdown || '').split(/\r?\n/);
  const sections: SectionInput[] = [];

  let currentTitle = 'Intro';
  let currentContent: string[] = [];
  let order = 1;

  const flush = () => {
    const content = currentContent.join('\n').trim();
    if (content.length) {
      sections.push({ order: order++, title: currentTitle.trim() || 'Section', content });
    }
    currentContent = [];
  };

  for (const line of lines) {
    const m = /^(#{2,3})\s+(.+)\s*$/.exec(line);
    if (m) {
      flush();
      currentTitle = m[2];
      continue;
    }
    currentContent.push(line);
  }
  flush();

  return sections;
}

async function tagSectionsBatch(sections: SectionInput[]): Promise<Array<Pick<TaggedSection, 'intents' | 'leadTypes' | 'keywords'>>> {
  const prompt = [
    'You label playbook sections for an email reply assistant.',
    '',
    'Return JSON ONLY as an array of objects, one per input section in order:',
    '[{ "intents": string[], "leadTypes": string[], "keywords": string[] }]',
    '',
    `Allowed intents: ${REPLY_INTENTS.join(', ')}`,
    `Allowed leadTypes: ${LEAD_TYPES.join(', ')}`,
    '',
    'Rules:',
    '- intents: 0-3 from the allowed list (empty means general).',
    '- leadTypes: 0-3 from allowed list (empty means general).',
    '- keywords: 8-20 short lowercase trigger phrases (no punctuation, no emails).',
    '',
    'Sections:',
    ...sections.map((s, idx) => {
      return [
        `--- SECTION ${idx + 1} ---`,
        `Title: ${s.title}`,
        `Content:\n${clamp(s.content, 1600)}`,
      ].join('\n');
    }),
  ].join('\n\n');

  const result = await generateText({
    messages: [{ role: 'user', content: prompt }],
    model: 'glm-4.7',
    maxTokens: 1800,
    temperature: 0.1,
  });

  const parsed = tryParseJson<any>(result.text);
  if (!Array.isArray(parsed) || parsed.length !== sections.length) {
    return sections.map(() => ({ intents: [], leadTypes: [], keywords: [] }));
  }

  return parsed.map((row: any) => {
    const intents = Array.isArray(row?.intents) ? row.intents.filter((x: any) => typeof x === 'string') : [];
    const leadTypes = Array.isArray(row?.leadTypes) ? row.leadTypes.filter((x: any) => typeof x === 'string') : [];
    const keywords = Array.isArray(row?.keywords) ? row.keywords.filter((x: any) => typeof x === 'string') : [];

    const normalizedIntents = intents
      .map((s: string) => s.trim().toUpperCase())
      .filter((s: string) => REPLY_INTENTS.includes(s as any)) as ReplyIntent[];
    const normalizedLeadTypes = leadTypes
      .map((s: string) => s.trim().toUpperCase())
      .filter((s: string) => LEAD_TYPES.includes(s as any)) as LeadType[];
    const normalizedKeywords = keywords
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 24);

    return {
      intents: normalizedIntents,
      leadTypes: normalizedLeadTypes,
      keywords: normalizedKeywords,
    };
  });
}

export async function ingestPlaybookFromMarkdown(params: {
  playbookKey: string;
  playbookName: string;
  markdown: string;
  replace?: boolean;
}) {
  assertPrismaModel(db, 'replyPlaybook');
  assertPrismaModel(db, 'replyPlaybookSection');
  const playbook = await db.replyPlaybook.upsert({
    where: { key: params.playbookKey },
    create: { key: params.playbookKey, name: params.playbookName, version: 1, isActive: true },
    update: { name: params.playbookName, isActive: true },
  });

  const sections = parseMarkdownSections(params.markdown);
  const tagged: TaggedSection[] = [];

  const batchSize = 8;
  for (let i = 0; i < sections.length; i += batchSize) {
    const batch = sections.slice(i, i + batchSize);
    let tags: Array<Pick<TaggedSection, 'intents' | 'leadTypes' | 'keywords'>> = [];
    try {
      tags = await tagSectionsBatch(batch);
    } catch {
      tags = batch.map(() => ({ intents: [], leadTypes: [], keywords: [] }));
    }

    for (let j = 0; j < batch.length; j++) {
      tagged.push({
        ...batch[j],
        intents: tags[j]?.intents || [],
        leadTypes: tags[j]?.leadTypes || [],
        keywords: tags[j]?.keywords || [],
      });
    }
  }

  // Ensure a core section exists (always included during selection).
  const hasCore = tagged.some((s) => s.title.toLowerCase().includes('core'));
  if (!hasCore) {
    tagged.unshift({
      order: 0,
      title: 'Core rules',
      content: 'Follow this playbook sectioning as the highest priority rules for this campaign.',
      intents: [],
      leadTypes: [],
      keywords: [],
    });
  }

  // Persist (idempotent by order+title; easiest: delete and recreate if replace, else upsert by (playbookId, order) is not unique)
  if (params.replace) {
    await db.replyPlaybookSection.deleteMany({ where: { playbookId: playbook.id } });
  }

  for (const section of tagged) {
    await db.replyPlaybookSection.create({
      data: {
        playbookId: playbook.id,
        order: section.order,
        title: section.title,
        content: section.content,
        intents: section.intents,
        leadTypes: section.leadTypes,
        keywords: section.keywords,
      },
    });
  }

  return { playbookId: playbook.id, sectionsCreated: tagged.length };
}

export async function ingestPlaybookFromFile(params: {
  playbookKey: string;
  playbookName: string;
  path: string;
  replace?: boolean;
}) {
  const file = await fs.readFile(params.path, 'utf8');
  return ingestPlaybookFromMarkdown({
    playbookKey: params.playbookKey,
    playbookName: params.playbookName,
    markdown: file,
    replace: params.replace,
  });
}
