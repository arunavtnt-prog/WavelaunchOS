import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'
import { generatePDF } from '@/lib/pdf/puppeteer-generator'
import { format } from 'date-fns'

// Increase function timeout for PDF generation (Vercel)
export const maxDuration = 60

const generatePDFSchema = z.object({
  quality: z.enum(['draft', 'final']).default('final'),
})

// POST /api/business-plans/[id]/generate-pdf - Generate PDF directly (serverless-compatible)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch business plan with client info
    const businessPlan = await prisma.businessPlan.findUnique({
      where: { id },
      include: {
        client: true,
      },
    })

    if (!businessPlan) {
      return NextResponse.json(
        { success: false, error: 'Business plan not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { quality } = generatePDFSchema.parse(body)

    // Generate PDF using Puppeteer
    const result = await generatePDF({
      content: businessPlan.contentMarkdown,
      metadata: {
        clientName: businessPlan.client.fullName,
        brandName: businessPlan.client.fullName || undefined,
        industry: businessPlan.client.industryNiche,
        version: businessPlan.version,
        date: format(businessPlan.createdAt, 'MMMM dd, yyyy'),
      },
      quality,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'PDF generation failed' },
        { status: 500 }
      )
    }

    // Generate filename
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss')
    const filename = `business-plan-v${businessPlan.version}-${quality}-${timestamp}.pdf`

    // Return PDF as downloadable file
    return new NextResponse(new Uint8Array(result.pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': result.fileSize.toString(),
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
