# Advanced Features Guide

Complete guide to WavelaunchOS CRM advanced features: analytics, reporting, exports, and webhooks.

## Table of Contents

- [Analytics Dashboard](#analytics-dashboard)
- [Reporting System](#reporting-system)
- [Export Functionality](#export-functionality)
- [Webhook Integrations](#webhook-integrations)
- [API Reference](#api-reference)

## Analytics Dashboard

### Overview

The analytics system provides comprehensive insights into your CRM operations with real-time metrics, historical trends, and client-specific analytics.

### Dashboard Analytics

Access comprehensive dashboard metrics:

```bash
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Response includes:**

1. **Overview Metrics**
   - Total clients, active clients
   - Total business plans, total deliverables
   - Overall completion rate

2. **Client Metrics**
   - Breakdown by status (ACTIVE, INACTIVE, ARCHIVED)
   - Breakdown by niche/industry
   - Recently onboarded count (last 30 days)
   - Average deliverables per client

3. **Deliverable Metrics**
   - Distribution by month (M1-M8)
   - Distribution by status
   - Completed this month count
   - Overdue count
   - Average completion time (days)

4. **AI Usage Metrics**
   - Total tokens used
   - Estimated cost (USD)
   - Business plans generated
   - Deliverables generated
   - Average tokens per plan/deliverable

5. **System Health**
   - Total jobs, queued, failed
   - Job success rate
   - Storage used vs limit

6. **Activity Metrics**
   - Recent activity types and counts
   - Active users today
   - Total actions today

### Client-Specific Analytics

Get detailed analytics for a specific client:

```bash
GET /api/analytics/clients/{clientId}
Authorization: Bearer <token>
```

**Response includes:**

- Client profile summary
- Onboarding date and days active
- Comprehensive metrics:
  - Business plans count
  - Deliverables count and completion rate
  - Files, notes, tickets count
- Activity timeline (last 20 events)
- Deliverable progress:
  - Completed months
  - In-progress months
  - Pending months

### Time Series Data

Get historical data for charts and graphs:

```bash
GET /api/analytics/timeseries?metric=clients&period=month
Authorization: Bearer <token>
```

**Parameters:**
- `metric`: `clients`, `deliverables`, or `revenue`
- `period`: `week`, `month`, `quarter`, or `year`

**Response format:**
```json
{
  "labels": ["2025-01-01", "2025-01-02", ...],
  "datasets": [
    {
      "label": "New Clients",
      "data": [5, 8, 3, ...]
    }
  ]
}
```

### Caching

Analytics are cached with smart TTL:
- Dashboard: 5 minutes
- Client analytics: 1 minute
- Time series: 30 minutes

Cache is automatically invalidated when underlying data changes.

---

## Reporting System

### Report Types

Generate comprehensive reports in multiple formats:

1. **Clients Report**
   - Full client details with metrics
   - Business plans, deliverables, files, notes, tickets counts

2. **Deliverables Report**
   - Deliverable details with client info
   - Status, generation date, approval date

3. **Business Plans Report**
   - Plan details with version history
   - Client info, status, timestamps

4. **Activities Report**
   - Activity log with user and client info
   - Type, description, timestamp

5. **Jobs Report**
   - Job queue status and history
   - Type, status, attempts, errors

6. **Tickets Report**
   - Support ticket summary
   - Status, priority, assignment, comments count

7. **Token Usage Report**
   - AI token consumption details
   - Operation, model, costs

### Generating Reports

**Endpoint:**
```bash
POST /api/reports/generate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "clients",
  "format": "csv",
  "filters": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "status": "ACTIVE"
  },
  "sortBy": "createdAt",
  "sortOrder": "desc",
  "limit": 1000
}
```

**Parameters:**

- `type` (required): Report type
  - `clients`, `deliverables`, `business-plans`, `activities`, `jobs`, `tickets`, `token-usage`

- `format` (required): Export format
  - `csv`, `json`, `pdf`

- `filters` (optional):
  - `startDate`: ISO 8601 date string
  - `endDate`: ISO 8601 date string
  - `status`: Filter by status
  - `clientId`: Filter by specific client
  - `userId`: Filter by specific user
  - `type`: Filter by type (for activities, jobs)

- `sortBy` (optional): Field to sort by
- `sortOrder` (optional): `asc` or `desc`
- `limit` (optional): Max rows (1-10,000)

**Response:**

File download with appropriate Content-Type:
- CSV: `text/csv`
- JSON: `application/json`
- PDF: `application/pdf`

Headers include:
- `Content-Disposition`: Filename with timestamp
- `X-Row-Count`: Number of rows in report

### Examples

**Export active clients to CSV:**
```bash
curl -X POST https://app.wavelaunch.com/api/reports/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "clients",
    "format": "csv",
    "filters": {"status": "ACTIVE"},
    "sortBy": "onboardedAt",
    "sortOrder": "desc"
  }' \
  --output clients-active.csv
```

**Export deliverables for a client:**
```bash
curl -X POST https://app.wavelaunch.com/api/reports/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deliverables",
    "format": "json",
    "filters": {"clientId": "clx123..."},
    "sortBy": "month",
    "sortOrder": "asc"
  }' \
  --output client-deliverables.json
```

**Export token usage for last month:**
```bash
curl -X POST https://app.wavelaunch.com/api/reports/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "token-usage",
    "format": "csv",
    "filters": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    }
  }' \
  --output token-usage-jan2025.csv
