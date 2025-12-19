import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'
import { format } from 'date-fns'
import { marked } from 'marked'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

// Increase function timeout for PDF generation (Vercel)
export const maxDuration = 60

const generatePDFSchema = z.object({
  quality: z.enum(['draft', 'final']).default('final'),
})

// POST /api/business-plans/[id]/generate-pdf - Generate PDF directly
// Priority: 1. Pandoc+XeLaTeX (Docker), 2. Puppeteer (Serverless), 3. HTML fallback
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

    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss')
    const filename = `business-plan-v${businessPlan.version}-${quality}-${timestamp}.pdf`

    // Method 1: Try Pandoc + XeLaTeX (best quality, works in Docker)
    try {
      const { generatePDF: generatePDFPandoc, checkPDFDependencies } = await import('@/lib/pdf/generator')
      const deps = await checkPDFDependencies()

      if (deps.pandocInstalled && deps.xelatexInstalled) {
        console.log('Using Pandoc + XeLaTeX for PDF generation')

        // Create temp output path
        const tempDir = os.tmpdir()
        const outputPath = path.join(tempDir, filename)

        const result = await generatePDFPandoc({
          content: businessPlan.contentMarkdown,
          metadata: {
            clientName: businessPlan.client.fullName,
            brandName: businessPlan.client.fullName || undefined,
            industry: businessPlan.client.industryNiche || undefined,
            version: businessPlan.version,
            date: format(businessPlan.createdAt, 'MMMM dd, yyyy'),
            type: 'business_plan',
          },
          quality,
          outputPath,
          options: {
            includeTOC: true,
            includePageNumbers: true,
          },
        })

        if (result.success) {
          // Read the generated PDF
          const pdfBuffer = await fs.readFile(outputPath)

          // Clean up temp file
          await fs.unlink(outputPath).catch(() => {})

          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Length': result.fileSize.toString(),
            },
          })
        }

        console.log('Pandoc generation failed, falling back to Puppeteer:', result.error)
      }
    } catch (pandocError: any) {
      console.log('Pandoc not available, trying Puppeteer:', pandocError.message)
    }

    // Method 2: Try Puppeteer (serverless-compatible)
    let result
    try {
      const { generatePDF } = await import('@/lib/pdf/puppeteer-generator')
      result = await generatePDF({
        content: businessPlan.contentMarkdown,
        metadata: {
          clientName: businessPlan.client.fullName,
          brandName: businessPlan.client.fullName || undefined,
          industry: businessPlan.client.industryNiche || undefined,
          version: businessPlan.version,
          date: format(businessPlan.createdAt, 'MMMM dd, yyyy'),
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
    } catch (puppeteerError: any) {
      console.error('Puppeteer import/execution error:', puppeteerError)
    }

    // Method 3: HTML fallback (last resort)
    console.log('Both Pandoc and Puppeteer failed, returning HTML fallback')
    const htmlContent = marked.parse(businessPlan.contentMarkdown) as string
    const htmlFilename = `business-plan-v${businessPlan.version}-${quality}-${timestamp}.html`

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${businessPlan.client.fullName} - Business Plan</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
    h1 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #6366f1; margin-top: 30px; }
    h3 { color: #1e293b; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
    th { background: #3b82f6; color: white; }
    blockquote { border-left: 4px solid #3b82f6; margin: 20px 0; padding: 10px 20px; background: #f8fafc; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
    .cover { text-align: center; margin-bottom: 60px; padding: 40px; border: 4px solid #3b82f6; }
    .cover h1 { font-size: 2.5em; margin-bottom: 10px; border: none; }
    .meta { margin-top: 30px; text-align: left; display: inline-block; }
    .meta-item { margin: 8px 0; }
    .meta-label { font-weight: bold; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${businessPlan.client.fullName}</h1>
    <p style="font-size: 1.3em; color: #1e293b;">Business Plan</p>
    <div class="meta">
      <div class="meta-item"><span class="meta-label">Client:</span> ${businessPlan.client.fullName}</div>
      <div class="meta-item"><span class="meta-label">Industry:</span> ${businessPlan.client.industryNiche || 'N/A'}</div>
      <div class="meta-item"><span class="meta-label">Date:</span> ${format(businessPlan.createdAt, 'MMMM dd, yyyy')}</div>
      <div class="meta-item"><span class="meta-label">Version:</span> v${businessPlan.version}</div>
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
  } catch (error) {
    console.error('PDF generation error:', error)
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
