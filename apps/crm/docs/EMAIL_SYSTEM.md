# Email & Notification System

Complete guide to the WavelaunchOS email and notification system.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Email Providers](#email-providers)
- [Email Templates](#email-templates)
- [Notification Preferences](#notification-preferences)
- [API Endpoints](#api-endpoints)
- [Integration with Workflows](#integration-with-workflows)
- [Configuration](#configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

The email system provides:

- **Multi-provider support** - Resend, SMTP, or console logging
- **Professional email templates** - 9 pre-built responsive templates
- **Notification preferences** - Granular per-client email controls
- **Workflow integration** - Automatic emails for client journey events
- **Job queue integration** - Reliable asynchronous email sending
- **Development mode** - Console logging for local development

## Architecture

### Components

```
┌─────────────────────────────────────────────┐
│         Email System Components             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐    ┌─────────────────┐   │
│  │  Templates   │───▶│  Email Service  │   │
│  │   Manager    │    │   (Unified)     │   │
│  └──────────────┘    └────────┬────────┘   │
│                               │             │
│                      ┌────────▼────────┐    │
│                      │   Providers     │    │
│                      ├─────────────────┤    │
│                      │ • Resend        │    │
│                      │ • SMTP          │    │
│                      │ • Console       │    │
│                      └─────────────────┘    │
│                                             │
│  ┌──────────────┐    ┌─────────────────┐   │
│  │ Preferences  │───▶│  Job Queue      │   │
│  │   Manager    │    │   (BullMQ)      │   │
│  └──────────────┘    └─────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Email Flow

1. **Trigger** - Workflow event or manual API call
2. **Preference Check** - Verify client wants this email type
3. **Queue Job** - Add SEND_EMAIL job to queue
4. **Process** - Worker picks up job and generates email
5. **Template** - Load template and replace variables
6. **Send** - Use configured provider to send
7. **Log** - Record success/failure

## Email Providers

### Resend (Recommended for Production)

**Best for**: Production environments, high deliverability

```env
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Wavelaunch Studio
```

**Setup**:
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Generate API key
4. Add to environment variables

### SMTP (Traditional Email)

**Best for**: Enterprise environments, existing mail servers

```env
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Wavelaunch Studio
```

**Gmail Setup**:
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in SMTP_PASSWORD

### Console (Development)

**Best for**: Local development, testing

```env
# .env
NODE_ENV=development
# OR explicitly force console mode
FORCE_CONSOLE_EMAIL=true
```

Emails will be logged to console instead of sent.

## Email Templates

### Available Templates

| Template | Trigger | Variables |
|----------|---------|-----------|
| `WELCOME` | Client created | `clientName`, `portalUrl` |
| `CLIENT_ACTIVATED` | Client activated | `clientName`, `portalUrl` |
| `BUSINESS_PLAN_READY` | Business plan completed | `clientName` |
| `DELIVERABLE_READY` | Deliverable ready | `clientName`, `month`, `deliverableTitle`, `progressPercent` |
| `DELIVERABLE_OVERDUE` | Deliverable overdue | `clientName`, `deliverableTitle`, `dueDate` |
| `MILESTONE_REACHED` | Milestone achieved | `clientName`, `milestone` |
| `JOURNEY_COMPLETED` | 8 months complete | `clientName` |
| `PASSWORD_RESET` | Password reset request | `resetUrl`, `expiresIn` |
| `INVITATION` | User invited | `inviterName`, `inviteUrl` |

### Template Features

- **Responsive design** - Works on all devices
- **Professional styling** - Brand-consistent layout
- **Variable substitution** - `{{variableName}}` syntax
- **HTML + Plain text** - Dual format for compatibility
- **Accessibility** - Semantic HTML, good contrast

### Using Templates

```typescript
import { emailTemplateManager } from '@/lib/email/templates'

// Get template with variables
const template = emailTemplateManager.getTemplate('WELCOME', {
  clientName: 'John Doe',
  portalUrl: 'https://app.wavelaunch.com/portal',
})

console.log(template.subject) // "Welcome to Wavelaunch Studio! 🎉"
console.log(template.html)    // Full HTML email
console.log(template.text)    // Plain text version
```

## Notification Preferences

### Database Model

```prisma
model NotificationPreferences {
  id       String  @id @default(cuid())
  clientId String  @unique

  // Email notifications
  emailWelcome             Boolean @default(true)
  emailActivation          Boolean @default(true)
  emailBusinessPlanReady   Boolean @default(true)
  emailDeliverableReady    Boolean @default(true)
  emailDeliverableOverdue  Boolean @default(true)
  emailMilestoneReached    Boolean @default(true)
  emailJourneyCompleted    Boolean @default(true)
  emailWeeklyDigest        Boolean @default(false)
  emailMarketingUpdates    Boolean @default(false)

  // Portal notifications
  portalDeliverableUpdates    Boolean @default(true)
  portalBusinessPlanUpdates   Boolean @default(true)
  portalSystemAnnouncements   Boolean @default(true)
  portalTicketUpdates         Boolean @default(true)

  // Communication preferences
  preferredContactMethod   String  @default("email")
  reminderFrequency        String  @default("daily")

  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
}
```

### Checking Preferences

```typescript
import { shouldSendEmail } from '@/lib/email/preferences'

// Check if client wants this email type
const sendEmail = await shouldSendEmail(clientId, 'emailDeliverableReady')

if (sendEmail) {
  // Send the email
}
```

### Default Behavior

- **New clients**: All essential notifications ON, marketing OFF
- **Missing preferences**: Auto-created with defaults
- **Error handling**: Fail-open (send email on error) for important notifications

## API Endpoints

### Get Current User's Preferences

```http
GET /api/preferences
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Preferences retrieved successfully",
  "data": {
    "id": "clx...",
    "clientId": "clx...",
    "emailWelcome": true,
    "emailActivation": true,
    "emailBusinessPlanReady": true,
    "emailDeliverableReady": true,
    "emailDeliverableOverdue": true,
    "emailMilestoneReached": true,
    "emailJourneyCompleted": true,
    "emailWeeklyDigest": false,
    "emailMarketingUpdates": false,
    "preferredContactMethod": "email",
    "reminderFrequency": "daily"
  }
}
```

### Update Current User's Preferences

```http
PUT /api/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailDeliverableReady": false,
  "emailWeeklyDigest": true,
  "reminderFrequency": "weekly"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": { /* updated preferences */ }
}
```

### Get Client Preferences (Admin Only)

```http
GET /api/preferences/[clientId]
Authorization: Bearer <admin-token>
```

### Update Client Preferences (Admin Only)

```http
PUT /api/preferences/[clientId]
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "emailMarketingUpdates": false
}
```

## Integration with Workflows

### Automatic Email Triggers

| Workflow Event | Email Template | Preference Key |
|----------------|----------------|----------------|
| `CLIENT_CREATED` | `WELCOME` | `emailWelcome` |
| `CLIENT_ACTIVATED` | `CLIENT_ACTIVATED` | `emailActivation` |
| `BUSINESS_PLAN_COMPLETED` | `BUSINESS_PLAN_READY` | `emailBusinessPlanReady` |
| `DELIVERABLE_COMPLETED` | `DELIVERABLE_READY` | `emailDeliverableReady` |
| `DELIVERABLE_OVERDUE` | `DELIVERABLE_OVERDUE` | `emailDeliverableOverdue` |
| `CLIENT_MILESTONE_REACHED` | `MILESTONE_REACHED` | `emailMilestoneReached` |
| Journey complete | `JOURNEY_COMPLETED` | `emailJourneyCompleted` |

### Workflow Integration Pattern

```typescript
// In client-journey.ts workflows
if (process.env.ENABLE_EMAIL_WORKFLOWS === 'true') {
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
          clientName: client.name,
          month: 5,
          deliverableTitle: 'Month 5 Deliverable',
          progressPercent: 62,
        },
      },
      { priority: JOB_PRIORITY.NORMAL }
    )
  }
}
```

## Configuration

### Environment Variables

```env
# Email Provider Selection (auto-detected)
RESEND_API_KEY=re_xxxxxxxxxxxxx        # Enables Resend
SMTP_HOST=smtp.gmail.com               # Enables SMTP

