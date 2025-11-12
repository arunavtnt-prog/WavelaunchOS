import { z } from 'zod'

export const createClientSchema = z.object({
  // Required fields
  creatorName: z.string().min(2, 'Creator name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  visionStatement: z.string().min(10, 'Vision statement must be at least 10 characters'),
  targetIndustry: z.string().min(2, 'Target industry is required'),
  targetAudience: z.string().min(10, 'Target audience description is required'),
  demographics: z.string().min(10, 'Demographics profile is required'),
  painPoints: z.string().min(10, 'Audience pain points are required'),
  uniqueValueProps: z.string().min(10, 'Unique value propositions are required'),
  targetDemographicAge: z.string().min(1, 'Target demographic age is required'),
  brandImage: z.string().min(10, 'Brand image description is required'),
  brandPersonality: z.string().min(5, 'Brand personality is required'),
  preferredFont: z.string().min(2, 'Preferred font is required'),

  // Optional fields
  brandName: z.string().max(100).optional(),
  niche: z.string().max(200).optional(),
  goals: z.string().optional(),
  socialHandles: z.string().optional(), // JSON string
  professionalMilestones: z.string().optional(),
  personalTurningPoints: z.string().optional(),
  competitiveDifferentiation: z.string().optional(),
  emergingCompetitors: z.string().optional(),
  inspirationBrands: z.string().optional(),
  brandingAesthetics: z.string().optional(),
  emotionsBrandEvokes: z.string().optional(),
  scalingGoals: z.string().optional(),
  growthStrategies: z.string().optional(),
  longTermVision: z.string().optional(),
  additionalInfo: z.string().optional(),
  specificDeadlines: z.string().optional(),
  currentChannels: z.string().optional(),
  audienceGenderSplit: z.string().optional(),
  audienceMaritalStatus: z.string().optional(),
  brandValues: z.string().optional(),
})

export const updateClientSchema = createClientSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
})

export const clientFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  niche: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['creatorName', 'onboardedAt', 'updatedAt']).default('onboardedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ClientFilterInput = z.infer<typeof clientFilterSchema>
