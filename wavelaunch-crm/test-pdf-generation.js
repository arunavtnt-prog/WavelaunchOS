#!/usr/bin/env node

// Simple test for PDF generation
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs/promises');
const path = require('path');

const execAsync = promisify(exec);

async function testPDFGeneration() {
  console.log('Testing PDF generation...');
  
  try {
    // Test content
    const content = `# Test Business Plan

## Executive Summary
This is a test business plan to verify PDF generation works.

## Company Overview
Our company provides innovative solutions.

## Market Analysis
The market is growing rapidly.`;

    // Create test directory
    const testDir = path.join(process.cwd(), 'data', 'temp');
    await fs.mkdir(testDir, { recursive: true });
    
    // Create temporary files
    const timestamp = Date.now();
    const markdownPath = path.join(testDir, `test-${timestamp}.md`);
    const outputPath = path.join(testDir, `test-${timestamp}.pdf`);
    
    // Write content
    await fs.writeFile(markdownPath, content, 'utf-8');
    
    // Get template path
    const templatePath = path.join(process.cwd(), 'templates', 'business-plan.tex');
    
    // Build Pandoc command
    const command = [
      'pandoc',
      `"${markdownPath}"`,
      `--template="${templatePath}"`,
      '--pdf-engine=xelatex',
      '-V geometry:margin=1in',
      '--number-sections',
      '-o', `"${outputPath}"`
    ].join(' ');
    
    console.log('Running command:', command);
    
    // Execute Pandoc
    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024
    });
    
    console.log('Pandoc stdout:', stdout);
    console.log('Pandoc stderr:', stderr);
    
    // Check if PDF was created
    const stats = await fs.stat(outputPath);
    console.log('PDF generated successfully!');
    console.log('File size:', stats.size, 'bytes');
    
    // Clean up
    await fs.unlink(markdownPath);
    await fs.unlink(outputPath);
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('PDF generation test failed:', error);
    process.exit(1);
  }
}

testPDFGeneration();
