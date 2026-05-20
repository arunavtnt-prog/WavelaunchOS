import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { emailService } from '@/lib/email/service'

// CORS configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_CORS_ORIGINS
  ? process.env.ALLOWED_CORS_ORIGINS.split(',').map(s => s.trim())
  : [
    'https://apply.wavelaunch.org',
    'https://login.wavelaunch.org',
    'http://localhost:3000',
    'http://localhost:3001',
  ]


function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}

// Validation schema for public application submission
const applicationSchema = z.object({
  // Basic Information
  fullName: z.string().min(1, 'Full name is required'),
  name: z.string().optional(), // Alternative field name
  email: z.string().email('Invalid email format'),
  instagramHandle: z.string().optional().default(''),
  tiktokHandle: z.string().optional().default(''),
  country: z.string().min(1, 'Country is required'),
  industryNiche: z.string().min(1, 'Industry/niche is required'),
  age: z.coerce.number().min(18, 'Must be 18 or older'),

  // Career Background
  professionalMilestones: z.string().min(1, 'Professional milestones is required'),
  personalTurningPoints: z.string().min(1, 'Personal turning points is required'),
  visionForVenture: z.string().min(1, 'Vision for venture is required'),
  hopeToAchieve: z.string().min(1, 'What you hope to achieve is required'),

  // Audience & Demographics
  targetAudience: z.string().min(1, 'Target audience is required'),
  demographicProfile: z.string().min(1, 'Demographic profile is required'),
  targetDemographicAge: z.string().min(1, 'Target demographic age is required'),
  audienceGenderSplit: z.string().min(1, 'Audience gender split is required'),
  audienceMaritalStatus: z.string().optional().default(''),
  currentChannels: z.string().min(1, 'Current channels is required'),

  // Pain Points & Values
  keyPainPoints: z.string().min(1, 'Key pain points is required'),
  brandValues: z.string().min(1, 'Brand values is required'),

  // Competition & Market
  differentiation: z.string().min(1, 'Differentiation is required'),
  uniqueValueProps: z.string().min(1, 'Unique value props is required'),
  emergingCompetitors: z.string().optional().default(''),

  // Brand Identity
  idealBrandImage: z.string().min(1, 'Ideal brand image is required'),
  inspirationBrands: z.string().optional().default(''),
  brandingAesthetics: z.string().min(1, 'Branding aesthetics is required'),
  emotionsBrandEvokes: z.string().optional().default(''),
  brandPersonality: z.string().min(1, 'Brand personality is required'),
  preferredFont: z.string().optional().default(''),

  // Products & Goals
  productCategories: z.union([
    z.array(z.string()),
    z.string().transform((val) => {
      try {
        return JSON.parse(val)
      } catch {
        return val.split(',').map(s => s.trim()).filter(Boolean)
      }
    }),
  ]).default([]),
  otherProductIdeas: z.string().optional().default(''),
  scalingGoals: z.string().min(1, 'Scaling goals is required'),
  growthStrategies: z.string().optional().default(''),
  longTermVision: z.string().min(1, 'Long-term vision is required'),
  specificDeadlines: z.string().optional().default(''),
  additionalInfo: z.string().optional().default(''),

  // Terms
  termsAccepted: z.union([
    z.boolean(),
    z.string().transform(val => val === 'true'),
  ]).default(false),

  // File metadata (optional)
  zipFilePath: z.string().optional(),
  zipFileName: z.string().optional(),
  zipFileSize: z.number().optional(),
})

