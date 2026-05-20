#!/usr/bin/env node

/**
 * Single Reply Test
 * Test the reply generation with a specific email
 */

import { AIClient } from './ai-client.js';
import { ReplyAnalyzer } from './analyzer.js';
import { ReplyGenerator } from './generator.js';
import { logger } from './logger.js';

// Set log level to debug for testing
logger.debug('Single Reply Test Mode');

// Configuration
const AI_API_KEY = process.env.ZAI_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.z.ai/v1';

if (!AI_API_KEY) {
  throw new Error('ZAI_API_KEY is required');
}

// Initialize clients
const aiClient = new AIClient({ apiKey: AI_API_KEY, baseUrl: AI_BASE_URL });
const analyzer = new ReplyAnalyzer(aiClient);
const generator = new ReplyGenerator(aiClient);

// Test email (you can modify this)
const testEmail = {
  fromEmail: 'sierra@example.com',
  subject: 'Re: Partnership Opportunity',
  body: `Yes, I would be interested. - Sierra`,
  firstName: 'Sierra',
};

async function test() {
  console.log('='.repeat(60));
  console.log('Testing Reply Generation');
  console.log('='.repeat(60));
  console.log('Input Email:');
  console.log(`From: ${testEmail.fromEmail}`);
  console.log(`Subject: ${testEmail.subject}`);
  console.log(`Body: ${testEmail.body}`);
  console.log('');

  // Analyze
  const analysis = await analyzer.analyze(
    testEmail.fromEmail,
    testEmail.subject,
    testEmail.body,
    testEmail.firstName
  );

  console.log('='.repeat(60));
  console.log('Analysis Result:');
  console.log('='.repeat(60));
  console.log(JSON.stringify(analysis, null, 2));
  console.log('');

  // Generate reply
  const reply = await generator.generateReply(analysis, testEmail.subject);

  console.log('='.repeat(60));
  console.log('Generated Reply:');
  console.log('='.repeat(60));
  console.log(`Subject: ${reply.subject}`);
  console.log('');
  console.log(reply.body);
  console.log('');
  console.log('='.repeat(60));
  console.log('Done!');
  console.log('='.repeat(60));
}

test().catch(console.error);
