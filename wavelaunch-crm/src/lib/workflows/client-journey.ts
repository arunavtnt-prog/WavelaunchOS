/**
 * Client Journey Automation
 *
 * Automated workflows that trigger based on client lifecycle events.
 * Handles multi-step processes and client progression through deliverables.
 *
 * Features:
 * - Event-driven workflow triggers
 * - Sequential deliverable generation
 * - Reminder notifications
 * - Progress tracking
 * - Configurable automation rules
 */

import { db } from '@/lib/db'
import { jobQueue, JOB_PRIORITY } from '@/lib/jobs'
import { logInfo, logError, logDebug } from '@/lib/logging/logger'
import type { Client, Deliverable } from '@prisma/client'

export interface WorkflowEvent {
  type: WorkflowEventType
  clientId: string
  userId: string
  metadata?: Record<string, any>
}

export type WorkflowEventType =
  | 'CLIENT_CREATED'
  | 'CLIENT_ACTIVATED'
  | 'DELIVERABLE_COMPLETED'
  | 'DELIVERABLE_OVERDUE'
  | 'BUSINESS_PLAN_COMPLETED'
  | 'MONTH_TRANSITION'
  | 'CLIENT_MILESTONE_REACHED'

/**
 * Client Journey Workflow Manager
 */
export class ClientJourneyWorkflow {
  /**
   * Handle a workflow event
   */
  async handleEvent(event: WorkflowEvent): Promise<void> {
    logInfo(`Processing workflow event: ${event.type}`, {
      clientId: event.clientId,
      eventType: event.type,
    })

    try {
      switch (event.type) {
        case 'CLIENT_CREATED':
          await this.onClientCreated(event)
          break

        case 'CLIENT_ACTIVATED':
          await this.onClientActivated(event)
          break

        case 'DELIVERABLE_COMPLETED':
          await this.onDeliverableCompleted(event)
          break

        case 'DELIVERABLE_OVERDUE':
          await this.onDeliverableOverdue(event)
          break

        case 'BUSINESS_PLAN_COMPLETED':
          await this.onBusinessPlanCompleted(event)
          break

        case 'MONTH_TRANSITION':
          await this.onMonthTransition(event)
          break

        case 'CLIENT_MILESTONE_REACHED':
          await this.onClientMilestoneReached(event)
          break

        default:
          logError(`Unknown workflow event type: ${event.type}`)
      }
    } catch (error) {
      logError(`Failed to process workflow event: ${event.type}`, error as Error, {
        clientId: event.clientId,
      })
      throw error
    }
  }

