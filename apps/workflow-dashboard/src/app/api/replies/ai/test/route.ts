import { NextRequest, NextResponse } from 'next/server';
import { generateText, getAiConfig } from '@/lib/ai/client';

export async function GET(_request: NextRequest) {
  try {
    const cfg = getAiConfig();
    const result = await generateText({
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
      model: 'glm-4.7',
      maxTokens: 16,
      temperature: 0,
    });

    return NextResponse.json({
      success: true,
      data: {
        provider: cfg.provider,
        model: result.model,
        text: result.text?.slice(0, 80) || '',
        usage: result.usage || null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'AI test failed',
      },
      { status: 500 }
    );
  }
}

