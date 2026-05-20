/* eslint-disable no-console */

// Usage:
//   node scripts/generate-pdf.js <input.md> [output.pdf]
//
// Example:
//   node scripts/generate-pdf.js ../test-business-plan.md ./output/test-business-plan.pdf

const fs = require('fs');
const path = require('path');
const { generatePdf, sanitizeFilename } = require('../lib/renderer');

async function main() {
  const inputPath = process.argv[2];
  const outputArg = process.argv[3];

  if (!inputPath) {
    console.error('Missing input markdown path.\nUsage: node scripts/generate-pdf.js <input.md> [output.pdf]');
    process.exit(1);
  }

  const markdown = fs.readFileSync(inputPath, 'utf-8');
  const outputPath = outputArg
    ? path.resolve(outputArg)
    : path.resolve(__dirname, '..', 'output', sanitizeFilename(path.basename(inputPath).replace(/\.md$/i, '.pdf')));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  await generatePdf({ markdown, outputPath, options: { includeCover: true } });
  console.log(`✅ PDF written: ${outputPath}`);
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
