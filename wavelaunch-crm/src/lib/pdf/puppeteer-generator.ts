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

  // Production (Vercel) - download minimal Chromium
  return await chromium.executablePath(
    'https://github.com/nicepkg/puppeteer-core-chromium/releases/download/v143.0.0-chromium-min/chromium-v143.0.0-pack.tar'
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
 * Generate HTML from markdown with professional styling
 */
function generateHTML(content: string, metadata: PDFGenerationOptions['metadata'], quality: PDFQuality): string {
  // Configure marked for better rendering
  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  const htmlContent = marked.parse(content) as string
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
      --primary: #3b82f6;
      --secondary: #6366f1;
      --accent: #a855f7;
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
      @top-left {
        content: "${metadata.clientName}";
        font-size: 10px;
        color: var(--light);
      }
      @top-right {
        content: "Business Plan";
        font-size: 10px;
        color: var(--light);
      }
      @bottom-center {
        content: counter(page);
        font-size: 10px;
        color: var(--light);
      }
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: var(--text);
      background: var(--background);
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
    }

    .cover-page::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
    }

    .cover-page::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
    }

    .cover-title {
      font-size: 36pt;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 8px;
    }

    .cover-subtitle {
      font-size: 18pt;
      font-weight: 500;
      color: var(--dark);
      margin-bottom: 48px;
    }

    .cover-meta {
      margin-top: 48px;
      text-align: left;
    }

    .cover-meta-item {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
      font-size: 11pt;
    }

    .cover-meta-label {
      font-weight: 600;
      color: var(--dark);
      min-width: 100px;
    }

    .cover-meta-value {
      color: var(--text);
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
    }

    .toc h2 {
      color: var(--primary);
      font-size: 18pt;
      margin-bottom: 24px;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 8px;
    }

    .toc-list {
      list-style: none;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dotted var(--light);
    }

    .toc-item a {
      color: var(--text);
      text-decoration: none;
    }

    /* Content Styling */
    .content {
      position: relative;
    }

    h1 {
      font-size: 24pt;
      font-weight: 700;
      color: var(--primary);
      margin: 32px 0 16px 0;
      page-break-after: avoid;
    }

    h2 {
      font-size: 18pt;
      font-weight: 600;
      color: var(--secondary);
      margin: 24px 0 12px 0;
      page-break-after: avoid;
      border-bottom: 1px solid var(--secondary);
      padding-bottom: 4px;
    }

    h3 {
      font-size: 14pt;
      font-weight: 600;
      color: var(--dark);
      margin: 20px 0 10px 0;
      page-break-after: avoid;
    }

    h4, h5, h6 {
      font-size: 12pt;
      font-weight: 600;
      color: var(--text);
      margin: 16px 0 8px 0;
    }

    p {
      margin-bottom: 12px;
      text-align: justify;
    }

    ul, ol {
      margin: 12px 0;
      padding-left: 24px;
    }

    li {
      margin-bottom: 6px;
    }

    strong {
      font-weight: 600;
      color: var(--dark);
    }

    em {
      font-style: italic;
    }

    blockquote {
      border-left: 4px solid var(--primary);
      margin: 16px 0;
      padding: 12px 20px;
      background: #f8fafc;
      font-style: italic;
    }

    code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Menlo', 'Monaco', monospace;
      font-size: 10pt;
    }

    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
    }

    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
    }

    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px 12px;
      text-align: left;
    }

    th {
      background: var(--primary);
      color: white;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    hr {
      border: none;
      border-top: 2px solid #e2e8f0;
      margin: 32px 0;
    }

    a {
      color: var(--primary);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Page breaks */
    h1 {
      page-break-before: always;
    }

    h1:first-of-type {
      page-break-before: avoid;
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
    <h1 class="cover-title">${brandName}</h1>
    <p class="cover-subtitle">Business Plan</p>

    <div class="cover-meta">
      <div class="cover-meta-item">
        <span class="cover-meta-label">Client:</span>
        <span class="cover-meta-value">${metadata.clientName}</span>
      </div>
      ${metadata.brandName ? `
      <div class="cover-meta-item">
        <span class="cover-meta-label">Brand:</span>
        <span class="cover-meta-value">${metadata.brandName}</span>
      </div>
      ` : ''}
      ${metadata.industry ? `
      <div class="cover-meta-item">
        <span class="cover-meta-label">Industry:</span>
        <span class="cover-meta-value">${metadata.industry}</span>
      </div>
      ` : ''}
      <div class="cover-meta-item">
        <span class="cover-meta-label">Prepared by:</span>
        <span class="cover-meta-value">Wavelaunch Studio</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Date:</span>
        <span class="cover-meta-value">${date}</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Version:</span>
        <span class="cover-meta-value">v${metadata.version}</span>
      </div>
    </div>

    <div class="cover-footer">
      Confidential - For Internal Use Only<br>
      wavelaunch.studio
    </div>
  </div>

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
        <div style="font-size: 10px; color: #94a3b8; width: 100%; padding: 0 1in; display: flex; justify-content: space-between;">
          <span>${metadata.clientName}</span>
          <span>Business Plan</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: #94a3b8; width: 100%; text-align: center;">
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
