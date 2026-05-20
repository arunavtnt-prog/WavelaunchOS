/**
 * Puppeteer-based PDF Generator
 *
 * Generates PDFs using Puppeteer + Chromium for serverless environments (Vercel).
 * Replaces the Pandoc + XeLaTeX approach which doesn't work on serverless.
 */

import puppeteer, { Browser, Page } from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { marked } from 'marked'
import { format } from 'date-fns'

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
  }
  quality?: PDFQuality
}

export interface PDFGenerationResult {
  success: boolean
  pdfBuffer: Buffer
  fileSize: number
  error?: string
}

// Chromium executable path for different environments
async function getChromiumExecutable(): Promise<string> {
  // Local development - use locally installed Chrome
  if (process.env.NODE_ENV === 'development') {
    // Common Chrome paths
    const possiblePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
      '/usr/bin/google-chrome', // Linux
      '/usr/bin/chromium-browser', // Linux Chromium
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', // Windows x86
    ]

    for (const path of possiblePaths) {
      try {
        const fs = await import('fs/promises')
        await fs.access(path)
        return path
      } catch {
        continue
      }
    }

    throw new Error('Chrome not found locally. Please install Google Chrome for development.')
  }

  // Production (Vercel) - download minimal Chromium from official Sparticuz releases
  return await chromium.executablePath(
    'https://github.com/Sparticuz/chromium/releases/download/v143.0.0/chromium-v143.0.0-pack.x64.tar'
  )
}

// Browser singleton for reuse (improves performance on serverless)
let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (browserInstance) {
    return browserInstance
  }

  const executablePath = await getChromiumExecutable()

  browserInstance = await puppeteer.launch({
    args: process.env.NODE_ENV === 'development'
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : chromium.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath,
    headless: true,
  })

  return browserInstance
}

/**
 * Extract headings from HTML content for Table of Contents
 */
function extractHeadings(htmlContent: string): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = []
  const headingRegex = /<h([1-2])(?:[^>]*)>(.*?)<\/h\1>/gi
  let match

  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1])
    const text = match[2].replace(/<[^>]*>/g, '').trim() // Strip inner HTML tags
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    headings.push({ level, text, id })
  }

  return headings
}

/**
 * Add IDs to headings in HTML content for TOC linking
 */
function addHeadingIds(htmlContent: string): string {
  return htmlContent.replace(/<h([1-2])(?:[^>]*)>(.*?)<\/h\1>/gi, (match, level, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '').trim()
    const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    return `<h${level} id="${id}">${text}</h${level}>`
  })
}

/**
 * Generate Table of Contents HTML
 */
