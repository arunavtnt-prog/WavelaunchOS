/**
 * Workflow Hooks
 *
 * Helper functions to trigger workflow events from anywhere in the application.
 * These should be called after significant events (client creation, deliverable completion, etc.)
 */

import { clientJourneyWorkflow, type WorkflowEvent } from './client-journey'
import { logDebug, logError } from '@/lib/logging/logger'

/**
 * Trigger a workflow event
 * This is a fire-and-forget operation - errors are logged but not thrown
 */
export async function triggerWorkflow(event: WorkflowEvent): Promise<void> {
  try {
    logDebug(`Triggering workflow: ${event.type}`, {
      clientId: event.clientId,
    })

    // Handle event asynchronously - don't block the caller
    clientJourneyWorkflow.handleEvent(event).catch((error) => {
      logError(`Workflow event handler failed: ${event.type}`, error, {
        clientId: event.clientId,
      })
    })
  } catch (error) {
    // Log but don't throw - workflows should not break main operations
    logError(`Failed to trigger workflow: ${event.type}`, error as Error, {
      clientId: event.clientId,
    })
  }
}

/**
 * Trigger when a new client is created
 */
export async function onClientCreated(clientId: string, userId: string): Promise<void> {
  await triggerWorkflow({
    type: 'CLIENT_CREATED',
    clientId,
    userId,
  })
}

/**
 * Trigger when client status changes to ACTIVE
 */
export async function onClientActivated(clientId: string, userId: string): Promise<void> {
  await triggerWorkflow({
    type: 'CLIENT_ACTIVATED',
    clientId,
    userId,
  })
}

/**
 * Trigger when a deliverable is completed
 */
export async function onDeliverableCompleted(
  clientId: string,
  userId: string,
  deliverable: any
): Promise<void> {
  await triggerWorkflow({
    type: 'DELIVERABLE_COMPLETED',
    clientId,
    userId,
    metadata: { deliverable },
  })
}

/**
 * Trigger when a business plan is completed
 */
export async function onBusinessPlanCompleted(clientId: string, userId: string): Promise<void> {
  await triggerWorkflow({
    type: 'BUSINESS_PLAN_COMPLETED',
    clientId,
    userId,
  })
}

/**
 * Trigger when a deliverable becomes overdue
 */
export async function onDeliverableOverdue(
  clientId: string,
  userId: string,
  deliverable: any
): Promise<void> {
  await triggerWorkflow({
    type: 'DELIVERABLE_OVERDUE',
    clientId,
    userId,
    metadata: { deliverable },
  })
}

/**
 * Trigger when a client reaches a milestone
 */
export async function onClientMilestoneReached(
  clientId: string,
  userId: string,
  milestone: string
): Promise<void> {
  await triggerWorkflow({
    type: 'CLIENT_MILESTONE_REACHED',
    clientId,
    userId,
    metadata: { milestone },
  })
}

/**
 * Trigger month transition check for a client
 */
export async function onMonthTransition(clientId: string, userId: string): Promise<void> {
  await triggerWorkflow({
    type: 'MONTH_TRANSITION',
    clientId,
    userId,
  })
}
