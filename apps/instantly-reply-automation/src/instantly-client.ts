/**
 * Instantly API Client
 * Handles fetching emails and sending replies
 */

import type { InstantlyEmail } from './types.js';
import { logger } from './logger.js';

export class InstantlyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.instantly.ai') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Fetch emails from Instantly with optional filters
   */
  async listEmails(options: {
    limit?: number;
    startingAfter?: string;
    isUnread?: boolean;
    emailType?: 'received' | 'sent' | 'manual';
    campaignId?: string;
    eaccount?: string;
    search?: string;
  } = {}): Promise<{ emails: InstantlyEmail[]; nextStartingAfter?: string | null }> {
    const url = new URL(`${this.baseUrl}/api/v2/emails`);

    if (options.limit) url.searchParams.set('limit', String(options.limit));
    if (options.startingAfter) url.searchParams.set('starting_after', options.startingAfter);
    if (typeof options.isUnread === 'boolean') url.searchParams.set('is_unread', String(options.isUnread));
    if (options.emailType) url.searchParams.set('email_type', options.emailType);
    if (options.campaignId) url.searchParams.set('campaign_id', options.campaignId);
    if (options.eaccount) url.searchParams.set('eaccount', options.eaccount);
    if (options.search) url.searchParams.set('search', options.search);

    logger.debug(`Fetching emails from Instantly: ${url.toString()}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Instantly API error (${response.status}): ${text}`);
    }

    const json = await response.json();

    let emails: InstantlyEmail[] = [];
    let nextStartingAfter: string | null = null;

    if (Array.isArray(json)) {
      emails = json;
    } else {
      const container = json as any;
      const candidates = [
        container.data,
        container.emails,
        container.items,
        container.results,
        container.messages,
      ];

      const firstArray = candidates.find((c) => Array.isArray(c));
      if (Array.isArray(firstArray)) {
        emails = firstArray;
      } else {
        for (const value of Object.values(container)) {
          if (Array.isArray(value)) {
            emails = value as any;
            break;
          }
        }
      }

      nextStartingAfter = container.next_starting_after ?? null;
    }

    logger.info(`Fetched ${emails.length} emails from Instantly`);

    return { emails, nextStartingAfter };
  }

  /**
   * Get campaign metadata
   */
  async getCampaign(campaignId: string): Promise<{ id: string; name?: string } | null> {
    const url = new URL(`${this.baseUrl}/api/v2/campaigns/${campaignId}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Instantly campaign fetch error (${response.status}): ${text}`);
    }

    const json = await response.json();
    if (!json || typeof json !== 'object') return null;

    const id = (json as any).id || campaignId;
    const name = (json as any).name;
    return { id, name };
  }

  /**
   * Send a reply email
   */
  async sendReply(params: {
    replyToUuid: string;
    eaccount: string;
    subject: string;
    body: string;
    isHtml?: boolean;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { replyToUuid, eaccount, subject, body, isHtml = false } = params;

    logger.info(`Sending reply to ${replyToUuid}`, { subject, eaccount });

    const url = new URL(`${this.baseUrl}/api/v2/emails/reply`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reply_to_uuid: replyToUuid,
        eaccount,
        subject,
        body,
        is_html: isHtml,
      }),
    });

    const text = await response.text().catch(() => '');

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: `Rate limited: ${text || 'Too many requests'}`,
        };
      }
      return {
        success: false,
        error: `Instantly API error (${response.status}): ${text}`,
      };
    }

    try {
      const json = JSON.parse(text);
      const messageId = (json as any)?.message_id || (json as any)?.id;
      logger.info(`Reply sent successfully`, { messageId });
      return { success: true, messageId };
    } catch {
      return { success: true, messageId: undefined };
    }
  }

  /**
   * Fetch all unread emails (paginated)
   */
  async getAllUnreceivedEmails(options: {
    campaignId?: string;
    eaccount?: string;
  } = {}): Promise<InstantlyEmail[]> {
    let allEmails: InstantlyEmail[] = [];
    let startingAfter: string | undefined;

    do {
      const result = await this.listEmails({
        limit: 100,
        startingAfter,
        isUnread: true,
        emailType: 'received',
        campaignId: options.campaignId,
        eaccount: options.eaccount,
      });

      allEmails = allEmails.concat(result.emails);
      startingAfter = result.nextStartingAfter || undefined;
    } while (startingAfter);

    logger.info(`Total unread emails fetched: ${allEmails.length}`);
    return allEmails;
  }

  /**
   * Extract body text from email
   */
  getBodyText(email: InstantlyEmail): string {
    if (!email.body) return '';

    if (typeof email.body === 'string') {
      return email.body;
    }

    if (email.body.text) {
      return email.body.text;
    }

    if (email.body.html) {
      // Basic HTML to text conversion
      return email.body.html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
    }

    return '';
  }

  /**
   * Extract from email address
   */
  getFromEmail(email: InstantlyEmail): string | undefined {
    return email.from_address_email || (email.lead as string);
  }

  /**
   * Extract sender's first name from email or lead name
   */
  getFirstName(email: InstantlyEmail): string | undefined {
    const fromEmail = this.getFromEmail(email);
    const leadName = email.lead as string;

    if (fromEmail) {
      const emailLocal = fromEmail.split('@')[0];
      const parts = emailLocal.split(/[._+-]/);
      if (parts.length > 0) {
        const name = parts[0];
        if (name.length > 1 && /^[a-zA-Z]+$/.test(name)) {
          return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        }
      }
    }

    if (leadName) {
      const nameParts = leadName.trim().split(/\s+/);
      if (nameParts.length > 0) {
        return nameParts[0];
      }
    }

    return undefined;
  }
}
