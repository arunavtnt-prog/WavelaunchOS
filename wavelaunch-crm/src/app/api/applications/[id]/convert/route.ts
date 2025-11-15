import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

// POST /api/applications/[id]/convert - Convert application to client
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Application must be approved before conversion' },
        { status: 400 }
      )
    }

    if (application.convertedToClientId) {
      return NextResponse.json(
        { success: false, error: 'Application already converted to client' },
        { status: 400 }
      )
    }

    // Create client from application data
    const client = await prisma.client.create({
      data: {
        creatorName: application.fullName,
        email: application.email,
        niche: application.industryNiche,
        status: 'ACTIVE',
        
        // Map application fields to client fields
        visionStatement: application.visionForVenture,
        targetIndustry: application.industryNiche,
        targetAudience: application.targetAudience,
        demographics: JSON.stringify({
          profile: application.demographicProfile,
          age: application.targetDemographicAge,
          gender: application.audienceGenderSplit,
          marital: application.audienceMaritalStatus,
        }),
        painPoints: application.keyPainPoints,
        uniqueValueProps: application.uniqueValueProps,
        targetDemographicAge: application.targetDemographicAge,
        brandImage: application.idealBrandImage,
        brandPersonality: application.brandPersonality,
        preferredFont: application.preferredFont,
        
        // Optional fields
        professionalMilestones: application.professionalMilestones,
        personalTurningPoints: application.personalTurningPoints,
        competitiveDifferentiation: application.differentiation,
        emergingCompetitors: application.emergingCompetitors,
        inspirationBrands: application.inspirationBrands,
        brandingAesthetics: application.brandingAesthetics,
        emotionsBrandEvokes: application.emotionsBrandEvokes,
        scalingGoals: application.scalingGoals,
        growthStrategies: application.growthStrategies,
        longTermVision: application.longTermVision,
        specificDeadlines: application.specificDeadlines,
        additionalInfo: application.additionalInfo,
        currentChannels: application.currentChannels,
        audienceGenderSplit: application.audienceGenderSplit,
        audienceMaritalStatus: application.audienceMaritalStatus,
        brandValues: application.brandValues,
      },
    })

    // Update application with client ID
    await prisma.application.update({
      where: { id: params.id },
      data: {
        convertedToClientId: client.id,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'CLIENT_CREATED',
        description: `Created client from D26 application: ${client.creatorName}`,
        metadata: JSON.stringify({
          applicationId: application.id,
          clientId: client.id,
        }),
        clientId: client.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: { client, application },
      message: 'Application converted to client successfully',
    })
  } catch (error) {
    console.error('Convert application error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to convert application to client' },
      { status: 500 }
    )
  }
}
