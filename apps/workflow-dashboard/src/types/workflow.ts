import type { WorkflowStatus, DraftStatus, Application, WorkflowState, EmailDraft, WorkflowAuditLog } from '@prisma/client';

export type { WorkflowStatus, DraftStatus, Application, WorkflowState, EmailDraft, WorkflowAuditLog };

export interface ApplicationWithWorkflow extends Application {
  workflowState: WorkflowState | null;
}

export interface WorkflowWithRelations extends WorkflowState {
  application: Application;
  emailDrafts: EmailDraft[];
  auditLogs: WorkflowAuditLog[];
}

export interface BlueprintGeneratorOptions {
  anthropicApiKey: string;
  blueprintEngineUrl: string;
  promptTemplatePath: string;
  frameworkPath: string;
}

export interface BlueprintGenerationResult {
  success: boolean;
  markdown?: string;
  pdfUrl?: string;
  error?: string;
  tokensUsed?: number;
}

export interface EmailDraftOptions {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    path: string;
    mimeType: string;
  }>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface QueueFilters {
  status?: WorkflowStatus;
  country?: string;
  industryNiche?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface ConversionData {
  applicationId: string;
  convertedAt: Date;
  notes?: string;
  convertedBy: string;
}

export interface WorkflowTransition {
  from: WorkflowStatus;
  to: WorkflowStatus;
  action: string;
  canAutomate: boolean;
}

export const WORKFLOW_TRANSITIONS: Record<WorkflowStatus, WorkflowTransition[]> = {
  SUBMITTED: [
    { from: 'SUBMITTED', to: 'SNAPSHOT_QUEUED', action: 'Approve for Snapshot', canAutomate: false },
    { from: 'SUBMITTED', to: 'REJECTED', action: 'Reject Application', canAutomate: false },
  ],
  SNAPSHOT_QUEUED: [
    { from: 'SNAPSHOT_QUEUED', to: 'SNAPSHOT_GENERATING', action: 'Start Snapshot Generation', canAutomate: true },
  ],
  SNAPSHOT_GENERATING: [
    { from: 'SNAPSHOT_GENERATING', to: 'SNAPSHOT_COMPLETE', action: 'Complete Snapshot Generation', canAutomate: true },
    { from: 'SNAPSHOT_GENERATING', to: 'SNAPSHOT_FAILED', action: 'Fail Snapshot Generation', canAutomate: true },
  ],
  SNAPSHOT_COMPLETE: [
    { from: 'SNAPSHOT_COMPLETE', to: 'EMAIL_REVIEW_PENDING', action: 'Prepare Email Draft', canAutomate: true },
  ],
  SNAPSHOT_FAILED: [
    { from: 'SNAPSHOT_FAILED', to: 'SNAPSHOT_QUEUED', action: 'Retry Snapshot Generation', canAutomate: false },
    { from: 'SNAPSHOT_FAILED', to: 'REJECTED', action: 'Reject After Failed Snapshot', canAutomate: false },
  ],
  DRAFT_EMAIL_READY: [
    { from: 'DRAFT_EMAIL_READY', to: 'EMAIL_REVIEW_PENDING', action: 'Submit for Review', canAutomate: false },
  ],
  EMAIL_REVIEW_PENDING: [
    { from: 'EMAIL_REVIEW_PENDING', to: 'EMAIL_EDITED', action: 'Edit Email Draft', canAutomate: false },
    { from: 'EMAIL_REVIEW_PENDING', to: 'EMAIL_SENT', action: 'Approve and Send Email', canAutomate: false },
    { from: 'EMAIL_REVIEW_PENDING', to: 'DRAFT_EMAIL_READY', action: 'Return to Draft', canAutomate: false },
  ],
  EMAIL_EDITED: [
    { from: 'EMAIL_EDITED', to: 'EMAIL_REVIEW_PENDING', action: 'Submit Edited for Review', canAutomate: false },
  ],
  EMAIL_SENT: [
    { from: 'EMAIL_SENT', to: 'AWAITING_RESPONSE', action: 'Mark as Awaiting Response', canAutomate: true },
  ],
  AWAITING_RESPONSE: [
    { from: 'AWAITING_RESPONSE', to: 'CONVERTED', action: 'Mark as Converted', canAutomate: false },
    { from: 'AWAITING_RESPONSE', to: 'FOLLOW_UP_QUEUED', action: 'Schedule Follow-up', canAutomate: true },
    { from: 'AWAITING_RESPONSE', to: 'ARCHIVED', action: 'Archive', canAutomate: false },
  ],
  FOLLOW_UP_QUEUED: [
    { from: 'FOLLOW_UP_QUEUED', to: 'FOLLOW_UP_READY', action: 'Prepare Follow-up', canAutomate: true },
  ],
  FOLLOW_UP_READY: [
    { from: 'FOLLOW_UP_READY', to: 'EMAIL_SENT', action: 'Send Follow-up Email', canAutomate: false },
    { from: 'FOLLOW_UP_READY', to: 'CONVERTED', action: 'Mark as Converted', canAutomate: false },
  ],
  CONVERTED: [
    { from: 'CONVERTED', to: 'ARCHIVED', action: 'Archive After Conversion', canAutomate: true },
  ],
  REJECTED: [
    { from: 'REJECTED', to: 'ARCHIVED', action: 'Archive Rejected', canAutomate: true },
  ],
  ARCHIVED: [],
};
