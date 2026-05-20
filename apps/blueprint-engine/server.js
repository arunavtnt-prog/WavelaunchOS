#!/usr/bin/env node

/**
 * Blueprint Engine Server
 *
 * Local PDF renderer:
 *   Markdown → HTML (Pandoc) → PDF (Puppeteer)
 *
 * Runs on port 3010 for local development.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const {
  sanitizeFilename,
  checkPandocAvailable,
  checkWeasyprintAvailable,
  generatePdf,
} = require('./lib/renderer');

const app = express();
const PORT = process.env.PORT || 3010;

// Paths
const OUTPUT_DIR = path.join(__dirname, 'output');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Blueprint Engine',
    version: '1.0.0',
    description: 'API server for generating business plan PDFs from markdown content',
    endpoints: {
      health: 'GET /health',
      generate: 'POST /api/generate',
      download: 'GET /api/download/:filename',
      list: 'GET /api/list',
      delete: 'DELETE /api/delete/:filename'
    },
    renderer: 'Pandoc + WeasyPrint',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const pandocCheck = checkPandocAvailable();
  const weasyCheck = checkWeasyprintAvailable();
  res.json({
    status: 'ok',
    service: 'blueprint-engine',
    version: '1.0.0',
    pandocAvailable: pandocCheck.available,
    pandocVersion: pandocCheck.versionLine,
    weasyprintAvailable: weasyCheck.available,
    weasyprintVersion: weasyCheck.versionLine,
  });
});

/**
 * Generate PDF from markdown content
 * 
 * POST /api/generate
 * Body: { markdown: string, options?: { outputFilename?: string } }
 * Returns: { success: boolean, pdfUrl?: string, error?: string }
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { markdown, options = {} } = req.body;

    if (!markdown) {
      return res.status(400).json({
        success: false,
        error: 'Markdown content is required'
      });
    }

    // Generate unique filename
    const jobId = uuidv4();
    const outputFilename = sanitizeFilename(options.outputFilename || `blueprint-${jobId}.pdf`);
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    console.log(`[Blueprint Engine] Generating PDF for job ${jobId}...`);

    await generatePdf({ markdown, outputPath, options });

    if (fs.existsSync(outputPath)) {
      console.log(`[Blueprint Engine] PDF generated successfully: ${outputFilename}`);
      return res.json({
        success: true,
        jobId,
        pdfUrl: `/api/download/${outputFilename}`,
        filename: outputFilename,
        size: fs.statSync(outputPath).size,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'PDF generation failed',
      details: 'PDF file was not created',
    });

  } catch (error) {
    console.error(`[Blueprint Engine] Server error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * Download generated PDF
 * 
 * GET /api/download/:filename
 */
app.get('/api/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(OUTPUT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error(`[Blueprint Engine] Download error: ${err.message}`);
    }
  });
});

/**
 * List generated PDFs
 * 
 * GET /api/list
 */
app.get('/api/list', (req, res) => {
  try {
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter(file => file.endsWith('.pdf'))
      .map(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          url: `/api/download/${file}`
        };
      })
      .sort((a, b) => b.created - a.created);

    res.json({
      success: true,
      count: files.length,
      files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to list files',
      details: error.message
    });
  }
});

/**
 * Delete a generated PDF
 * 
 * DELETE /api/delete/:filename
 */
app.delete('/api/delete/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(OUTPUT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({
      success: true,
      message: `Deleted ${filename}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[Blueprint Engine] Error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// Start server
const HOST = process.env.HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                              ║
║           🚀 Blueprint Engine Server Started 🚀                 ║
║                                                              ║
║   Service:  Blueprint Generation API                             ║
║   Host:     ${HOST.toString().padEnd(48)}║
║   Port:     ${PORT.toString().padEnd(48)}║
║   Renderer:  Pandoc + WeasyPrint                                 ║
║                                                              ║
║   Endpoints:                                                   ║
║   • GET  /health          - Health check                       ║
║   • POST /api/generate     - Generate PDF from markdown         ║
║   • GET  /api/download/:f  - Download generated PDF            ║
║   • GET  /api/list         - List all generated PDFs         ║
║   • DEL  /api/delete/:f    - Delete a PDF file              ║
║                                                              ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Blueprint Engine] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Blueprint Engine] SIGINT received, shutting down gracefully...');
  process.exit(0);
});