  /**
   * Workflow: Client Created
   * Triggers when a new client is added to the system
   */
  private async onClientCreated(event: WorkflowEvent): Promise<void> {
    const client = await db.client.findUnique({
      where: { id: event.clientId },
    })

    if (!client) {
      logError('Client not found', undefined, { clientId: event.clientId })
      return
    }

    logInfo(`New client workflow started`, {
      clientId: client.id,
      clientName: client.fullName || client.fullName,
    })

    // 1. Send welcome email (if email system is enabled and client wants it)
    if (process.env.ENABLE_EMAIL_WORKFLOWS === 'true') {
      const { shouldSendEmail } = await import('@/lib/email/preferences')
      const sendEmail = await shouldSendEmail(client.id, 'emailWelcome')

      if (sendEmail) {
        await jobQueue.enqueue(
          'SEND_EMAIL',
          {
            type: 'WELCOME',
            clientId: client.id,
            to: client.email,
            context: {
              clientName: client.fullName,
              portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client-portal`,
            },
          },
          { priority: JOB_PRIORITY.NORMAL }
        )
        logDebug('Enqueued welcome email', { clientId: client.id })
      } else {
        logDebug('Welcome email disabled in client preferences', { clientId: client.id })
      }
    }

    // 2. Create activity log
    await db.activity.create({
      data: {
        userId: event.userId,
        type: 'CLIENT_CREATED',
        description: `Created new client: ${client.fullName || client.fullName}`,
        metadata: JSON.stringify({
          clientId: client.id,
          company: client.fullName,
        }),
      },
    })

    logInfo('Client creation workflow completed', { clientId: client.id })
  }

  /**
   * Workflow: Client Activated
   * Triggers when client status changes to ACTIVE
   */
  private async onClientActivated(event: WorkflowEvent): Promise<void> {
    const client = await db.client.findUnique({
      where: { id: event.clientId },
    })

    if (!client) return

    logInfo('Client activated workflow started', { clientId: client.id })

    // 1. Send activation email (if email system is enabled and client wants it)
    if (process.env.ENABLE_EMAIL_WORKFLOWS === 'true') {
      const { shouldSendEmail } = await import('@/lib/email/preferences')
      const sendEmail = await shouldSendEmail(client.id, 'emailActivation')

      if (sendEmail) {
        await jobQueue.enqueue(
          'SEND_EMAIL',
          {
            type: 'CLIENT_ACTIVATED',
            clientId: client.id,
            to: client.email,
            context: {
              clientName: client.fullName,
              portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client-portal`,
            },
          },
          { priority: JOB_PRIORITY.NORMAL }
        )
        logDebug('Enqueued activation email', { clientId: client.id })
      }
    }

    // 2. Auto-generate business plan (if not exists)
    const existingPlan = await db.businessPlan.findFirst({
      where: { clientId: client.id },
    })

    if (!existingPlan) {
      await jobQueue.enqueue(
        'GENERATE_BUSINESS_PLAN',
        {
          clientId: client.id,
          userId: event.userId,
        },
        { priority: JOB_PRIORITY.HIGH }
      )
      logInfo('Enqueued business plan generation', { clientId: client.id })
    }

    // 2. Schedule Month 1 deliverable generation (delayed by 1 hour to allow business plan to complete)
    const existingM1 = await db.deliverable.findFirst({
      where: {
        clientId: client.id,
        month: 1,
        type: 'MAIN',
      },
    })

    if (!existingM1) {
      await jobQueue.enqueue(
        'GENERATE_DELIVERABLE',
        {
          clientId: client.id,
          month: 1,
          userId: event.userId,
        },
        {
          priority: JOB_PRIORITY.HIGH,
          delay: 60 * 60 * 1000, // 1 hour delay
        }
      )
      logInfo('Scheduled Month 1 deliverable generation', { clientId: client.id })
    }

    logInfo('Client activation workflow completed', { clientId: client.id })
  }

  /**
   * Workflow: Deliverable Completed
   * Triggers when a deliverable is marked as completed
   * Auto-generates next month's deliverable
   */
  private async onDeliverableCompleted(event: WorkflowEvent): Promise<void> {
    const deliverable = event.metadata?.deliverable as Deliverable

    if (!deliverable) {
      logError('Deliverable not found in event metadata')
      return
    }

    logInfo('Deliverable completion workflow started', {
      clientId: event.clientId,
      month: deliverable.month,
    })

    // Check if this is not the last month (M8)
    if (deliverable.month < 8) {
      const nextMonth = deliverable.month + 1

      // Check if next month's deliverable already exists
      const existingNext = await db.deliverable.findFirst({
        where: {
          clientId: event.clientId,
          month: nextMonth,
          type: 'MAIN',
        },
      })

      if (!existingNext) {
        // Auto-generate next month's deliverable
        await jobQueue.enqueue(
          'GENERATE_DELIVERABLE',
          {
            clientId: event.clientId,
            month: nextMonth,
            userId: event.userId,
          },
          {
            priority: JOB_PRIORITY.NORMAL,
            delay: 5 * 60 * 1000, // 5 minute delay to allow for any cleanup
          }
        )

        logInfo(`Scheduled Month ${nextMonth} deliverable generation`, {
          clientId: event.clientId,
          previousMonth: deliverable.month,
          nextMonth,
        })

        // Send notification email (if enabled)
        if (process.env.ENABLE_EMAIL_WORKFLOWS === 'true') {
          const client = await db.client.findUnique({
            where: { id: event.clientId },
          })

          if (client) {
            const { shouldSendEmail } = await import('@/lib/email/preferences')
            const sendEmail = await shouldSendEmail(client.id, 'emailDeliverableReady')

            if (sendEmail) {
              await jobQueue.enqueue(
                'SEND_EMAIL',
                {
                  type: 'DELIVERABLE_READY',
                  clientId: client.id,
                  to: client.email,
                  context: {
                    clientName: client.fullName || client.fullName,
                    month: nextMonth,
                    deliverableTitle: `Month ${nextMonth} Deliverable`,
                  },
                },
                { priority: JOB_PRIORITY.NORMAL }
              )
              logDebug('Enqueued deliverable ready email', { clientId: client.id, month: nextMonth })
            }
          }
        }
      } else {
        logDebug(`Month ${nextMonth} deliverable already exists`, {
          clientId: event.clientId,
        })
      }
    } else {
      // This was the final deliverable (M8)
      logInfo('Client completed all 8 months of deliverables!', {
        clientId: event.clientId,
      })

      // Send completion email (if enabled)
      if (process.env.ENABLE_EMAIL_WORKFLOWS === 'true') {
        const client = await db.client.findUnique({
          where: { id: event.clientId },
        })

        if (client) {
          const { shouldSendEmail } = await import('@/lib/email/preferences')
          const sendEmail = await shouldSendEmail(client.id, 'emailJourneyCompleted')

          if (sendEmail) {
            await jobQueue.enqueue(
              'SEND_EMAIL',
              {
                type: 'JOURNEY_COMPLETED',
                clientId: client.id,
                to: client.email,
                context: {
                  clientName: client.fullName || client.fullName,
                },
              },
              { priority: JOB_PRIORITY.NORMAL }
            )
            logDebug('Enqueued journey completed email', { clientId: client.id })
          }
        }
      }

      // Create milestone activity
      await db.activity.create({
        data: {
          userId: event.userId,
          type: 'CLIENT_UPDATED',
          description: `Client ${event.clientId} completed all 8 months of deliverables`,
          metadata: JSON.stringify({
            clientId: event.clientId,
            milestone: 'JOURNEY_COMPLETED',
          }),
        },
      })
    }

    logInfo('Deliverable completion workflow finished', {
      clientId: event.clientId,
    })
  }

