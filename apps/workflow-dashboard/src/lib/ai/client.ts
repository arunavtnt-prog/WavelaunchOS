export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AiGenerateParams = {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
};

export type AiGenerateResult = {
  text: string;
  model: string;
  usage?: { inputTokens?: number; outputTokens?: number };
  raw?: unknown;
};

type Provider = 'proxy' | 'zai';

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable (rate limit, timeout, or server error)
      const isRetryable =
        lastError.message.includes('429') || // Rate limit
        lastError.message.includes('503') || // Service unavailable
        lastError.message.includes('502') || // Bad gateway
        lastError.message.includes('timeout') || // Timeout
        lastError.message.includes('ETIMEDOUT') || // Network timeout
        lastError.message.includes('ECONNRESET'); // Connection reset

      if (!isRetryable || attempt >= maxRetries) {
        throw lastError;
      }

      // Exponential backoff: wait longer with each retry
      const delayMs = baseDelayMs * Math.pow(2, attempt);
      console.log(`[AI Client] Retryable error, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries}): ${lastError.message}`);
      await sleep(delayMs);
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

function getProvider(): Provider {
  const forced = (process.env.AI_PROVIDER || '').toLowerCase().trim();
  if (forced === 'proxy') return 'proxy';
  if (forced === 'zai' || forced === 'direct') return 'zai';

  // Auto-detect: if a z.ai key exists, prefer direct (no localhost dependency).
  const key = process.env.GLM_API_KEY || process.env.ZHIPU_API_KEY;
  if (key) return 'zai';
  return 'proxy';
}

export function getAiConfig() {
  const provider = getProvider();
  return {
    provider,
    proxyUrl: process.env.AI_PROXY_URL || 'http://localhost:3003',
    hasZaiKey: Boolean(process.env.GLM_API_KEY || process.env.ZHIPU_API_KEY),
  };
}

async function generateViaProxyWithRetry(params: Required<AiGenerateParams>): Promise<AiGenerateResult> {
  return retryWithBackoff(async () => {
    const { proxyUrl } = getAiConfig();
    const controller = new AbortController();
    // Use longer timeout for blueprint generation (5 minutes default, configurable)
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 300_000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch(`${proxyUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: params.messages,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
          model: params.model,
        }),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`AI request timed out after ${timeoutMs}ms (proxy)`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`AI proxy error (${response.status}): ${details}`);
    }

    const data = await response.json();
    const text: string = data?.content?.[0]?.text || data?.content?.text || '';
    return {
      text,
      model: data?.model || params.model,
      usage: {
        inputTokens: data?.usage?.input_tokens || 0,
        outputTokens: data?.usage?.output_tokens || 0,
      },
      raw: data,
    };
  }, 3, 2000); // Max 3 retries, starting with 2 second delay
}

async function generateViaZaiWithRetry(params: Required<AiGenerateParams>): Promise<AiGenerateResult> {
  return retryWithBackoff(async () => {
    const key = process.env.GLM_API_KEY || process.env.ZHIPU_API_KEY;
    if (!key) throw new Error('Missing GLM_API_KEY (z.ai)');

    const controller = new AbortController();
    // Use longer timeout for blueprint generation (5 minutes default, configurable)
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 300_000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch('https://api.z.ai/api/coding/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: params.model,
          messages: params.messages,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
          stream: false,
        }),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`AI request timed out after ${timeoutMs}ms (z.ai)`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const details = await response.text().catch(() => '');

      // Handle rate limit with specific error message
      if (response.status === 429) {
        throw new Error(`Rate limit reached (429). The z.ai API has rate limits. Please wait a moment and retry. Details: ${details}`);
      }

      throw new Error(`z.ai error (${response.status}): ${details}`);
    }

    const data = await response.json();
    const text: string = data?.choices?.[0]?.message?.content || '';
    return {
      text,
      model: data?.model || params.model,
      usage: {
        inputTokens: data?.usage?.prompt_tokens || 0,
        outputTokens: data?.usage?.completion_tokens || 0,
      },
      raw: data,
    };
  }, 3, 2000); // Max 3 retries, starting with 2 second delay
}

export async function generateText(params: AiGenerateParams): Promise<AiGenerateResult> {
  const normalized: Required<AiGenerateParams> = {
    messages: params.messages,
    model: params.model || 'glm-4.7',
    maxTokens: params.maxTokens ?? 1200,
    temperature: params.temperature ?? 0.4,
  };

  const { provider } = getAiConfig();
  if (provider === 'zai') return generateViaZaiWithRetry(normalized);
  return generateViaProxyWithRetry(normalized);
}