// GET /api/applications - Get all applications
// Note: Auth disabled for now since User table doesn't exist in database
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  try {
    const applications = await prisma.application.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(
      { success: true, data: applications },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Fetch applications error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST /api/applications - Public endpoint for application submission
// Cache cleared: $(date)
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  try {
    // Parse request body (JSON or FormData)
    let data: Record<string, unknown>
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      data = await request.json()
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      data = {}
      formData.forEach((value, key) => {
        if (typeof value === 'string') {
          data[key] = value
        }
      })
    } else {
      // Try JSON first, fall back to text
      try {
        data = await request.json()
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid content type. Use application/json or multipart/form-data' },
          { status: 400, headers: corsHeaders }
        )
      }
    }

    // Normalize field names (support both 'name' and 'fullName')
    if (data.fullName && !data.name) {
      data.name = data.fullName
    } else if (data.name && !data.fullName) {
      data.fullName = data.name
    }

    // Validate the data
    const validationResult = applicationSchema.safeParse(data)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((e: any) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      return NextResponse.json(
        { success: false, error: `Validation failed: ${errorMessages}` },
        { status: 400, headers: corsHeaders }
      )
    }

    const validatedData = validationResult.data

    // Check if terms were accepted
    if (!validatedData.termsAccepted) {
      return NextResponse.json(
        { success: false, error: 'You must accept the terms and conditions' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check for duplicate email
    const existingApplication = await prisma.application.findFirst({
      where: { email: validatedData.email },
    })

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'An application with this email already exists' },
        { status: 409, headers: corsHeaders }
      )
    }

    // Create the application in the database
    const application = await prisma.application.create({
      data: {
        fullName: validatedData.fullName || validatedData.name || '',
        email: validatedData.email,
        instagramHandle: validatedData.instagramHandle || null,
        tiktokHandle: validatedData.tiktokHandle || null,
        country: validatedData.country,
        industryNiche: validatedData.industryNiche,
        age: validatedData.age,
        professionalMilestones: validatedData.professionalMilestones,
        personalTurningPoints: validatedData.personalTurningPoints,
        visionForVenture: validatedData.visionForVenture,
        hopeToAchieve: validatedData.hopeToAchieve,
        targetAudience: validatedData.targetAudience,
        demographicProfile: validatedData.demographicProfile,
        targetDemographicAge: validatedData.targetDemographicAge,
        audienceGenderSplit: validatedData.audienceGenderSplit,
        audienceMaritalStatus: validatedData.audienceMaritalStatus || '',
        currentChannels: validatedData.currentChannels,
        keyPainPoints: validatedData.keyPainPoints,
        brandValues: validatedData.brandValues,
        differentiation: validatedData.differentiation,
        uniqueValueProps: validatedData.uniqueValueProps,
        emergingCompetitors: validatedData.emergingCompetitors || '',
        idealBrandImage: validatedData.idealBrandImage,
        inspirationBrands: validatedData.inspirationBrands || null,
        brandingAesthetics: validatedData.brandingAesthetics,
        emotionsBrandEvokes: validatedData.emotionsBrandEvokes || '',
        brandPersonality: validatedData.brandPersonality,
        preferredFont: validatedData.preferredFont || '',
        productCategories: Array.isArray(validatedData.productCategories)
          ? JSON.stringify(validatedData.productCategories)
          : '[]',
        otherProductIdeas: validatedData.otherProductIdeas || null,
        scalingGoals: validatedData.scalingGoals,
        growthStrategies: validatedData.growthStrategies || '',
        longTermVision: validatedData.longTermVision,
        specificDeadlines: validatedData.specificDeadlines || null,
        additionalInfo: validatedData.additionalInfo || null,
        termsAccepted: true,
        status: 'PENDING',
        // File metadata
        zipFilePath: validatedData.zipFilePath || null,
        zipFileName: validatedData.zipFileName || null,
        zipFileSize: validatedData.zipFileSize || null,
      },
    })

    console.log(`New application submitted: ${application.id} - ${application.email}`)

    // Send email notification to admin
    try {
      await emailService.send({
        to: 'arunavtnt@gmail.com',
        subject: `New Application Submission: ${application.fullName}`,
        html: `
          <h2>New Application Received</h2>
          <p>A new application has been submitted to Wavelaunch Studio.</p>
          <hr />
          <h3>Applicant Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${application.fullName}</li>
            <li><strong>Email:</strong> ${application.email}</li>
            <li><strong>Industry:</strong> ${application.industryNiche}</li>
            <li><strong>Country:</strong> ${application.country}</li>
            <li><strong>Instagram:</strong> ${application.instagramHandle || 'N/A'}</li>
            <li><strong>TikTok:</strong> ${application.tiktokHandle || 'N/A'}</li>
          </ul>
          <hr />
          <p>View the full application in the <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/submissions">Wavelaunch CRM</a>.</p>
          <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
        `,
      })
      console.log('Admin notification email sent successfully')
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
      // Don't fail the submission if email fails
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: application.id,
          email: application.email,
          name: application.fullName,
        },
        message: 'Application submitted successfully',
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Application submission error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })

    // Return detailed error for debugging (temporary - REMOVE IN PRODUCTION)
    return NextResponse.json(
      {
        success: false,
        error: `[DEPLOY-ID:7ede986] Failed to submit application: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error.stack : String(error),
        deployId: '7ede986'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
// Cache bust: 1771657943
