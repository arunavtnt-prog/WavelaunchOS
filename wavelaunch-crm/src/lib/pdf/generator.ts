import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import { format } from 'date-fns'

const execAsync = promisify(exec)

export type PDFQuality = 'draft' | 'final'
export type PDFType = 'business_plan' | 'deliverable' | 'report'

export interface PDFGenerationOptions {
  content: string
  metadata: {
    clientName: string
    brandName?: string
    industry?: string
    version: number
    date?: string
    type?: PDFType
    template?: string
  }
  quality?: PDFQuality
  outputPath: string
  options?: {
    includeWatermark?: boolean
    includePageNumbers?: boolean
    includeTOC?: boolean
    customCSS?: string
  }
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
  const { content, metadata, quality = 'final', outputPath, options: pdfOptions = {} } = options

  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    await fs.mkdir(outputDir, { recursive: true })

    // Create temporary files for Markdown and metadata
    const tempDir = path.join(process.cwd(), 'data', 'temp')
    await fs.mkdir(tempDir, { recursive: true })

    const timestamp = Date.now()
    const fileName = `${metadata.type || 'document'}-${timestamp}`
    const markdownPath = path.join(tempDir, `${fileName}.md`)
    const yamlPath = path.join(tempDir, `metadata-${timestamp}.yaml`)

    // Process content with additional formatting
    const processedContent = processContent(content, pdfOptions)

    // Write Markdown content
    await fs.writeFile(markdownPath, processedContent, 'utf-8')

    // Create enhanced YAML metadata
    const yamlMetadata = createEnhancedYAMLMetadata(metadata, quality, pdfOptions)
    await fs.writeFile(yamlPath, yamlMetadata, 'utf-8')

    // Get appropriate template based on type
    const templatePath = getTemplatePath(metadata.type, metadata.template)

    // Build Pandoc command with enhanced options
    const pandocCommand = buildPandocCommand({
      markdownPath,
      yamlPath,
      templatePath,
      outputPath,
      quality,
      pdfOptions
    })

    // Execute Pandoc
    const { stdout, stderr } = await execAsync(pandocCommand, {
      timeout: 180000, // 3 minutes timeout for complex documents
      maxBuffer: 20 * 1024 * 1024, // 20MB buffer
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
 * Process content with additional formatting options
 */
function processContent(content: string, options: PDFGenerationOptions['options']): string {
  let processed = content

  // Add page breaks for sections if requested
  if (options?.includePageNumbers !== false) {
    processed = processed.replace(/^## /gm, '\n\\pagebreak\n## ')
  }

  // Add watermark for draft documents
  if (options?.includeWatermark) {
    processed = `\n\n[watermark: DRAFT - CONFIDENTIAL]\n\n${processed}`
  }

  // Apply custom CSS if provided
  if (options?.customCSS) {
    processed = `\n\n<style>\n${options.customCSS}\n</style>\n\n${processed}`
  }

  return processed
}

/**
 * Create enhanced YAML metadata
 */
function createEnhancedYAMLMetadata(
  metadata: PDFGenerationOptions['metadata'],
  quality: PDFQuality,
  options: PDFGenerationOptions['options']
): string {
  const date = metadata.date || format(new Date(), 'MMMM dd, yyyy')

  return `---
client-name: "${metadata.clientName}"
${metadata.brandName ? `brand-name: "${metadata.brandName}"` : ''}
${metadata.industry ? `industry: "${metadata.industry}"` : ''}
version: "v${metadata.version}"
date: "${date}"
${metadata.type ? `document-type: "${metadata.type}"` : ''}
${metadata.template ? `template: "${metadata.template}"` : ''}
pdf-quality: true
${quality === 'final' ? 'pdf-quality-final: true' : 'pdf-quality-draft: true'}
${options?.includeTOC !== false ? 'include-toc: true' : ''}
${options?.includePageNumbers !== false ? 'include-page-numbers: true' : ''}
${options?.includeWatermark ? 'watermark: "DRAFT"' : ''}
---
`
}

/**
 * Get template path based on document type
 */
function getTemplatePath(type?: PDFType, templateName?: string): string {
  if (templateName) {
    return path.join(process.cwd(), 'templates', `${templateName}.tex`)
  }

  const defaultTemplates: Record<PDFType, string> = {
    business_plan: 'business-plan',
    deliverable: 'deliverable',
    report: 'report'
  }

  const templateNameDefault = type ? defaultTemplates[type] : 'default'
  return path.join(process.cwd(), 'templates', `${templateNameDefault}.tex`)
}

/**
 * Build enhanced Pandoc command
 */
function buildPandocCommand(params: {
  markdownPath: string
  yamlPath: string
  templatePath: string
  outputPath: string
  quality: PDFQuality
  pdfOptions: PDFGenerationOptions['options']
}): string {
  const { markdownPath, yamlPath, templatePath, outputPath, quality, pdfOptions } = params

  const commands = [
    'pandoc',
    `"${markdownPath}"`,
    `--metadata-file="${yamlPath}"`,
    `--template="${templatePath}"`,
    '--pdf-engine=xelatex',
  ]

  // Add table of contents
  if (pdfOptions?.includeTOC !== false) {
    commands.push('--toc', '--toc-depth=3')
  }

  // Add section numbering
  commands.push('--number-sections')

  // Add geometry
  commands.push('-V geometry:margin=1in')

  // Add quality settings
  if (quality === 'draft') {
    commands.push('-V pdf-quality-draft=true')
  } else {
    commands.push('-V pdf-quality-final=true')
  }

  // Add page numbers
  if (pdfOptions?.includePageNumbers !== false) {
    commands.push('-V page-numbers=true')
  }

  // Add watermark if specified
  if (pdfOptions?.includeWatermark) {
    commands.push('-V watermark=draft')
  }

  // Output path
  commands.push(`--output="${outputPath}"`)

  return commands.join(' ')
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
