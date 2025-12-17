/**
 * Webhook Service
 *
 * Manages webhooks for external integrations.
 * Sends HTTP callbacks when events occur in the CRM.
 */

import { prisma } from '@/lib/db'
import { logInfo, logError, logWarn } from '@/lib/logging/logger'
import crypto from 'crypto'

export type WebhookEvent =
  | 'client.created'
  | 'client.updated'
  | 'client.activated'
  | 'client.archived'
  | 'businessplan.created'
  | 'businessplan.approved'
  | 'deliverable.created'
  | 'deliverable.completed'
  | 'deliverable.overdue'
  | 'ticket.created'
  | 'ticket.updated'
  | 'ticket.resolved'

export interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: any
}

export interface Webhook {
  id: string
  name: string
  url: string
  secret?: string
  events: WebhookEvent[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastTriggeredAt?: Date
  createdBy: string
}

/**
 * Webhook Service Class
 */
export class WebhookService {
  /**
   * Trigger a webhook event
   */
  async trigger(event: WebhookEvent, data: any): Promise<void> {
    try {
      // Get active webhooks listening for this event
      const webhooks = await this.getWebhooksForEvent(event)

      if (webhooks.length === 0) {
        logInfo(`No webhooks registered for event: ${event}`)
        return
      }

      // Send to all matching webhooks (async, non-blocking)
      const promises = webhooks.map((webhook) => this.sendWebhook(webhook, event, data))

      // Fire and forget (don't await)
      Promise.all(promises).catch((error) => {
        logError('Error sending webhooks', error)
      })

      logInfo(`Triggered ${webhooks.length} webhook(s) for event: ${event}`)
    } catch (error) {
      logError('Webhook trigger error', error as Error, { event })
    }
  }

  /**
   * Get webhooks that listen for a specific event
   */
  private async getWebhooksForEvent(event: WebhookEvent): Promise<Webhook[]> {
    // Note: In production, this would query the webhooks table
    // For now, returning empty array as table needs to be created
    // via migration in actual database
    try {
      // This will work once migration is applied
      const webhooks = await prisma.$queryRaw<any[]>`
        SELECT * FROM webhooks
        WHERE is_active = true
        AND events::jsonb @> ${JSON.stringify([event])}::jsonb
      `

      return webhooks.map((w) => ({
        id: w.id,
        name: w.name,
        url: w.url,
        secret: w.secret,
        events: JSON.parse(w.events),
        isActive: w.is_active,
        createdAt: w.created_at,
        updatedAt: w.updated_at,
        lastTriggeredAt: w.last_triggered_at,
        createdBy: w.created_by,
      }))
    } catch (error) {
      // Table doesn't exist yet, return empty array
      logWarn('Webhooks table not found. Run migrations to enable webhooks.')
      return []
    }
  }

  /**
   * Send webhook to a URL
   */
  private async sendWebhook(webhook: Webhook, event: WebhookEvent, data: any): Promise<void> {
    const deliveryId = this.generateId()
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    }

    const payloadString = JSON.stringify(payload)
    let attempts = 0
    let success = false
    let responseStatus: number | null = null
    let responseBody: string | null = null
    let error: string | null = null

    try {
      // Sign payload if secret is configured
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'WavelaunchOS-Webhook/1.0',
        'X-Webhook-ID': deliveryId,
        'X-Webhook-Event': event,
        'X-Webhook-Timestamp': payload.timestamp,
      }

      if (webhook.secret) {
        const signature = this.signPayload(payloadString, webhook.secret)
        headers['X-Webhook-Signature'] = signature
      }

      // Send HTTP POST request
      attempts = 1
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      responseStatus = response.status
      responseBody = await response.text()
      success = response.ok

      // Log delivery
      await this.logDelivery({
        id: deliveryId,
        webhookId: webhook.id,
        event,
        payload: payloadString,
        responseStatus,
        responseBody,
        error: success ? null : `HTTP ${responseStatus}: ${responseBody}`,
        attempts,
        success,
      })

      // Update last triggered time
      await this.updateLastTriggered(webhook.id)

      if (success) {
        logInfo(`Webhook delivered successfully`, {
          webhookId: webhook.id,
          event,
          status: responseStatus,
        })
      } else {
        logWarn(`Webhook delivery failed`, {
          webhookId: webhook.id,
          event,
          status: responseStatus,
        })
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
      logError('Webhook send error', err as Error, {
        webhookId: webhook.id,
        event,
      })

      // Log failed delivery
      await this.logDelivery({
        id: deliveryId,
        webhookId: webhook.id,
        event,
        payload: payloadString,
        responseStatus: null,
        responseBody: null,
        error,
        attempts,
        success: false,
      })
    }
  }

  /**
   * Sign payload with HMAC SHA256
   */
  private signPayload(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    return `sha256=${hmac.digest('hex')}`
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `whd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Log webhook delivery
   */
  private async logDelivery(delivery: {
    id: string
    webhookId: string
    event: string
    payload: string
    responseStatus: number | null
    responseBody: string | null
    error: string | null
    attempts: number
    success: boolean
  }): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO webhook_deliveries (
          id, webhook_id, event, payload, response_status,
          response_body, error, attempts, success, created_at, delivered_at
        ) VALUES (
          ${delivery.id},
          ${delivery.webhookId},
          ${delivery.event},
          ${delivery.payload},
          ${delivery.responseStatus},
          ${delivery.responseBody},
          ${delivery.error},
          ${delivery.attempts},
          ${delivery.success},
          NOW(),
          ${delivery.success ? new Date() : null}
        )
      `
    } catch (error) {
      // Silently fail if table doesn't exist yet
      logWarn('Could not log webhook delivery (table not found)')
    }
  }

  /**
   * Update last triggered timestamp
   */
  private async updateLastTriggered(webhookId: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE webhooks
        SET last_triggered_at = NOW()
        WHERE id = ${webhookId}
      `
    } catch (error) {
      // Silently fail if table doesn't exist yet
    }
  }
}

// Singleton instance
export const webhookService = new WebhookService()

/**
 * Convenience functions for triggering common events
 */
export const webhooks = {
  clientCreated: (clientId: string, data: any) =>
    webhookService.trigger('client.created', { clientId, ...data }),

  clientUpdated: (clientId: string, data: any) =>
    webhookService.trigger('client.updated', { clientId, ...data }),

  clientActivated: (clientId: string, data: any) =>
    webhookService.trigger('client.activated', { clientId, ...data }),

  businessPlanCreated: (planId: string, clientId: string, data: any) =>
    webhookService.trigger('businessplan.created', { planId, clientId, ...data }),

  businessPlanApproved: (planId: string, clientId: string, data: any) =>
    webhookService.trigger('businessplan.approved', { planId, clientId, ...data }),

  deliverableCreated: (deliverableId: string, clientId: string, month: number, data: any) =>
    webhookService.trigger('deliverable.created', { deliverableId, clientId, month, ...data }),

  deliverableCompleted: (deliverableId: string, clientId: string, month: number, data: any) =>
    webhookService.trigger('deliverable.completed', { deliverableId, clientId, month, ...data }),

  ticketCreated: (ticketId: string, clientId: string, data: any) =>
    webhookService.trigger('ticket.created', { ticketId, clientId, ...data }),

  ticketResolved: (ticketId: string, clientId: string, data: any) =>
    webhookService.trigger('ticket.resolved', { ticketId, clientId, ...data }),
}
