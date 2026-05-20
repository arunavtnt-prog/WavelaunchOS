/**
 * Reply Generator
 * Generates personalized email replies based on analysis
 */

import { AIClient } from './ai-client.js';
import { getTemplateForIntent, COMPANY_DOCUMENTATION } from './templates.js';
import { logger } from './logger.js';
import type { AnalysisResult, GeneratedReply, ReplyIntent } from './types.js';

export class ReplyGenerator {
  constructor(private aiClient: AIClient) {}

  /**
   * Generate a reply based on analysis
   */
  async generateReply(analysis: AnalysisResult, originalSubject: string): Promise<GeneratedReply> {
    logger.info(`Generating reply for intent: ${analysis.intent}`);

    const firstName = analysis.firstName || 'there';

    // For certain intents, use templates directly
    if (this.shouldUseTemplate(analysis.intent, analysis.confidence)) {
      const template = getTemplateForIntent(analysis.intent, analysis.objectionType);
      const body = template.replace(/\{\{firstName\}\}/g, firstName);
      const subject = this.generateSubject(originalSubject, analysis.intent);

      return {
        subject,
        body,
        isHtml: false,
        intent: analysis.intent,
        confidence: analysis.confidence,
        firstName,
      };
    }

    // For other cases or low confidence, use AI to personalize
    return this.generatePersonalizedReply(analysis, originalSubject, firstName);
  }

  /**
   * Check if we should use a template or generate a personalized reply
   */
  private shouldUseTemplate(intent: ReplyIntent, confidence: number): boolean {
    // Always use templates for these
    if (['NOT_INTERESTED', 'UNSUBSCRIBE', 'OUT_OF_OFFICE'].includes(intent)) {
      return true;
    }

    // Use templates for high-confidence objections
    if (intent === 'OBJECTION' && confidence >= 0.7) {
      return true;
    }

    // Use templates for high-confidence interested/questions
    if (['INTERESTED', 'QUESTIONS'].includes(intent) && confidence >= 0.8) {
      return true;
    }

    return false;
  }

  /**
   * Generate a personalized reply using AI
   */
  private async generatePersonalizedReply(
    analysis: AnalysisResult,
    originalSubject: string,
    firstName: string
  ): Promise<GeneratedReply> {
    const template = getTemplateForIntent(analysis.intent, analysis.objectionType);
    const prompt = this.buildGenerationPrompt(analysis, originalSubject, firstName, template);

    try {
      const result = await this.aiClient.generateJSON<{
        subject: string;
        body: string;
      }>(prompt, { maxTokens: 1500, temperature: 0.5 });

      logger.info(`Generated personalized reply`);

      return {
        subject: result.data.subject,
        body: result.data.body,
        isHtml: false,
        intent: analysis.intent,
        confidence: analysis.confidence,
        firstName,
      };
    } catch (error) {
      logger.error('Failed to generate personalized reply, using template', { error });
      // Fallback to template
      const body = template.replace(/\{\{firstName\}\}/g, firstName);
      const subject = this.generateSubject(originalSubject, analysis.intent);

      return {
        subject,
        body,
        isHtml: false,
        intent: analysis.intent,
        confidence: analysis.confidence,
        firstName,
      };
    }
  }

  /**
   * Build the generation prompt
   */
  private buildGenerationPrompt(
    analysis: AnalysisResult,
    originalSubject: string,
    firstName: string,
    baseTemplate: string
  ): string {
    return `You are an email assistant for Wavelaunch Studio, a company that partners with creators to build brands.

## Communication Guidelines
- Warm but professional tone
- Keep emails concise and focused
- No calls, meetings, or video chats - we operate 100% async
- Sign emails as "Warmly, Wavelaunch Studio Team"
- Goal: Get leads to fill out the Vision Form (https://apply.wavelaunch.org/apply)

## Company Context
${COMPANY_DOCUMENTATION.slice(0, 4000)}

## The Email You're Replying To

**Subject**: ${originalSubject}

**Lead's Intent**: ${analysis.intent}
${analysis.objectionType ? `**Objection Type**: ${analysis.objectionType}` : ''}
**Confidence**: ${analysis.confidence}
${analysis.keyPoints ? `**Key Points**: ${analysis.keyPoints.join(', ')}` : ''}
${analysis.reason ? `**Reason**: ${analysis.reason}` : ''}

## Base Template

Use this as your starting point, but personalize it based on the lead's response:

${baseTemplate}

## Instructions

1. Personalize the email for the lead's response
2. Address any specific questions or concerns they raised
3. Keep the tone warm but professional
4. End with the Vision Form CTA if appropriate
5. Replace {{firstName}} with "${firstName}"
6. Keep it concise - 300-500 words max

## Response Format

Respond with JSON only:
\`\`\`json
{
  "subject": "reply_subject_line",
  "body": "full_email_body_without_signature"
}
\`\`\`

Now generate the best reply email.`;
  }

  /**
   * Generate an appropriate subject line
   */
  private generateSubject(originalSubject: string, intent: ReplyIntent): string {
    const lowerOriginal = originalSubject.toLowerCase();

    if (lowerOriginal.includes('re:')) {
      return originalSubject;
    }

    if (intent === 'NOT_INTERESTED' || intent === 'UNSUBSCRIBE') {
      return originalSubject;
    }

    if (intent === 'OUT_OF_OFFICE') {
      return `Re: ${originalSubject}`;
    }

    return `Re: ${originalSubject}`;
  }
}
