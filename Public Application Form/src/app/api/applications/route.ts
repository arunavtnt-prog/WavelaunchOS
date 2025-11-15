import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { applicationSchema } from '@/schemas/application'
import { sendApplicationConfirmation, sendAdminNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the data
    const validationResult = applicationSchema.safeParse(body)
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

    // Create application in database
    const application = await prisma.application.create({
      data: {
        fullName: data.fullName,
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

    // Send confirmation email to applicant
    await sendApplicationConfirmation({
      fullName: application.fullName,
      email: application.email,
      applicationId: application.id,
      industryNiche: application.industryNiche,
      instagramHandle: application.instagramHandle || undefined,
      tiktokHandle: application.tiktokHandle || undefined,
      country: application.country,
    })

    // Send notification to admin
    await sendAdminNotification({
      fullName: application.fullName,
      email: application.email,
      applicationId: application.id,
      industryNiche: application.industryNiche,
      instagramHandle: application.instagramHandle || undefined,
      tiktokHandle: application.tiktokHandle || undefined,
      country: application.country,
    })

    // Create activity log entry (optional, for tracking)
    await prisma.activity.create({
      data: {
        type: 'APPLICATION_SUBMITTED',
        description: `New application submitted by ${application.fullName}`,
        metadata: JSON.stringify({
          applicationId: application.id,
          email: application.email,
          industryNiche: application.industryNiche,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        message: 'Application submitted successfully',
      },
    })
  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit application. Please try again.',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get specific application
      const application = await prisma.application.findUnique({
        where: { id },
      })

      if (!application) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: application })
    }

    // List all applications (for admin)
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ success: true, data: applications })
  } catch (error) {
    console.error('Application retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve applications' },
      { status: 500 }
    )
  }
}
