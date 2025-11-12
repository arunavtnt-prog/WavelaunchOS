// System Limits
export const MAX_CLIENTS = 100
export const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10')
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const STORAGE_LIMIT_GB = parseInt(process.env.STORAGE_LIMIT_GB || '50')
export const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_GB * 1024 * 1024 * 1024
export const STORAGE_WARNING_THRESHOLD = 0.8 // 80%

// Auto-save Intervals
export const AUTO_SAVE_INTERVAL_MS = 30000 // 30 seconds
export const DASHBOARD_REFRESH_INTERVAL_MS = 300000 // 5 minutes

// Job Queue
export const MAX_JOB_RETRIES = 3
export const JOB_RETRY_DELAYS = [2000, 4000, 8000] // Exponential backoff in ms

// Backup
export const BACKUP_RETENTION_DAYS = 30
export const BACKUP_SCHEDULE_TIME = '02:00' // 2 AM

// Claude API
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
export const CLAUDE_MAX_TOKENS = 8000
export const CLAUDE_TIMEOUT_MS = 120000 // 2 minutes

// PDF Quality
export const PDF_QUALITY_DRAFT_DPI = 150
export const PDF_QUALITY_FINAL_DPI = 300

// Month Labels for Deliverables
export const DELIVERABLE_MONTHS = [
  { number: 1, title: 'Month 1: Foundation Excellence' },
  { number: 2, title: 'Month 2: Brand Readiness & Productization' },
  { number: 3, title: 'Month 3: Market Entry Preparation' },
  { number: 4, title: 'Month 4: Sales Engine & Launch Infrastructure' },
  { number: 5, title: 'Month 5: Pre-Launch Mastery' },
  { number: 6, title: 'Month 6: Soft Launch Execution' },
  { number: 7, title: 'Month 7: Scaling & Growth Systems' },
  { number: 8, title: 'Month 8: Full Launch & Market Domination' },
] as const

// File Categories
export const FILE_CATEGORIES = [
  'BUSINESS_PLAN',
  'DELIVERABLE',
  'UPLOAD',
  'MISC',
] as const

// Activity Event Types
export const ACTIVITY_TYPES = {
  CLIENT_CREATED: 'Created client',
  CLIENT_UPDATED: 'Updated client',
  CLIENT_DELETED: 'Deleted client',
  BUSINESS_PLAN_GENERATED: 'Generated business plan',
  BUSINESS_PLAN_UPDATED: 'Updated business plan',
  BUSINESS_PLAN_APPROVED: 'Approved business plan',
  BUSINESS_PLAN_DELIVERED: 'Delivered business plan',
  DELIVERABLE_GENERATED: 'Generated deliverable',
  DELIVERABLE_UPDATED: 'Updated deliverable',
  DELIVERABLE_APPROVED: 'Approved deliverable',
  DELIVERABLE_DELIVERED: 'Delivered deliverable',
  FILE_UPLOADED: 'Uploaded file',
  FILE_DELETED: 'Deleted file',
  NOTE_CREATED: 'Created note',
  NOTE_UPDATED: 'Updated note',
  NOTE_DELETED: 'Deleted note',
  BACKUP_CREATED: 'Created backup',
  BACKUP_RESTORED: 'Restored backup',
} as const