function generateTOC(headings: { level: number; text: string; id: string }[]): string {
  if (headings.length === 0) return ''

  // Assign section numbers
  let h1Count = 0
  let h2Count = 0

  const tocItems = headings.map(h => {
    let number = ''
    if (h.level === 1) {
      h1Count++
      h2Count = 0
      number = `${h1Count}`
    } else if (h.level === 2) {
      h2Count++
      number = `${h1Count}.${h2Count}`
    }
    return { ...h, number }
  })

  return `
    <div class="toc">
      <h2 class="toc-title">Contents</h2>
      <div class="toc-list">
        ${tocItems.map(h => `
          <div class="toc-item toc-level-${h.level}">
            <span class="toc-number">${h.number}</span>
            <span class="toc-text">${h.text}</span>
            <span class="toc-dots"></span>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

/**
 * Generate HTML from markdown with professional styling (matches LaTeX design)
 */
function generateHTML(content: string, metadata: PDFGenerationOptions['metadata'], quality: PDFQuality): string {
  // Configure marked for better rendering
  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  let htmlContent = marked.parse(content) as string
  const headings = extractHeadings(htmlContent)
  htmlContent = addHeadingIds(htmlContent)
  const tocHtml = generateTOC(headings)

  const date = metadata.date || format(new Date(), 'MMMM dd, yyyy')
  const brandName = metadata.brandName || metadata.clientName
  const isDraft = quality === 'draft'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandName} - Business Plan</title>
  <style>
    :root {
      --primary: #3b82f6;
      --secondary: #6366f1;
      --dark: #0f172a;
      --light: #94a3b8;
      --text: #1e293b;
      --background: #ffffff;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: letter;
      margin: 1in;
    }

    body {
      font-family: Georgia, 'Times New Roman', 'DejaVu Serif', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: var(--text);
      background: var(--background);
      counter-reset: section;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
      position: relative;
      padding: 40px;
    }

    .cover-rule {
      width: 100%;
      height: 2px;
      background: var(--primary);
      margin: 16px 0;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 700;
      color: var(--primary);
      margin: 8px 0;
    }

    .cover-subtitle {
      font-size: 16pt;
      font-weight: 400;
      color: var(--dark);
      margin-bottom: 32px;
    }

    .cover-meta {
      margin-top: 48px;
      text-align: left;
    }

    .cover-meta-table {
      border-collapse: collapse;
    }

    .cover-meta-table td {
      padding: 4px 12px 4px 0;
      border: none;
      font-size: 11pt;
      background: transparent;
    }

    .cover-meta-table td:first-child {
      font-weight: 700;
      color: var(--dark);
    }

    .cover-footer {
      position: absolute;
      bottom: 60px;
      text-align: center;
      color: var(--light);
      font-size: 10pt;
      font-style: italic;
    }

    ${isDraft ? `
    .draft-watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100pt;
      font-weight: 700;
      color: rgba(239, 68, 68, 0.08);
      pointer-events: none;
      z-index: 1000;
      white-space: nowrap;
    }
    ` : ''}

    /* Table of Contents */
    .toc {
      page-break-after: always;
      padding: 0;
    }

    .toc-title {
      color: var(--primary);
      font-size: 18pt;
      font-weight: 700;
      margin-bottom: 24px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--primary);
    }

    .toc-list {
      list-style: none;
    }

    .toc-item {
      display: flex;
      align-items: baseline;
      padding: 6px 0;
      font-size: 11pt;
    }

    .toc-level-2 {
      padding-left: 24px;
    }

    .toc-number {
      min-width: 32px;
      color: var(--dark);
    }

    .toc-text {
      color: var(--text);
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted var(--light);
      margin: 0 8px;
      min-width: 20px;
    }

    /* Content Styling with Section Numbering */
    .content {
      position: relative;
    }

    .content h1 {
      counter-increment: section;
      counter-reset: subsection subsubsection;
    }

    .content h1::before {
      content: counter(section) " ";
      color: var(--primary);
    }

    .content h2 {
      counter-increment: subsection;
      counter-reset: subsubsection;
    }

    .content h2::before {
      content: counter(section) "." counter(subsection) " ";
      color: var(--secondary);
    }

    .content h3 {
      counter-increment: subsubsection;
    }

    .content h3::before {
      content: counter(section) "." counter(subsection) "." counter(subsubsection) " ";
      color: var(--dark);
    }

    h1 {
      font-size: 18pt;
      font-weight: 700;
      color: var(--primary);
      margin: 28px 0 14px 0;
      page-break-after: avoid;
      page-break-before: always;
    }

    h1:first-of-type {
      page-break-before: avoid;
    }

    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: var(--secondary);
      margin: 22px 0 10px 0;
      page-break-after: avoid;
      padding-bottom: 2px;
      border-bottom: 0.5px solid var(--secondary);
    }

    h3 {
      font-size: 12pt;
      font-weight: 700;
      color: var(--dark);
      margin: 18px 0 8px 0;
      page-break-after: avoid;
    }

    h4, h5, h6 {
      font-size: 11pt;
      font-weight: 700;
      color: var(--text);
      margin: 14px 0 6px 0;
    }

    p {
      margin-bottom: 10px;
      text-align: justify;
      text-justify: inter-word;
    }

    ul, ol {
      margin: 10px 0;
      padding-left: 24px;
    }

    li {
      margin-bottom: 4px;
    }

    strong {
      font-weight: 700;
      color: var(--dark);
    }

    em {
      font-style: italic;
    }

    blockquote {
      border-left: 3px solid var(--primary);
      margin: 14px 0;
      padding: 10px 16px;
      background: #f8fafc;
      font-style: italic;
    }

    code {
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 2px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
    }

    pre {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px;
      overflow-x: auto;
      margin: 14px 0;
      font-size: 9pt;
    }

    pre code {
      background: none;
      padding: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 10pt;
    }

    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      text-align: left;
    }

    th {
      background: var(--primary);
      color: white;
      font-weight: 700;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 24px 0;
    }

    a {
      color: var(--primary);
      text-decoration: none;
    }

    /* Prevent orphans and widows */
    p, li {
      orphans: 3;
      widows: 3;
    }

    /* Print optimizations */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  ${isDraft ? '<div class="draft-watermark">DRAFT</div>' : ''}

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-rule"></div>
    <h1 class="cover-title">${brandName}</h1>
    <p class="cover-subtitle">Business Plan</p>
    <div class="cover-rule"></div>

    <div class="cover-meta">
      <table class="cover-meta-table">
        <tr>
          <td>Client:</td>
          <td>${metadata.clientName}</td>
        </tr>
        ${metadata.brandName ? `
        <tr>
          <td>Brand:</td>
          <td>${metadata.brandName}</td>
        </tr>
        ` : ''}
        ${metadata.industry ? `
        <tr>
          <td>Industry:</td>
          <td>${metadata.industry}</td>
        </tr>
        ` : ''}
        <tr>
          <td>Prepared by:</td>
          <td>Wavelaunch Studio</td>
        </tr>
        <tr>
          <td>Date:</td>
          <td>${date}</td>
        </tr>
        <tr>
          <td>Version:</td>
          <td>v${metadata.version}</td>
        </tr>
      </table>
    </div>

    <div class="cover-footer">
      Confidential - For Internal Use Only<br>
      wavelaunch.studio
    </div>
  </div>

  <!-- Table of Contents -->
  ${tocHtml}

  <!-- Content -->
  <div class="content">
    ${htmlContent}
  </div>
