import { z } from 'zod'

export const applicationSchema = z.object({
  // Basic Information
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  country: z.string().optional(),
  industryNiche: z.string().optional(),
  age: z.number().optional(),

  // Career Background
  professionalMilestones: z.string().optional(),
  personalTurningPoints: z.string().optional(),
  visionForVenture: z.string().optional(),
  hopeToAchieve: z.string().optional(),

  // Audience & Demographics
  targetAudience: z.string().optional(),
  demographicProfile: z.string().optional(),
  targetDemographicAge: z.string().optional(),
  audienceGenderSplit: z.string().optional(),
  audienceMaritalStatus: z.string().optional(),
  currentChannels: z.string().optional(),

  // Audience Pain Points & Needs
  keyPainPoints: z.string().optional(),
  brandValues: z.string().optional(),

  // Competition & Market Understanding
  differentiation: z.string().optional(),
  uniqueValueProps: z.string().optional(),
  emergingCompetitors: z.string().optional(),

  // Brand Identity Preferences
  idealBrandImage: z.string().optional(),
  inspirationBrands: z.string().optional(),
  brandingAesthetics: z.string().optional(),
  emotionsBrandEvokes: z.string().optional(),
  brandPersonality: z.string().optional(),
  preferredFont: z.string().optional(),

  // Product Direction
  productCategories: z.array(z.string()).optional(),
  otherProductIdeas: z.string().optional(),

  // Business Goals
  scalingGoals: z.string().optional(),
  growthStrategies: z.string().optional(),
  longTermVision: z.string().optional(),
  specificDeadlines: z.string().optional(),
  additionalInfo: z.string().optional(),

  // Logistics
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and privacy policy',
  }),
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

export const stepSchemas = {
  basicInfo: applicationSchema.pick({
    fullName: true,
    email: true,
    instagramHandle: true,
    tiktokHandle: true,
    country: true,
    industryNiche: true,
    age: true,
  }),

  careerBackground: applicationSchema.pick({
    professionalMilestones: true,
    personalTurningPoints: true,
    visionForVenture: true,
    hopeToAchieve: true,
  }),

  audienceDemographics: applicationSchema.pick({
    targetAudience: true,
    demographicProfile: true,
    targetDemographicAge: true,
    audienceGenderSplit: true,
    audienceMaritalStatus: true,
    currentChannels: true,
  }),

  painPoints: applicationSchema.pick({
    keyPainPoints: true,
    brandValues: true,
  }),

  competition: applicationSchema.pick({
    differentiation: true,
    uniqueValueProps: true,
    emergingCompetitors: true,
  }),

  brandIdentity: applicationSchema.pick({
    idealBrandImage: true,
    inspirationBrands: true,
    brandingAesthetics: true,
    emotionsBrandEvokes: true,
    brandPersonality: true,
    preferredFont: true,
  }),

  productDirection: applicationSchema.pick({
    productCategories: true,
    otherProductIdeas: true,
  }),

  businessGoals: applicationSchema.pick({
    scalingGoals: true,
    growthStrategies: true,
    longTermVision: true,
    specificDeadlines: true,
    additionalInfo: true,
  }),

  logistics: applicationSchema.pick({
    termsAccepted: true,
  }),
}
