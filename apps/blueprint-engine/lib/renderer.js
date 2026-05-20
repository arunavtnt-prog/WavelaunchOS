const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');

const DEFAULT_PANDOC = process.env.PANDOC_PATH || 'pandoc';
const DEFAULT_WEASYPRINT = process.env.WEASYPRINT_PATH || 'weasyprint';

function sanitizeFilename(filename) {
  const base = path.basename(String(filename || 'document.pdf'));
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
}

function extractDocMeta(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const firstRuleIdx = lines.findIndex((l) => l.trim() === '---');
  const headerLines =
    firstRuleIdx > -1 && firstRuleIdx <= 20
      ? lines.slice(0, firstRuleIdx).map((l) => l.trim()).filter(Boolean)
      : [];

  const rawName = headerLines[0] || '';
  const fullName = rawName.replace(/^#+\s*/, '').trim() || 'Business Blueprint';
  const subtitle = (headerLines[1] || '').replace(/^\*+|\*+$/g, '').trim() || '';
  const tagline = (headerLines[2] || '').trim() || '';

  const generatedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return { fullName, subtitle, tagline, generatedDate };
}

function getCss({ hideFirstPageNumber } = {}) {
  return `
    @font-face {
      font-family: 'League Gothic';
      src: local('League Gothic'), local('LeagueGothic'),
           url('https://cdn.jsdelivr.net/npm/league-gothic@1.0.0/leaguegothic.woff2') format('woff2'),
           url('https://cdn.jsdelivr.net/npm/league-gothic@1.0.0/leaguegothic.woff') format('woff');
      font-weight: 400;
      font-style: normal;
    }

    @page {
      size: Letter;
      margin: 0.9in;
      @bottom-center {
        content: counter(page);
        font-size: 9pt;
        color: #999;
      }
    }

    ${hideFirstPageNumber ? `
    @page:first {
      @bottom-center { content: ""; }
      margin: 0.9in;
    }` : ''}

    html, body {
      padding: 0;
      margin: 0;
    }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #111;
      letter-spacing: 0.005em;
    }

    a, a:visited {
      color: #111;
      text-decoration: none;
    }

    hr {
      border: none;
      border-top: 1px solid #e0e0e0;
      margin: 20px 0;
    }

    p {
      margin: 0 0 12px 0;
      font-size: 12px;
      line-height: 1.6;
    }

    h1, h2, h3, h4 {
      margin: 28px 0 12px 0;
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: 1.3;
    }

    h1 {
      font-family: 'League Gothic', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 32px;
      margin-top: 0;
      letter-spacing: 0.04em;
      font-weight: 400;
    }

    h2 {
      font-size: 18px;
      letter-spacing: 0.02em;
      font-weight: 600;
    }

    h3 {
      font-size: 14px;
      letter-spacing: 0.01em;
      font-weight: 600;
    }

    h4 {
      font-size: 13px;
      letter-spacing: 0.01em;
      font-weight: 600;
    }

    ul, ol {
      margin: 12px 0 16px 24px;
      padding: 0;
    }

    li {
      margin: 6px 0;
      font-size: 12px;
      line-height: 1.6;
    }

    blockquote {
      margin: 16px 0;
      padding-left: 16px;
      border-left: 2px solid #e0e0e0;
      color: #444;
      font-style: italic;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 20px 0;
      font-size: 11px;
    }

    th, td {
      border: 1px solid #e0e0e0;
      padding: 8px 12px;
      vertical-align: top;
      font-size: 11px;
    }

    th {
      background: #f5f5f5;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 11px;
      background: #f8f8f8;
      padding: 2px 4px;
    }

    .page-break {
      break-after: page;
      page-break-after: always;
    }

    /* Cover Page */
    .cover {
      min-height: 9in;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0.9in;
      margin: 0;
    }

    .cover-top {
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #999;
      font-weight: 500;
    }

    .cover-title {
      margin-top: 1.5in;
      font-family: 'League Gothic', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 48px;
      font-weight: 400;
      line-height: 1.1;
      letter-spacing: 0.04em;
      color: #111;
    }

    .cover-subtitle {
      margin-top: 16px;
      font-size: 14px;
      letter-spacing: 0.03em;
      color: #666;
      font-weight: 400;
    }

    .cover-footer {
      margin-top: auto;
      font-size: 10px;
      color: #666;
      letter-spacing: 0.01em;
      line-height: 1.5;
    }

    .cover-footer .hash {
      color: #999;
    }

    .cover-confidential {
      margin-top: 12px;
      font-size: 8px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #aaa;
    }

    /* First-page header block */
    .doc > h1:first-child {
      margin-bottom: 4px;
    }
    .doc > p:nth-of-type(1) {
      font-style: italic;
      font-weight: 400;
      margin-bottom: 4px;
      color: #555;
      font-size: 12px;
    }
    .doc > p:nth-of-type(2) {
      font-size: 11px;
      color: #666;
      margin-bottom: 0;
    }
  `;
}

function buildCoverHtml(meta) {
  const safeName = String(meta.fullName || 'Business Blueprint');
  const safeSubtitle = String(meta.subtitle || meta.tagline || '');
  const safeDate = String(meta.generatedDate || '');
  return `
    <section class="cover">
      <div>
        <div class="cover-top">Business Plan</div>
        <div class="cover-title">${safeName}</div>
        ${safeSubtitle ? `<div class="cover-subtitle">${safeSubtitle}</div>` : ''}
      </div>
      <div>
        <div class="cover-footer">${safeDate}</div>
        <div class="cover-confidential">Confidential</div>
      </div>
    </section>
  `;
}

function buildChapterPage(number, title) {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const chapterNum = romanNumerals[number - 1] || number;
  const safeTitle = String(title || `Chapter ${number}`);
  return `
    <section class="chapter-page">
      <div class="chapter-number">Chapter ${chapterNum}</div>
      <div class="chapter-title">${safeTitle}</div>
    </section>
    <div class="page-break"></div>
  `;
}

async function renderMarkdownToHtml(markdownPath, pandocPath = DEFAULT_PANDOC) {
  return new Promise((resolve, reject) => {
    const args = ['--from', 'markdown', '--to', 'html5', '--wrap=none', markdownPath];
    const pandoc = spawn(pandocPath, args, { env: process.env });
    let stdout = '';
    let stderr = '';

    pandoc.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    pandoc.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    pandoc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `pandoc failed with code ${code}`));
        return;
      }
      resolve(stdout);
    });
    pandoc.on('error', (err) => {
      reject(err);
    });
  });
}

