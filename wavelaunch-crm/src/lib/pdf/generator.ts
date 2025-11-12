import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import { format } from 'date-fns'

const execAsync = promisify(exec)

export type PDFQuality = 'draft' | 'final'

export interface PDFGenerationOptions {
  content: string
  metadata: {
    clientName: string
    brandName?: string
    industry?: string
    version: number
    date?: string
  }
  quality?: PDFQuality
  outputPath: string
}

export interface PDFGenerationResult {
  success: boolean
  pdfPath: string
  fileSize: number
  error?: string
}

/**
 * Generate a PDF from Markdown content using Pandoc + XeLaTeX
 */
export async function generatePDF(
  options: PDFGenerationOptions
): Promise<PDFGenerationResult> {
  const { content, metadata, quality = 'final', outputPath } = options

  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    await fs.mkdir(outputDir, { recursive: true })

    // Create temporary files for Markdown and metadata
    const tempDir = path.join(process.cwd(), 'data', 'temp')
    await fs.mkdir(tempDir, { recursive: true })

    const timestamp = Date.now()
    const markdownPath = path.join(tempDir, `business-plan-${timestamp}.md`)
    const yamlPath = path.join(tempDir, `metadata-${timestamp}.yaml`)

    // Write Markdown content
    await fs.writeFile(markdownPath, content, 'utf-8')

    // Create YAML metadata
    const yamlMetadata = createYAMLMetadata(metadata, quality)
    await fs.writeFile(yamlPath, yamlMetadata, 'utf-8')

    // LaTeX template path
    const templatePath = path.join(process.cwd(), 'templates', 'business-plan.tex')

    // Pandoc command
    const pandocCommand = [
      'pandoc',
      `"${markdownPath}"`,
      `--metadata-file="${yamlPath}"`,
      `--template="${templatePath}"`,
      '--pdf-engine=xelatex',
      '--toc',
      '--toc-depth=3',
      '--number-sections',
      '-V geometry:margin=1in',
      quality === 'draft' ? '-V pdf-quality-draft=true' : '-V pdf-quality-final=true',
      `--output="${outputPath}"`,
    ].join(' ')

    // Execute Pandoc
    const { stdout, stderr } = await execAsync(pandocCommand, {
      timeout: 120000, // 2 minutes timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    })

    // Check if PDF was created
    const stats = await fs.stat(outputPath)

    // Clean up temporary files
    await Promise.all([
      fs.unlink(markdownPath).catch(() => {}),
      fs.unlink(yamlPath).catch(() => {}),
    ])

    return {
      success: true,
      pdfPath: outputPath,
      fileSize: stats.size,
    }
  } catch (error: any) {
    console.error('PDF generation error:', error)

    return {
      success: false,
      pdfPath: outputPath,
      fileSize: 0,
      error: error.message || 'Failed to generate PDF',
    }
  }
}

/**
 * Create YAML metadata for Pandoc
 */
function createYAMLMetadata(
  metadata: PDFGenerationOptions['metadata'],
  quality: PDFQuality
): string {
  const date = metadata.date || format(new Date(), 'MMMM dd, yyyy')

  return `---
client-name: "${metadata.clientName}"
${metadata.brandName ? `brand-name: "${metadata.brandName}"` : ''}
${metadata.industry ? `industry: "${metadata.industry}"` : ''}
version: "v${metadata.version}"
date: "${date}"
pdf-quality: true
${quality === 'final' ? 'pdf-quality-final: true' : 'pdf-quality-draft: true'}
---
`
}

/**
 * Check if Pandoc and XeLaTeX are installed
 */
export async function checkPDFDependencies(): Promise<{
  pandocInstalled: boolean
  xelatexInstalled: boolean
  error?: string
}> {
  try {
    // Check Pandoc
    let pandocInstalled = false
    try {
      await execAsync('pandoc --version')
      pandocInstalled = true
    } catch (error) {
      console.error('Pandoc not found')
    }

    // Check XeLaTeX
    let xelatexInstalled = false
    try {
      await execAsync('xelatex --version')
      xelatexInstalled = true
    } catch (error) {
      console.error('XeLaTeX not found')
    }

    return {
      pandocInstalled,
      xelatexInstalled,
    }
  } catch (error: any) {
    return {
      pandocInstalled: false,
      xelatexInstalled: false,
      error: error.message,
    }
  }
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
