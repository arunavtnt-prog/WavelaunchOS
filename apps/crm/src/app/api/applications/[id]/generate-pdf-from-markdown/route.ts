import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'
import { format } from 'date-fns'
import { normalizeMarkdown, validateMarkdown } from '@/lib/pdf/markdown-normalizer'

// Increase function timeout for PDF generation (Vercel)
export const maxDuration = 60

const generatePDFSchema = z.object({
  markdown: z.string().min(1, 'Markdown content is required'),
  quality: z.enum(['draft', 'final']).default('final'),
  normalize: z.boolean().default(true),
  returnValidationOnly: z.boolean().default(false),
})

// POST /api/applications/[id]/generate-pdf-from-markdown - Generate PDF from custom markdown
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

    // Fetch application to get client info
    const application = await prisma.application.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { markdown, quality, normalize, returnValidationOnly } = generatePDFSchema.parse(body)

    // Return validation only if requested
    if (returnValidationOnly) {
      const issues = validateMarkdown(markdown)
      return NextResponse.json({
        success: true,
        validation: {
          issues,
          issueCount: issues.length,
        },
      })
    }

    // Normalize markdown to ensure consistent PDF formatting
    const normalizedMarkdown = normalize ? normalizeMarkdown(markdown) : markdown

    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss')
    const filename = `blueprint-${application.fullName}-${quality}-${timestamp}.pdf`

    // Use Puppeteer for PDF generation (serverless-compatible)
    try {
      const { generatePDF } = await import('@/lib/pdf/puppeteer-generator')
      const result = await generatePDF({
        content: normalizedMarkdown,
        metadata: {
          clientName: application.fullName,
          brandName: application.fullName || undefined,
          industry: application.industryNiche || undefined,
          version: 1,
          date: format(new Date(), 'MMMM dd, yyyy'),
        },
        quality,
      })

      if (result.success) {
        return new NextResponse(new Uint8Array(result.pdfBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': result.fileSize.toString(),
          },
        })
      }

      throw new Error(result.error || 'PDF generation failed')
    } catch (puppeteerError: any) {
      console.error('Puppeteer PDF generation error:', puppeteerError)

      // Fallback to HTML if Puppeteer fails
      const { marked } = await import('marked')
      const htmlContent = marked.parse(normalizedMarkdown) as string
      const htmlFilename = `blueprint-${application.fullName}-${quality}-${timestamp}.html`

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${application.fullName} - Blueprint</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
    h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
    h2 { color: #6366f1; margin-top: 30px; }
    h3 { color: #1e293b; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
    th { background: #f8fafc; color: #1e293b; }
    blockquote { border-left: 4px solid #6366f1; margin: 20px 0; padding: 10px 20px; background: #f8fafc; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
    .cover { text-align: center; margin-bottom: 60px; padding: 40px; border: 4px solid #6366f1; }
    .cover h1 { font-size: 2.5em; margin-bottom: 10px; border: none; }
    .meta { margin-top: 30px; text-align: left; display: inline-block; }
    .meta-item { margin: 8px 0; }
    .meta-label { font-weight: bold; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${application.fullName}</h1>
    <p style="font-size: 1.3em; color: #1e293b;">Blueprint</p>
    <div class="meta">
      <div class="meta-item"><span class="meta-label">Client:</span> ${application.fullName}</div>
      <div class="meta-item"><span class="meta-label">Industry:</span> ${application.industryNiche || 'N/A'}</div>
      <div class="meta-item"><span class="meta-label">Date:</span> ${format(new Date(), 'MMMM dd, yyyy')}</div>
    </div>
  </div>
  ${htmlContent}
  <p style="margin-top: 40px; color: #94a3b8; font-size: 0.9em; text-align: center;">
    <em>Note: PDF generation unavailable. Print this page to PDF using your browser (Ctrl/Cmd + P).</em>
  </p>
</body>
</html>`

      return new NextResponse(fullHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${htmlFilename}"`,
        },
      })
    }
  } catch (error) {
    console.error('PDF generation error:', error)
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