```

---

## Export Functionality

### CSV Export

**Format:**
- Header row with field names
- Comma-separated values
- Quoted strings with escaped quotes
- ISO 8601 dates

**Use cases:**
- Import into Excel/Google Sheets
- Data analysis with pandas/R
- Backup for archival

### JSON Export

**Format:**
- Pretty-printed JSON array
- 2-space indentation
- Full object structure

**Use cases:**
- Import into other systems
- API integrations
- Data processing pipelines

### PDF Export

**Format:**
- Basic text-based PDF
- Includes report metadata
- Row count summary

**Note:** Full PDF generation with tables and charts is planned for future enhancement.

**Use cases:**
- Executive reports
- Client presentations
- Printed documentation

---

## Webhook Integrations

### Overview

Webhooks enable real-time integration with external systems by sending HTTP callbacks when events occur.

### Webhook Events

**Client Events:**
- `client.created` - New client onboarded
- `client.updated` - Client details updated
- `client.activated` - Client status changed to active
- `client.archived` - Client archived

**Business Plan Events:**
- `businessplan.created` - New business plan generated
- `businessplan.approved` - Business plan approved

**Deliverable Events:**
- `deliverable.created` - New deliverable generated
- `deliverable.completed` - Deliverable approved/delivered
- `deliverable.overdue` - Deliverable marked overdue

**Ticket Events:**
- `ticket.created` - New support ticket created
- `ticket.updated` - Ticket status/details updated
- `ticket.resolved` - Ticket marked resolved

### Creating a Webhook

**Endpoint:**
```bash
POST /api/webhooks
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Slack Notifications",
  "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "secret": "your-secret-key-for-hmac",
  "events": [
    "client.created",
    "deliverable.completed",
    "ticket.created"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "wh_1234567890_abc123",
    "name": "Slack Notifications",
    "url": "https://hooks.slack.com/...",
    "events": ["client.created", "deliverable.completed", "ticket.created"],
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Webhook Payload

When an event occurs, WavelaunchOS sends a POST request to your webhook URL:

**Headers:**
```
Content-Type: application/json
User-Agent: WavelaunchOS-Webhook/1.0
X-Webhook-ID: whd_1234567890_xyz789
X-Webhook-Event: client.created
X-Webhook-Timestamp: 2025-01-15T10:30:00Z
X-Webhook-Signature: sha256=abcdef123456...
```

**Payload:**
```json
{
  "event": "client.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "clientId": "clx123...",
    "creatorName": "John Doe",
    "email": "john@example.com",
    "niche": "Tech & Gadgets"
  }
}
```

### Verifying Webhook Signatures

If you provide a `secret` when creating the webhook, all payloads are signed with HMAC SHA256:

**Node.js Example:**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = `sha256=${hmac.digest('hex')}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your webhook handler:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhook(payload, signature, 'your-secret-key')) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
  console.log('Event:', req.body.event);
  console.log('Data:', req.body.data);

  res.status(200).send('OK');
});
```

### Managing Webhooks

**List all webhooks:**
```bash
GET /api/webhooks
Authorization: Bearer <admin-token>
```

**Get webhook details:**
```bash
GET /api/webhooks/{id}
Authorization: Bearer <admin-token>
```

**Update webhook:**
```bash
PUT /api/webhooks/{id}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isActive": false
}
```

**Delete webhook:**
```bash
DELETE /api/webhooks/{id}
Authorization: Bearer <admin-token>
```

### Webhook Delivery

**Timeout:** 10 seconds per request

**Response codes:**
- 2xx: Success (webhook delivery logged as successful)
- 4xx/5xx: Failure (webhook delivery logged with error)

**Retry logic:** Currently no automatic retry (planned for future)

**Delivery tracking:** All webhook deliveries are logged in the `webhook_deliveries` table with:
- Request payload
- Response status and body
- Timestamp
- Success/failure status

---

## API Reference

### Analytics Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/analytics/dashboard` | GET | User | Get dashboard analytics |
| `/api/analytics/clients/{id}` | GET | User | Get client analytics |
| `/api/analytics/timeseries` | GET | User | Get time series data |

### Reporting Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/reports/generate` | POST | Admin | Generate and download report |

### Webhook Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/webhooks` | GET | Admin | List all webhooks |
| `/api/webhooks` | POST | Admin | Create webhook |
| `/api/webhooks/{id}` | GET | Admin | Get webhook details |
| `/api/webhooks/{id}` | PUT | Admin | Update webhook |
| `/api/webhooks/{id}` | DELETE | Admin | Delete webhook |

---

## Best Practices

### Analytics

1. **Use caching wisely**: Analytics are cached for performance. Force refresh by clearing cache if needed.
2. **Monitor trends**: Use time series data to identify patterns over weeks/months.
3. **Client health**: Regularly check client completion rates to identify at-risk clients.

### Reporting

1. **Date filters**: Always use date filters for large datasets to improve performance.
2. **Limit rows**: Use reasonable limits (100-1000 rows) for regular reports.
3. **Schedule reports**: Generate reports during off-peak hours for better performance.
4. **Format choice**: Use CSV for data analysis, JSON for integrations, PDF for presentations.

### Webhooks

1. **Verify signatures**: Always verify HMAC signatures to ensure authenticity.
2. **Respond quickly**: Return 200 OK within 10 seconds to avoid timeout.
3. **Process async**: Queue webhook processing in your system, don't block the response.
4. **Monitor failures**: Check webhook delivery logs regularly for failed deliveries.
5. **Use secrets**: Always provide a secret for production webhooks.
6. **Event selection**: Only subscribe to events you need to reduce traffic.

---

## Troubleshooting

### Analytics not updating

**Issue**: Dashboard shows stale data

**Solutions**:
- Wait for cache TTL to expire (5 minutes max)
- Clear cache via `/api/cache/clear` (admin only)
- Check if background jobs are processing

### Report generation fails

**Issue**: Report endpoint returns error

**Solutions**:
- Check date format (must be ISO 8601)
- Reduce row limit if timeout occurs
- Verify admin authentication
- Check server logs for specific error

### Webhook not firing

**Issue**: Events occur but webhook not triggered

**Solutions**:
- Verify webhook is active (`isActive: true`)
- Check event name matches exactly
- Ensure webhook URL is accessible
- Check webhook delivery logs for errors

### Webhook signature mismatch

**Issue**: Signature verification fails

**Solutions**:
- Ensure you're using the exact payload string (no modifications)
- Check secret matches what was configured
- Verify HMAC algorithm is SHA256
- Check for encoding issues (UTF-8)

---

## Related Documentation

- [AUTOMATION.md](./AUTOMATION.md) - Workflow automation
- [EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md) - Email notifications
- [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) - Production setup
- [API.md](./API.md) - Complete API reference

---

**Last Updated**: Sprint 6 - Advanced Features
**Version**: 2.0.0
