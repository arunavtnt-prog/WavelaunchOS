import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/applications/[id]/convert-to-client - Convert approved application to client
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get the application
    const application = await db.application.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved applications can be converted to clients' },
        { status: 400 }
      )
    }

    // Check if already converted
    if (application.convertedToClientId) {
      return NextResponse.json(
        { error: 'This application has already been converted to a client' },
        { status: 400 }
      )
    }

    // Check if client already exists with this email
    const existingClient = await db.client.findUnique({
      where: { email: application.email },
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 400 }
      )
    }

    // Parse productCategories - handle both string and potential null
    let productCategoriesArray: string[] = []
    if (application.productCategories) {
      productCategoriesArray = application.productCategories
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0)
    }

    // Use a transaction to create client AND update application atomically
    const result = await db.$transaction(async (tx) => {
      // Create client from application data with safe defaults
      const client = await tx.client.create({
        data: {
          fullName: application.fullName,
          email: application.email,
          country: application.country,
          industryNiche: application.industryNiche,
          age: application.age ?? 0,
          instagramHandle: application.instagramHandle ?? '',
          tiktokHandle: application.tiktokHandle ?? '',
          // Career background
          professionalMilestones: application.professionalMilestones ?? '',
          personalTurningPoints: application.personalTurningPoints ?? '',
          visionForVenture: application.visionForVenture ?? '',
          hopeToAchieve: application.hopeToAchieve ?? '',
          // Audience & demographics
          targetAudience: application.targetAudience ?? '',
          demographicProfile: application.demographicProfile ?? '',
          targetDemographicAge: application.targetDemographicAge ?? '',
          audienceGenderSplit: application.audienceGenderSplit ?? '',
          audienceMaritalStatus: application.audienceMaritalStatus ?? '',
          currentChannels: application.currentChannels ?? '',
          keyPainPoints: application.keyPainPoints ?? '',
          brandValues: application.brandValues ?? '',
          // Market & category
          differentiation: application.differentiation ?? '',
          uniqueValueProps: application.uniqueValueProps ?? '',
          emergingCompetitors: application.emergingCompetitors ?? '',
          // Brand & vision
          idealBrandImage: application.idealBrandImage ?? '',
          inspirationBrands: application.inspirationBrands ?? '',
          brandingAesthetics: application.brandingAesthetics ?? '',
          emotionsBrandEvokes: application.emotionsBrandEvokes ?? '',
          brandPersonality: application.brandPersonality ?? '',
          preferredFont: application.preferredFont ?? '',
          // Product ideas
          productCategories: productCategoriesArray,
          otherProductIdeas: application.otherProductIdeas ?? '',
          // Scaling & execution
          scalingGoals: application.scalingGoals ?? '',
          growthStrategies: application.growthStrategies ?? '',
          longTermVision: application.longTermVision ?? '',
          specificDeadlines: application.specificDeadlines ?? '',
          // Additional information
          additionalInfo: application.additionalInfo ?? '',
        },
      })

      // Update application to mark as converted
      await tx.application.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          convertedToClientId: client.id,
          reviewedAt: new Date(),
        },
      })

      return client
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Application successfully converted to client'
    })

  } catch (error: unknown) {
    console.error('Error converting application to client:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = (error as { code?: string })?.code
    const errorMeta = (error as { meta?: unknown })?.meta

    // Handle specific Prisma errors
    if (errorCode === 'P2002') {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 400 }
      )
    }

    if (errorCode === 'P2025') {
      return NextResponse.json(
        { error: 'Application not found or already converted' },
        { status: 404 }
      )
    }

    // Log detailed error for debugging
    console.error('Prisma error code:', errorCode)
    console.error('Prisma error meta:', errorMeta)

    return NextResponse.json(
      { error: 'Failed to convert application to client', details: errorMessage },
      { status: 500 }
    )
  }
}
