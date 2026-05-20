import { NextRequest, NextResponse } from 'next/server';
import { getAiConfig } from '@/lib/ai/client';

export async function GET(_request: NextRequest) {
  const cfg = getAiConfig();
  if (cfg.provider === 'zai' && !cfg.hasZaiKey) {
    return NextResponse.json(
      { success: false, error: 'Missing GLM_API_KEY for direct z.ai mode' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      provider: cfg.provider,
      apiUrl: cfg.proxyUrl,
      model: 'glm-4.7',
    },
  });
}
