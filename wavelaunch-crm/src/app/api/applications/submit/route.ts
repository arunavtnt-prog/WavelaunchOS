import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Google Sheets integration (async, non-blocking)
async function pushToGoogleSheets(application: any) {
  try {
    // TODO: Implement Google Sheets API integration
    // This requires:
    // 1. Google Service Account credentials
    // 2. Google Sheets API enabled
    // 3. Sheet ID and authentication
    
    console.log('Google Sheets integration placeholder - application ID:', application.id)
    
    // Example implementation (when ready):
    // const { GoogleSpreadsheet } = require('google-spreadsheet')
    // const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID)
    // await doc.useServiceAccountAuth({
    //   client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    //   private_key: process.env.GOOGLE_PRIVATE_KEY,
    // })
    // await doc.loadInfo()
    // const sheet = doc.sheetsByIndex[0]
    // await sheet.addRow({
    //   'Application ID': application.id,
    //   'Full Name': application.name,
    //   'Email': application.email,
    //   'Industry Niche': application.industryNiche,
    //   'Country': application.country,
    //   'Status': application.status,
    //   'Submitted At': new Date().toISOString(),
    //   ...other fields
    // })
    
  } catch (error) {
    console.error('Google Sheets sync error:', error)
    // Don't throw - this is async and non-blocking
  }
}

// Validation schema for application submission
const applicationSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Full name is required'),
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
  productCategories: z.string().transform((val) => {
    try {
      return JSON.parse(val)
    } catch {
      return []
    }
  }),
  otherProductIdeas: z.string().optional().default(''),
  scalingGoals: z.string().min(1, 'Scaling goals is required'),
  growthStrategies: z.string().optional().default(''),
  longTermVision: z.string().min(1, 'Long-term vision is required'),
  specificDeadlines: z.string().optional().default(''),
  additionalInfo: z.string().optional().default(''),

  // Terms
  termsAccepted: z.string().transform(val => val === 'true'),
})

