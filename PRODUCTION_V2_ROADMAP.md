# WavelaunchOS Production v2.0 Implementation Plan

> **Goal**: Achieve production-ready v2.0 status with all high-priority features and minimum errors

**Timeline**: 12 weeks (3 months)
**Team Size Assumption**: 1-2 developers
**Methodology**: Agile sprints (2-week cycles)

---

## 📊 Overview

```
Sprint 1-2: Critical Fixes & Security     [Weeks 1-4]   ████████░░░░
Sprint 3:   Infrastructure Upgrade        [Weeks 5-6]   ░░░░░░██░░░░
Sprint 4:   Email & Communication         [Weeks 7-8]   ░░░░░░░░██░░
Sprint 5:   Core Features Completion      [Weeks 9-10]  ░░░░░░░░░░██
Sprint 6:   Performance & Polish          [Weeks 11-12] ░░░░░░░░░░░░██
```

**Total Estimated Effort**: 480-560 hours (60-70 dev days)

---

## 🚨 SPRINT 1: Critical Security & Bug Fixes (Week 1-2)

> **Priority**: CRITICAL
> **Duration**: 2 weeks
> **Goal**: Fix all security vulnerabilities and broken flows

### Week 1: Security Hardening

#### Day 1-2: Authorization & CSRF Protection
**Priority**: 🔴 CRITICAL

**Tasks**:
1. Implement row-level security checks
   - Create middleware: `src/lib/auth/authorize.ts`
   - Add ownership verification to all `/api/clients/[id]/*` routes
   - Add ownership verification to files, business plans, deliverables
   - Verify clients can only access their own portal data

2. Add CSRF protection
   - Install: `npm install @edge-csrf/nextjs`
   - Implement CSRF middleware
   - Add CSRF tokens to all forms
   - Test with Playwright

**Files to Create/Modify**:
```
src/lib/auth/authorize.ts                    # New: Authorization helpers
src/middleware.ts                             # Update: Add CSRF
src/app/api/clients/[id]/route.ts            # Update: Add auth checks
src/app/api/business-plans/[id]/route.ts     # Update: Add auth checks
src/app/api/deliverables/[id]/route.ts       # Update: Add auth checks
src/app/api/files/[id]/route.ts              # Update: Add auth checks
src/app/api/portal/*/route.ts                # Update: Add ownership checks
```

**Acceptance Criteria**:
- [ ] No user can access another user's data
- [ ] All POST/PUT/DELETE requests require CSRF token
- [ ] All API routes verify ownership before returning data
- [ ] Tests pass for unauthorized access attempts

---

#### Day 3-4: File Upload Security
**Priority**: 🔴 CRITICAL

**Tasks**:
1. Implement file validation
   - Add file content validation (not just MIME type)
   - Sanitize filenames (prevent path traversal)
   - Add file size validation per endpoint
   - Implement virus scanning (ClamAV or VirusTotal API)

2. Secure file storage
   - Move uploads outside public directory
   - Implement signed URLs for file access
   - Add expiry to download links

**Files to Create/Modify**:
```
src/lib/files/validation.ts                  # New: File validation
src/lib/files/scanner.ts                     # New: Virus scanning
src/lib/files/storage.ts                     # Update: Secure storage
src/app/api/files/upload/route.ts            # Update: Add validation
src/app/api/files/[id]/download/route.ts     # New: Signed downloads
```

**Acceptance Criteria**:
- [ ] Files validated beyond MIME type
- [ ] Filenames sanitized (no ../../../etc/passwd)
- [ ] Virus scanning active
- [ ] Files not directly accessible via URL
- [ ] Download links expire after 1 hour

---

#### Day 5: Input Sanitization & XSS Prevention
**Priority**: 🔴 HIGH

**Tasks**:
1. Install DOMPurify: `npm install isomorphic-dompurify`
2. Sanitize all rich text inputs (TipTap editor content)
3. Add output encoding for user-generated content
4. Review all `dangerouslySetInnerHTML` usage

**Files to Create/Modify**:
```
src/lib/security/sanitize.ts                 # New: Sanitization helpers
src/components/editor/TipTapEditor.tsx       # Update: Sanitize on save
src/app/api/business-plans/*/route.ts        # Update: Sanitize input
src/app/api/notes/*/route.ts                 # Update: Sanitize input
```

**Acceptance Criteria**:
- [ ] All user input sanitized before storage
- [ ] XSS test payloads blocked
- [ ] Rich text editor strips dangerous tags

---

### Week 2: Critical Bug Fixes

#### Day 6-7: Authentication Security
**Priority**: 🔴 HIGH

**Tasks**:
1. Implement account lockout (5 failed attempts = 15 min lockout)
2. Add session timeout (24 hours inactive)
3. Implement password strength requirements
4. Add password reset rate limiting (already exists, verify)
5. Log all authentication attempts

**Files to Create/Modify**:
```
src/lib/auth/lockout.ts                      # New: Account lockout
src/lib/auth/session.ts                      # Update: Session timeout
src/schemas/auth.ts                          # Update: Password validation
src/app/api/auth/login/route.ts              # Update: Lockout logic
prisma/schema.prisma                         # Add: LoginAttempt model
```

