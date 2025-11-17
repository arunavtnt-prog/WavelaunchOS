/**
 * Notification Preferences
 *
 * Utilities for checking and managing client notification preferences.
 */

import { db } from '@/lib/db'
import { logDebug } from '@/lib/logging/logger'

export type EmailNotificationType =
  | 'emailWelcome'
  | 'emailActivation'
  | 'emailBusinessPlanReady'
  | 'emailDeliverableReady'
  | 'emailDeliverableOverdue'
  | 'emailMilestoneReached'
  | 'emailJourneyCompleted'
  | 'emailWeeklyDigest'
  | 'emailMarketingUpdates'

/**
 * Check if client has email notifications enabled for a specific type
 */
export async function shouldSendEmail(
  clientId: string,
  notificationType: EmailNotificationType
): Promise<boolean> {
  try {
    // Get client preferences
    let preferences = await db.notificationPreferences.findUnique({
      where: { clientId },
    })

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await db.notificationPreferences.create({
        data: { clientId },
      })
    }

    // Check if this notification type is enabled
    const isEnabled = preferences[notificationType] as boolean

    logDebug(`Email notification check for ${notificationType}`, {
      clientId,
      notificationType,
      isEnabled,
    })

    return isEnabled
  } catch (error) {
    // On error, default to sending the email (fail open for important notifications)
    logDebug(`Error checking email preferences, defaulting to send`, {
      clientId,
      notificationType,
      error,
    })
    return true
  }
}

/**
 * Get client notification preferences
 */
export async function getNotificationPreferences(clientId: string) {
  let preferences = await db.notificationPreferences.findUnique({
    where: { clientId },
  })

  // Create default preferences if they don't exist
  if (!preferences) {
    preferences = await db.notificationPreferences.create({
      data: { clientId },
    })
  }

  return preferences
}

/**
 * Update client notification preferences
 */
export async function updateNotificationPreferences(
  clientId: string,
  updates: Partial<{
    emailWelcome: boolean
    emailActivation: boolean
    emailBusinessPlanReady: boolean
    emailDeliverableReady: boolean
    emailDeliverableOverdue: boolean
    emailMilestoneReached: boolean
    emailJourneyCompleted: boolean
    emailWeeklyDigest: boolean
    emailMarketingUpdates: boolean
    portalNewDeliverable: boolean
    portalNewMessage: boolean
    portalMilestoneReminder: boolean
    portalAccountUpdate: boolean
    preferredContactMethod: string
    reminderFrequency: string
  }>
) {
  // Ensure preferences exist first
  await getNotificationPreferences(clientId)

  // Update preferences
  return db.notificationPreferences.update({
    where: { clientId },
    data: updates,
  })
}

/**
 * Disable all email notifications for a client
 */
export async function disableAllEmailNotifications(clientId: string) {
  return updateNotificationPreferences(clientId, {
    emailWelcome: false,
    emailActivation: false,
    emailBusinessPlanReady: false,
    emailDeliverableReady: false,
    emailDeliverableOverdue: false,
    emailMilestoneReached: false,
    emailJourneyCompleted: false,
    emailWeeklyDigest: false,
    emailMarketingUpdates: false,
  })
}

/**
 * Enable all email notifications for a client
 */
export async function enableAllEmailNotifications(clientId: string) {
  return updateNotificationPreferences(clientId, {
    emailWelcome: true,
    emailActivation: true,
    emailBusinessPlanReady: true,
    emailDeliverableReady: true,
    emailDeliverableOverdue: true,
    emailMilestoneReached: true,
    emailJourneyCompleted: true,
  })
}