# Sender Information
EMAIL_FROM=noreply@wavelaunch.com
EMAIL_FROM_NAME=Wavelaunch Studio

# SMTP Configuration (if using SMTP)
SMTP_PORT=587
SMTP_SECURE=false                      # true for port 465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Feature Flags
ENABLE_EMAIL_WORKFLOWS=true            # Enable automatic workflow emails
FORCE_CONSOLE_EMAIL=false              # Force console mode (dev only)

# Application URLs
NEXT_PUBLIC_APP_URL=https://app.wavelaunch.com
```

### Provider Selection Logic

```
1. If NODE_ENV=development and !FORCE_EMAIL_SEND → Console
2. If RESEND_API_KEY is set → Resend
3. If SMTP_HOST is set → SMTP
4. Otherwise → Console
```

## Testing

### Test Email Connection

```http
GET /api/email/test
Authorization: Bearer <admin-token>
```

**Response**:
```json
{
  "provider": "resend",
  "connectionOk": true,
  "message": "Email service is working (using resend)",
  "from": "noreply@wavelaunch.com"
}
```

### Manual Email Sending

```typescript
import { sendWelcomeEmail, sendDeliverableReadyEmail } from '@/lib/email/sender'

// Send welcome email
await sendWelcomeEmail('client@example.com', 'John Doe')

