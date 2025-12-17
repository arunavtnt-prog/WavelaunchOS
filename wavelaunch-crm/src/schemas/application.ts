import { z } from 'zod'

export const applicationSchema = z.object({
  // Basic Information
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  country: z.string().min(2, 'Please select a country'),
  industryNiche: z.string().min(2, 'Please enter your industry/niche'),
  age: z.number().min(18, 'You must be at least 18 years old').max(100, 'Invalid age'),

  // Career Background
  professionalMilestones: z.string().min(10, 'Please provide more details (at least 10 characters)'),
  personalTurningPoints: z.string().min(10, 'Please provide more details (at least 10 characters)'),
  visionForVenture: z.string().min(10, 'Please provide more details (at least 10 characters)'),
  hopeToAchieve: z.string().min(10, 'Please provide more details (at least 10 characters)'),

  // Audience & Demographics
  targetAudience: z.string().min(10, 'Please describe your target audience'),
  demographicProfile: z.string().min(10, 'Please describe demographic profile'),
  targetDemographicAge: z.string().min(1, 'Please specify age range'),
  audienceGenderSplit: z.string().min(1, 'Please specify gender split'),
  audienceMaritalStatus: z.string().min(1, 'Please specify marital status'),
  currentChannels: z.string().min(10, 'Please describe how your audience finds you'),

  // Audience Pain Points & Needs
  keyPainPoints: z.string().min(10, 'Please describe key pain points'),
  brandValues: z.string().min(10, 'Please describe brand values'),

  // Competition & Market Understanding
  differentiation: z.string().min(10, 'Please describe how you plan to differentiate'),
  uniqueValueProps: z.string().min(10, 'Please describe your unique value propositions'),
  emergingCompetitors: z.string().min(5, 'Please list competitors you monitor'),

  // Brand Identity Preferences
  idealBrandImage: z.string().min(10, 'Please describe your ideal brand image'),
  inspirationBrands: z.string().min(5, 'Please list influencers/brands you admire'),
  brandingAesthetics: z.string().min(10, 'Please describe branding aesthetics'),
  emotionsBrandEvokes: z.string().min(5, 'Please list emotions/adjectives'),
  brandPersonality: z.string().min(3, 'Please select brand personality'),
  preferredFont: z.string().min(2, 'Please select a font preference'),

  // Product Direction
  productCategories: z.array(z.string()).min(1, 'Please select at least one product category'),
  otherProductIdeas: z.string().optional(),

  // Business Goals
  scalingGoals: z.string().min(10, 'Please describe your scaling goals'),
  growthStrategies: z.string().min(10, 'Please describe growth strategies'),
  longTermVision: z.string().min(10, 'Please describe your long-term vision'),
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