  /**
   * Workflow: Deliverable Overdue
   * Triggers when a deliverable passes its due date without completion
   */
  private async onDeliverableOverdue(event: WorkflowEvent): Promise<void> {
    const deliverable = event.metadata?.deliverable as Deliverable

    if (!deliverable) return

    logInfo('Deliverable overdue workflow started', {
      clientId: event.clientId,
      deliverableId: deliverable.id,
      month: deliverable.month,
    })

    // Send reminder email (if enabled)
    if (process.env.ENABLE_EMAIL_WORKFLOWS === 'true') {
      const client = await db.client.findUnique({
        where: { id: event.clientId },
      })

      if (client) {
        const { shouldSendEmail } = await import('@/lib/email/preferences')
        const sendEmail = await shouldSendEmail(client.id, 'emailDeliverableOverdue')

        if (sendEmail) {
          await jobQueue.enqueue(
            'SEND_EMAIL',
            {
              type: 'DELIVERABLE_OVERDUE',
              clientId: client.id,
              to: client.email,
              context: {
                clientName: client.fullName || client.fullName,
                deliverableTitle: deliverable.title,
                dueDate: deliverable.deliveredAt,
              },
            },
            { priority: JOB_PRIORITY.NORMAL }
          )
          logDebug('Enqueued overdue reminder email', { clientId: client.id })
        }
      }
    }

    // Create activity log
    await db.activity.create({
      data: {
        userId: event.userId,
        type: 'DELIVERABLE_APPROVED',
        description: `Deliverable overdue: ${deliverable.title}`,
        metadata: JSON.stringify({
          clientId: event.clientId,
          deliverableId: deliverable.id,
          dueDate: deliverable.deliveredAt,
        }),
      },
    })

    logInfo('Deliverable overdue workflow completed', {
      clientId: event.clientId,
    })
  }

  /**
   * Workflow: Business Plan Completed
   * Triggers when business plan generation is completed
   */
  private async onBusinessPlanCompleted(event: WorkflowEvent): Promise<void> {
    logInfo('Business plan completion workflow started', {
      clientId: event.clientId,
    })

    // Auto-generate PDF (if enabled)
    if (process.env.AUTO_GENERATE_PDF === 'true') {
      const businessPlan = await db.businessPlan.findFirst({
        where: { clientId: event.clientId },
        orderBy: { version: 'desc' },
      })

      if (businessPlan) {
        await jobQueue.enqueue(
          'GENERATE_PDF',
          {
            businessPlanId: businessPlan.id,
            quality: 'final',
            userId: event.userId,
          },
          { priority: JOB_PRIORITY.NORMAL }
        )
        logInfo('Enqueued business plan PDF generation', {
          businessPlanId: businessPlan.id,
        })
      }
    }

    // Send notification email (if enabled)
    if (process.env.ENABLE_EMAIL_WORKFLOWS === 'true') {
      const client = await db.client.findUnique({
        where: { id: event.clientId },
      })

      if (client) {
        const { shouldSendEmail } = await import('@/lib/email/preferences')
        const sendEmail = await shouldSendEmail(client.id, 'emailBusinessPlanReady')

        if (sendEmail) {
          await jobQueue.enqueue(
            'SEND_EMAIL',
            {
              type: 'BUSINESS_PLAN_READY',
              clientId: client.id,
              to: client.email,
              context: {
                clientName: client.fullName || client.fullName,
              },
            },
            { priority: JOB_PRIORITY.NORMAL }
          )
          logDebug('Enqueued business plan ready email', { clientId: client.id })
        }
      }
    }

    logInfo('Business plan completion workflow finished', {
      clientId: event.clientId,
    })
  }

