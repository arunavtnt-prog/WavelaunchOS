import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updatePromptSchema = z.object({
  name: z.string().min(1).max(200).optional(),
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
  ]).optional(),
  content: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
})

// GET /api/prompts/[id] - Get single prompt template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const prompt = await prisma.promptTemplate.findUnique({
      where: { id: params.id },
    })

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: prompt,
    })
  } catch (error) {
    console.error('Fetch prompt error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompt' },
      { status: 500 }
    )
  }
}

// PATCH /api/prompts/[id] - Update prompt template
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.promptTemplate.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Prompt not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = updatePromptSchema.parse(body)

    // If setting as default, unset other defaults of same type
    if (data.isDefault && data.type) {
      await prisma.promptTemplate.updateMany({
        where: { type: data.type, isDefault: true, id: { not: params.id } },
        data: { isDefault: false },
      })
    }

    // If setting as active, unset other active of same type
    if (data.isActive && (data.type || existing.type)) {
      await prisma.promptTemplate.updateMany({
        where: { type: data.type || existing.type, isActive: true, id: { not: params.id } },
        data: { isActive: false },
      })
    }

    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.type) updateData.type = data.type
    if (data.content) updateData.content = data.content
    if (data.variables) updateData.variables = JSON.stringify(data.variables)
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault

    const prompt = await prisma.promptTemplate.update({
      where: { id: params.id },
      data: updateData,
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'PROMPT_UPDATED',
        description: `Updated prompt template: ${prompt.name}`,
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
      message: 'Prompt template updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update prompt error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update prompt template' },
      { status: 500 }
    )
  }
}

// DELETE /api/prompts/[id] - Delete prompt template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const prompt = await prisma.promptTemplate.findUnique({
      where: { id: params.id },
    })

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt not found' }, { status: 404 })
    }

    // Don't allow deletion of default prompts
    if (prompt.isDefault) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete default prompt template' },
        { status: 400 }
      )
    }

    await prisma.promptTemplate.delete({
      where: { id: params.id },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'PROMPT_DELETED',
        description: `Deleted prompt template: ${prompt.name}`,
        metadata: JSON.stringify({
          promptId: prompt.id,
          promptType: prompt.type,
        }),
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Prompt template deleted successfully',
    })
  } catch (error) {
    console.error('Delete prompt error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete prompt template' },
      { status: 500 }
    )
  }
}
