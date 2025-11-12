import Anthropic from '@anthropic-ai/sdk'
import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS, CLAUDE_TIMEOUT_MS } from '@/lib/utils/constants'

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

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    try {
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

      return textContent.text
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
