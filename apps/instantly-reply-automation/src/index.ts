#!/usr/bin/env node

/**
 * Instantly Reply Automation
 * Main entry point for the automated email reply system
 */

import { InstantlyClient } from './instantly-client.js';
import { AIClient } from './ai-client.js';
import { ReplyAnalyzer } from './analyzer.js';
import { ReplyGenerator } from './generator.js';
import { logger, setLevel } from './logger.js';
import type { ProcessResult, LogLevel } from './types.js';

// Parse command line arguments
const args = process.argv.slice(2);
const analyzeOnly = args.includes('--analyze-only');
const verbose = args.includes('--verbose');
const dryRun = args.includes('--dry-run');

// Set log level
const logLevel: LogLevel = verbose ? 'debug' : (process.env.LOG_LEVEL as LogLevel) || 'info';
setLevel(logLevel);

// Configuration
const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY;
const AI_API_KEY = process.env.ZAI_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.z.ai/v1';
const CAMPAIGN_ID = process.env.CAMPAIGN_ID;
const EACCOUNT = process.env.EACCOUNT;
const AUTO_SEND_ENABLED = process.env.AUTO_SEND_ENABLED === 'true';
const AUTO_SEND_CONFIDENCE = parseFloat(process.env.AUTO_SEND_CONFIDENCE || '0.85');

// Validate configuration
if (!INSTANTLY_API_KEY) {
  throw new Error('INSTANTLY_API_KEY is required');
}

if (!AI_API_KEY) {
  throw new Error('ZAI_API_KEY is required');
}

// Initialize clients
const instantlyClient = new InstantlyClient(INSTANTLY_API_KEY);
const aiClient = new AIClient({ apiKey: AI_API_KEY, baseUrl: AI_BASE_URL });
const analyzer = new ReplyAnalyzer(aiClient);
const generator = new ReplyGenerator(aiClient);

/**
 * Process a single email reply
 */
async function processEmail(email: any): Promise<ProcessResult> {
  const result: ProcessResult = {
    emailId: email.id,
    threadId: email.thread_id,
    fromEmail: instantlyClient.getFromEmail(email),
    analysis: {} as any,
    processedAt: new Date(),
  };

  try {
    const bodyText = instantlyClient.getBodyText(email);
    const firstName = instantlyClient.getFirstName(email);
    const subject = email.subject || '';

    logger.info(`Processing email from ${result.fromEmail}`, {
      subject,
      firstName,
      bodyPreview: bodyText.slice(0, 100),
    });

    // Analyze the reply
    const analysis = await analyzer.analyze(result.fromEmail || '', subject, bodyText, firstName);
    result.analysis = analysis;

    logger.info(`Analysis result`, {
      intent: analysis.intent,
      objectionType: analysis.objectionType,
      confidence: analysis.confidence,
    });

    // Skip certain intents
    if (analysis.intent === 'OUT_OF_OFFICE') {
      logger.info('Skipping out-of-office message');
      return result;
    }

    if (analysis.intent === 'UNSUBSCRIBE') {
      logger.info('Not replying to unsubscribe request');
      return result;
    }

    if (analysis.intent === 'NOT_INTERESTED' && analysis.confidence > 0.7) {
      logger.info('Not replying to not interested');
      return result;
    }

    // Generate reply
    const reply = await generator.generateReply(analysis, subject);
    result.reply = reply;

    logger.info(`Generated reply`, {
      intent: reply.intent,
      confidence: reply.confidence,
      subject: reply.subject,
      bodyPreview: reply.body.slice(0, 100),
    });

    // Stop here if analyze-only mode
    if (analyzeOnly || dryRun) {
      logger.info(`Dry run / analyze-only mode, not sending reply`);
      return result;
    }

    // Determine if we should auto-send
    const shouldSend = AUTO_SEND_ENABLED && reply.confidence >= AUTO_SEND_CONFIDENCE;

    if (shouldSend) {
      // Check if we have the required fields to send
      const replyToUuid = email.id || email.message_id || email.thread_id;
      const eaccount = email.eaccount || EACCOUNT;

      if (!replyToUuid || !eaccount) {
        logger.warn('Cannot send reply: missing replyToUuid or eaccount', {
          replyToUuid,
          eaccount,
        });
        result.error = 'Missing replyToUuid or eaccount';
        return result;
      }

      // Send the reply
      const sendResult = await instantlyClient.sendReply({
        replyToUuid,
        eaccount,
        subject: reply.subject,
        body: reply.body,
        isHtml: reply.isHtml,
      });

      if (sendResult.success) {
        result.sent = true;
        result.sentMessageId = sendResult.messageId;
        logger.info(`Reply sent successfully`, { messageId: sendResult.messageId });
      } else {
        result.error = sendResult.error;
        logger.error(`Failed to send reply`, { error: sendResult.error });
      }
    } else {
      logger.info(`Not auto-sending (auto-send: ${AUTO_SEND_ENABLED}, confidence: ${reply.confidence} >= ${AUTO_SEND_CONFIDENCE})`);
    }

    return result;
  } catch (error) {
    result.error = String(error);
    logger.error(`Error processing email`, { error, emailId: result.emailId });
    return result;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    logger.info('=' .repeat(60));
    logger.info('Instantly Reply Automation Started');
    logger.info('=' .repeat(60));
    logger.info('Configuration', {
      analyzeOnly,
      dryRun,
      campaignId: CAMPAIGN_ID,
      eaccount: EACCOUNT,
      autoSendEnabled: AUTO_SEND_ENABLED,
      autoSendConfidence: AUTO_SEND_CONFIDENCE,
      logLevel,
    });

    // Fetch all unread emails
    const emails = await instantlyClient.getAllUnreceivedEmails({
      campaignId: CAMPAIGN_ID,
      eaccount: EACCOUNT,
    });

    if (emails.length === 0) {
      logger.info('No unread emails to process');
      logger.info('Done!');
      process.exit(0);
    }

    logger.info(`Found ${emails.length} unread email(s) to process`);

    // Process each email
    const results: ProcessResult[] = [];
    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const email of emails) {
      const result = await processEmail(email);
      results.push(result);

      if (result.sent) {
        sentCount++;
      } else if (result.error) {
        errorCount++;
      } else {
        skippedCount++;
      }

      // Small delay between processing to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Print summary
    logger.info('=' .repeat(60));
    logger.info('Processing Complete');
    logger.info('=' .repeat(60));
    logger.info('Summary', {
      total: emails.length,
      sent: sentCount,
      skipped: skippedCount,
      errors: errorCount,
    });

    // Print detailed results in debug mode
    if (verbose) {
      for (const result of results) {
        logger.debug('Process result', result);
      }
    }

    logger.info('Done!');
    process.exit(0);
  } catch (error) {
    logger.error('Fatal error', { error });
    process.exit(1);
  }
}

// Run the main function
main();
