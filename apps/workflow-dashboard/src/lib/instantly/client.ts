export type InstantlyEmail = {
  id?: string;
  thread_id?: string;
  message_id?: string;
  subject?: string;
  body?: { text?: string; html?: string } | string;
  from_address_email?: string;
  to_address_email_list?: Array<{ email?: string } | string> | string[] | string;
  cc_address_email_list?: Array<{ email?: string } | string> | string[] | string;
  timestamp_created?: number | string;
  timestamp_email?: number | string;
  is_unread?: boolean;
  is_focused?: boolean;
  email_type?: string;
  campaign_id?: string;
  campaign_name?: string;
  lead?: string;
  lead_id?: string;
  ue_type?: number;
  content_preview?: string;
  subsequence_id?: string;
  list_id?: string;
  eaccount?: string;
  [key: string]: any;
};

export type ListEmailsResponse =
  | InstantlyEmail[]
  | {
      data?: InstantlyEmail[];
      emails?: InstantlyEmail[];
      next_starting_after?: string | null;
      starting_after?: string | null;
      [key: string]: any;
    };

export type ListEmailsOptions = {
  limit?: number;
  startingAfter?: string;
  isUnread?: boolean;
  mode?: 'emode_focused' | 'emode_others' | 'emode_all';
  emailType?: 'received' | 'sent' | 'manual';
  campaignId?: string;
  eaccount?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
};

export class InstantlyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.instantly.ai') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async listEmails(options: ListEmailsOptions = {}) {
    const url = new URL(`${this.baseUrl}/api/v2/emails`);
    if (options.limit) url.searchParams.set('limit', String(options.limit));
    if (options.startingAfter) url.searchParams.set('starting_after', options.startingAfter);
    if (typeof options.isUnread === 'boolean') url.searchParams.set('is_unread', String(options.isUnread));
    if (options.mode) url.searchParams.set('mode', options.mode);
    if (options.emailType) url.searchParams.set('email_type', options.emailType);
    if (options.campaignId) url.searchParams.set('campaign_id', options.campaignId);
    if (options.eaccount) url.searchParams.set('eaccount', options.eaccount);
    if (options.sortOrder) url.searchParams.set('sort_order', options.sortOrder);
    if (options.search) url.searchParams.set('search', options.search);

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

    const json: ListEmailsResponse = await response.json();

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
        // Fallback: find any array-valued property
        for (const value of Object.values(container)) {
          if (Array.isArray(value)) {
            emails = value as any;
            break;
          }
        }
      }

      nextStartingAfter = container.next_starting_after ?? null;
    }

    return { emails, nextStartingAfter, raw: json };
  }

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

  async sendReply(params: {
    replyToUuid: string;
    eaccount: string;
    subject: string;
    body: string;
    isHtml?: boolean;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { replyToUuid, eaccount, subject, body, isHtml = false } = params;

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
      // Handle rate limiting (429) specifically
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
      // Instantly typically returns message details including message ID
      const messageId = (json as any)?.message_id || (json as any)?.id;
      return {
        success: true,
        messageId,
      };
    } catch {
      // If JSON parsing fails but status is OK, consider it a success
      return {
        success: true,
        messageId: undefined,
      };
    }
  }
}
