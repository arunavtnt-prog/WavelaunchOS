import { db } from '@/lib/db/prisma';
import type { LeadType, ReplyIntent, ReplyPlaybook, ReplyPlaybookSection } from '@prisma/client';
import { assertPrismaModel } from '@/lib/db/assert-prisma-model';

export type PlaybookKey = 'D26' | 'GENERAL' | 'CLIENT';

export async function ensureDefaultPlaybooks() {
  assertPrismaModel(db, 'replyPlaybook');
  assertPrismaModel(db, 'replyPlaybookSection');
  const existing = await db.replyPlaybook.findMany({
    where: { key: { in: ['D26', 'GENERAL', 'CLIENT'] } },
    select: { key: true },
  });
  const have = new Set(existing.map((r) => r.key));

  if (!have.has('D26')) {
    const pb = await db.replyPlaybook.create({
      data: { key: 'D26', name: 'D26 Cohort', version: 1, isActive: true },
    });
    await db.replyPlaybookSection.createMany({
      data: [
        {
          playbookId: pb.id,
          order: 1,
          title: 'Opening',
          content: [
            'Start with a warm, appreciative opening acknowledging their interest.',
            'Example: "Hi {{firstName}}, thanks for getting back to me! Great to hear you\'re interested in learning more about Wavelaunch Studio."',
          ].join('\n'),
          intents: ['INTERESTED' as ReplyIntent],
          leadTypes: ['COLD' as LeadType],
          keywords: ['interested', 'tell me more', 'sounds interesting', 'want to learn'],
        },
        {
          playbookId: pb.id,
          order: 2,
          title: 'Wavelaunch Overview',
          content: [
            'Explain Wavelaunch Studio briefly:',
            '- We are backed by Wavelaunch VC',
            '- We invest $50,000-$100,000 in creator brands',
            '- We help build and launch scalable product lines',
            '- This is a partnership: 10% equity + 25% revenue share',
          ].join('\n'),
          intents: ['INTERESTED' as ReplyIntent, 'PRICING' as ReplyIntent, 'QUESTIONS' as ReplyIntent],
          leadTypes: ['COLD' as LeadType],
          keywords: ['how does it work', 'what do you do', 'partnership', 'investment'],
        },
        {
          playbookId: pb.id,
          order: 3,
          title: 'Terms',
          content: [
            'When asked about terms, be clear:',
            '- 10% equity in the brand',
            '- 25% revenue share',
            '- $5,000 onboarding fee (non-refundable, covers initial work)',
            '- We handle product development, supply chain, marketing strategy',
            '',
            'Note: The onboarding fee demonstrates commitment and covers our initial work.',
          ].join('\n'),
          intents: ['PRICING' as ReplyIntent, 'QUESTIONS' as ReplyIntent],
          leadTypes: ['COLD' as LeadType],
          keywords: ['cost', 'fee', 'money', 'terms', 'equity', 'revenue'],
        },
        {
          playbookId: pb.id,
          order: 4,
          title: 'CTA - Vision Form',
          content: [
            'Direct them to fill out our vision form:',
            '- Link: https://apply.wavelaunch.org',
            '- This helps us understand their brand vision',
            '- Takes about 10-15 minutes',
            '- We review all submissions within 48 hours',
            '',
            'Alternative: Provide documentation link: https://studio.wavelaunch.org/documentation',
          ].join('\n'),
          intents: ['INTERESTED' as ReplyIntent],
          leadTypes: ['COLD' as LeadType],
          keywords: ['next step', 'what now', 'apply', 'application', 'how to start'],
        },
        {
          playbookId: pb.id,
          order: 5,
          title: 'Closing',
          content: [
            'End with a helpful closing:',
            '- "Feel free to reply with any questions"',
            '- "Warmly, Wavelaunch Studio Team"',
            '- Keep it short and inviting',
          ].join('\n'),
          intents: ['INTERESTED' as ReplyIntent, 'QUESTIONS' as ReplyIntent],
          leadTypes: ['COLD' as LeadType],
          keywords: [],
        },
        {
          playbookId: pb.id,
          order: 6,
          title: 'Scheduling',
          content: [
            'D26 Cohort is async-first. Calls are rare and only when absolutely necessary.',
            'If they ask for a call:',
            '- Explain we prefer async communication',
            '- Say we can address all questions by email',
            '- Only agree to call if they insist and have a legitimate complex need',
          ].join('\n'),
          intents: ['SCHEDULING' as ReplyIntent],
          leadTypes: ['COLD' as LeadType],
          keywords: ['call', 'meeting', 'zoom', 'calendar', 'schedule'],
        },
        {
          playbookId: pb.id,
          order: 10,
          title: 'Price Negotiation Response',
          content: `Hi {{firstName}},

Thanks for being upfront about your budget considerations, and I completely understand wanting to explore all options.

The commitment fee reflects industry standards for professional creator brand development. Most agencies in our space charge monthly retainers of $5,000-$15,000, so our one-time commitment fee actually represents exceptional value for what we deliver. The fee ensures we can allocate dedicated resources from our brand strategists, product developers, and creative team who typically work on projects with much higher budgets.

What makes our model unique is that this modest commitment fee unlocks a $50K+ investment from us. We're essentially asking for 6-10% of the value we're investing, which is significantly lower than traditional business partnerships where commitment fees often match the total investment amount.

We do offer the flexible 3-6 month payment plan specifically to make this accessible to creators at different stages. Many of our most successful brand launches came from creators who started with the payment plan and were thrilled they made the investment once they saw the results.

Let me know if the payment plan option would work better for your current situation.`,
          intents: ['PRICE_NEGOTIATION' as ReplyIntent],
          leadTypes: ['COLD' as LeadType, 'PIPELINE' as LeadType],
          keywords: ['fee', 'expensive', 'cost', 'budget', 'price', '$', 'cheaper', 'lower'],
        },
        {
          playbookId: pb.id,
          order: 20,
          title: 'Timeline Concerns Response',
          content: `Hi {{firstName}},

I understand your eagerness to launch quickly - that energy is great to work with!

The 4-6 month timeline actually reflects what successful creator brands require for sustainable launch. Industry data shows that brands requiring 18-24 months of proper development achieve 300-500% ROI within three years, while rushed launches have only a 10-20% long-term success rate. We've seen too many creators launch quickly only to struggle with quality issues, supply chain problems, or brand positioning that doesn't resonate.

The timeline breaks down strategically: 2-4 weeks for deep audience research and brand strategy (this foundation is crucial), 8-12 weeks for product development and testing (quality control is non-negotiable), and 4-8 weeks for launch preparation and system setup. Each phase builds on the previous one.

That said, we can explore ways to optimize certain elements if you have a specific deadline. For instance, if there's a particular season or event you're targeting, we might be able to adjust our launch strategy while maintaining quality standards.

I'd love to understand what's driving your specific timeline needs, as that helps us find the best path forward.`,
          intents: ['TIMELINE_CONCERNS' as ReplyIntent],
          leadTypes: ['COLD' as LeadType, 'PIPELINE' as LeadType],
          keywords: ['timeline', 'too long', 'months', 'launch date', 'speed up', 'faster', 'deadline', 'urgent'],
        },
        {
          playbookId: pb.id,
          order: 30,
          title: 'Skepticism Response',
          content: `Hi {{firstName}},

I appreciate you asking the important questions - it's smart to be thoughtful about partnerships.

Wavelaunch Studio is backed by Wavelaunch VC, which has invested in over 50 creator brands since 2020. We're not looking for quick wins; we're building long-term, sustainable businesses with creators we genuinely believe in. Our portfolio includes brands that have scaled to $2M+ in annual revenue within 18 months.

Here's what I'd suggest: Start with our Vision Form at https://apply.wavelaunch.org. It's obligation-free and helps us both understand if there's a genuine fit. After reviewing your submission, our team will provide an honest assessment - we only move forward when we're confident we can deliver real value.

We're also completely transparent about our process. Once we're in conversation, you'll have direct access to our brand strategists and you'll see exactly how we work. No hidden fees, no surprises - just a clear partnership where we invest in your success.

If you'd like to speak with any of our current partners about their experience, I'd be happy to facilitate an introduction.`,
          intents: ['SKEPTICISM_CONCERNS' as ReplyIntent],
          leadTypes: ['COLD' as LeadType],
          keywords: ['too good to be true', 'scam', 'legitimate', 'real', 'verify', 'prove'],
        },
        {
          playbookId: pb.id,
          order: 40,
          title: 'Competition Questions Response',
          content: `Hi {{firstName}},

Great question - and it shows you're thinking strategically about your brand.

We do work with multiple creators, including some in overlapping niches. However, we've found that creator audiences are highly specific and loyal to individual creators rather than just product categories. Our focus is on helping each creator build something authentically aligned with their unique voice and audience relationship.

That said, we're thoughtful about this. When reviewing applications, we consider factors like:
- How differentiated is your brand positioning?
- Does your audience have unique needs we haven't addressed elsewhere?
- Are there product opportunities specific to your content style?

We're not building identical brands - we're building complementary ones. Think of it like how Netflix works with multiple creators who might cover similar topics but create distinctly different content.

I'd love to learn more about your specific concerns - is there a particular competitor or product type you're worried about? This helps me provide more tailored guidance.`,
          intents: ['COMPETITION_QUESTIONS' as ReplyIntent],
          leadTypes: ['COLD' as LeadType],
          keywords: ['competitors', 'exclusive', 'working with others', 'niche', 'copy', 'steal'],
        },
        {
          playbookId: pb.id,
          order: 50,
          title: 'Revenue Sharing Objection Response',
          content: `Hi {{firstName}},

Thanks for bringing this up - it's an important part of our partnership to discuss openly.

The 10% equity and 25% revenue share reflects the significant investment we're making: $50,000-$100,000 in direct funding, plus our team's expertise in brand development, supply chain management, marketing strategy, and ongoing operations. We're essentially funding and building an entire business around your brand.

Here's some context: Traditional brand acquisition or partnership deals in creator commerce typically involve 30-50% equity buyouts or revenue shares of 40-60%. Our structure is creator-friendly because we want you to remain motivated and invested in the brand's success.

We also structure this so that if the brand doesn't perform, you're not locked into unfavorable terms - the revenue share only activates when there's actual revenue. And the equity ensures you benefit proportionally as the brand grows.

What aspects of the revenue sharing model are you most concerned about? I'm happy to walk through specific scenarios or alternatives.`,
          intents: ['REVENUE_SHARING_OBJS' as ReplyIntent],
          leadTypes: ['COLD' as LeadType, 'PIPELINE' as LeadType],
          keywords: ['10%', 'revenue share', 'equity', 'too high', 'buy out', 'ownership'],
        },
        {
          playbookId: pb.id,
          order: 60,
          title: 'Contract Questions Response',
          content: `Hi {{firstName},

Absolutely - having legal review is completely reasonable and we encourage it for any partnership of this scale.

When we move forward, we provide a comprehensive partnership agreement that clearly outlines:
- Investment amount and structure
- Equity and revenue sharing terms
- Roles and responsibilities for both parties
- Deliverables and timelines
- Intellectual property rights
- Exit provisions and termination clauses

Your lawyer is welcome to review this document and ask any questions. We're happy to clarify terms, make reasonable adjustments for mutual protection, and ensure you feel fully comfortable before signing.

We don't use complex legal jargon or hidden clauses. Everything is designed to be transparent and fair because we want this to be a partnership we're both excited about for years to come.

Is there a specific aspect of the agreement you'd like us to address or clarify in advance?`,
          intents: ['CONTRACT_QUESTIONS' as ReplyIntent],
          leadTypes: ['PIPELINE' as LeadType],
          keywords: ['lawyer', 'legal', 'contract', 'agreement', 'written', 'terms', 'exit'],
        },
        {
          playbookId: pb.id,
          order: 70,
          title: 'Payment Questions Response',
          content: `Hi {{firstName},

Happy to walk through the payment process!

For the onboarding fee, we offer two options:

1. Full payment upfront ($5,000) - Simple and straightforward
2. Payment plan (3-6 months, interest-free) - Spreads the cost as $834-$1,667/month

Payment can be made via:
- Bank transfer (ACH/Wire)
- Credit card (3% processing fee applies)
- Wise (for international transfers)

We provide an invoice upon agreement, and payment triggers the start of your onboarding process. The onboarding fee covers our initial brand strategy work, product development research, supply chain setup, and launch preparation.

For ongoing revenue sharing payments, we handle all collections and accounting, so you don't need to worry about payment processing on your end. We'll provide regular financial statements and payments on a quarterly schedule.

What payment method works best for you, and would you prefer the payment plan or upfront option?`,
          intents: ['PAYMENT_QUESTIONS' as ReplyIntent],
          leadTypes: ['PIPELINE' as LeadType],
          keywords: ['how do i pay', 'payment method', 'invoice', 'wise', 'wire', 'bank transfer', 'ach'],
        },
        {
          playbookId: pb.id,
          order: 80,
          title: 'Long-term Questions Response',
          content: `Hi {{firstName},

This is exactly the right question to ask - we want you to feel confident about the long-term picture.

After launch, our relationship evolves from active development to ongoing partnership. Here's what that looks like:

**Year 1-2: Growth Phase**
- We actively manage operations and scaling
- Monthly strategy reviews and optimization
- Supply chain management and inventory planning
- Marketing execution and performance optimization
- Quarterly business reviews

**Year 3+: Independence Transition**
- Your team can gradually take over operations
- We step into an advisory role
- You maintain access to our expertise as needed
- Contract terms allow for buyout options if desired

The goal isn't to create dependency - it's to build a sustainable brand that can eventually operate independently. We structure the partnership so you learn alongside us and can build your own team over time if you choose.

Many of our creators have transitioned to largely independent operations within 2-3 years, with us serving in a strategic advisory capacity.

What's your ideal scenario for long-term involvement? I'd love to ensure our approach aligns with your vision.`,
          intents: ['LONGTERM_QUESTIONS' as ReplyIntent],
          leadTypes: ['PIPELINE' as LeadType],
          keywords: ['after launch', 'long term', 'stay involved', 'hire my own team', 'future', 'dependency'],
        },
        {
          playbookId: pb.id,
          order: 90,
          title: 'Vision Form - Vague/Short Responses',
          content: `Hi {{firstName}},

Thank you for completing the Vision Form! I can see the foundation of what could be a strong brand.

To create the most comprehensive brand roadmap for you, I'd love to dive a bit deeper into a few areas. Our brand strategists work best when they understand not just what you want to create, but the deeper motivations and audience insights that will make your brand truly resonate.

Could you help me understand a bit more about {{specificArea}}? For example, when you mentioned {{theirResponse}}, what specifically drew you to that direction? And what does your audience currently come to you for that this brand could amplify?

The more detail you can provide, the more tailored and strategic our brand roadmap will be. Some of our most successful brand concepts have come from understanding those deeper audience needs and creator motivations that aren't immediately obvious.

Let me know if you'd prefer to hop back into the form and expand on those sections, or if you'd rather send me a quick email with those additional insights.`,
          intents: ['VISION_VAGUE' as ReplyIntent, 'QUESTIONS' as ReplyIntent],
          leadTypes: ['PIPELINE' as LeadType],
          keywords: ['vision', 'form', 'short', 'vague'],
        },
        {
          playbookId: pb.id,
          order: 100,
          title: 'Vision Form - Incomplete Submission',
          content: `Hi {{firstName},

Thanks for starting the Vision Form! I noticed a few sections weren't completed, and I wanted to check in before we move forward.

The form is designed to give our team a comprehensive understanding of your brand vision, audience, and goals. Even the sections that seem less obvious - like professional milestones or turning points - often reveal crucial insights that shape our strategy.

If you're pressed for time, here are the most essential sections to complete:
- Target audience demographics
- Product categories you're considering
- What you hope to achieve with this brand
- Any unique value propositions you've identified

Would you like to:
1. Return to the form and complete the remaining sections?
2. Reply here with the missing information?
3. Hop on a quick async thread about any sections you're unsure about?

The more complete picture we have, the more tailored and effective your brand roadmap will be.`,
          intents: ['VISION_INCOMPLETE' as ReplyIntent],
          leadTypes: ['PIPELINE' as LeadType],
          keywords: ['vision', 'form', 'incomplete', 'missing'],
        },
        {
          playbookId: pb.id,
          order: 110,
          title: 'Vision Form - Technical Issues',
          content: `Hi {{firstName},

Thanks for letting me know you ran into some issues with the Vision Form - I'm sorry for the frustration!

We want to make sure your information gets through properly. Here are a few options:

1. Try again - Sometimes clearing your browser cache or trying a different browser resolves form issues
2. Copy-paste alternative - You can complete your responses in a document and then paste them into the form
3. Email your responses - If the form continues to have problems, you can email your responses directly and we'll process them the same way

The form link is: https://apply.wavelaunch.org

If you'd prefer to email your responses, here are the key sections we need:
- Your professional background and milestones
- What type of brand you envision creating
- Who your target audience is
- Product categories you're considering
- What you hope to achieve
- Any specific goals or constraints

Let me know which approach works best for you, and we'll get your vision captured so we can move forward!`,
          intents: ['VISION_TECH_ISSUE' as ReplyIntent],
          leadTypes: ['PIPELINE' as LeadType],
          keywords: ['vision', 'form', 'technical', 'issue', 'error', 'problem'],
        },
        {
          playbookId: pb.id,
          order: 120,
          title: 'Roadmap - Changes Requested',
          content: `Hi {{firstName}},

Thank you for your feedback on the roadmap - I'm glad it resonates with your vision!

The adjustments you mentioned make sense, and this is exactly why we present the roadmap before development begins. Our creative team builds in revision rounds specifically for this purpose. We can easily adjust {{specificElements}} while maintaining the strategic foundation that's working.

Would you like to walk through these adjustments in more detail via email? I can send you some follow-up questions to make sure every element aligns perfectly with your vision before we move into development.

Let me know which specific aspects feel most important to refine first.`,
          intents: ['ROADMAP_CHANGES_REQUESTED' as ReplyIntent],
          leadTypes: ['PIPELINE' as LeadType],
          keywords: ['changes', 'adjustments', 'modify', 'different'],
        },
        {
          playbookId: pb.id,
          order: 130,
          title: 'Roadmap - Unsure About Direction',
          content: `Hi {{firstName},

I completely understand - this is a big step, and it's natural to want to feel confident about the direction before moving forward.

The roadmap presents our strategic recommendation based on our analysis of your audience, market opportunities, and your unique strengths. However, it's just that - a recommendation. Your input and comfort with the direction are crucial.

Here's what I'd suggest:

1. Take some time to review the roadmap at your own pace
2. Note any specific areas where you feel uncertain or have concerns
3. Send me your thoughts or questions, and we can discuss each point

We can also:
- Provide additional market research to support specific recommendations
- Explore alternative directions for any elements you're unsure about
- Adjust the scope to focus on areas where you feel most confident

There's no pressure to proceed until you feel good about the direction. What specific aspects of the roadmap are giving you pause? I'd love to address them directly.`,
          intents: ['ROADMAP_UNSURE_DIRECTION' as ReplyIntent],
          leadTypes: ['PIPELINE' as LeadType],
          keywords: ['unsure', 'uncertain', 'confused', 'not sure'],
        },
        {
          playbookId: pb.id,
          order: 140,
          title: 'Roadmap - Competitor Analysis Request',
          content: `Hi {{firstName},

Great instinct - understanding the competitive landscape is crucial for building a differentiated brand.

Our roadmap does include basic competitive analysis, but if you'd like a deeper dive, we can absolutely provide that. Here's what enhanced competitor research would cover:

**Direct Competitors**
- Detailed analysis of similar creator brands in your space
- Their product offerings, pricing, and positioning
- Strengths, weaknesses, and market gaps

**Market Opportunities**
- Underserved audience needs
- Product categories with less competition
- Unique positioning opportunities

**Differentiation Strategy**
- How to stand out from existing options
- Build on what makes your brand unique
- Avoid me-too products that compete directly

We can incorporate this deeper analysis into your roadmap before we begin development. It would add about 1-2 weeks to the research phase but provides valuable strategic insights.

Would you like us to proceed with enhanced competitor analysis? Any specific competitors or concerns you'd like us to focus on?`,
          intents: ['ROADMAP_COMPETITOR_ANALYSIS' as ReplyIntent],
          leadTypes: ['PIPELINE' as LeadType],
          keywords: ['competitor', 'competition', 'competitive analysis', 'market research'],
        },
      ],
    });
  }

  if (!have.has('GENERAL')) {
    const pb = await db.replyPlaybook.create({
      data: { key: 'GENERAL', name: 'General', version: 1, isActive: true },
    });
    await db.replyPlaybookSection.createMany({
      data: [
        {
          playbookId: pb.id,
          order: 1,
          title: 'Core rules',
          content: [
            'Rules:',
            '- Be concise and specific.',
            '- Don\'t invent facts, pricing, timelines, or links.',
            '- Ask 1–2 clarifying questions if needed.',
            '- No hype; professional and helpful.',
            '- End with a simple next step.',
            '',
            'Signature: — Wavelaunch Studio',
          ].join('\n'),
          intents: [],
          leadTypes: [],
          keywords: [],
        },
      ],
    });
  }

  if (!have.has('CLIENT')) {
    const pb = await db.replyPlaybook.create({
      data: { key: 'CLIENT', name: 'Client', version: 1, isActive: true },
    });
    await db.replyPlaybookSection.createMany({
      data: [
        {
          playbookId: pb.id,
          order: 1,
          title: 'Core rules',
          content: [
            'Rules:',
            '- Assume shared context; be direct and execution-focused.',
            '- Confirm next deliverable or next step and timeline.',
            '- If blocked, ask exactly what you need (1–3 bullets).',
            '',
            'Signature: — Wavelaunch Studio',
          ].join('\n'),
          intents: [],
          leadTypes: ['CLIENT' as LeadType],
          keywords: [],
        },
      ],
    });
  }
}

