import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import fs from 'fs/promises';
import path from 'path';

const PROMPTS_FILE = path.join(process.cwd(), 'src', 'lib', 'prompts', 'Prompts.ts');

/**
 * Parse prompt exports from Prompts.ts file
 */
async function parsePromptsFile(): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(PROMPTS_FILE, 'utf-8');

    const prompts: Record<string, string> = {};

    // Extract BASE_PROMPT
    const basePromptMatch = content.match(/export const BASE_PROMPT = `([\s\S]*?)`;/);
    if (basePromptMatch) {
      prompts.BASE_PROMPT = basePromptMatch[1];
    }

    // Extract individual stage prompts
    const stagePromptMatches = content.matchAll(/export const (\w+_PROMPT) = `([\s\S]*?)`;/g);
    for (const match of stagePromptMatches) {
      const key = match[1].replace('_PROMPT', '');
      prompts[key] = match[2];
    }

    // Extract DATA_INTEGRITY and OUTPUT_FORMAT as separate exports (if they exist)
    const dataIntegrityMatch = content.match(/export const DATA_INTEGRITY_PROMPT = `([\s\S]*?)`;/);
    if (dataIntegrityMatch) {
      prompts.DATA_INTEGRITY = dataIntegrityMatch[1];
    }

    const outputFormatMatch = content.match(/export const OUTPUT_FORMAT_PROMPT = `([\s\S]*?)`;/);
    if (outputFormatMatch) {
      prompts.OUTPUT_FORMAT = outputFormatMatch[1];
    }

    return prompts;
  } catch (error) {
    console.error('Error reading prompts file:', error);
    return {};
  }
}

/**
 * Rebuild Prompts.ts file with updated content
 */
async function rebuildPromptsFile(updates: Record<string, string>, originalContent?: string): Promise<boolean> {
  try {
    // Read the original Prompts file if not provided
    const content = originalContent || await fs.readFile(PROMPTS_FILE, 'utf-8');

    let updatedContent = content;

    // Helper function to escape content for JavaScript template literals (for single-line format)
    const escapeForJs = (str: string): string => {
      return str
        .replace(/\\/g, '\\\\')  // Escape backslashes first
        .replace(/`/g, '\\`')    // Then escape backticks
        .replace(/\$/g, '\\$')    // Escape dollar signs (for ${})
        .replace(/\n/g, '\\n')   // Escape newlines
        .replace(/\r/g, '\\r');   // Escape carriage returns
    };

    // For multi-line template literals, only escape backticks, ${}, and backslashes
    const escapeForMultiLine = (str: string): string => {
      return str
        .replace(/\\/g, '\\\\')  // Escape backslashes first
        .replace(/`/g, '\\`')    // Then escape backticks
        .replace(/\$/g, '\\$');  // Escape dollar signs (for ${})
    };

    // Update BASE_PROMPT (single-line format with escaped newlines)
    if (updates.BASE_PROMPT !== undefined) {
      const baseRegex = /export const BASE_PROMPT = `[^`]*`;/;
      const replacement = 'export const BASE_PROMPT = `' + escapeForJs(updates.BASE_PROMPT) + '`;';
      updatedContent = updatedContent.replace(baseRegex, replacement);
      console.log('Updated BASE_PROMPT');
    }

    // Update DATA_INTEGRITY_PROMPT (multi-line format)
    if (updates.DATA_INTEGRITY !== undefined) {
      const promptRegex = /export const DATA_INTEGRITY_PROMPT = `[\s\S]*?`;/g;
      const escapedValue = escapeForMultiLine(updates.DATA_INTEGRITY);
      const replacement = 'export const DATA_INTEGRITY_PROMPT = `\n' + escapedValue + '`;';
      updatedContent = updatedContent.replace(promptRegex, replacement);
      console.log('Updated DATA_INTEGRITY_PROMPT');
    }

    // Update OUTPUT_FORMAT_PROMPT (multi-line format)
    if (updates.OUTPUT_FORMAT !== undefined) {
      const promptRegex = /export const OUTPUT_FORMAT_PROMPT = `[\s\S]*?`;/g;
      const escapedValue = escapeForMultiLine(updates.OUTPUT_FORMAT);
      const replacement = 'export const OUTPUT_FORMAT_PROMPT = `\n' + escapedValue + '`;';
      updatedContent = updatedContent.replace(promptRegex, replacement);
      console.log('Updated OUTPUT_FORMAT_PROMPT');
    }

    // Update individual prompts (multi-line format)
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'BASE_PROMPT' || key === 'DATA_INTEGRITY' || key === 'OUTPUT_FORMAT') {
        // These are handled above
        continue;
      }

      const promptName = `${key}_PROMPT`;

      // First, check if this prompt exists in the file
      const checkRegex = new RegExp('export const ' + promptName + ' = ');
      if (!checkRegex.test(updatedContent)) {
        console.log(`Prompt ${promptName} not found in file`);
        continue;
      }

      // Match the entire export statement including the multi-line template
      // Use [\s\S]*? to match across multiple lines
      const promptRegex = new RegExp(
        'export const ' + promptName + ' = `' + '[\\s\\S]*?' + '`;',
        'g'
      );

      // Check if the regex matches
      const match = updatedContent.match(promptRegex);
      if (match) {
        console.log(`Found ${promptName} with ${match[0].length} characters`);
      } else {
        console.log(`No match found for ${promptName}`);
      }

      // Create replacement with multi-line format (preserve newlines)
      const escapedValue = escapeForMultiLine(value);
      const replacement = 'export const ' + promptName + ' = `\n' + escapedValue + '`;';

      const newContent = updatedContent.replace(promptRegex, replacement);
      if (newContent === updatedContent) {
        console.log(`Replacement failed for ${promptName}`);
      } else {
        console.log(`Successfully replaced ${promptName}`);
      }
      updatedContent = newContent;
    }

    // Write back to file
    await fs.writeFile(PROMPTS_FILE, updatedContent, 'utf-8');

    return true;
  } catch (error) {
    console.error('Error writing prompts file:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Skip auth check for development - prompts should be accessible
  try {
    const prompts = await parsePromptsFile();

    return NextResponse.json({
      success: true,
      data: prompts,
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch prompts',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Skip auth check for development
  try {
    const body = await request.json();
    const { action, key, content } = body;

    if (action === 'save') {
      const success = await rebuildPromptsFile({ [key]: content });

      if (success) {
        return NextResponse.json({
          success: true,
          message: `Prompt ${key} updated successfully`,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to save prompt',
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
    }, { status: 400 });
  } catch (error) {
    console.error('Error updating prompts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update prompts',
    }, { status: 500 });
  }
}