**Schema Changes**:
```prisma
model LoginAttempt {
  id        String   @id @default(cuid())
  email     String
  ip        String
  success   Boolean
  createdAt DateTime @default(now())

  @@index([email, createdAt])
  @@index([ip, createdAt])
}

model User {
  // ... existing fields
  lockedUntil   DateTime?
  lastLoginAt   DateTime?
  sessionExpiry DateTime?
}
```

**Acceptance Criteria**:
- [ ] Account locks after 5 failed attempts
- [ ] Sessions expire after 24 hours
- [ ] Strong passwords enforced (8+ chars, uppercase, number, symbol)
- [ ] All login attempts logged

---

#### Day 8-9: API Security & Rate Limiting
**Priority**: 🔴 HIGH

**Tasks**:
1. Implement global rate limiting (not just login/reset)
2. Add CORS configuration
3. Standardize error responses (don't leak stack traces)
4. Add request ID tracking
5. Implement API request logging

**Files to Create/Modify**:
```
src/lib/rate-limiter.ts                      # Update: Global rate limits
src/middleware.ts                            # Update: Add CORS, rate limit
src/lib/api/responses.ts                     # New: Standardized responses
src/lib/api/logger.ts                        # New: Request logging
```

**Rate Limits**:
```
POST /api/auth/login           → 5 req/15min per IP
POST /api/auth/reset-password  → 3 req/hour per IP
POST /api/*/                   → 100 req/15min per user
GET /api/*/                    → 300 req/15min per user
```

**Acceptance Criteria**:
- [ ] Rate limiting on all endpoints
- [ ] CORS properly configured
- [ ] Errors don't expose sensitive info
- [ ] All requests logged with request ID

---

#### Day 10: Testing & Documentation
**Priority**: 🟡 HIGH

**Tasks**:
1. Write security tests (Playwright)
   - Test unauthorized access
   - Test CSRF protection
   - Test rate limiting
   - Test file upload validation

2. Document security measures
   - Update SECURITY.md
   - Add security section to README
   - Document rate limits in API docs

3. Run security audit
   - `npm audit`
   - Check dependencies for vulnerabilities
   - Update vulnerable packages

**Acceptance Criteria**:
- [ ] All security tests pass
- [ ] SECURITY.md updated
- [ ] No critical npm vulnerabilities
- [ ] Sprint 1 ready for review

---

## 🔧 SPRINT 2: Infrastructure Upgrade (Week 3-4)

> **Priority**: CRITICAL
> **Duration**: 2 weeks
> **Goal**: Migrate from SQLite to PostgreSQL, implement Redis, stable queue

### Week 3: Database Migration

#### Day 11-12: PostgreSQL Setup & Migration
**Priority**: 🔴 CRITICAL

**Tasks**:
1. Setup PostgreSQL
   - Create `docker-compose.yml` with PostgreSQL + Redis
   - Update `.env.example` with new variables
   - Create local dev database

2. Update Prisma schema
   - Change provider to PostgreSQL
   - Add indexes for common queries
   - Generate migration files
   - Test migration locally

3. Create data migration script
   - Export SQLite data
   - Transform for PostgreSQL
   - Import and verify

**Files to Create/Modify**:
```
docker/docker-compose.yml                    # New: PG + Redis
docker/docker-compose.dev.yml                # New: Dev environment
.env.example                                 # Update: Add PG/Redis
prisma/schema.prisma                         # Update: Provider
scripts/migrate-sqlite-to-postgres.ts        # New: Migration script
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: wavelaunch
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: wavelaunch_crm
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Prisma Schema Updates**:
```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}

// Add indexes
model Client {
  // ... existing fields

  @@index([status])
  @@index([createdAt])
  @@index([email])
}

model BusinessPlan {
  // ... existing fields

  @@index([clientId, status])
  @@index([createdAt])
}

model Deliverable {
  // ... existing fields

  @@index([clientId, milestone])
  @@index([status, dueDate])
}

model File {
  // ... existing fields

  @@index([clientId, createdAt])
  @@index([uploadedBy])
}

model Activity {
  // ... existing fields

  @@index([userId, createdAt])
  @@index([entityType, entityId])
}
```

**Acceptance Criteria**:
- [ ] PostgreSQL running in Docker
- [ ] Prisma migrations created
- [ ] All data migrated successfully
- [ ] Queries faster than SQLite
- [ ] Dev environment documented

---

#### Day 13-14: Redis Integration
**Priority**: 🔴 HIGH

**Tasks**:
1. Setup Redis client
   - Install: `npm install ioredis`
   - Create Redis connection wrapper
   - Add health check endpoint

2. Migrate rate limiter to Redis
   - Replace in-memory Map with Redis
   - Test distributed rate limiting
   - Add rate limit headers to responses

3. Implement response caching
   - Cache expensive queries (analytics, reports)
   - Set appropriate TTLs
   - Add cache invalidation logic

**Files to Create/Modify**:
```
src/lib/redis/client.ts                      # New: Redis client
src/lib/redis/cache.ts                       # New: Caching helpers
src/lib/rate-limiter.ts                      # Update: Use Redis
src/app/api/health/route.ts                  # New: Health check
src/app/api/analytics/route.ts               # Update: Add caching
```

**Cache Strategy**:
```typescript
// Cache durations
const CACHE_TTL = {
  analytics: 3600,        // 1 hour
  clientList: 300,        // 5 minutes
  deliverableList: 300,   // 5 minutes
  businessPlan: 1800,     // 30 minutes (content heavy)
}

