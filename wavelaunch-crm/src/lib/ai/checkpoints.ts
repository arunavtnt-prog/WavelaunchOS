import { db } from '@/lib/db'

export interface CheckpointData {
  jobId: string
  jobType: 'BUSINESS_PLAN' | 'DELIVERABLE'
  clientId: string
  totalSections: number
  completedSections: number
  currentSection: number
  generatedContent: any
  promptContext: any
  metadata?: any
}

/**
 * Create or update a checkpoint
 */
export async function saveCheckpoint(data: CheckpointData): Promise<void> {
  try {
    await db.generationCheckpoint.upsert({
      where: { jobId: data.jobId },
      create: {
        jobId: data.jobId,
        jobType: data.jobType,
        clientId: data.clientId,
        status: 'IN_PROGRESS',
        totalSections: data.totalSections,
        completedSections: data.completedSections,
        currentSection: data.currentSection,
        generatedContent: JSON.stringify(data.generatedContent),
        promptContext: JSON.stringify(data.promptContext),
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        canResume: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        completedSections: data.completedSections,
        currentSection: data.currentSection,
        generatedContent: JSON.stringify(data.generatedContent),
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Save checkpoint error:', error)
  }
}

/**
 * Get a checkpoint by job ID
 */
export async function getCheckpoint(jobId: string) {
  try {
    const checkpoint = await db.generationCheckpoint.findUnique({
      where: { jobId },
    })

    if (!checkpoint) {
      return null
    }

    return {
      ...checkpoint,
      generatedContent: JSON.parse(checkpoint.generatedContent),
      promptContext: JSON.parse(checkpoint.promptContext),
      metadata: checkpoint.metadata ? JSON.parse(checkpoint.metadata) : null,
    }
  } catch (error) {
    console.error('Get checkpoint error:', error)
    return null
  }
}

/**
 * Mark a checkpoint as completed
 */
export async function completeCheckpoint(jobId: string): Promise<void> {
  try {
    await db.generationCheckpoint.update({
      where: { jobId },
      data: {
        status: 'COMPLETED',
        canResume: false,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Complete checkpoint error:', error)
  }
}

/**
 * Mark a checkpoint as failed
 */
export async function failCheckpoint(
  jobId: string,
  errorMessage?: string
): Promise<void> {
  try {
    await db.generationCheckpoint.update({
      where: { jobId },
      data: {
        status: 'FAILED',
        canResume: true,
        errorMessage,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Fail checkpoint error:', error)
  }
}

/**
 * Delete a checkpoint
 */
export async function deleteCheckpoint(jobId: string): Promise<void> {
  try {
    await db.generationCheckpoint.delete({
      where: { jobId },
    })
  } catch (error) {
    console.error('Delete checkpoint error:', error)
  }
}

/**
 * Get all resumable checkpoints for a client
 */
export async function getResumableCheckpoints(clientId?: string) {
  try {
    const where: any = {
      canResume: true,
      status: {
        in: ['IN_PROGRESS', 'FAILED'],
      },
    }

    if (clientId) {
      where.clientId = clientId
    }

    const checkpoints = await db.generationCheckpoint.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        client: {
          select: {
            id: true,
            creatorName: true,
            brandName: true,
          },
        },
      },
    })

    return checkpoints.map((checkpoint) => ({
      ...checkpoint,
      generatedContent: JSON.parse(checkpoint.generatedContent),
      promptContext: JSON.parse(checkpoint.promptContext),
      metadata: checkpoint.metadata ? JSON.parse(checkpoint.metadata) : null,
    }))
  } catch (error) {
    console.error('Get resumable checkpoints error:', error)
    return []
  }
}

/**
 * Clean up old completed checkpoints (older than 7 days)
 */
export async function cleanupOldCheckpoints(): Promise<number> {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const result = await db.generationCheckpoint.deleteMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          lt: sevenDaysAgo,
        },
      },
    })

    return result.count
  } catch (error) {
    console.error('Cleanup old checkpoints error:', error)
    return 0
  }
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(checkpoint: {
  completedSections: number
  totalSections: number
}): number {
  if (checkpoint.totalSections === 0) return 0
  return Math.round((checkpoint.completedSections / checkpoint.totalSections) * 100)
}
