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
