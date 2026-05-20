import type { LeadType, ReplyIntent } from '@prisma/client';

export type LeadTypeValue = LeadType;
export type ReplyIntentValue = ReplyIntent;

export const LEAD_TYPES: LeadTypeValue[] = [
  'COLD',
  'FOLLOWUP',
  'PIPELINE',
  'CLIENT',
  'CLOSED',
];

export const REPLY_INTENTS: ReplyIntentValue[] = [
  'UNSUBSCRIBE',
  'NOT_INTERESTED',
  'SCHEDULING',
  'PRICING',
  'QUESTIONS',
  'INTERESTED',
  'REFERRAL',
  'CLIENT_UPDATE',
  'OTHER',
  // Objection handling intents
  'PRICE_NEGOTIATION',
  'TIMELINE_CONCERNS',
  'SKEPTICISM_CONCERNS',
  'COMPETITION_QUESTIONS',
  'REVENUE_SHARING_OBJS',
  'CONTRACT_QUESTIONS',
  'PAYMENT_QUESTIONS',
  'LONGTERM_QUESTIONS',
  // Vision form follow-up intents
  'VISION_VAGUE',
  'VISION_INCOMPLETE',
  'VISION_TECH_ISSUE',
  // Roadmap response intents
  'ROADMAP_CHANGES_REQUESTED',
  'ROADMAP_UNSURE_DIRECTION',
  'ROADMAP_COMPETITOR_ANALYSIS',
];

export type ConversationStageValue = 'INITIAL_CONTACT' | 'VISION_FORM_SENT' | 'VISION_FORM_COMPLETE' | 'ROADMAP_DELIVERED' | 'VC_SUBMITTED' | 'VC_APPROVED' | 'ONBOARDING_STARTED' | 'ONBOARDING_COMPLETE';

export const CONVERSATION_STAGES: ConversationStageValue[] = [
  'INITIAL_CONTACT',
  'VISION_FORM_SENT',
  'VISION_FORM_COMPLETE',
  'ROADMAP_DELIVERED',
  'VC_SUBMITTED',
  'VC_APPROVED',
  'ONBOARDING_STARTED',
  'ONBOARDING_COMPLETE',
];

