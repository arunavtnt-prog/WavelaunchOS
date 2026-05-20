import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json()
    console.log('Creating portal users:', users.length)

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body. Expected an array of users.' },
        { status: 400 }
      )
    }

    const results = []

    for (const userData of users) {
      // Check if client already exists
      const existingClient = await prisma.client.findUnique({
        where: { email: userData.email }
      })

      if (existingClient) {
        results.push({
          email: userData.email,
          success: false,
          error: 'Client already exists'
        })
        continue
      }

      // Create client
      const client = await prisma.client.create({
        data: {
          fullName: userData.fullName || 'Test User',
          brandName: userData.brandName || 'Test Brand',
          email: userData.email,
          niche: userData.niche || 'Testing',
          status: userData.status || 'ACTIVE',
          onboardedAt: new Date(userData.onboardedAt || new Date()),
          country: 'US',
          industryNiche: userData.industryNiche || 'Testing',
          age: userData.age || 25,
          professionalMilestones: userData.professionalMilestones || '',
          personalTurningPoints: userData.personalTurningPoints || '',
          visionForVenture: userData.visionForVenture || '',
          hopeToAchieve: userData.hopeToAchieve || '',
          targetAudience: userData.targetAudience || '',
          demographicProfile: userData.demographicProfile || '',
          targetDemographicAge: userData.targetDemographicAge || '',
          audienceGenderSplit: userData.audienceGenderSplit || '',
          audienceMaritalStatus: userData.audienceMaritalStatus || '',
          currentChannels: userData.currentChannels || '',
          keyPainPoints: userData.keyPainPoints || '',
          brandValues: userData.brandValues || '',
          differentiation: userData.differentiation || '',
          uniqueValueProps: userData.uniqueValueProps || '',
          emergingCompetitors: userData.emergingCompetitors || '',
          idealBrandImage: userData.idealBrandImage || '',
          inspirationBrands: userData.inspirationBrands || '',
          brandingAesthetics: userData.brandingAesthetics || '',
          emotionsBrandEvokes: userData.emotionsBrandEvokes || '',
          brandPersonality: userData.brandPersonality || '',
          preferredFont: userData.preferredFont || '',
          productCategories: userData.productCategories || [],
          otherProductIdeas: userData.otherProductIdeas || null,
          scalingGoals: userData.scalingGoals || '',
          growthStrategies: userData.growthStrategies || '',
          longTermVision: userData.longTermVision || '',
          specificDeadlines: userData.specificDeadlines || null,
          additionalInfo: userData.additionalInfo || null
        }
      })

      // Create portal user
      const passwordHash = await hash(userData.password || 'Test1234', 12)

      const portalUser = await prisma.clientPortalUser.create({
        data: {
          clientId: client.id,
          email: userData.email,
          passwordHash: passwordHash,
          isActive: true,
          emailVerified: true,
          activatedAt: new Date(),
          invitedAt: new Date(),
          notifyNewDeliverable: true,
          notifyNewMessage: true,
          notifyMilestoneReminder: true,
          notifyWeeklySummary: false
        }
      })

      results.push({
        email: userData.email,
        success: true
      })
    }

    return NextResponse.json({
      success: true,
      data: { results }
    })
  } catch (error) {
    console.error('Error creating portal users:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred. Please try again.',
      },
      { status: 500 }
    )
  }
}
