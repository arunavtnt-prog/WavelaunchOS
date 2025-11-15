import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createPromptSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum([
    'BUSINESS_PLAN',
    'DELIVERABLE_M1',
    'DELIVERABLE_M2',
    'DELIVERABLE_M3',
    'DELIVERABLE_M4',
    'DELIVERABLE_M5',
    'DELIVERABLE_M6',
    'DELIVERABLE_M7',
    'DELIVERABLE_M8',
    'CUSTOM',
  ]),
  content: z.string().min(1),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().default(false),
  isDefault: z.boolean().default(false),
})

// GET /api/prompts - List all prompt templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (activeOnly) {
      where.isActive = true
    }

    const prompts = await prisma.promptTemplate.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { isActive: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({
      success: true,
      data: prompts,
    })
  } catch (error) {
    console.error('Fetch prompts error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

// POST /api/prompts - Create new prompt template
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createPromptSchema.parse(body)

    // If setting as default, unset other defaults of same type
    if (data.isDefault) {
      await prisma.promptTemplate.updateMany({
        where: { type: data.type, isDefault: true },
        data: { isDefault: false },
      })
    }

    // If setting as active, unset other active of same type
    if (data.isActive) {
      await prisma.promptTemplate.updateMany({
        where: { type: data.type, isActive: true },
        data: { isActive: false },
      })
    }

    const prompt = await prisma.promptTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        content: data.content,
        variables: data.variables ? JSON.stringify(data.variables) : null,
        isActive: data.isActive,
        isDefault: data.isDefault,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'PROMPT_CREATED',
        description: `Created prompt template: ${prompt.name}`,
        metadata: JSON.stringify({
          promptId: prompt.id,
          promptType: prompt.type,
        }),
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: prompt,
      message: 'Prompt template created successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create prompt error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create prompt template' },
      { status: 500 }
    )
  }
}
