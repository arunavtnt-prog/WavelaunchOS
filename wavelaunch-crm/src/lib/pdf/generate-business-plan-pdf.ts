import { prisma } from '@/lib/db'
import { generatePDF, type PDFQuality } from './generator'
import { AppError } from '@/lib/utils/errors'
import * as path from 'path'
import { format } from 'date-fns'
import type { JobResult } from '@/types'

export interface GenerateBusinessPlanPDFPayload {
  businessPlanId: string
  quality?: PDFQuality
  userId: string
}

/**
 * Generate PDF for a business plan
 * This is called by the job queue worker
 */
export async function generateBusinessPlanPDF(
  payload: GenerateBusinessPlanPDFPayload
): Promise<JobResult> {
  const { businessPlanId, quality = 'final', userId } = payload

  try {
    // Fetch business plan with client info
    const businessPlan = await prisma.businessPlan.findUnique({
      where: { id: businessPlanId },
      include: {
        client: true,
      },
    })

    if (!businessPlan) {
      throw new AppError('Business plan not found', 404, 'NOT_FOUND')
    }

    // Generate filename
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss')
    const filename = `business-plan-v${businessPlan.version}-${quality}-${timestamp}.pdf`

    // Output path: /data/clients/{clientId}/files/{filename}
    const outputPath = path.join(
      process.cwd(),
      'data',
      'clients',
      businessPlan.clientId,
      'files',
      filename
    )

    // Generate PDF
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
      outputPath,
    })

    if (!result.success) {
      throw new AppError(
        result.error || 'PDF generation failed',
        500,
        'PDF_GENERATION_FAILED'
      )
    }

    // Create file record in database
    const file = await prisma.file.create({
      data: {
        clientId: businessPlan.clientId,
        filename,
        filepath: outputPath,
        mimetype: 'application/pdf',
        filesize: result.fileSize,
        category: 'BUSINESS_PLAN',
        uploadedBy: userId,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        clientId: businessPlan.clientId,
        type: 'FILE_UPLOADED',
        description: `Generated PDF: Business Plan v${businessPlan.version} (${quality} quality)`,
        userId,
      },
    })

    return {
      success: true,
      data: {
        fileId: file.id,
        filename,
        fileSize: result.fileSize,
        pdfPath: outputPath,
      },
      message: 'Business plan PDF generated successfully',
    }
  } catch (error: any) {
    console.error('Error generating business plan PDF:', error)
    throw error
  }
}
