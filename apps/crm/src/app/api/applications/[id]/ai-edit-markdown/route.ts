import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const schema = z.object({
  markdown: z.string().min(1, 'Markdown content is required'),
  instructions: z.string().min(1, 'Instructions are required'),
})

// z.ai API configuration
const ZAI_API_KEY = 'ccd0288c43a94911b59a67e61bcb11c3.3AOblzsUwTkDgUFX'
const ZAI_ANTHROPIC_API_URL = 'https://api.z.ai/api/anthropic/v1/messages'

// POST /api/applications/[id]/ai-edit-markdown - AI-powered markdown editing using Claude via z.ai proxy
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { markdown, instructions } = schema.parse(body)

    // System prompt for AI editing
    const systemPrompt = `You are an expert document editor specializing in business plans and blueprints. Your task is to edit markdown documents according to user instructions while:

1. Maintaining the original markdown structure and formatting
2. Ensuring consistency across the entire document
3. Making intelligent contextual adjustments (e.g., if changing a revenue target, update related projections, percentages, and logic accordingly)
4. Preserving numbered sections (like "1.1 Title", "1.2 Title") exactly as they are
5. Keeping the tone and style consistent
6. Not adding any conversational filler - return ONLY the edited markdown

Return ONLY the edited markdown content, no explanations or commentary.`

    const userPrompt = `Please edit the following markdown document according to these instructions:

${instructions}

ORIGINAL MARKDOWN:
${markdown}

EDITED MARKDOWN:`

    // Call Claude API via z.ai proxy (Anthropic format)
    const response = await fetch(ZAI_ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ZAI_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 16000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('z.ai API error:', errorText)
      throw new Error(`z.ai API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    // Extract the edited markdown from the response
    const editedMarkdown = data.content?.[0]?.text || markdown

    return NextResponse.json({
      success: true,
      originalMarkdown: markdown,
      editedMarkdown,
      usage: data.usage,
    })

  } catch (error) {
    console.error('AI editing error:', error)
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}
