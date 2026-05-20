import Anthropic from '@anthropic-ai/sdk'
import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS, CLAUDE_TIMEOUT_MS } from '@/lib/utils/constants'
import {
  generateCacheKey,
  generatePromptHash,
  checkCache,
  storeCache,
  updateTokensSaved,
} from './cache'
import { logTokenUsage, checkBudget, type TokenUsageData } from './token-tracker'

export interface GenerateOptions {
  systemPrompt?: string
  useCache?: boolean
  cacheTTLHours?: number
  operation?: string
  clientId?: string
  userId?: string
  metadata?: Record<string, any>
}

export class ClaudeClient {
  private client: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }

    this.client = new Anthropic({
      apiKey,
      timeout: CLAUDE_TIMEOUT_MS,
    })
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const {
      systemPrompt,
      useCache = true,
      cacheTTLHours = 168, // 7 days
      operation = 'GENERATE',
      clientId,
      userId,
      metadata,
    } = options

    try {
      // Check budget first
      const budgetCheck = await checkBudget()
      if (!budgetCheck.allowed) {
        throw new Error(`Token budget exceeded: ${budgetCheck.reason}`)
      }

      // Check cache if enabled
      let cacheKey: string | undefined
      if (useCache) {
        cacheKey = generateCacheKey(prompt, CLAUDE_MODEL, {
          temperature: 1.0,
          maxTokens: CLAUDE_MAX_TOKENS,
          systemPrompt,
        })

        const cached = await checkCache(cacheKey)
        if (cached) {
          // Log cache hit
          const promptTokens = await this.countTokens(prompt + (systemPrompt || ''))
          const completionTokens = await this.countTokens(cached)

          await logTokenUsage({
            operation,
            model: CLAUDE_MODEL,
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
            cacheHit: true,
            cacheKey,
            clientId,
            userId,
            metadata,
          })

          // Update tokens saved
          await updateTokensSaved(cacheKey, promptTokens + completionTokens)

          return cached
        }
      }

      // Generate new response
      const message = await this.client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: CLAUDE_MAX_TOKENS,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      // Extract text from response
      const textContent = message.content.find((block) => block.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response')
      }

      const response = textContent.text

      // Log token usage
      const promptTokens = message.usage.input_tokens
      const completionTokens = message.usage.output_tokens

      await logTokenUsage({
        operation,
        model: CLAUDE_MODEL,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        cacheHit: false,
        cacheKey,
        clientId,
        userId,
        metadata,
      })

      // Store in cache
      if (useCache && cacheKey) {
        const promptHash = generatePromptHash(prompt)
        await storeCache(cacheKey, promptHash, response, CLAUDE_MODEL, cacheTTLHours)
      }

      return response
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API error: ${error.message}`)
      }
      throw error
    }
  }

  async generateStream(
    prompt: string,
    systemPrompt?: string,
    onChunk?: (text: string) => void
  ): Promise<string> {
    try {
      const stream = await this.client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: CLAUDE_MAX_TOKENS,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
      })

      let fullText = ''

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const text = event.delta.text
          fullText += text
          if (onChunk) {
            onChunk(text)
          }
        }
      }

      return fullText
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API error: ${error.message}`)
      }
      throw error
    }
  }

  async countTokens(text: string): Promise<number> {
    // Approximate token count (Claude uses ~4 chars per token)
    return Math.ceil(text.length / 4)
  }
}

// Singleton instance
let claudeClient: ClaudeClient | null = null

export function getClaudeClient(): ClaudeClient {
  if (!claudeClient) {
    claudeClient = new ClaudeClient()
  }
  return claudeClient
}
