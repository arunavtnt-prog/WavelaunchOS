import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema for external application submission
const externalApplicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  country: z.string().min(2),
  industryNiche: z.string().min(2),
  age: z.number().min(16).max(100),
  professionalMilestones: z.string().min(10),
  personalTurningPoints: z.string().min(10),
  visionForVenture: z.string().min(10),
  hopeToAchieve: z.string().min(10),
  targetAudience: z.string().min(10),
  demographicProfile: z.string().min(10),
  targetDemographicAge: z.string(),
  audienceGenderSplit: z.string(),
  audienceMaritalStatus: z.string().optional(),
  currentChannels: z.string(),
  keyPainPoints: z.string().min(10),
  brandValues: z.string().min(10),
  differentiation: z.string().min(10),
  uniqueValueProps: z.string().min(10),
  emergingCompetitors: z.string().optional(),
  idealBrandImage: z.string().min(10),
  inspirationBrands: z.string().optional(),
  brandingAesthetics: z.string().min(10),
  emotionsBrandEvokes: z.string().optional(),
  brandPersonality: z.string().min(10),
  preferredFont: z.string().optional(),
  productCategories: z.array(z.string()),
  otherProductIdeas: z.string().optional(),
  scalingGoals: z.string().min(10),
  growthStrategies: z.string().min(10),
  longTermVision: z.string().min(10),
  specificDeadlines: z.string().optional(),
  additionalInfo: z.string().optional(),
  termsAccepted: z.boolean().default(true),
})

// Simple token authentication for external requests
function authenticateRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.EXTERNAL_API_TOKEN
  
  if (!expectedToken) {
    console.warn('EXTERNAL_API_TOKEN not configured')
    return false
  }
  
  return authHeader === `Bearer ${expectedToken}`
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate the data
    const validationResult = externalApplicationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if application already exists for this email
    const existingApplication = await prisma.application.findFirst({
      where: { email: data.email }
    })

    if (existingApplication) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Application already exists for this email',
          applicationId: existingApplication.id 
        },
        { status: 409 }
      )
    }

    // Create application in CRM database
    const application = await prisma.application.create({
      data: {
        name: data.name,
        email: data.email,
        instagramHandle: data.instagramHandle,
        tiktokHandle: data.tiktokHandle,
        country: data.country,
        industryNiche: data.industryNiche,
        age: data.age,
        professionalMilestones: data.professionalMilestones,
        personalTurningPoints: data.personalTurningPoints,
        visionForVenture: data.visionForVenture,
        hopeToAchieve: data.hopeToAchieve,
        targetAudience: data.targetAudience,
        demographicProfile: data.demographicProfile,
        targetDemographicAge: data.targetDemographicAge,
        audienceGenderSplit: data.audienceGenderSplit,
        audienceMaritalStatus: data.audienceMaritalStatus,
        currentChannels: data.currentChannels,
        keyPainPoints: data.keyPainPoints,
        brandValues: data.brandValues,
        differentiation: data.differentiation,
        uniqueValueProps: data.uniqueValueProps,
        emergingCompetitors: data.emergingCompetitors,
        idealBrandImage: data.idealBrandImage,
        inspirationBrands: data.inspirationBrands,
        brandingAesthetics: data.brandingAesthetics,
        emotionsBrandEvokes: data.emotionsBrandEvokes,
        brandPersonality: data.brandPersonality,
        preferredFont: data.preferredFont,
        productCategories: JSON.stringify(data.productCategories),
        otherProductIdeas: data.otherProductIdeas,
        scalingGoals: data.scalingGoals,
        growthStrategies: data.growthStrategies,
        longTermVision: data.longTermVision,
        specificDeadlines: data.specificDeadlines,
        additionalInfo: data.additionalInfo,
        termsAccepted: data.termsAccepted,
        status: 'PENDING',
      },
    })

    // Create activity log entry
    await prisma.activity.create({
      data: {
        type: 'CLIENT_CREATED',
        description: `External application submitted by ${application.name}`,
        metadata: JSON.stringify({
          source: 'public_form',
          applicationId: application.id,
          email: application.email,
          industryNiche: application.industryNiche,
        }),
      },
    })

    console.log(`External application received: ${application.id} - ${application.email}`)

    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        message: 'Application submitted successfully to CRM',
      },
    })
  } catch (error) {
    console.error('External application submission error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit application to CRM',
      },
      { status: 500 }
    )
  }
}