// Cache invalidation triggers
- Client updated → invalidate client cache
- Deliverable created → invalidate client & deliverable list
- Business plan approved → invalidate business plan cache
```

**Acceptance Criteria**:
- [ ] Redis connected and healthy
- [ ] Rate limiting uses Redis
- [ ] Analytics endpoint cached
- [ ] Cache invalidation works
- [ ] Performance improved (measure with logs)

---

### Week 4: Job Queue & Background Workers

#### Day 15-17: BullMQ Job Queue
**Priority**: 🔴 CRITICAL

**Tasks**:
1. Replace in-memory queue with BullMQ
   - Install: `npm install bullmq`
   - Create queue service
   - Migrate existing jobs to BullMQ

2. Implement background worker
   - Create worker process
   - Add job types (AI generation, PDF, email)
   - Implement retry logic
   - Add job progress tracking

3. Create job monitoring dashboard
   - Update jobs page to show BullMQ jobs
   - Real-time job progress
   - Failed job retry UI
   - Job logs viewer

**Files to Create/Modify**:
```
src/lib/queue/bullmq.ts                      # New: BullMQ setup
src/lib/queue/jobs/ai-generation.ts          # New: Job handlers
src/lib/queue/jobs/pdf-generation.ts         # New: Job handlers
src/lib/queue/jobs/email-sending.ts          # New: Job handlers
src/workers/processor.ts                     # New: Background worker
src/app/(dashboard)/jobs/page.tsx            # Update: BullMQ UI
package.json                                 # Add: worker script
```

**Job Types**:
```typescript
enum JobType {
  BUSINESS_PLAN_GENERATION = 'business_plan_generation',
  DELIVERABLE_GENERATION = 'deliverable_generation',
  PDF_GENERATION = 'pdf_generation',
  EMAIL_SENDING = 'email_sending',
  FILE_CLEANUP = 'file_cleanup',
  BACKUP_DATABASE = 'backup_database',
}
```

**package.json scripts**:
```json
{
  "scripts": {
    "worker": "tsx src/workers/processor.ts",
    "dev:worker": "tsx watch src/workers/processor.ts"
  }
}
```

**Acceptance Criteria**:
- [ ] All jobs moved to BullMQ
- [ ] Worker processes jobs in background
- [ ] Failed jobs retry automatically (3 attempts)
- [ ] Job progress visible in UI
- [ ] Jobs persist across server restarts

---

#### Day 18-20: Automated Workflows
**Priority**: 🟡 HIGH

**Tasks**:
1. Create scheduled tasks system
   - Implement cron jobs for recurring tasks
   - File cleanup (every Sunday)
   - Database backup (daily at 2 AM)
   - Token budget alerts (daily)

2. Implement automated client journey
   - Auto-generate M1 after client onboarding
   - Schedule M2-M8 based on timeline
   - Send reminder emails before milestones

3. Add admin controls for automation
   - Pause/resume automation per client
   - Override schedules
   - View automation history

**Files to Create/Modify**:
```
src/lib/automation/scheduler.ts              # New: Cron scheduler
src/lib/automation/workflows/client-journey.ts  # New: Auto workflow
src/lib/automation/jobs/cleanup.ts           # New: Cleanup jobs
src/lib/automation/jobs/backup.ts            # New: Backup jobs
prisma/schema.prisma                         # Add: AutomationLog model
src/app/(dashboard)/automation/page.tsx      # New: Automation UI
src/app/api/automation/*/route.ts            # New: Automation API
```

**Schema Changes**:
```prisma
model AutomationRule {
  id          String   @id @default(cuid())
  clientId    String
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  type        String   // 'deliverable_generation', 'reminder_email'
  schedule    String   // Cron expression or ISO date
  config      Json     // Rule-specific config
  enabled     Boolean  @default(true)
  lastRun     DateTime?
  nextRun     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([clientId, enabled])
  @@index([nextRun])
}

model AutomationLog {
  id        String   @id @default(cuid())
  ruleId    String
  rule      AutomationRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  status    String   // 'success', 'failed', 'skipped'
  error     String?
  duration  Int?     // Milliseconds
  createdAt DateTime @default(now())

  @@index([ruleId, createdAt])
}
```

**Acceptance Criteria**:
- [ ] File cleanup runs automatically
- [ ] Daily database backups created
- [ ] M1 auto-generated for new clients (if enabled)
- [ ] Admin can pause/resume automation
- [ ] Automation logs visible in UI

---

## 📧 SPRINT 3: Email & Communication System (Week 5-6)

> **Priority**: HIGH
> **Duration**: 2 weeks
> **Goal**: Complete email integration, notification system

### Week 5: Email Infrastructure

#### Day 21-23: Email Service Implementation
**Priority**: 🔴 CRITICAL

**Tasks**:
1. Create comprehensive email service
   - Implement EmailService class
   - Create email templates (React Email)
   - Add email queue (via BullMQ)
   - Implement retry logic for failed emails

2. Create email templates
   - Welcome email (client onboarded)
   - Portal invite email
   - Password reset email
   - Deliverable ready notification
   - Weekly progress summary
   - Milestone reminder

3. Email sending & logging
   - Send emails via Resend API
   - Log all email attempts
   - Track delivery status
   - Handle bounces & complaints

**Files to Create/Modify**:
```
src/lib/email/service.ts                     # New: Email service
src/lib/email/templates/welcome.tsx          # New: React Email template
src/lib/email/templates/portal-invite.tsx    # New: React Email template
src/lib/email/templates/deliverable-ready.tsx # New: React Email template
src/lib/email/templates/password-reset.tsx   # New: React Email template
src/lib/email/templates/progress-summary.tsx # New: React Email template
src/lib/email/templates/milestone-reminder.tsx # New: React Email template
prisma/schema.prisma                         # Add: EmailLog model
src/app/api/admin/emails/route.ts            # New: Email logs API
src/app/(dashboard)/emails/page.tsx          # New: Email logs UI
```

**Install React Email**:
```bash
npm install react-email @react-email/components
npm install -D @react-email/render
```

**Schema Changes**:
```prisma
model EmailLog {
  id         String   @id @default(cuid())
  to         String
  from       String
  subject    String
  template   String
  status     String   // 'sent', 'failed', 'bounced', 'complained'
  provider   String   @default("resend")
  providerId String?  // Resend email ID
  error      String?
  sentAt     DateTime?
  createdAt  DateTime @default(now())

  // Optional relations
  clientId   String?
  client     Client?  @relation(fields: [clientId], references: [id], onDelete: SetNull)
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([status, createdAt])
  @@index([to])
  @@index([clientId])
}
```

**Email Service Example**:
```typescript
// src/lib/email/service.ts
export class EmailService {
  static async sendWelcomeEmail(client: Client, password: string) {
    const html = await render(WelcomeEmail({ client, password }))

    const job = await emailQueue.add('send-email', {
      to: client.email,
      subject: `Welcome to WavelaunchOS, ${client.creatorName}!`,
      html,
      template: 'welcome',
      clientId: client.id,
    })

    return job.id
  }

  // ... other email methods
}
```

**Acceptance Criteria**:
- [ ] All email templates created
- [ ] Emails send successfully via Resend
- [ ] Email sending is queued (non-blocking)
- [ ] Failed emails retry 3 times
- [ ] All emails logged in database
- [ ] Admin can view email logs

---

#### Day 24-25: Integrate Emails into Workflows
**Priority**: 🔴 HIGH

**Tasks**:
1. Trigger welcome emails
   - Send on client creation
   - Include login credentials
   - Add getting started guide

2. Trigger portal invite emails
   - Replace console.log with actual email
   - Include invite link
   - Add expiry notice (7 days)

3. Trigger deliverable notifications
   - Email when deliverable ready
   - Include download link
   - Add feedback request

4. Create email preferences
   - Allow clients to unsubscribe
   - Preference management page
   - Honor unsubscribe requests

**Files to Create/Modify**:
```
src/app/api/clients/route.ts                 # Update: Send welcome email
src/app/api/admin/portal-users/invite/route.ts # Update: Send invite email
src/app/api/deliverables/[id]/route.ts       # Update: Send notification
src/app/portal/preferences/page.tsx          # New: Email preferences
src/app/api/portal/preferences/route.ts      # New: Preferences API
prisma/schema.prisma                         # Add: emailPreferences to PortalUser
```

**Schema Changes**:
```prisma
model PortalUser {
  // ... existing fields
  emailPreferences Json @default("{\"marketing\": true, \"deliverables\": true, \"reminders\": true}")
}
```

**Acceptance Criteria**:
- [ ] Welcome email sent on client creation
- [ ] Portal invite emails sent (no more console.log!)
- [ ] Deliverable notifications sent
- [ ] Clients can manage email preferences
- [ ] Unsubscribe links work

---

### Week 6: Notification System

#### Day 26-28: In-App Notifications
**Priority**: 🟡 HIGH

**Tasks**:
1. Create notification system
   - Database model for notifications
   - Notification service
   - Real-time via polling (or WebSockets)
   - Mark as read functionality

2. Create notification UI
   - Bell icon in header
   - Unread count badge
   - Notification dropdown
   - Notification preferences

3. Trigger notifications
   - New client message → notify admin
   - Deliverable ready → notify client
   - New submission → notify admin
   - Token budget threshold → notify admin

**Files to Create/Modify**:
```
prisma/schema.prisma                         # Add: Notification model
src/lib/notifications/service.ts             # New: Notification service
src/components/layout/NotificationBell.tsx   # New: Notification UI
src/app/api/notifications/route.ts           # New: Notifications API
src/app/api/notifications/[id]/read/route.ts # New: Mark as read
src/hooks/useNotifications.ts                # New: Polling hook
```

**Schema Changes**:
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String   // 'message', 'deliverable', 'submission', 'alert'
  title     String
  message   String
  link      String?
  read      Boolean  @default(false)
  readAt    DateTime?
  createdAt DateTime @default(now())

  @@index([userId, read, createdAt])
}
```

**Notification Service**:
```typescript
export class NotificationService {
  static async create(data: {
    userId: string
    type: string
    title: string
    message: string
    link?: string
  }) {
    return prisma.notification.create({ data })
  }

  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() }
    })
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false }
    })
  }
}
```

**Acceptance Criteria**:
- [ ] Notifications stored in database
- [ ] Bell icon shows unread count
- [ ] Clicking notification marks as read
- [ ] Notifications link to relevant pages
- [ ] Polling updates every 30 seconds

---

#### Day 29-30: Testing & Polish
**Priority**: 🟡 MEDIUM

**Tasks**:
1. Test email delivery
   - Test all email templates
   - Verify links work
   - Test unsubscribe flow
   - Check mobile rendering

2. Test notifications
   - Trigger all notification types
   - Test mark as read
   - Test notification preferences
   - Verify polling works

3. Create email/notification docs
   - Document all email triggers
   - Document notification types
   - Add troubleshooting guide

**Acceptance Criteria**:
- [ ] All emails tested and working
- [ ] All notifications tested and working
- [ ] Documentation complete
- [ ] Sprint 3 ready for review

---

## ✅ SPRINT 4: Core Features Completion (Week 7-8)

> **Priority**: HIGH
> **Duration**: 2 weeks
> **Goal**: Complete ticket system, help center, portal enhancements

### Week 7: Ticket System

#### Day 31-33: Ticket System Backend
**Priority**: 🔴 CRITICAL

**Tasks**:
1. Create ticket database schema
   - SupportTicket model
   - TicketMessage model (for conversation)
   - Ticket categories & priorities

2. Build ticket API
   - Create ticket
   - List tickets (admin + client views)
   - Get ticket details
   - Add message to ticket
   - Update ticket status
   - Assign ticket to admin

3. Email notifications for tickets
   - New ticket → notify admin
   - Admin reply → notify client
   - Ticket closed → notify client

**Files to Create/Modify**:
```
prisma/schema.prisma                         # Add: SupportTicket, TicketMessage
src/app/api/tickets/route.ts                 # New: List/Create tickets
src/app/api/tickets/[id]/route.ts            # New: Get/Update ticket
src/app/api/tickets/[id]/messages/route.ts   # New: Ticket messages
src/lib/email/templates/ticket-created.tsx   # New: Email template
src/lib/email/templates/ticket-reply.tsx     # New: Email template
```

**Schema Changes**:
```prisma
enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_ON_CLIENT
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model SupportTicket {
  id          String         @id @default(cuid())
  number      Int            @unique // Auto-increment ticket number
  subject     String
  description String
  status      TicketStatus   @default(OPEN)
  priority    TicketPriority @default(MEDIUM)
  category    String?        // 'Technical', 'Billing', 'General'

  // Relations
  clientId    String?
  client      Client?        @relation(fields: [clientId], references: [id], onDelete: SetNull)
  assignedToId String?
  assignedTo  User?          @relation(fields: [assignedToId], references: [id], onDelete: SetNull)
  messages    TicketMessage[]

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  resolvedAt  DateTime?
  closedAt    DateTime?

  @@index([status, priority])
  @@index([clientId])
  @@index([assignedToId])
  @@index([number])
}

model TicketMessage {
  id        String        @id @default(cuid())
  ticketId  String
  ticket    SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  message   String
  isAdminReply Boolean    @default(false)
  authorId  String
  author    User         @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime     @default(now())

  @@index([ticketId, createdAt])
}
```

**Acceptance Criteria**:
- [ ] Ticket model created
- [ ] API endpoints working
- [ ] Emails sent for ticket events
- [ ] Auto-incrementing ticket numbers
- [ ] Tests pass

---

#### Day 34-35: Ticket System Frontend
**Priority**: 🔴 CRITICAL

**Tasks**:
1. Fix tickets page UI
   - Connect form to API
   - Show ticket submission success
   - Add ticket list view
   - Add filters (status, priority)

2. Create ticket detail page
   - Show full conversation
   - Reply functionality
   - Status change controls (admin only)
   - Assignment controls (admin only)

3. Create client portal tickets view
   - Client can view their tickets
   - Client can create tickets
   - Client can reply to tickets

**Files to Create/Modify**:
```
src/app/(dashboard)/tickets/page.tsx         # Update: Connect to API
src/app/(dashboard)/tickets/[id]/page.tsx    # New: Ticket detail
src/app/portal/tickets/page.tsx              # New: Client tickets view
src/app/portal/tickets/[id]/page.tsx         # New: Client ticket detail
src/components/tickets/TicketList.tsx        # New: Ticket list component
src/components/tickets/TicketDetail.tsx      # New: Ticket detail component
src/components/tickets/TicketForm.tsx        # New: Create ticket form
```

**Acceptance Criteria**:
- [ ] Admin can create tickets
- [ ] Admin can view all tickets
- [ ] Admin can reply to tickets
- [ ] Admin can assign tickets
- [ ] Clients can create tickets from portal
- [ ] Clients can view their tickets
- [ ] Real-time status updates

---

### Week 8: Help Center & Portal Polish

#### Day 36-37: Help Center
**Priority**: 🟡 HIGH

**Tasks**:
1. Create help article system
   - Article database model
   - Markdown-based articles
   - Categories & tags
   - Search functionality

2. Build help center CMS
   - Admin page to create articles
   - Markdown editor
   - Publish/draft status
   - Preview functionality

3. Fix help center public view
   - List articles by category
   - Article detail page
   - Search working
   - Related articles

**Files to Create/Modify**:
```
prisma/schema.prisma                         # Add: HelpArticle model
src/app/api/help/articles/route.ts           # New: Articles API
src/app/api/help/articles/[id]/route.ts      # New: Article CRUD
src/app/(dashboard)/help-cms/page.tsx        # New: CMS for articles
src/app/(dashboard)/help-cms/new/page.tsx    # New: Create article
src/app/(dashboard)/help-cms/[id]/page.tsx   # New: Edit article
src/app/help/page.tsx                        # Update: Show real articles
src/app/help/[slug]/page.tsx                 # New: Article detail
src/components/help/ArticleEditor.tsx        # New: Markdown editor
```

**Schema Changes**:
```prisma
model HelpArticle {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  content     String   // Markdown
  excerpt     String?
  category    String   // 'Getting Started', 'Portal', 'Features', 'Billing'
  tags        String[] // ['onboarding', 'portal-setup']
  published   Boolean  @default(false)
  views       Int      @default(0)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?

  @@index([published, category])
  @@index([slug])
}
```

**Acceptance Criteria**:
- [ ] Admin can create help articles
- [ ] Articles render Markdown properly
- [ ] Search works (full-text search)
- [ ] Articles categorized
- [ ] Public help center functional

---

#### Day 38-40: Portal Enhancements
**Priority**: 🟡 HIGH

**Tasks**:
1. Enhanced onboarding wizard
   - Expand from 3 to 6 steps
   - Add progress tracking
   - Add welcome video embed
   - Make it skippable

2. Portal dashboard improvements
   - Recent activity feed
   - Quick actions widget
   - Progress overview
   - Next steps guidance

3. Mobile responsiveness
   - Test all portal pages on mobile
   - Fix sidebar on mobile
   - Optimize forms for mobile
   - Touch-friendly buttons

**Files to Create/Modify**:
```
src/app/portal/onboarding/page.tsx           # Update: 6-step wizard
src/app/portal/dashboard/page.tsx            # Update: Enhanced dashboard
src/components/portal/OnboardingWizard.tsx   # Update: More steps
src/components/portal/RecentActivity.tsx     # New: Activity feed
src/components/portal/QuickActions.tsx       # New: Quick actions
src/components/layout/PortalSidebar.tsx      # Update: Mobile responsive
```

**Onboarding Steps**:
1. Welcome & Introduction
2. Profile Setup
3. Upload Your Materials
4. Review Your Business Plan
5. Set Notification Preferences
6. Complete! (Next steps)

**Acceptance Criteria**:
- [ ] Onboarding wizard has 6 steps
- [ ] Progress tracked in database
- [ ] Portal dashboard shows recent activity
- [ ] All portal pages mobile-friendly
- [ ] Sidebar collapses on mobile

---

## 🚀 SPRINT 5: Performance & Production Readiness (Week 9-10)

> **Priority**: CRITICAL
> **Duration**: 2 weeks
> **Goal**: Optimize performance, add monitoring, prepare for production

### Week 9: Performance Optimization

#### Day 41-43: Database & API Optimization
**Priority**: 🔴 CRITICAL

**Tasks**:
1. Database optimization
   - Add missing indexes (all foreign keys, query fields)
   - Optimize N+1 queries
   - Implement pagination everywhere
   - Add database connection pooling

2. API optimization
   - Implement response caching (Redis)
   - Add field selection (sparse fieldsets)
   - Compress API responses
   - Optimize expensive queries

3. Frontend optimization
   - Implement React Query for server state
   - Add optimistic updates
   - Debounce search inputs
   - Lazy load heavy components

**Files to Create/Modify**:
```
prisma/schema.prisma                         # Add: Missing indexes
src/lib/db.ts                                # Update: Connection pooling
src/app/api/*/route.ts                       # Update: Pagination
src/lib/api/cache.ts                         # New: Response caching
src/hooks/useClients.ts                      # New: React Query hooks
src/hooks/useBusinessPlans.ts                # New: React Query hooks
src/hooks/useDeliverables.ts                 # New: React Query hooks
package.json                                 # Add: @tanstack/react-query
```

**Install React Query**:
```bash
npm install @tanstack/react-query
```

**Index Additions**:
```prisma
model Client {
  // ... existing
  @@index([status, createdAt])
}

