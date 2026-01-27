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
        instagramHandle: data.instagramHandle || null,
        tiktokHandle: data.tiktokHandle || null,
        country: data.country || '',
        industryNiche: data.industryNiche || '',
        age: data.age || 0,
        professionalMilestones: data.professionalMilestones || '',
        personalTurningPoints: data.personalTurningPoints || '',
        visionForVenture: data.visionForVenture || '',
        hopeToAchieve: data.hopeToAchieve || '',
        targetAudience: data.targetAudience || '',
        demographicProfile: data.demographicProfile || '',
        targetDemographicAge: data.targetDemographicAge || '',
        audienceGenderSplit: data.audienceGenderSplit || '',
        audienceMaritalStatus: data.audienceMaritalStatus || '',
        currentChannels: data.currentChannels || '',
        keyPainPoints: data.keyPainPoints || '',
        brandValues: data.brandValues || '',
        differentiation: data.differentiation || '',
        uniqueValueProps: data.uniqueValueProps || '',
        emergingCompetitors: data.emergingCompetitors || '',
        idealBrandImage: data.idealBrandImage || '',
        inspirationBrands: data.inspirationBrands || '',
        brandingAesthetics: data.brandingAesthetics || '',
        emotionsBrandEvokes: data.emotionsBrandEvokes || '',
        brandPersonality: data.brandPersonality || '',
        preferredFont: data.preferredFont || '',
        productCategories: JSON.stringify(data.productCategories || []),
        otherProductIdeas: data.otherProductIdeas || null,
        scalingGoals: data.scalingGoals || '',
        growthStrategies: data.growthStrategies || '',
        longTermVision: data.longTermVision || '',
        specificDeadlines: data.specificDeadlines || null,
        additionalInfo: data.additionalInfo || null,
        termsAccepted: data.termsAccepted,
        status: 'PENDING',
        // File metadata
        zipFilePath: data.zipFilePath || null,
        zipFileName: data.zipFileName || null,
        zipFileSize: data.zipFileSize || null,
      },
    })

    // Helper function to convert empty strings to undefined
const emptyToUndefined = (value: string | null | undefined): string | undefined => {
  if (!value || value === '') return undefined
  return value
}

    // Send confirmation email to applicant
    await sendApplicationConfirmation({
      fullName: application.fullName,
      email: application.email,
      applicationId: application.id,
      industryNiche: emptyToUndefined(application.industryNiche),
      instagramHandle: emptyToUndefined(application.instagramHandle),
      tiktokHandle: emptyToUndefined(application.tiktokHandle),
      country: emptyToUndefined(application.country),
    })

    // Send notification to admin
    await sendAdminNotification({
      fullName: application.fullName,
      email: application.email,
      applicationId: application.id,
      industryNiche: emptyToUndefined(application.industryNiche),
      instagramHandle: emptyToUndefined(application.instagramHandle),
      tiktokHandle: emptyToUndefined(application.tiktokHandle),
      country: emptyToUndefined(application.country),
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

    // Sync to Google Sheets (Non-blocking)
    syncToGoogleSheets(application).catch(console.error)

    // Sync to CRM backend (Non-blocking)
    syncToCRM(application).catch(console.error)

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

async function syncToGoogleSheets(data: any) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.error('Failed to sync to Google Sheets:', error)
    // Do not throw, so we don't fail the submission
  }
}

async function syncToCRM(data: any) {
  const crmApiUrl = process.env.CRM_API_URL
  const crmApiToken = process.env.CRM_API_TOKEN
  
  if (!crmApiUrl || !crmApiToken) {
    console.warn('CRM API configuration missing')
    return
  }

  try {
    const response = await fetch(crmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${crmApiToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('CRM sync failed:', response.status, errorData)
      return
    }

    const result = await response.json()
    console.log('CRM sync successful:', result)
  } catch (error) {
    console.error('Failed to sync to CRM:', error)
    // Do not throw, so we don't fail the submission
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
