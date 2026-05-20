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
    description: 'A few details to get started',
    fields: ['fullName', 'email', 'instagramHandle', 'tiktokHandle', 'country', 'industryNiche', 'age'],
  },
  {
    id: 2,
    title: 'Career Background',
    description: 'Your journey so far',
    fields: ['professionalMilestones', 'personalTurningPoints', 'visionForVenture', 'hopeToAchieve'],
  },
  {
    id: 3,
    title: 'Audience & Demographics',
    description: 'The people you serve',
    fields: ['targetAudience', 'demographicProfile', 'targetDemographicAge', 'audienceGenderSplit', 'audienceMaritalStatus', 'currentChannels'],
  },
  {
    id: 4,
    title: 'Audience Pain Points & Needs',
    description: 'What matters most',
    fields: ['keyPainPoints', 'brandValues'],
  },
  {
    id: 5,
    title: 'Competition & Market Understanding',
    description: 'Where you fit in',
    fields: ['differentiation', 'uniqueValueProps', 'emergingCompetitors'],
  },
  {
    id: 6,
    title: 'Brand Identity Preferences',
    description: 'How you want to be seen',
    fields: ['idealBrandImage', 'inspirationBrands', 'brandingAesthetics', 'emotionsBrandEvokes', 'brandPersonality', 'preferredFont'],
  },
  {
    id: 7,
    title: 'Product Direction',
    description: 'What you want to build',
    fields: ['productCategories', 'otherProductIdeas'],
  },
  {
    id: 8,
    title: 'Business Goals',
    description: 'What success looks like',
    fields: ['scalingGoals', 'growthStrategies', 'longTermVision', 'specificDeadlines', 'additionalInfo'],
  },
  {
    id: 9,
    title: 'Logistics',
    description: 'Final details',
    fields: ['termsAccepted'],
  },
]

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Switzerland',
  'Austria',
  'Belgium',
  'Ireland',
  'New Zealand',
  'Singapore',
  'Japan',
  'South Korea',
  'India',
  'Brazil',
  'Mexico',
  'Argentina',
  'Chile',
  'Colombia',
  'United Arab Emirates',
  'Saudi Arabia',
  'South Africa',
  'Other',
]

export const BRAND_PERSONALITIES = [
  { value: 'sophisticated-elegant', label: 'Sophisticated & Elegant' },
  { value: 'bold-daring', label: 'Bold & Daring' },
  { value: 'playful-fun', label: 'Playful & Fun' },
  { value: 'minimal-clean', label: 'Minimal & Clean' },
  { value: 'luxurious-premium', label: 'Luxurious & Premium' },
  { value: 'authentic-relatable', label: 'Authentic & Relatable' },
  { value: 'innovative-cutting-edge', label: 'Innovative & Cutting-edge' },
  { value: 'warm-friendly', label: 'Warm & Friendly' },
  { value: 'professional-trustworthy', label: 'Professional & Trustworthy' },
  { value: 'rebellious-edgy', label: 'Rebellious & Edgy' },
]

export const FONT_PREFERENCES = [
  { value: 'modern-sans', label: 'Modern Sans-serif (e.g., Helvetica, Inter)' },
  { value: 'elegant-serif', label: 'Elegant Serif (e.g., Playfair, Bodoni)' },
  { value: 'bold-display', label: 'Bold Display (e.g., Bebas, Impact)' },
  { value: 'handwritten-script', label: 'Handwritten/Script (e.g., Pacifico, Dancing Script)' },
  { value: 'geometric-clean', label: 'Geometric & Clean (e.g., Futura, Montserrat)' },
]

export const PRODUCT_CATEGORIES = [
  { value: 'beauty-cosmetics', label: 'Beauty & Cosmetics', niches: ['beauty', 'makeup', 'skincare'] },
  { value: 'fashion-apparel', label: 'Fashion & Apparel', niches: ['fashion', 'style', 'clothing'] },
  { value: 'health-wellness', label: 'Health & Wellness', niches: ['fitness', 'wellness', 'health'] },
  { value: 'supplements-nutrition', label: 'Supplements & Nutrition', niches: ['fitness', 'health', 'nutrition'] },
  { value: 'home-lifestyle', label: 'Home & Lifestyle', niches: ['home', 'lifestyle', 'decor'] },
  { value: 'tech-gadgets', label: 'Tech & Gadgets', niches: ['tech', 'technology', 'gadgets'] },
  { value: 'fitness-equipment', label: 'Fitness Equipment', niches: ['fitness', 'sports', 'gym'] },
  { value: 'jewelry-accessories', label: 'Jewelry & Accessories', niches: ['fashion', 'jewelry', 'accessories'] },
  { value: 'food-beverage', label: 'Food & Beverage', niches: ['food', 'cooking', 'culinary'] },
  { value: 'pet-products', label: 'Pet Products', niches: ['pets', 'animals'] },
  { value: 'baby-kids', label: 'Baby & Kids', niches: ['parenting', 'family', 'kids'] },
  { value: 'sports-outdoor', label: 'Sports & Outdoor', niches: ['sports', 'outdoor', 'adventure'] },
]