// POST /api/applications/submit - Public endpoint for application submission
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Convert FormData to object
    const data: Record<string, string> = {}
    formData.forEach((value, key) => {
      if (key !== 'zipFile' && typeof value === 'string') {
        data[key] = value
      }
    })

    // Normalize payload - map old field names to new schema names
    const normalizeApplicationPayload = (input: Record<string, string>) => {
      return {
        // Required fields with fallbacks
        name: input.name ?? input.creatorName ?? "",
        email: input.email ?? "",
        instagramHandle: input.instagramHandle ?? "",
        tiktokHandle: input.tiktokHandle ?? "",
        country: input.country ?? "",
        industryNiche: input.industryNiche ?? input.niche ?? "",
        age: input.age ? parseInt(input.age) : 18,
        professionalMilestones: input.professionalMilestones ?? "",
        personalTurningPoints: input.personalTurningPoints ?? "",
        visionForVenture: input.visionForVenture ?? input.visionStatement ?? "",
        hopeToAchieve: input.hopeToAchieve ?? "",
        targetAudience: input.targetAudience ?? "",
        demographicProfile: input.demographicProfile ?? input.demographics ?? "",
        targetDemographicAge: input.targetDemographicAge ?? "",
        audienceGenderSplit: input.audienceGenderSplit ?? "",
        audienceMaritalStatus: input.audienceMaritalStatus ?? "",
        currentChannels: input.currentChannels ?? "",
        keyPainPoints: input.keyPainPoints ?? input.painPoints ?? "",
        brandValues: input.brandValues ?? "",
        differentiation: input.differentiation ?? input.competitiveDifferentiation ?? "",
        uniqueValueProps: input.uniqueValueProps ?? "",
        emergingCompetitors: input.emergingCompetitors ?? "",
        idealBrandImage: input.idealBrandImage ?? input.brandImage ?? "",
        inspirationBrands: input.inspirationBrands ?? "",
        brandingAesthetics: input.brandingAesthetics ?? "",
        emotionsBrandEvokes: input.emotionsBrandEvokes ?? "",
        brandPersonality: input.brandPersonality ?? "",
        preferredFont: input.preferredFont ?? "",
        productCategories: input.productCategories ? JSON.parse(input.productCategories) : [],
        otherProductIdeas: input.otherProductIdeas ?? "",
        scalingGoals: input.scalingGoals ?? "",
        growthStrategies: input.growthStrategies ?? "",
        longTermVision: input.longTermVision ?? "",
        specificDeadlines: input.specificDeadlines ?? "",
        additionalInfo: input.additionalInfo ?? "",
        termsAccepted: input.termsAccepted === "true",
      }
    }

    const normalizedData = normalizeApplicationPayload(data)

    // Validate the data
    const validationResult = applicationSchema.safeParse(normalizedData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json(
        { success: false, error: `Validation failed: ${errorMessages}` },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Check if terms were accepted
    if (!validatedData.termsAccepted) {
      return NextResponse.json(
        { success: false, error: 'You must accept the terms and conditions' },
        { status: 400 }
      )
    }

    // Handle file upload if present
    let zipFilePath: string | null = null
    let zipFileName: string | null = null
    let zipFileSize: number | null = null

    const zipFile = formData.get('zipFile')
    if (zipFile && zipFile instanceof File && zipFile.size > 0) {
      // Validate file size (25MB max)
      const MAX_SIZE = 25 * 1024 * 1024
      if (zipFile.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: 'File size must be less than 25MB' },
          { status: 400 }
        )
      }

      // Validate file type
      if (!zipFile.name.endsWith('.zip')) {
        return NextResponse.json(
          { success: false, error: 'Only ZIP files are allowed' },
          { status: 400 }
        )
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'applications')
      await mkdir(uploadsDir, { recursive: true })

      // Generate unique filename
      const timestamp = Date.now()
      const safeEmail = validatedData.email.replace(/[^a-z0-9]/gi, '_')
      const filename = `${safeEmail}_${timestamp}.zip`
      const filePath = path.join(uploadsDir, filename)

      // Write file
      const bytes = await zipFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      zipFilePath = `/uploads/applications/${filename}`
      zipFileName = zipFile.name
      zipFileSize = zipFile.size
    }

    // Create the application in the database
    const application = await prisma.application.create({
      data: {
        fullName: validatedData.name,
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
        audienceMaritalStatus: validatedData.audienceMaritalStatus || null,
        currentChannels: validatedData.currentChannels,
        keyPainPoints: validatedData.keyPainPoints,
        brandValues: validatedData.brandValues,
        differentiation: validatedData.differentiation,
        uniqueValueProps: validatedData.uniqueValueProps,
        emergingCompetitors: validatedData.emergingCompetitors || null,
        idealBrandImage: validatedData.idealBrandImage,
        inspirationBrands: validatedData.inspirationBrands || null,
        brandingAesthetics: validatedData.brandingAesthetics,
        emotionsBrandEvokes: validatedData.emotionsBrandEvokes || null,
        brandPersonality: validatedData.brandPersonality,
        preferredFont: validatedData.preferredFont || null,
        productCategories: JSON.stringify(validatedData.productCategories),
        otherProductIdeas: validatedData.otherProductIdeas || null,
        scalingGoals: validatedData.scalingGoals,
        growthStrategies: validatedData.growthStrategies || null,
        longTermVision: validatedData.longTermVision,
        specificDeadlines: validatedData.specificDeadlines || null,
        additionalInfo: validatedData.additionalInfo || null,
        zipFilePath,
        zipFileName,
        zipFileSize,
        termsAccepted: true,
        status: 'PENDING',
      },
    })

    // Async: Push to Google Sheets (non-blocking)
    queueMicrotask(() => {
      pushToGoogleSheets(application).catch(error => {
        console.error('Google Sheets sync failed:', error)
      })
    })

    // Send notification email to admin
    try {
      await sendAdminNotification(application)
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the request if email fails
    }

    // Send confirmation email to applicant
    try {
      await sendApplicantConfirmation(application)
    } catch (emailError) {
      console.error('Failed to send applicant confirmation:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        email: application.email,
        name: application.fullName,
      },
      message: 'Application submitted successfully',
    })
  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    )
  }
}

