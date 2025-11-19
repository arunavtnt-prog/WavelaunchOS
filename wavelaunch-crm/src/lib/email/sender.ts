/**
 * Email Sender
 *
 * High-level email sending functions that combine templates with the email service.
 * Provides convenient functions for sending specific types of emails.
 */

import { emailService, type EmailOptions } from './service'
import { emailTemplateManager, type EmailTemplateType, type TemplateVariables } from './templates'
import { logInfo, logError } from '@/lib/logging/logger'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Send an email using a template
 */
export async function sendTemplatedEmail(
  to: string | string[],
  templateType: EmailTemplateType,
  variables: TemplateVariables
): Promise<boolean> {
  try {
    // Add default variables
    const enrichedVariables = {
      ...variables,
      appUrl: APP_URL,
      portalUrl: variables.portalUrl || `${APP_URL}/client-portal`,
    }

    // Get the rendered template
    const template = emailTemplateManager.getTemplate(templateType, enrichedVariables)

    // Send the email
    const result = await emailService.send({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    return result.success
  } catch (error) {
    logError(`Failed to send templated email: ${templateType}`, error as Error, {
      to,
      templateType,
    })
    return false
  }
}

/**
 * Send welcome email to new client
 */
export async function sendWelcomeEmail(clientEmail: string, clientName: string): Promise<boolean> {
  logInfo('Sending welcome email', { clientEmail, clientName })

  return sendTemplatedEmail(clientEmail, 'WELCOME', {
    clientName,
  })
}

/**
 * Send client activated email
 */
export async function sendClientActivatedEmail(
  clientEmail: string,
  clientName: string
): Promise<boolean> {
  logInfo('Sending client activated email', { clientEmail, clientName })

  return sendTemplatedEmail(clientEmail, 'CLIENT_ACTIVATED', {
    clientName,
  })
}

/**
 * Send business plan ready notification
 */
export async function sendBusinessPlanReadyEmail(
  clientEmail: string,
  clientName: string
): Promise<boolean> {
  logInfo('Sending business plan ready email', { clientEmail, clientName })

  return sendTemplatedEmail(clientEmail, 'BUSINESS_PLAN_READY', {
    clientName,
  })
}

/**
 * Send deliverable ready notification
 */
export async function sendDeliverableReadyEmail(
  clientEmail: string,
  clientName: string,
  month: number,
  deliverableTitle: string
): Promise<boolean> {
  logInfo('Sending deliverable ready email', {
    clientEmail,
    clientName,
    month,
    deliverableTitle,
  })

  // Calculate progress percentage
  const progressPercent = Math.round((month / 8) * 100)

  return sendTemplatedEmail(clientEmail, 'DELIVERABLE_READY', {
    clientName,
    month,
    deliverableTitle,
    progressPercent,
  })
}

/**
 * Send deliverable overdue reminder
 */
export async function sendDeliverableOverdueEmail(
  clientEmail: string,
  clientName: string,
  deliverableTitle: string,
  dueDate: Date
): Promise<boolean> {
  logInfo('Sending deliverable overdue email', {
    clientEmail,
    clientName,
    deliverableTitle,
  })

  return sendTemplatedEmail(clientEmail, 'DELIVERABLE_OVERDUE', {
    clientName,
    deliverableTitle,
    dueDate: dueDate.toLocaleDateString(),
  })
}

/**
 * Send journey completed celebration email
 */
export async function sendJourneyCompletedEmail(
  clientEmail: string,
  clientName: string
): Promise<boolean> {
  logInfo('Sending journey completed email', { clientEmail, clientName })

  return sendTemplatedEmail(clientEmail, 'JOURNEY_COMPLETED', {
    clientName,
  })
}

/**
 * Send milestone reached notification
 */
export async function sendMilestoneReachedEmail(
  clientEmail: string,
  clientName: string,
  milestone: string
): Promise<boolean> {
  logInfo('Sending milestone reached email', {
    clientEmail,
    clientName,
    milestone,
  })

  return sendTemplatedEmail(clientEmail, 'MILESTONE_REACHED', {
    clientName,
    milestone,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetToken: string,
  expiryHours: number = 24
): Promise<boolean> {
  logInfo('Sending password reset email', { userEmail, userName })

  const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`

  return sendTemplatedEmail(userEmail, 'PASSWORD_RESET', {
    userName,
    resetUrl,
    expiryHours,
  })
}

/**
 * Send invitation email
 */
export async function sendInvitationEmail(
  inviteeEmail: string,
  inviterName: string,
  inviteToken: string,
  expiryDays: number = 7
): Promise<boolean> {
  logInfo('Sending invitation email', { inviteeEmail, inviterName })

  const inviteUrl = `${APP_URL}/auth/accept-invite?token=${inviteToken}`

  return sendTemplatedEmail(inviteeEmail, 'INVITATION', {
    inviterName,
    inviteUrl,
    expiryDays,
  })
}

/**
 * Send custom email (no template)
 */
export async function sendCustomEmail(options: EmailOptions): Promise<boolean> {
  try {
    const result = await emailService.send(options)
    return result.success
  } catch (error) {
    logError('Failed to send custom email', error as Error, {
      to: options.to,
      subject: options.subject,
    })
    return false
  }
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<boolean> {
  return emailService.testConnection()
}

/**
 * Get email provider being used
 */
export function getEmailProvider(): string {
  return emailService.getProvider()
}
