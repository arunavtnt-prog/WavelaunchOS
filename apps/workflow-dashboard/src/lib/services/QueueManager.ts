import { db } from '@/lib/db/prisma';
import type { Application, WorkflowStatus, WorkflowState } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export interface QueueItem {
  id: string;
  application: Application;
  workflowState: WorkflowState | null;
}

export interface QueueFilters {
  status?: WorkflowStatus;
  country?: string;
  industryNiche?: string;
  search?: string;
}

export class QueueManager {
  /**
   * Get applications queued for review
   */
  static async getQueue(filters?: QueueFilters): Promise<QueueItem[]> {
    const where: any = {};

    if (filters?.status) {
      where.workflowState = {
        status: filters.status,
      };
    } else {
      // Default to SUBMITTED status for queue
      where.OR = [
        { workflowState: null },
        { workflowState: { status: 'SUBMITTED' } },
      ];
    }

    if (filters?.country) {
      where.country = { contains: filters.country, mode: 'insensitive' };
    }

    if (filters?.industryNiche) {
      where.industryNiche = { contains: filters.industryNiche, mode: 'insensitive' };
    }

    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { instagramHandle: { contains: filters.search, mode: 'insensitive' } },
        { tiktokHandle: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const applications = await db.application.findMany({
      where,
      include: {
        workflowState: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return applications.map((app) => ({
      id: app.id,
      application: app,
      workflowState: app.workflowState,
    }));
  }

  /**
   * Approve application for workflow processing
   */
  static async approve(applicationId: string, userId: string): Promise<WorkflowState> {
    // Check if workflow state exists
    let workflowState = await db.workflowState.findUnique({
      where: { applicationId },
    });

    if (workflowState) {
      // Update existing state
      workflowState = await db.workflowState.update({
        where: { applicationId },
        data: {
          status: 'SNAPSHOT_QUEUED',
          statusHistory: [
            ...(workflowState.statusHistory as any[]),
            {
              from: workflowState.status,
              to: 'SNAPSHOT_QUEUED',
              at: new Date().toISOString(),
              by: userId,
            },
          ],
        },
      });
    } else {
      // Create new workflow state
      workflowState = await db.workflowState.create({
        data: {
          applicationId,
          status: 'SNAPSHOT_QUEUED',
          statusHistory: [
            {
              from: 'SUBMITTED',
              to: 'SNAPSHOT_QUEUED',
              at: new Date().toISOString(),
              by: userId,
            },
          ],
        },
      });
    }

    // Log the action
    await db.workflowAuditLog.create({
      data: {
        workflowId: workflowState.id,
        action: 'APPROVE_FOR_SNAPSHOT',
        performedBy: userId,
        oldStatus: 'SUBMITTED',
        newStatus: 'SNAPSHOT_QUEUED',
        metadata: {
          applicationId,
        },
      },
    });

    // Update application status
    await db.application.update({
      where: { id: applicationId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
    });

    revalidatePath('/queue');
    revalidatePath('/');

    return workflowState;
  }

  /**
   * Reject application
   */
  static async reject(applicationId: string, userId: string, reason?: string): Promise<WorkflowState | null> {
    // Check if workflow state exists
    let workflowState = await db.workflowState.findUnique({
      where: { applicationId },
    });

    if (workflowState) {
      // Update existing state
      workflowState = await db.workflowState.update({
        where: { applicationId },
        data: {
          status: 'REJECTED',
          statusHistory: [
            ...(workflowState.statusHistory as any[]),
            {
              from: workflowState.status,
              to: 'REJECTED',
              at: new Date().toISOString(),
              by: userId,
              reason,
            },
          ],
        },
      });
    } else {
      // Create new workflow state as rejected
      workflowState = await db.workflowState.create({
        data: {
          applicationId,
          status: 'REJECTED',
          statusHistory: [
            {
              from: 'SUBMITTED',
              to: 'REJECTED',
              at: new Date().toISOString(),
              by: userId,
              reason,
            },
          ],
        },
      });
    }

    // Log the action
    await db.workflowAuditLog.create({
      data: {
        workflowId: workflowState.id,
        action: 'REJECT_APPLICATION',
        performedBy: userId,
        oldStatus: 'SUBMITTED',
        newStatus: 'REJECTED',
        metadata: {
          applicationId,
          reason,
        },
      },
    });

    // Update application status
    await db.application.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewNotes: reason,
      },
    });

    revalidatePath('/queue');
    revalidatePath('/');

    return workflowState;
  }

  /**
   * Bulk approve applications
   */
  static async bulkApprove(applicationIds: string[], userId: string): Promise<void> {
    await Promise.all(
      applicationIds.map((id) => this.approve(id, userId))
    );
  }

  /**
   * Bulk reject applications
   */
  static async bulkReject(applicationIds: string[], userId: string, reason?: string): Promise<void> {
    await Promise.all(
      applicationIds.map((id) => this.reject(id, userId, reason))
    );
  }

  /**
   * Get queue statistics
   */
  static async getStats(): Promise<{
    submitted: number;
    snapshotQueued: number;
    snapshotGenerating: number;
    total: number;
  }> {
    const [submitted, snapshotQueued, snapshotGenerating] = await Promise.all([
      db.application.count({
        where: {
          OR: [
            { workflowState: null },
            { workflowState: { status: 'SUBMITTED' } },
          ],
        },
      }),
      db.workflowState.count({ where: { status: 'SNAPSHOT_QUEUED' } }),
      db.workflowState.count({ where: { status: 'SNAPSHOT_GENERATING' } }),
    ]);

    return {
      submitted,
      snapshotQueued,
      snapshotGenerating,
      total: submitted + snapshotQueued + snapshotGenerating,
    };
  }
}
