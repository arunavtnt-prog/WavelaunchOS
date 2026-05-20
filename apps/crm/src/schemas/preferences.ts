/**
 * Notification Preferences Schemas
 *
 * Zod validation schemas for notification preferences
 */

import { z } from 'zod'

// Update preferences schema
export const updatePreferencesSchema = z.object({
  // Email notifications
  emailWelcome: z.boolean().optional(),
  emailActivation: z.boolean().optional(),
  emailBusinessPlanReady: z.boolean().optional(),
  emailDeliverableReady: z.boolean().optional(),
  emailDeliverableOverdue: z.boolean().optional(),
  emailMilestoneReached: z.boolean().optional(),
  emailJourneyCompleted: z.boolean().optional(),
  emailWeeklyDigest: z.boolean().optional(),
  emailMarketingUpdates: z.boolean().optional(),

  // Portal notifications
  portalDeliverableUpdates: z.boolean().optional(),
  portalBusinessPlanUpdates: z.boolean().optional(),
  portalSystemAnnouncements: z.boolean().optional(),
  portalTicketUpdates: z.boolean().optional(),

  // Communication preferences
  preferredContactMethod: z.enum(['email', 'phone', 'portal']).optional(),
  reminderFrequency: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
