import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/applications/[id]/convert-to-client - Convert approved application to client
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Convert to client request for application ID:', params.id)
    
    // Get the application
    const application = await db.application.findUnique({
      where: { id: params.id },
    })

    console.log('Found application:', application?.id, 'Status:', application?.status)

    if (!application) {
      console.log('Application not found')
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'APPROVED') {
      console.log('Application not approved, status:', application.status)
      return NextResponse.json(
        { error: 'Only approved applications can be converted to clients' },
        { status: 400 }
      )
    }

    // Check if client already exists with this email
    const existingClient = await db.client.findUnique({
      where: { email: application.email },
    })

    console.log('Existing client check:', existingClient?.email)

    if (existingClient) {
      console.log('Client already exists with this email')
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 400 }
      )
    }

    console.log('Creating client from application data...')
    // Create client from application data
    const client = await db.client.create({
      data: {
        fullName: application.fullName,
        email: application.email,
        // Map application fields to client fields
        country: application.country,
        industryNiche: application.industryNiche,
        // Basic info
        age: application.age || 0,
        instagramHandle: application.instagramHandle || '',
        tiktokHandle: application.tiktokHandle || '',
        // Career background
        professionalMilestones: application.professionalMilestones,
        personalTurningPoints: application.personalTurningPoints,
        visionForVenture: application.visionForVenture,
        hopeToAchieve: application.hopeToAchieve,
        // Audience & demographics
        targetAudience: application.targetAudience,
        demographicProfile: application.demographicProfile,
        targetDemographicAge: application.targetDemographicAge || '',
        audienceGenderSplit: application.audienceGenderSplit || '',
        audienceMaritalStatus: application.audienceMaritalStatus || '',
        currentChannels: application.currentChannels,
        keyPainPoints: application.keyPainPoints,
        brandValues: application.brandValues,
        // Market & category
        differentiation: application.differentiation,
        uniqueValueProps: application.uniqueValueProps,
        emergingCompetitors: application.emergingCompetitors || '',
        // Brand & vision
        idealBrandImage: application.idealBrandImage,
        inspirationBrands: application.inspirationBrands || '',
        brandingAesthetics: application.brandingAesthetics,
        emotionsBrandEvokes: application.emotionsBrandEvokes || '',
        brandPersonality: application.brandPersonality,
        preferredFont: application.preferredFont || '',
        // Product ideas
        productCategories: application.productCategories.split(',').map(cat => cat.trim()),
        otherProductIdeas: application.otherProductIdeas || '',
        // Scaling & execution
        scalingGoals: application.scalingGoals,
        growthStrategies: application.growthStrategies || '',
        longTermVision: application.longTermVision,
        specificDeadlines: application.specificDeadlines || '',
        // Additional information
        additionalInfo: application.additionalInfo || '',
      },
    })

    console.log('Client created successfully:', client.id, client.fullName)

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Application successfully converted to client'
    })

  } catch (error: unknown) {
    console.error('Error converting application to client:', error)
    
    // Type guard to safely access error properties
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorCode = (error as any)?.code
    const errorMeta = (error as any)?.meta
    const errorName = (error as any)?.name
    
    console.error('Error details:', errorMessage)
    if (errorStack) console.error('Error stack:', errorStack)
    
    // Check for specific database errors
    if (errorCode === 'P2002') {
      console.error('Unique constraint violation:', errorMeta)
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 400 }
      )
    }
    
    if (errorCode === 'P2025') {
      console.error('Record not found:', errorMeta)
      return NextResponse.json(
        { error: 'Application not found or already converted' },
        { status: 404 }
      )
    }
    
    // Check for Prisma validation errors
    if (errorName === 'PrismaClientValidationError') {
      console.error('Prisma validation error:', errorMessage)
      return NextResponse.json(
        { error: 'Database schema mismatch. Please check field mappings.', details: errorMessage },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to convert application to client', details: errorMessage },
      { status: 500 }
    )
  }
}