// Send deliverable ready email
await sendDeliverableReadyEmail(
  'client@example.com',
  'John Doe',
  5,
  'Month 5 Marketing Strategy'
)
```

### Job Queue Testing

```typescript
import { jobQueue, JOB_PRIORITY } from '@/lib/jobs'

await jobQueue.enqueue(
  'SEND_EMAIL',
  {
    type: 'DELIVERABLE_READY',
    clientId: 'clx123',
    to: 'client@example.com',
    context: {
      clientName: 'John Doe',
      month: 5,
      deliverableTitle: 'Month 5 Deliverable',
      progressPercent: 62,
    },
  },
  { priority: JOB_PRIORITY.HIGH }
)
```

## Troubleshooting

### Emails Not Sending

**Check**:
1. Environment variables configured correctly
2. `ENABLE_EMAIL_WORKFLOWS=true` is set
3. Email provider credentials are valid
4. Redis is running (for BullMQ job queue)
5. Client has email preference enabled

**Debug**:
```bash
# Check email service status
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/email/test

# Check job queue metrics
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/jobs/metrics
```

### Resend Provider Issues

**Common errors**:
- `Invalid API key` - Check RESEND_API_KEY is correct
- `Domain not verified` - Verify domain in Resend dashboard
- `Rate limit exceeded` - Upgrade Resend plan or reduce send rate

### SMTP Provider Issues

**Common errors**:
- `Authentication failed` - Check SMTP_USER and SMTP_PASSWORD
- `Connection timeout` - Check SMTP_HOST and SMTP_PORT
- `TLS error` - Verify SMTP_SECURE setting matches port (587=false, 465=true)

**Gmail specific**:
- Use app password, not regular password
- Enable "Less secure app access" if needed
- Check Gmail sending limits (500/day for free accounts)

### Preferences Not Working

**Check**:
1. Client record exists in database
2. NotificationPreferences record created (auto-created on first check)
3. Correct preference key used (e.g., `emailDeliverableReady` not `deliverableReady`)

**Debug**:
```typescript
import { shouldSendEmail } from '@/lib/email/preferences'

const result = await shouldSendEmail(clientId, 'emailDeliverableReady')
console.log('Should send:', result)

// Check database
const prefs = await db.notificationPreferences.findUnique({
  where: { clientId }
})
console.log('Preferences:', prefs)
```

### Job Queue Issues

If emails are queued but not sent:

```bash
# Check Redis is running
docker ps | grep redis

# Check job queue metrics
curl http://localhost:3000/api/jobs/metrics

# View job queue dashboard (if using BullMQ)
# Retries are automatic with exponential backoff
```

### Development Mode

Emails logged to console in development:

```
[Email Service] Console mode - Email would be sent:
From: Wavelaunch Studio <noreply@wavelaunch.com>
To: client@example.com
Subject: Your Month 5 Deliverable is Ready! 🎉
---
[Email Content]
---
```

To force sending in development:
```env
FORCE_EMAIL_SEND=true
```

## Best Practices

### For Developers

1. **Always check preferences** before sending emails
2. **Use job queue** for all email sending (never synchronous)
3. **Handle errors gracefully** - log but don't throw
4. **Test in console mode** before using real provider
5. **Validate email addresses** before enqueueing jobs

### For Admins

1. **Monitor send rates** - avoid hitting provider limits
2. **Track deliverability** - check bounce rates
3. **Respect unsubscribes** - honor preference changes
4. **Keep templates updated** - maintain brand consistency
5. **Test email rendering** - check across email clients

### For Users

1. **Customize preferences** - only get emails you want
2. **Whitelist sender** - add to contacts to avoid spam folder
3. **Update email address** - keep contact info current
4. **Check spam folder** - emails might be filtered
5. **Report issues** - help improve deliverability

## Related Documentation

- [Automation System](./AUTOMATION.md) - Workflow and scheduling documentation
- [Job Queue](../src/lib/jobs/README.md) - BullMQ job queue documentation
- [API Documentation](./API.md) - Complete API reference

## Support

For issues or questions:

1. Check this documentation
2. Review error logs
3. Test with `/api/email/test` endpoint
4. Check job queue metrics at `/api/jobs/metrics`
5. File an issue on GitHub

---

**Last Updated**: Sprint 3 - Email & Communication System
**Version**: 2.0.0
