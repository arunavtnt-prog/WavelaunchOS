import type { ReplyIntent } from '@prisma/client';

export type ObjectionType = 'PRICE_NEGOTIATION' | 'TIMELINE_CONCERNS' | 'SKEPTICISM_CONCERNS' | 'COMPETITION_QUESTIONS' | 'REVENUE_SHARING_OBJS' | 'CONTRACT_QUESTIONS' | 'PAYMENT_QUESTIONS' | 'LONGTERM_QUESTIONS';

export class ObjectionHandler {
  private static patterns = {
    priceNegotiation: [
      /(\$\d+[kK])/i,
      /(too expensive|too high|fee is high)/i,
      /(cheaper|lower price|discount|reduce)/i,
      /(can you do|lower|reduce) (the|fee|price|cost)/i,
    ],
    timelineConcerns: [
      /(too long|faster|speed up|deadline)/i,
      /(\d+) months?|launch (by|before)/i,
      /(take|too much) time/i,
    ],
    skepticism: [
      /(too good to be true|scam|legitimate|real)/i,
      /(how do i know|verify|prove|burned)/i,
      /(invested?|risk|safe)/i,
    ],
    competition: [
      /(competitors?|exclusive?|working with others)/i,
      /(copy|steal|idea|concept)/i,
      /(niche|same market|direct competition)/i,
    ],
    revenueSharing: [
      /(10%|revenue share|too high)/i,
      /(buy out|buyout|full control)/i,
      /(equity|ownership|keep)/i,
    ],
    contract: [
      /(lawyer|legal|contract|agreement)/i,
      /(written|documentation|terms)/i,
      /(exit|cancel|guarantee)/i,
    ],
    payment: [
      /(how (do i|to) pay|payment method|invoice)/i,
      /(wise|wire|bank transfer|ach)/i,
      /(when (is fee|to pay|due))/i,
    ],
    longterm: [
      /(after launch|long term|stay involved)/i,
      /(hire my own team|future|2-3 years)/i,
      /(dependency|independent|ongoing)/i,
    ],
  };

  /**
   * Detect objection type from a message using regex patterns
   */
  static detectObjectionType(message: string): ReplyIntent | null {
    const messageLower = message.toLowerCase();

    for (const [type, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(messageLower)) {
          return type.toUpperCase() as ReplyIntent;
        }
      }
    }

    return null;
  }

  /**
   * Get intent multiplier for scoring objections higher priority
   */
  static getIntentMultiplier(intent: ReplyIntent | null): number {
    if (!intent) return 1;

    const highPriority: ReplyIntent[] = [
      'PRICE_NEGOTIATION',
      'TIMELINE_CONCERNS',
      'SKEPTICISM_CONCERNS',
    ];

    const mediumPriority: ReplyIntent[] = [
      'COMPETITION_QUESTIONS',
      'REVENUE_SHARING_OBJS',
      'CONTRACT_QUESTIONS',
      'PAYMENT_QUESTIONS',
      'LONGTERM_QUESTIONS',
      'VISION_VAGUE',
      'VISION_INCOMPLETE',
      'ROADMAP_CHANGES_REQUESTED',
    ];

    if (highPriority.includes(intent)) {
      return 3;
    } else if (mediumPriority.includes(intent)) {
      return 2;
    }

    return 1;
  }

  /**
   * Check if an intent is related to objections
   */
  static isObjectionIntent(intent: ReplyIntent | null): boolean {
    if (!intent) return false;

    const objectionIntents: ReplyIntent[] = [
      'PRICE_NEGOTIATION',
      'TIMELINE_CONCERNS',
      'SKEPTICISM_CONCERNS',
      'COMPETITION_QUESTIONS',
      'REVENUE_SHARING_OBJS',
      'CONTRACT_QUESTIONS',
      'PAYMENT_QUESTIONS',
      'LONGTERM_QUESTIONS',
    ];

    return objectionIntents.includes(intent);
  }

  /**
   * Check if an intent is related to vision form follow-up
   */
  static isVisionFormIntent(intent: ReplyIntent | null): boolean {
    if (!intent) return false;

    const visionFormIntents: ReplyIntent[] = [
      'VISION_VAGUE',
      'VISION_INCOMPLETE',
      'VISION_TECH_ISSUE',
    ];

    return visionFormIntents.includes(intent);
  }

  /**
   * Check if an intent is related to roadmap responses
   */
  static isRoadmapIntent(intent: ReplyIntent | null): boolean {
    if (!intent) return false;

    const roadmapIntents: ReplyIntent[] = [
      'ROADMAP_CHANGES_REQUESTED',
      'ROADMAP_UNSURE_DIRECTION',
      'ROADMAP_COMPETITOR_ANALYSIS',
    ];

    return roadmapIntents.includes(intent);
  }

  /**
   * Get user-friendly label for objection type
   */
  static getObjectionLabel(intent: ReplyIntent | null): string {
    if (!intent) return 'Unknown';

    const labels: Record<string, string> = {
      PRICE_NEGOTIATION: 'Price Negotiation',
      TIMELINE_CONCERNS: 'Timeline Concerns',
      SKEPTICISM_CONCERNS: 'Skepticism',
      COMPETITION_QUESTIONS: 'Competition Questions',
      REVENUE_SHARING_OBJS: 'Revenue Sharing',
      CONTRACT_QUESTIONS: 'Contract Questions',
      PAYMENT_QUESTIONS: 'Payment Questions',
      LONGTERM_QUESTIONS: 'Long-term Questions',
      VISION_VAGUE: 'Vision Form - Vague',
      VISION_INCOMPLETE: 'Vision Form - Incomplete',
      VISION_TECH_ISSUE: 'Vision Form - Technical Issue',
      ROADMAP_CHANGES_REQUESTED: 'Roadmap - Changes',
      ROADMAP_UNSURE_DIRECTION: 'Roadmap - Unsure Direction',
      ROADMAP_COMPETITOR_ANALYSIS: 'Roadmap - Competitor Analysis',
    };

    return labels[intent] || intent;
  }
}
