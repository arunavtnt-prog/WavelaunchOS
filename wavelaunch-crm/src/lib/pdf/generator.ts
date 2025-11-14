import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import { format } from 'date-fns'

const execAsync = promisify(exec)

/**
 * Sanitize content for LaTeX PDF generation
 * Replaces Unicode characters that LaTeX cannot handle
 */
function sanitizeContentForLaTeX(content: string): string {
  // Map of Unicode characters to LaTeX-safe replacements
  const replacements: Record<string, string> = {
    '\u2605': '*', // Star symbol
    '\u2713': 'v', // Checkmark
    '\u2717': 'x', // X mark
    '\u2192': '->', // Right arrow
    '\u2190': '<-', // Left arrow
    '\u2191': '^', // Up arrow
    '\u2193': 'v', // Down arrow
    '\u2022': '-', // Bullet point
    '\u2013': '--', // En dash
    '\u2014': '---', // Em dash
    '\u201C': '"', // Left double quote
    '\u201D': '"', // Right double quote
    '\u2018': "'", // Left single quote
    '\u2019': "'", // Right single quote
    '\u2026': '...', // Ellipsis
    '\u2122': '(TM)', // Trademark
    '\u00A9': '(C)', // Copyright
    '\u00AE': '(R)', // Registered
    '\u00B0': ' degrees', // Degree symbol
    '\u00B1': '+/-', // Plus-minus
    '\u00D7': 'x', // Multiplication
    '\u00F7': '/', // Division
    '\u2248': '~=', // Approximately equal
    '\u2260': '!=', // Not equal
    '\u2264': '<=', // Less than or equal
    '\u2265': '>=', // Greater than or equal
    '\u221E': 'infinity', // Infinity
    '\u2211': 'sum', // Summation
    '\u220F': 'product', // Product
    '\u221A': 'sqrt', // Square root
    '\u2202': 'd', // Partial derivative
    '\u222B': 'integral', // Integral
    '\u26A1': '[!]', // Lightning/Energy
    '\uD83D\uDE80': '[rocket]', // Rocket
    '\uD83D\uDCA1': '[idea]', // Light bulb
    '\uD83D\uDCC8': '[growth]', // Chart increasing
    '\uD83D\uDCCA': '[chart]', // Bar chart
    '\uD83D\uDCB0': '[$]', // Money bag
    '\uD83C\uDFAF': '[target]', // Target
    '\u2B50': '*', // Star (filled)
    '\u2764': '<3', // Heart
    '\uD83D\uDC4D': '[+1]', // Thumbs up
  }

  let sanitized = content

  // Replace special Unicode characters
  for (const [unicode, replacement] of Object.entries(replacements)) {
    sanitized = sanitized.replace(new RegExp(unicode, 'g'), replacement)
  }

  // Remove any remaining emoji or problematic Unicode characters
  // This regex matches most emoji and special symbols
  sanitized = sanitized.replace(/[\u{1F300}-\u{1F9FF}]/gu, '[emoji]')

  return sanitized
}

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

    // Sanitize and write Markdown content
    const sanitizedContent = sanitizeContentForLaTeX(content)
    await fs.writeFile(markdownPath, sanitizedContent, 'utf-8')

    // Create YAML metadata
    const yamlMetadata = createYAMLMetadata(metadata, quality)
    await fs.writeFile(yamlPath, yamlMetadata, 'utf-8')

    // LaTeX template path
    const templatePath = path.join(process.cwd(), 'templates', 'business-plan.tex')

    // Pandoc command - use pdflatex for better compatibility
    // Note: Using pdflatex instead of xelatex as it's more commonly available
    // Content is pre-sanitized to handle Unicode characters
    const pandocCommand = [
      'pandoc',
      `"${markdownPath}"`,
      `--metadata-file="${yamlPath}"`,
      `--template="${templatePath}"`,
      '--pdf-engine=pdflatex',
      '--toc',
      '--toc-depth=3',
      '--number-sections',
      '-V geometry:margin=1in',
      quality === 'draft' ? '-V pdf-quality-draft=true' : '-V pdf-quality-final=true',
      `--output="${outputPath}"`,
    ].join(' ')

    console.log('Executing Pandoc command:', pandocCommand)

    // Execute Pandoc
    const { stdout, stderr } = await execAsync(pandocCommand, {
      timeout: 120000, // 2 minutes timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    })

    if (stderr && stderr.length > 0) {
      console.warn('Pandoc stderr:', stderr)
    }
    if (stdout && stdout.length > 0) {
      console.log('Pandoc stdout:', stdout)
    }

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
