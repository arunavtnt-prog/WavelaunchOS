import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerifiedPortalSession } from '@/lib/auth/portal-auth'
import { z } from 'zod'

const onboardingSchema = z.object({
  // Step 1: Business Basics
  niche: z.string().min(1, 'Business niche is required'),
  visionStatement: z.string().min(1, 'Vision statement is required'),
  goals: z.string().optional(),

  // Step 2: Target Audience
  targetIndustry: z.string().min(1, 'Target industry is required'),
  targetAudience: z.string().min(1, 'Target audience is required'),
  targetDemographicAge: z.string().min(1, 'Target demographic age is required'),
  demographics: z.string().min(1, 'Demographics are required'),
  audienceGenderSplit: z.string().optional(),
  audienceMaritalStatus: z.string().optional(),

  // Step 3: Value Proposition
  painPoints: z.string().min(1, 'Pain points are required'),
  uniqueValueProps: z.string().min(1, 'Unique value propositions are required'),
  competitiveDifferentiation: z.string().optional(),
  emergingCompetitors: z.string().optional(),

  // Step 4: Brand Identity
  brandImage: z.string().min(1, 'Brand image is required'),
  brandPersonality: z.string().min(1, 'Brand personality is required'),
  preferredFont: z.string().min(1, 'Preferred font is required'),
  brandValues: z.string().optional(),
  brandingAesthetics: z.string().optional(),
  emotionsBrandEvokes: z.string().optional(),
  inspirationBrands: z.string().optional(),

  // Step 5: Growth & Vision (all optional)
  scalingGoals: z.string().optional(),
  growthStrategies: z.string().optional(),
  longTermVision: z.string().optional(),
  currentChannels: z.string().optional(),
  specificDeadlines: z.string().optional(),

  // Step 6: Your Story (all optional)
  professionalMilestones: z.string().optional(),
  personalTurningPoints: z.string().optional(),
  socialHandles: z.string().optional(),
  additionalInfo: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await getVerifiedPortalSession()

    if (!auth?.portalUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = onboardingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Portal user and client are already verified by getVerifiedPortalSession
    const portalUser = auth.portalUser

    if (!portalUser.client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Check if already completed onboarding
    if (portalUser.completedOnboarding) {
      return NextResponse.json(
        { success: false, error: 'Onboarding already completed' },
        { status: 400 }
      )
    }

    // Wrap all database operations in a transaction for atomicity
    const updatedClient = await prisma.$transaction(async (tx) => {
      // Update client with onboarding data
      const client = await tx.client.update({
        where: { id: portalUser.clientId },
        data: {
          // Required fields
          niche: data.niche,
          visionStatement: data.visionStatement,
          targetIndustry: data.targetIndustry,
          targetAudience: data.targetAudience,
          targetDemographicAge: data.targetDemographicAge,
          demographics: data.demographics,
          painPoints: data.painPoints,
          uniqueValueProps: data.uniqueValueProps,
          brandImage: data.brandImage,
          brandPersonality: data.brandPersonality,
          preferredFont: data.preferredFont,

          // Optional fields (only update if provided)
          ...(data.goals && { goals: data.goals }),
          ...(data.audienceGenderSplit && { audienceGenderSplit: data.audienceGenderSplit }),
          ...(data.audienceMaritalStatus && { audienceMaritalStatus: data.audienceMaritalStatus }),
          ...(data.competitiveDifferentiation && { competitiveDifferentiation: data.competitiveDifferentiation }),
          ...(data.emergingCompetitors && { emergingCompetitors: data.emergingCompetitors }),
          ...(data.brandValues && { brandValues: data.brandValues }),
          ...(data.brandingAesthetics && { brandingAesthetics: data.brandingAesthetics }),
          ...(data.emotionsBrandEvokes && { emotionsBrandEvokes: data.emotionsBrandEvokes }),
          ...(data.inspirationBrands && { inspirationBrands: data.inspirationBrands }),
          ...(data.scalingGoals && { scalingGoals: data.scalingGoals }),
          ...(data.growthStrategies && { growthStrategies: data.growthStrategies }),
          ...(data.longTermVision && { longTermVision: data.longTermVision }),
          ...(data.currentChannels && { currentChannels: data.currentChannels }),
          ...(data.specificDeadlines && { specificDeadlines: data.specificDeadlines }),
          ...(data.professionalMilestones && { professionalMilestones: data.professionalMilestones }),
          ...(data.personalTurningPoints && { personalTurningPoints: data.personalTurningPoints }),
          ...(data.socialHandles && { socialHandles: data.socialHandles }),
          ...(data.additionalInfo && { additionalInfo: data.additionalInfo }),
        },
      })

      // Mark onboarding as completed on portal user
      await tx.clientPortalUser.update({
        where: { id: auth.session.userId },
        data: {
          completedOnboarding: true,
          onboardingCompletedAt: new Date(),
        },
      })

      // Log activity
      await tx.activity.create({
        data: {
          clientId: portalUser.clientId,
          type: 'CLIENT_UPDATED',
          description: `Client completed onboarding questionnaire: ${portalUser.email}`,
        },
      })

      // Create welcome notification for client
      await tx.portalNotification.create({
        data: {
          clientUserId: auth.session.userId,
          type: 'ACCOUNT_UPDATE',
          title: '🎉 Welcome to Wavelaunch!',
          message: 'Your onboarding is complete! Our team is reviewing your information and will create your personalized business plan soon.',
          actionUrl: '/portal/dashboard',
        },
      })

      return client
    })

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        clientId: updatedClient.id,
      },
    })
  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
