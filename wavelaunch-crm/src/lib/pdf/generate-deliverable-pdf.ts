import { db } from '@/lib/db'
import { generatePDF, type PDFQuality } from './generator'
import { AppError } from '@/lib/utils/errors'
import * as path from 'path'
import { format } from 'date-fns'
import type { JobResult } from '@/types'

export interface GenerateDeliverablePDFPayload {
  deliverableId: string
  quality?: PDFQuality
  userId: string
}

/**
 * Generate PDF for a deliverable
 * This is called by the job queue worker
 */
export async function generateDeliverablePDF(
  payload: GenerateDeliverablePDFPayload
): Promise<JobResult> {
  const { deliverableId, quality = 'final', userId } = payload

  try {
    // Fetch deliverable with client info
    const deliverable = await db.deliverable.findUnique({
      where: { id: deliverableId },
      include: {
        client: true,
      },
    })

    if (!deliverable) {
      throw new AppError('Deliverable not found', 404, 'NOT_FOUND')
    }

    // Generate filename
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss')
    const filename = `deliverable-m${deliverable.month}-${quality}-${timestamp}.pdf`

    // Output path: /data/clients/{clientId}/files/{filename}
    const outputPath = path.join(
      process.cwd(),
      'data',
      'clients',
      deliverable.clientId,
      'files',
      filename
    )

    // Generate PDF
    const result = await generatePDF({
      content: deliverable.contentMarkdown,
      metadata: {
        clientName: deliverable.client.creatorName,
        brandName: deliverable.client.brandName || undefined,
        industry: deliverable.client.targetIndustry,
        version: 1, // Deliverables don't have versions
        date: format(deliverable.createdAt, 'MMMM dd, yyyy'),
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
    const file = await db.file.create({
      data: {
        clientId: deliverable.clientId,
        filename,
        filepath: outputPath,
        mimetype: 'application/pdf',
        filesize: result.fileSize,
        category: 'DELIVERABLE',
        uploadedBy: userId,
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        clientId: deliverable.clientId,
        type: 'FILE_UPLOADED',
        description: `Generated PDF: Month ${deliverable.month} Deliverable (${quality} quality)`,
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
      message: 'Deliverable PDF generated successfully',
    }
  } catch (error: any) {
    console.error('Error generating deliverable PDF:', error)
    throw error
  }
}
