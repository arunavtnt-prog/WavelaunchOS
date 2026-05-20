/**
 * AI Client for generating replies
 * Supports z.ai / GLM-4.7 via OpenAI-compatible API
 */

import OpenAI from 'openai';
import { logger } from './logger.js';

export interface AIClientConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
}

export class AIClient {
  private client: OpenAI;
  private model: string;
  private timeout: number;

  constructor(config: AIClientConfig) {
    this.model = config.model || 'glm-4-plus';
    this.timeout = config.timeout || 60000;

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || 'https://api.z.ai/v1',
      timeout: this.timeout,
    });

    logger.info(`AI Client initialized`, { model: this.model, baseUrl: config.baseUrl });
  }

  /**
   * Generate text using the AI model
   */
  async generate(prompt: string, options: GenerateOptions = {}): Promise<{
    text: string;
    model: string;
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    logger.debug(`Generating text with ${this.model}`, {
      maxTokens: options.maxTokens,
      temperature: options.temperature,
    });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.4,
    });

    const text = response.choices[0]?.message?.content || '';
    const usage = response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined;

    logger.debug(`AI generation complete`, {
      textLength: text.length,
      usage,
    });

    return {
      text,
      model: this.model,
      usage,
    };
  }

  /**
   * Generate with JSON response (structured output)
   */
  async generateJSON<T = any>(prompt: string, options: GenerateOptions = {}): Promise<{
    data: T;
    text: string;
    model: string;
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    // Add JSON instruction to prompt if not present
    const jsonPrompt = prompt.includes('Respond with JSON')
      ? prompt
      : `${prompt}\n\nRespond with JSON only, no other text.`;

    const result = await this.generate(jsonPrompt, options);

    // Try to parse JSON from the response
    let data: T;

    try {
      // Remove code fences if present
      const cleaned = result.text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      data = JSON.parse(cleaned) as T;
    } catch (error) {
      logger.error('Failed to parse JSON response', { text: result.text, error });
      throw new Error(`Failed to parse JSON from AI response: ${error}`);
    }

    return {
      data,
      text: result.text,
      model: result.model,
      usage: result.usage,
    };
  }

  getModel(): string {
    return this.model;
  }
}