export async function getCampaignPolicy(campaignId: string | null | undefined) {
  if (!campaignId) return null;
  assertPrismaModel(db, 'replyCampaignPolicy');
  return db.replyCampaignPolicy.findUnique({ where: { providerCampaignId: campaignId } });
}

export async function getPlaybookByKey(key: string): Promise<(ReplyPlaybook & { sections: ReplyPlaybookSection[] }) | null> {
  assertPrismaModel(db, 'replyPlaybook');
  return db.replyPlaybook.findUnique({
    where: { key },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
}

export function scoreSection(params: {
  section: ReplyPlaybookSection;
  leadType: LeadType;
  intent: ReplyIntent;
  queryText: string;
}) {
  const q = params.queryText.toLowerCase();
  let score = 0;
  if (params.section.intents?.includes(params.intent)) score += 3;
  if (params.section.leadTypes?.includes(params.leadType)) score += 2;
  const keywords = params.section.keywords || [];
  for (const kw of keywords) {
    const k = (kw || '').toLowerCase().trim();
    if (!k) continue;
    if (q.includes(k)) score += 1;
  }
  return score;
}

export function selectPlaybookSections(params: {
  playbook: ReplyPlaybook & { sections: ReplyPlaybookSection[] };
  leadType: LeadType;
  intent: ReplyIntent;
  queryText: string;
  maxSections?: number;
}) {
  const maxSections = Math.max(1, Math.min(8, params.maxSections ?? 5));
  const sections = params.playbook.sections || [];
  const core =
    sections.find((s) => s.title.toLowerCase().includes('core')) ||
    sections[0] ||
    null;

  const rest = sections.filter((s) => s.id !== core?.id);
  const scored = rest
    .map((section) => ({
      section,
      score: scoreSection({
        section,
        leadType: params.leadType,
        intent: params.intent,
        queryText: params.queryText,
      }),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, maxSections - (core ? 1 : 0)))
    .map((x) => x.section);

  return core ? [core, ...scored] : scored;
}