</body>
</html>`
}

/**
 * Generate a PDF from Markdown content using Puppeteer
 */
export async function generatePDF(options: PDFGenerationOptions): Promise<PDFGenerationResult> {
  const { content, metadata, quality = 'final' } = options

  let page: Page | null = null

  try {
    const browser = await getBrowser()
    page = await browser.newPage()

    // Generate HTML
    const html = generateHTML(content, metadata, quality)

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-family: Georgia, serif; font-size: 9px; color: #94a3b8; width: 100%; padding: 0 0.5in; display: flex; justify-content: space-between; border-bottom: 0.5px solid #3b82f6; padding-bottom: 4px; font-style: italic;">
          <span>${metadata.clientName}</span>
          <span>Business Plan</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-family: Georgia, serif; font-size: 9px; color: #94a3b8; width: 100%; text-align: center;">
          <span class="pageNumber"></span>
        </div>
      `,
    })

    return {
      success: true,
      pdfBuffer: Buffer.from(pdfBuffer),
      fileSize: pdfBuffer.length,
    }
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return {
      success: false,
      pdfBuffer: Buffer.alloc(0),
      fileSize: 0,
      error: error.message || 'Failed to generate PDF',
    }
  } finally {
    if (page) {
      await page.close()
    }
  }
}

/**
 * Check if PDF generation dependencies are available
 */
export async function checkPDFDependencies(): Promise<{
  chromiumAvailable: boolean
  error?: string
}> {
  try {
    const executablePath = await getChromiumExecutable()
    return {
      chromiumAvailable: !!executablePath,
    }
  } catch (error: any) {
    return {
      chromiumAvailable: false,
      error: error.message,
    }
  }
}

/**
 * Close browser instance (for cleanup)
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}
