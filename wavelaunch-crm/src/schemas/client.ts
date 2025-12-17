import { z } from 'zod'

export const createClientSchema = z.object({
  // Required fields
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  visionForVenture: z.string().min(10, 'Vision for venture must be at least 10 characters'),
  targetAudience: z.string().min(10, 'Target audience description is required'),
  demographicProfile: z.string().min(10, 'Demographics profile is required'),
  keyPainPoints: z.string().min(10, 'Audience pain points are required'),
  uniqueValueProps: z.string().min(10, 'Unique value propositions are required'),
  targetDemographicAge: z.string().min(1, 'Target demographic age is required'),
  idealBrandImage: z.string().min(10, 'Brand image description is required'),
  brandPersonality: z.string().min(5, 'Brand personality is required'),
  preferredFont: z.string().min(2, 'Preferred font is required'),
  industryNiche: z.string().min(2, 'Industry niche is required'),
  age: z.number().min(1, 'Age is required'),
  country: z.string().min(2, 'Country is required'),
  professionalMilestones: z.string().min(10, 'Professional milestones are required'),
  personalTurningPoints: z.string().min(10, 'Personal turning points are required'),
  hopeToAchieve: z.string().min(10, 'What you hope to achieve is required'),
  currentChannels: z.string().min(2, 'Current channels are required'),
  brandValues: z.string().min(5, 'Brand values are required'),
  scalingGoals: z.string().min(5, 'Scaling goals are required'),
  longTermVision: z.string().min(10, 'Long term vision is required'),
  brandingAesthetics: z.string().min(5, 'Branding aesthetics is required'),

  // Optional fields
  instagramHandle: z.string().max(100).optional(),
  tiktokHandle: z.string().max(100).optional(),
  audienceGenderSplit: z.string().optional(),
  audienceMaritalStatus: z.string().optional(),
  otherProductIdeas: z.string().optional(),
  emergingCompetitors: z.string().optional(),
  inspirationBrands: z.string().optional(),
  emotionsBrandEvokes: z.string().optional(),
  growthStrategies: z.string().optional(),
  additionalInfo: z.string().optional(),
  specificDeadlines: z.string().optional(),
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
  sortBy: z.enum(['fullName', 'onboardedAt', 'updatedAt']).default('onboardedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ClientFilterInput = z.infer<typeof clientFilterSchema>