// Send notification email to admin
async function sendAdminNotification(application: {
  id: string
  fullName: string
  email: string
  country: string
  industryNiche: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@wavelaunch.studio'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Check if we have email configuration
  const hasResend = !!process.env.RESEND_API_KEY
  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

  if (!hasResend && !hasSmtp) {
    console.log('No email provider configured. Admin notification skipped.')
    console.log('New application:', {
      id: application.id,
      name: application.fullName,
      email: application.email,
      country: application.country,
      niche: application.industryNiche,
    })
    return
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Application Received</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); border-radius: 12px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-weight: bold; font-size: 20px;">W</span>
            </div>
          </div>

          <h1 style="color: #0f172a; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
            New Application Received
          </h1>

          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
            A new creator has submitted an application to the partnership program.
          </p>

          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Name</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500; text-align: right;">${application.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500; text-align: right;">${application.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Country</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500; text-align: right;">${application.country}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Industry</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500; text-align: right;">${application.industryNiche}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center;">
            <a href="${appUrl}/dashboard/submissions/${application.id}"
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; font-size: 14px;">
              Review Application
            </a>
          </div>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          Wavelaunch Studio - Creator Partnership Program
        </p>
      </div>
    </body>
    </html>
  `

  if (hasResend) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.SMTP_FROM || 'Wavelaunch <noreply@wavelaunch.studio>',
      to: adminEmail,
      subject: `New Application: ${application.fullName} (${application.industryNiche})`,
      html: emailHtml,
    })
  } else if (hasSmtp) {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Wavelaunch <noreply@wavelaunch.studio>',
      to: adminEmail,
      subject: `New Application: ${application.fullName} (${application.industryNiche})`,
      html: emailHtml,
    })
  }
}

// Send confirmation email to applicant
async function sendApplicantConfirmation(application: {
  fullName: string
  email: string
}) {
  // Check if we have email configuration
  const hasResend = !!process.env.RESEND_API_KEY
  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

  if (!hasResend && !hasSmtp) {
    console.log('No email provider configured. Applicant confirmation skipped.')
    return
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Received</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); border-radius: 12px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-weight: bold; font-size: 20px;">W</span>
            </div>
          </div>

          <h1 style="color: #0f172a; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
            Application Received!
          </h1>

          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi ${application.fullName},
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Thank you for applying to the Wavelaunch Creator Partnership Program! We've received your application and are excited to learn more about your vision.
          </p>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #166534; font-size: 14px; margin: 0; font-weight: 500;">
              What's next?
            </p>
            <p style="color: #15803d; font-size: 14px; margin: 8px 0 0 0;">
              Our team will review your application within 48 hours. We'll reach out via email if we need any additional information or to discuss next steps.
            </p>
          </div>

          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            In the meantime, feel free to follow us on social media for updates and creator success stories.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0;">
            Best regards,<br>
            <strong>The Wavelaunch Team</strong>
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          Wavelaunch Studio - Creator Partnership Program<br>
          Questions? Reply to this email or contact hello@wavelaunch.studio
        </p>
      </div>
    </body>
    </html>
  `

  if (hasResend) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.SMTP_FROM || 'Wavelaunch <noreply@wavelaunch.studio>',
      to: application.email,
      subject: 'Application Received - Wavelaunch Creator Partnership',
      html: emailHtml,
    })
  } else if (hasSmtp) {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Wavelaunch <noreply@wavelaunch.studio>',
      to: application.email,
      subject: 'Application Received - Wavelaunch Creator Partnership',
      html: emailHtml,
    })
  }
}
