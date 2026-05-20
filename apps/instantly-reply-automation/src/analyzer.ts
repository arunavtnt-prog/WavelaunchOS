/**
 * Reply Analyzer
 * Analyzes incoming email replies to classify intent and extract information
 */

import { AIClient } from './ai-client.js';
import { logger } from './logger.js';
import type { AnalysisResult, ReplyIntent, ObjectionType } from './types.js';

export class ReplyAnalyzer {
  constructor(private aiClient: AIClient) {}

  /**
   * Analyze an email reply
   */
  async analyze(
    fromEmail: string,
    subject: string,
    body: string,
    firstName?: string
  ): Promise<AnalysisResult> {
    logger.info(`Analyzing reply from ${fromEmail}`);

    const prompt = this.buildAnalysisPrompt(fromEmail, subject, body, firstName);

    try {
      const result = await this.aiClient.generateJSON<{
        intent: ReplyIntent;
        objectionType?: ObjectionType;
        firstName?: string;
        lastName?: string;
        confidence: number;
        keyPoints?: string[];
        reason?: string;
      }>(prompt, { maxTokens: 800, temperature: 0.2 });

      logger.info(`Analysis complete`, {
        intent: result.data.intent,
        objectionType: result.data.objectionType,
        confidence: result.data.confidence,
      });

      return {
        intent: result.data.intent,
        objectionType: result.data.objectionType,
        firstName: result.data.firstName || firstName,
        lastName: result.data.lastName,
        confidence: result.data.confidence,
        keyPoints: result.data.keyPoints,
        reason: result.data.reason,
      };
    } catch (error) {
      logger.error('Analysis failed, using fallback', { error });
      return this.fallbackAnalysis(body, firstName);
    }
  }

  /**
   * Build the analysis prompt
   */
  private buildAnalysisPrompt(
    fromEmail: string,
    subject: string,
    body: string,
    firstName?: string
  ): string {
    return `You are analyzing email replies for Wavelaunch Studio, a company that partners with creators to build brands.

Your task: Classify the email reply and extract key information.

## Reply Classification Categories

**INTERESTED**: Creator expresses interest, wants to learn more, or asks for next steps. Examples:
- "I'm interested"
- "Tell me more"
- "I'd like to learn more"
- "Sounds good"
- "Let's talk"
- Positive responses, agreement, openness

**QUESTIONS**: Creator asks general questions about the partnership. Examples:
- Questions about services
- Questions about the process
- Questions about what we do
- General curiosity

**OBJECTION**: Creator raises concerns or objections. Common types:
- **PRICING**: Concerns about $5K fee, revenue share, or equity
- **TIMELINE**: Concerns about time commitment or duration
- **CONTROL**: Concerns about losing control or creative freedom
- **TRUST**: Concerns about legitimacy, track record, or who we are
- **RELEVANCE**: Doesn't see fit for their situation
- **ALREADY_DOING_IT**: Already has a brand or doing something similar
- **TOO_BUSY**: Doesn't have time or bandwidth
- **NOT_READY**: Timing isn't right or not ready yet

**NOT_INTERESTED**: Creator declines or indicates not interested. Examples:
- "Not interested"
- "No thanks"
- "Not for me"
- "I'm good"
- Explicit rejection

**UNSUBSCRIBE**: Creator asks to unsubscribe or stop emails. Examples:
- "Unsubscribe"
- "Remove me"
- "Stop emailing"
- "Take me off your list"

**OUT_OF_OFFICE**: Auto-reply / out of office message.

**OTHER**: Doesn't fit above categories.

## Response Format

Respond with JSON only:
\`\`\`json
{
  "intent": "CATEGORY",
  "objectionType": "OBJECTION_TYPE_OR_NULL",
  "firstName": "extracted_first_name_OR_NULL",
  "lastName": "extracted_last_name_OR_NULL",
  "confidence": 0.0_to_1.0,
  "keyPoints": ["list", "key", "points"],
  "reason": "brief_explanation"
}
\`\`\`

## Email to Analyze

**From**: ${fromEmail}
**Subject**: ${subject}
**First Name**: ${firstName || 'Unknown'}

**Body**:
${body.slice(0, 3000)}

Now analyze this email and respond with JSON only.`;
  }

  /**
   * Fallback analysis when AI fails
   */
  private fallbackAnalysis(body: string, firstName?: string): AnalysisResult {
    const lowerBody = body.toLowerCase();

    // Check for unsubscribe
    if (
      lowerBody.includes('unsubscribe') ||
      lowerBody.includes('remove me') ||
      lowerBody.includes('take me off') ||
      lowerBody.includes('stop email')
    ) {
      return { intent: 'UNSUBSCRIBE', confidence: 0.8, firstName };
    }

    // Check for out of office
    if (
      lowerBody.includes('out of office') ||
      lowerBody.includes('out of the office') ||
      lowerBody.includes('auto-reply') ||
      lowerBody.includes('automated reply') ||
      lowerBody.includes('currently out') ||
      lowerBody.includes('away from my desk')
    ) {
      return { intent: 'OUT_OF_OFFICE', confidence: 0.9, firstName };
    }

    // Check for not interested
    if (
      lowerBody.includes('not interested') ||
      lowerBody.includes('not for me') ||
      lowerBody.includes('no thanks') ||
      lowerBody.includes('i\'m good') ||
      lowerBody.includes('im good') ||
      lowerBody.includes('not interested in')
    ) {
      return { intent: 'NOT_INTERESTED', confidence: 0.8, firstName };
    }

    // Check for interested
    if (
      lowerBody.includes('interested') ||
      lowerBody.includes('tell me more') ||
      lowerBody.includes('sounds good') ||
      lowerBody.includes('let\'s talk') ||
      lowerBody.includes('lets talk') ||
      lowerBody.includes('i\'d like') ||
      lowerBody.includes('id like')
    ) {
      return { intent: 'INTERESTED', confidence: 0.7, firstName };
    }

    // Check for questions
    if (
      lowerBody.includes('?') ||
      lowerBody.includes('what') ||
      lowerBody.includes('how') ||
      lowerBody.includes('why') ||
      lowerBody.includes('when')
    ) {
      return { intent: 'QUESTIONS', confidence: 0.6, firstName };
    }

    // Default to other
    return { intent: 'OTHER', confidence: 0.5, firstName };
  }
}