function checkPandocAvailable(pandocPath = DEFAULT_PANDOC) {
  const result = spawnSync(pandocPath, ['--version'], { encoding: 'utf-8' });
  return {
    available: result.status === 0,
    versionLine: result.stdout ? String(result.stdout).split('\n')[0] : null,
    error: result.error ? String(result.error.message || result.error) : null,
  };
}

function checkWeasyprintAvailable(weasyprintPath = DEFAULT_WEASYPRINT) {
  const result = spawnSync(weasyprintPath, ['--version'], { encoding: 'utf-8' });
  return {
    available: result.status === 0,
    versionLine: result.stdout ? String(result.stdout).split('\n')[0] : null,
    error: result.error ? String(result.error.message || result.error) : null,
  };
}

async function generatePdf({
  markdown,
  outputPath,
  options = {},
  pandocPath = DEFAULT_PANDOC,
  weasyprintPath = DEFAULT_WEASYPRINT,
}) {
  const includeCover = options.cover !== false && options.includeCover !== false;

  const jobId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  const outputDir = path.dirname(outputPath);
  const tempMdPath = path.join(outputDir, `temp-${jobId}.md`);
  const tempHtmlPath = path.join(outputDir, `temp-${jobId}.html`);

  fs.writeFileSync(tempMdPath, String(markdown || ''), 'utf-8');

  try {
    const meta = extractDocMeta(markdown);
    const contentHtml = await renderMarkdownToHtml(tempMdPath, pandocPath);
    const coverBlock = includeCover ? `${buildCoverHtml(meta)}<div class="page-break"></div>` : '';

    const css = getCss({ hideFirstPageNumber: includeCover });
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${String(meta.fullName || 'Business Blueprint')}</title>
    <style>${css}</style>
  </head>
  <body>
    ${coverBlock}
    <article class="doc">
      ${contentHtml}
    </article>
  </body>
</html>`;

    fs.writeFileSync(tempHtmlPath, html, 'utf-8');

    await new Promise((resolve, reject) => {
      const proc = spawn(weasyprintPath, [tempHtmlPath, outputPath], { env: process.env });
      let stderr = '';
      proc.stderr.on('data', (d) => {
        stderr += d.toString();
      });
      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(stderr || `weasyprint failed with code ${code}`));
          return;
        }
        resolve();
      });
      proc.on('error', (err) => {
        reject(err);
      });
    });

    return { meta };
  } finally {
    try {
      fs.unlinkSync(tempMdPath);
    } catch {
      // ignore
    }
    try {
      fs.unlinkSync(tempHtmlPath);
    } catch {
      // ignore
    }
  }
}

module.exports = {
  sanitizeFilename,
  checkPandocAvailable,
  checkWeasyprintAvailable,
  generatePdf,
};