  /**
   * Workflow: Month Transition
   * Triggers at the beginning of each calendar month
   * Checks for deliverables that should be auto-generated
   */
  private async onMonthTransition(event: WorkflowEvent): Promise<void> {
    logInfo('Month transition workflow started', { clientId: event.clientId })

    const client = await db.client.findUnique({
      where: { id: event.clientId },
      include: {
        deliverables: {
          where: { type: 'MAIN' },
          orderBy: { month: 'desc' },
        },
      },
    })

    if (!client) return

    // Get the latest completed deliverable
    const latestDeliverable = client.deliverables[0]

    if (latestDeliverable && latestDeliverable.status === 'DELIVERED') {
      const nextMonth = latestDeliverable.month + 1

      if (nextMonth <= 8) {
        // Check if next month doesn't exist
        const existingNext = client.deliverables.find((d) => d.month === nextMonth)

        if (!existingNext) {
          await jobQueue.enqueue(
            'GENERATE_DELIVERABLE',
            {
              clientId: client.id,
              month: nextMonth,
              userId: event.userId,
            },
            { priority: JOB_PRIORITY.NORMAL }
          )

          logInfo(`Generated Month ${nextMonth} deliverable for month transition`, {
            clientId: client.id,
          })
        }
      }
    }

    logInfo('Month transition workflow completed', { clientId: event.clientId })
  }

  /**
   * Workflow: Client Milestone Reached
   * Triggers when client reaches specific milestones
   */
  private async onClientMilestoneReached(event: WorkflowEvent): Promise<void> {
    const milestone = event.metadata?.milestone

    logInfo('Client milestone workflow started', {
      clientId: event.clientId,
      milestone,
    })

    // Create activity log
    await db.activity.create({
      data: {
        userId: event.userId,
        type: 'CLIENT_UPDATED',
        description: `Client reached milestone: ${milestone}`,
        metadata: JSON.stringify({
          clientId: event.clientId,
          milestone,
        }),
      },
    })

    // Send milestone email (if enabled)
    if (process.env.ENABLE_EMAIL_WORKFLOWS === 'true') {
      const client = await db.client.findUnique({
        where: { id: event.clientId },
      })

      if (client) {
        const { shouldSendEmail } = await import('@/lib/email/preferences')
        const sendEmail = await shouldSendEmail(client.id, 'emailMilestoneReached')

        if (sendEmail) {
          await jobQueue.enqueue(
            'SEND_EMAIL',
            {
              type: 'CLIENT_MILESTONE',
              clientId: client.id,
              to: client.email,
              context: {
                clientName: client.fullName || client.fullName,
                milestone,
              },
            },
            { priority: JOB_PRIORITY.NORMAL }
          )
          logDebug('Enqueued milestone reached email', { clientId: client.id, milestone })
        }
      }
    }

    logInfo('Client milestone workflow completed', {
      clientId: event.clientId,
      milestone,
    })
  }

  /**
   * Check for overdue deliverables and trigger reminders
   * This should be called by a scheduled job daily
   */
  async checkOverdueDeliverables(userId: string): Promise<void> {
    logInfo('Checking for overdue deliverables...')

    const now = new Date()

    const overdueDeliverables = await db.deliverable.findMany({
      where: {
        status: 'DRAFT',
      },
      include: {
        client: true,
      },
    })

    logInfo(`Found ${overdueDeliverables.length} overdue deliverables`)

    for (const deliverable of overdueDeliverables) {
      await this.handleEvent({
        type: 'DELIVERABLE_OVERDUE',
        clientId: deliverable.clientId,
        userId,
        metadata: {
          deliverable,
        },
      })
    }
  }
}

// Singleton instance
export const clientJourneyWorkflow = new ClientJourneyWorkflow()