model File {
  // ... existing
  @@index([clientId, uploadedAt])
  @@index([uploadedBy])
}

model BusinessPlan {
  // ... existing
  @@index([clientId, status])
}

model Deliverable {
  // ... existing
  @@index([clientId, milestone, status])
}

model Message {
  // ... existing
  @@index([threadId, createdAt])
}

model Note {
  // ... existing
  @@index([clientId, createdAt])
}
```

**Acceptance Criteria**:
- [ ] All foreign keys indexed
- [ ] All list APIs paginated
- [ ] Expensive queries cached
- [ ] React Query implemented
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms (p95)

---

#### Day 44-45: Frontend Performance
**Priority**: 🟡 HIGH

**Tasks**:
1. Code splitting
   - Dynamic imports for heavy components
   - Route-based splitting
   - Lazy load modals

2. Image optimization
   - Convert all `<img>` to `<Image>`
   - Add proper sizes
   - Use webp format

3. Bundle optimization
   - Analyze bundle size
   - Tree shake unused code
   - Remove duplicate dependencies

**Files to Create/Modify**:
```
src/components/*/  # Update: Dynamic imports
next.config.js     # Update: Image optimization
package.json       # Add: bundle analyzer
```

**next.config.js**:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // ... rest of config
})
```

**Acceptance Criteria**:
- [ ] Initial bundle < 300KB
- [ ] Heavy components lazy loaded
- [ ] All images optimized
- [ ] Lighthouse score > 90

---

### Week 10: Monitoring & Production Prep

#### Day 46-48: Monitoring & Logging
**Priority**: 🔴 CRITICAL

**Tasks**:
1. Setup error tracking (Sentry)
   - Install and configure Sentry
   - Add error boundaries
   - Track unhandled rejections
   - Source maps for production

2. Setup logging
   - Structured logging (Winston/Pino)
   - Log levels (debug, info, warn, error)
   - Log rotation
   - Sensitive data redaction

3. Setup uptime monitoring
   - Health check endpoint
   - Database health check
   - Redis health check
   - External monitoring (UptimeRobot)

4. Setup analytics
   - Page view tracking
   - Feature usage tracking
   - Performance tracking

**Files to Create/Modify**:
```
src/lib/monitoring/sentry.ts                 # New: Sentry config
src/lib/logging/logger.ts                    # New: Logger setup
src/app/api/health/route.ts                  # Update: Health checks
src/components/ErrorBoundary.tsx             # Update: Sentry integration
next.config.js                               # Update: Sentry webpack
.env.example                                 # Add: Monitoring vars
```

**Install Monitoring**:
```bash
npm install @sentry/nextjs
npm install pino pino-pretty
```

**Health Check Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00Z",
  "services": {
    "database": { "status": "healthy", "latency": 12 },
    "redis": { "status": "healthy", "latency": 3 },
    "email": { "status": "healthy" },
    "storage": { "status": "healthy", "usage": "45%" }
  },
  "version": "2.0.0"
}
```

**Acceptance Criteria**:
- [ ] Sentry catching errors
- [ ] Logs structured and searchable
- [ ] Health endpoint working
- [ ] External monitoring setup
- [ ] Performance tracked

---

#### Day 49-50: Testing & Documentation
**Priority**: 🟡 HIGH

**Tasks**:
1. Write comprehensive tests
   - Unit tests for utilities (Vitest)
   - API integration tests
   - E2E critical paths (Playwright)
   - Minimum 70% code coverage

2. Update documentation
   - DEPLOYMENT.md (step-by-step)
   - ARCHITECTURE.md
   - API.md (all endpoints)
   - CONTRIBUTING.md
   - Update README.md

3. Create deployment checklist
   - Environment variables
   - Database migration steps
   - SSL certificate setup
   - Backup procedures
   - Rollback plan

**Files to Create/Modify**:
```
tests/unit/**/*.test.ts                      # New: Unit tests
tests/integration/**/*.test.ts               # New: Integration tests
tests/e2e/**/*.spec.ts                       # Update: E2E tests
docs/DEPLOYMENT.md                           # New
docs/ARCHITECTURE.md                         # New
docs/CONTRIBUTING.md                         # New
docs/API.md                                  # Update
README.md                                    # Update
vitest.config.ts                             # New
```

**Test Coverage Goals**:
- Utilities: 90%
- Services: 80%
- API routes: 70%
- Components: 60%
- Overall: 70%

**Acceptance Criteria**:
- [ ] Test suite runs successfully
- [ ] Code coverage > 70%
- [ ] All docs updated
- [ ] Deployment checklist complete
- [ ] Production ready! 🎉

---

## 🎯 SPRINT 6 (BONUS): Advanced Features (Week 11-12)

> **Priority**: MEDIUM
> **Duration**: 2 weeks
> **Goal**: AI Coach, Advanced Analytics, Polish

### Week 11: AI Business Coach

#### Day 51-54: AI Chat Interface
**Priority**: 🟡 MEDIUM

**Tasks**:
1. Create chat UI
   - Chat interface component
   - Message history
   - Typing indicators
   - Conversation threads

2. Implement AI coach backend
   - Claude API integration
   - Context management
   - Conversation history
   - Token usage tracking

3. Add coach features
   - Business plan Q&A
   - Strategy suggestions
   - Market analysis
   - Content ideas

**Files to Create/Modify**:
```
src/app/(dashboard)/coach/page.tsx           # New: AI Coach page
src/app/portal/coach/page.tsx                # New: Client coach page
src/app/api/coach/route.ts                   # New: Chat API
src/lib/ai/coach.ts                          # New: Coach logic
src/components/coach/ChatInterface.tsx       # New: Chat UI
prisma/schema.prisma                         # Add: Conversation model
```

**Acceptance Criteria**:
- [ ] Chat interface working
- [ ] AI responds intelligently
- [ ] Conversation history saved
- [ ] Available in client portal

---

### Week 12: Advanced Analytics & Final Polish

#### Day 55-57: Advanced Analytics
**Priority**: 🟡 MEDIUM

**Tasks**:
1. Build analytics dashboard
   - Revenue tracking
   - Client retention metrics
   - Conversion funnel
   - Time-to-deliverable metrics

2. Add export functionality
   - Export to CSV
   - Export to PDF
   - Custom date ranges
   - Scheduled reports

**Files to Create/Modify**:
```
src/app/(dashboard)/analytics/page.tsx       # Update: Advanced analytics
src/app/api/analytics/export/route.ts        # New: Export API
src/lib/analytics/metrics.ts                 # New: Metrics calculation
```

**Acceptance Criteria**:
- [ ] Advanced metrics displayed
- [ ] Export to CSV/PDF works
- [ ] Custom date ranges work

---

#### Day 58-60: Final Polish & Launch Prep
**Priority**: 🟡 HIGH

**Tasks**:
1. UI/UX polish
   - Fix any remaining UI bugs
   - Ensure consistent spacing
   - Test all user flows
   - Mobile testing on real devices

2. Security audit
   - Run `npm audit`
   - Check all environment variables
   - Review authentication flows
   - Test rate limiting

3. Performance testing
   - Load testing (k6 or Artillery)
   - Stress test API endpoints
   - Test with production-like data
   - Optimize slow queries

4. Launch preparation
   - Create production environment
   - Setup CI/CD pipeline
   - Configure monitoring alerts
   - Prepare rollback plan
   - Create launch checklist

**Acceptance Criteria**:
- [ ] All critical bugs fixed
- [ ] Security audit passed
- [ ] Performance tests passed
- [ ] Ready for production launch! 🚀

---

## 📋 DEFINITION OF DONE (Each Sprint)

Sprint is considered complete when:

- [ ] All planned features implemented
- [ ] Code reviewed and tested
- [ ] Unit/integration tests written
- [ ] E2E tests updated
- [ ] Documentation updated
- [ ] No critical bugs
- [ ] Performance benchmarks met
- [ ] Security checklist passed
- [ ] Deployed to staging
- [ ] Stakeholder approval

---

## 🎯 SUCCESS METRICS

### Performance Targets
- Page load time: < 2 seconds
- API response time: < 500ms (p95)
- Time to interactive: < 3 seconds
- Lighthouse score: > 90

### Reliability Targets
- Uptime: 99.9%
- Error rate: < 0.1%
- Failed job rate: < 1%

### Security Targets
- All OWASP Top 10 addressed
- Zero critical vulnerabilities
- All data encrypted in transit
- Regular security audits

### Code Quality Targets
- Test coverage: > 70%
- Type coverage: 100% (TypeScript)
- No ESLint errors
- No console.logs in production

---

## 🚀 POST-LAUNCH (Month 4+)

### Continuous Improvement
1. User feedback collection
2. Performance monitoring
3. Security updates
4. Feature iterations
5. A/B testing
6. User analytics

### Future Features (v2.1+)
- Social media analytics integration
- Payment processing
- Creator community platform
- White-label options
- Mobile apps
- Advanced automation workflows

---

## 📝 NOTES & ASSUMPTIONS

**Assumptions**:
- 1-2 developers working full-time
- Development environment already setup
- Access to necessary APIs (Claude, Resend)
- Design system (shadcn/ui) already in place

**Dependencies**:
- Docker for local development
- PostgreSQL + Redis
- Resend for emails
- Sentry for monitoring
- Claude API access

**Risks & Mitigations**:
- **Risk**: PDF generation dependencies
  **Mitigation**: Use Puppeteer as fallback

- **Risk**: Email deliverability
  **Mitigation**: Implement retry logic, monitor bounces

- **Risk**: Database migration issues
  **Mitigation**: Test thoroughly, backup before migration

- **Risk**: Performance degradation
  **Mitigation**: Monitor continuously, optimize proactively

---

## 🎉 LAUNCH CHECKLIST

Before going to production:

### Infrastructure
- [ ] PostgreSQL database configured
- [ ] Redis cache configured
- [ ] Background workers running
- [ ] File storage configured
- [ ] Backups automated

### Security
- [ ] All environment variables set
- [ ] SSL certificates installed
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Authentication tested
- [ ] Authorization tested

### Monitoring
- [ ] Sentry error tracking active
- [ ] Uptime monitoring configured
- [ ] Log aggregation setup
- [ ] Performance monitoring active
- [ ] Alerts configured

### Documentation
- [ ] Deployment guide complete
- [ ] API documentation complete
- [ ] User guides written
- [ ] Admin guides written
- [ ] Troubleshooting guide ready

### Testing
- [ ] All tests passing
- [ ] Load testing completed
- [ ] Security testing completed
- [ ] UAT completed
- [ ] Rollback plan tested

### Communication
- [ ] Support channels ready
- [ ] Status page setup
- [ ] Incident response plan ready
- [ ] User onboarding emails ready
- [ ] Launch announcement prepared

---

**Total Estimated Timeline**: 12 weeks (3 months)
**Target Launch Date**: [Set based on start date]
**Version**: WavelaunchOS v2.0 Production-Ready

---

*This roadmap is a living document. Update as needed based on progress and changing priorities.*
