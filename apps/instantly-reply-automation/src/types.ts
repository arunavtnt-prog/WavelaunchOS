/**
 * Core TypeScript types for Instantly Reply Automation
 */

export type InstantlyEmail = {
  id?: string;
  thread_id?: string;
  message_id?: string;
  subject?: string;
  body?: { text?: string; html?: string } | string;
  from_address_email?: string;
  to_address_email_list?: Array<{ email?: string } | string> | string[] | string;
  cc_address_email_list?: Array<{ email?: string } | string> | string[] | string;
  timestamp_created?: number | string;
  timestamp_email?: number | string;
  is_unread?: boolean;
  is_focused?: boolean;
  email_type?: string;
  campaign_id?: string;
  campaign_name?: string;
  lead?: string;
  lead_id?: string;
  ue_type?: number;
  content_preview?: string;
  subsequence_id?: string;
  list_id?: string;
  eaccount?: string;
  [key: string]: any;
};

export type ReplyIntent =
  | 'INTERESTED'
  | 'QUESTIONS'
  | 'OBJECTION'
  | 'NOT_INTERESTED'
  | 'UNSUBSCRIBE'
  | 'OUT_OF_OFFICE'
  | 'OTHER';

export type ObjectionType =
  | 'PRICING'
  | 'TIMELINE'
  | 'CONTROL'
  | 'TRUST'
  | 'RELEVANCE'
  | 'ALREADY_DOING_IT'
  | 'TOO_BUSY'
  | 'NOT_READY'
  | 'OTHER';

export type AnalysisResult = {
  intent: ReplyIntent;
  objectionType?: ObjectionType;
  firstName?: string;
  lastName?: string;
  confidence: number;
  keyPoints?: string[];
  reason?: string;
};

export type GeneratedReply = {
  subject: string;
  body: string;
  isHtml: boolean;
  intent: ReplyIntent;
  confidence: number;
  firstName?: string;
};

export type ProcessResult = {
  emailId?: string;
  threadId?: string;
  fromEmail?: string;
  analysis: AnalysisResult;
  reply?: GeneratedReply;
  sent?: boolean;
  sentMessageId?: string;
  error?: string;
  processedAt: Date;
};

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
