import {
  User,
  Client,
  BusinessPlan,
  Deliverable,
  File,
  Note,
  Activity,
  Job,
  PromptTemplate,
  BackupLog,
  Settings,
  Role,
  ClientStatus,
  DocumentStatus,
  DeliverableType,
  FileCategory,
  PromptTemplateType,
  JobType,
  JobStatus,
  ActivityType,
  BackupStatus
} from '@prisma/client'

// Re-export Prisma types
export type {
  User,
  Client,
  BusinessPlan,
  Deliverable,
  File,
  Note,
  Activity,
  Job,
  PromptTemplate,
  BackupLog,
  Settings,
}

// Re-export enums
export {
  Role,
  ClientStatus,
  DocumentStatus,
  DeliverableType,
  FileCategory,
  PromptTemplateType,
  JobType,
  JobStatus,
  ActivityType,
  BackupStatus,
}

// Custom types
export interface JobResult<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// Extended types with relations
export type ClientWithRelations = Client & {
  businessPlans: BusinessPlan[]
  deliverables: Deliverable[]
  files: File[]
  notes: Note[]
  activities: Activity[]
  _count?: {
    businessPlans: number
    deliverables: number
    files: number
    notes: number
  }
}

export type BusinessPlanWithRelations = BusinessPlan & {
  client: Client
  generatedByUser: User
}

export type DeliverableWithRelations = Deliverable & {
  client: Client
  generatedByUser: User
  parent?: Deliverable
  subdocuments: Deliverable[]
}

export type FileWithRelations = File & {
  client?: Client
  uploadedByUser: User
}

export type NoteWithRelations = Note & {
  client: Client
  author: User
}

export type ActivityWithRelations = Activity & {
  client?: Client
  user?: User
}

// API Response Types
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface FormStep {
  id: number
  title: string
  description: string
  fields: string[]
}

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: 'Basic Information',
    description: 'Tell us about yourself and your background',
    fields: ['fullName', 'email', 'instagramHandle', 'tiktokHandle', 'country', 'industryNiche', 'age'],
  },
  {
    id: 2,
    title: 'Career Background',
    description: 'Share your professional journey and vision',
    fields: ['professionalMilestones', 'personalTurningPoints', 'visionForVenture', 'hopeToAchieve'],
  },
  {
    id: 3,
    title: 'Audience & Demographics',
    description: 'Help us understand your target audience',
    fields: ['targetAudience', 'demographicProfile', 'targetDemographicAge', 'audienceGenderSplit', 'audienceMaritalStatus', 'currentChannels'],
  },
  {
    id: 4,
    title: 'Audience Pain Points & Needs',
    description: 'Identify the problems you want to solve',
    fields: ['keyPainPoints', 'brandValues'],
  },
  {
    id: 5,
    title: 'Competition & Market Understanding',
    description: 'Show us your market knowledge',
    fields: ['differentiation', 'uniqueValueProps', 'emergingCompetitors'],
  },
  {
    id: 6,
    title: 'Brand Identity Preferences',
    description: 'Define your brand vision and aesthetic',
    fields: ['idealBrandImage', 'inspirationBrands', 'brandingAesthetics', 'emotionsBrandEvokes', 'brandPersonality', 'preferredFont'],
  },
  {
    id: 7,
    title: 'Product Direction',
    description: 'Explore product opportunities',
    fields: ['productCategories', 'otherProductIdeas'],
  },
  {
    id: 8,
    title: 'Business Goals',
    description: 'Share your vision for growth and success',
    fields: ['scalingGoals', 'growthStrategies', 'longTermVision', 'specificDeadlines', 'additionalInfo'],
  },
  {
    id: 9,
    title: 'Logistics',
    description: 'Upload documents and accept terms',
    fields: ['termsAccepted'],
  },
]

export interface OnboardingFormData {
  // Required
  creatorName: string
  email: string
  visionStatement: string
  targetIndustry: string
  targetAudience: string
  demographics: string
  painPoints: string
  uniqueValueProps: string
  targetDemographicAge: string
  brandImage: string
  brandPersonality: string
  preferredFont: string

  // Optional
  brandName?: string
  niche?: string
  goals?: string
  socialHandles?: string
  professionalMilestones?: string
  personalTurningPoints?: string
  competitiveDifferentiation?: string
  emergingCompetitors?: string
  inspirationBrands?: string
  brandingAesthetics?: string
  emotionsBrandEvokes?: string
  scalingGoals?: string
  growthStrategies?: string
  longTermVision?: string
  additionalInfo?: string
  specificDeadlines?: string
  currentChannels?: string
  audienceGenderSplit?: string
  audienceMaritalStatus?: string
  brandValues?: string
}

// Job Payload Types
export type GenerateBusinessPlanPayload = {
  clientId: string
  userId: string
}

export type GenerateDeliverablePayload = {
  clientId: string
  month: number
  userId: string
}

export type GeneratePDFPayload = {
  type: 'business-plan' | 'deliverable'
  id: string
  quality: 'draft' | 'final'
}

export type BackupPayload = {
  manual: boolean
  userId?: string
}

// Analytics Types
export type AdminAnalytics = {
  clientCount: number
  activeClients: number
  pendingDeliverables: number
  storageUsed: number
  storageLimit: number
  recentActivity: ActivityWithRelations[]
  clientProgress: {
    clientId: string
    clientName: string
    businessPlanStatus: DocumentStatus | null
    deliverablesCompleted: number
    totalDeliverables: number
  }[]
}

export type ClientAnalytics = {
  client: Client
  businessPlanStatus: DocumentStatus | null
  deliverablesCompleted: number
  totalFiles: number
  totalNotes: number
  recentActivity: Activity[]
}

// Settings Types
export type AppSettings = {
  claudeApiKey?: string
  resendApiKey?: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPass?: string
  smtpFrom?: string
  emailNotifications?: boolean
  backupEnabled?: boolean
}

// Next Steps Types
export type NextStep = {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action: string
  clientId?: string
}
