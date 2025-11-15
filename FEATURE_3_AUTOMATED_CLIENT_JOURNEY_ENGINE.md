# Feature 3: Automated Client Journey Engine

## Executive Summary

An intelligent workflow automation system that orchestrates the entire 8-month client journey. It automatically triggers deliverable generation, sends reminders, updates statuses, notifies clients of milestones, and ensures every client progresses smoothly through their program—with minimal manual intervention.

**Priority:** MEDIUM
**Complexity:** High
**Estimated Timeline:** 6-8 weeks
**Developer Resources:** 1-2 full-time developers

---

## Problem Statement

**Current Pain Points:**
- Admins manually track when to generate next deliverables
- Clients miss deadlines without proactive reminders
- Inconsistent timing of deliverable delivery
- Manual status updates and email notifications
- Risk of clients "falling through the cracks"
- Admin time consumed by routine progress checks

**Impact:**
- Delayed deliverable generation
- Reduced client satisfaction (lack of proactivity)
- Admin burnout from repetitive tasks
- Inconsistent client experience
- Difficulty scaling beyond 50-100 clients

---

## Solution Overview

Build an event-driven automation engine that:

1. **Auto-generates deliverables** when milestones are reached
2. **Sends proactive reminders** (3 days before, day of, 3 days after deadlines)
3. **Updates client status** automatically (M1 → M2 → M3, etc.)
4. **Triggers notifications** (email, in-app, portal messages)
5. **Escalates delays** to admin when clients fall behind
6. **Adapts to changes** (if deadline extended, reschedule automations)

**Core Principle:** "Set it and forget it" - Admin onboards client, system handles the rest.

---

## User Stories

### Admin Stories

**As an admin, I want to:**
1. Set a client's start date and have the system auto-schedule all 8 months
2. Receive alerts when a client falls behind schedule
3. Manually override automation for specific clients if needed
4. See a visual timeline of all scheduled automations per client
5. Pause/resume automation if a client requests a break
6. Get weekly digest of automation activities (what fired, what's coming)

### Client Stories

**As a client, I want to:**
1. Receive reminders before my deliverable is due
2. Get notified immediately when new deliverables are ready
3. Know exactly when to expect each month's content
4. See my progress update automatically as I complete milestones
5. Receive encouragement if I'm falling behind

---

## Detailed Requirements

### 1. Automation Rules Engine

**Rule Types:**

**Time-Based Rules (Scheduled):**
- Generate M1 deliverable on Start Date + 0 days
- Generate M2 deliverable on Start Date + 30 days
- Generate M3 deliverable on Start Date + 60 days
- ... (through M8 at Start Date + 210 days)

**Event-Based Rules (Reactive):**
- When deliverable status → DELIVERED, mark month complete
- When month complete, send celebration email
- When business plan approved, generate M1 deliverable
- When client behind schedule (7 days past due), escalate to admin

**Conditional Rules:**
- If client has active hold, skip all automation
- If admin manually generates deliverable, cancel auto-generation
- If deliverable rejected, send revision reminder after 3 days

---

### 2. Automation Workflow Types

### Workflow A: Monthly Deliverable Generation

**Trigger:** Start Date + (30 × month_number) days

**Actions:**
1. Check if previous month delivered (if not, escalate)
2. Build client context (onboarding + business plan + previous deliverables)
3. Create generation job in queue
4. Set job priority (MEDIUM)
5. Monitor job progress
6. When complete:
   - Update deliverable status → PENDING_REVIEW
   - Notify admin for review
7. When admin approves:
   - Update status → DELIVERED
   - Notify client via email + portal
   - Schedule next month's generation

**Edge Cases:**
- If client on hold, skip and reschedule for return date
- If API fails, retry 3 times, then escalate to admin
- If deliverable already exists (manual creation), skip automation

---

### Workflow B: Reminder System

**Milestone Approaching (3 days before):**
```
📧 Email to Client:
Subject: Your [Month] deliverable is coming soon!

Hi [Name],

Your Month [X]: [Title] deliverable will be ready on [Date].

In the meantime, here's what you can do to prepare:
• Review your [previous month] deliverable
• Gather any questions for our next check-in
• Update your social media handles in your profile

We're excited to help you reach this next milestone!

[View Your Progress] (CTA Button)
```

**Deliverable Ready (Day 0):**
```
📧 Email to Client:
Subject: 🎉 Your [Month] deliverable is ready!

Hi [Name],

Great news! Your Month [X]: [Title] deliverable is now available.

[View Deliverable] (CTA Button)

Inside, you'll find:
• [Key item 1]
• [Key item 2]
• [Key item 3]

Questions? Reply to this email or message us in your portal.

Keep up the great momentum!
```

**Overdue Follow-Up (3 days after):**
```
📧 Email to Client:
Subject: Need help with [Month]?

Hi [Name],

We noticed you haven't accessed your Month [X] deliverable yet.

Is everything okay? We're here to support you!

If you're stuck or need guidance, reply to this email or chat
with our AI Business Coach anytime.

[Access Deliverable] (CTA Button)

You've got this! 💪
```

**Admin Escalation (7 days overdue):**
```
📧 Email to Admin:
Subject: 🚨 Client Alert: [Client Name] is 7 days overdue

Client: [Name]
Current Month: M[X]
Deliverable: [Title]
Due Date: [Date]
Status: Not accessed

Actions:
• [View Client Dashboard]
• [Send Personal Message]
• [Schedule Check-in Call]

This client may need extra support.
```

---

### Workflow C: Progress Tracking & Celebration

**Month Completed:**
```
📧 Email to Client:
Subject: 🎉 Congratulations! You completed Month [X]!

Hi [Name],

Amazing work completing Month [X]: [Title]!

You're now [X/8 × 100]% through your Wavelaunch journey.

🏆 What you accomplished:
• [Achievement 1]
• [Achievement 2]
• [Achievement 3]

🚀 Next up: Month [X+1]: [Next Month Title]
Expected: [Date]

[View Your Progress] (CTA Button)

Keep crushing it!
```

**Halfway Milestone (M4 Complete):**
```
📧 Email to Client:
Subject: 🌟 You're halfway there!

Hi [Name],

HUGE congratulations! You've completed 4 out of 8 months.

You're officially halfway through your creator journey! 🎉

Take a moment to celebrate how far you've come:
✅ Business plan finalized
✅ Brand identity created
✅ Market entry prepared
✅ Sales engine built

The momentum you've built is incredible. Let's finish strong!

[View Your Full Journey] (CTA Button)
```

**Program Completion (M8 Complete):**
```
📧 Email to Client:
Subject: 🎊 CONGRATULATIONS! You completed the Wavelaunch program!

Hi [Name],

WOW! You did it! 🎉🎊🚀

You've completed all 8 months of the Wavelaunch program.

From idea to launch, you've built:
✅ A comprehensive business plan
✅ A professional brand identity
✅ A market-ready product/service
✅ A sales and marketing engine
✅ Real audience growth and revenue

This is just the beginning. We can't wait to see where you go next!

[Download Certificate of Completion] (CTA Button)

Thank you for trusting us with your journey. You're a true creator! ❤️
```

---

### 3. Automation Scheduler

**Architecture:**

**Option A: Cron-Based Scheduler (Simpler)**
- Cron job runs every hour
- Checks database for due automations
- Executes actions for any past-due items
- Marks as completed

**Option B: Background Job Queue (Recommended)**
- Use existing job queue system
- Schedule jobs with exact execution time
- More reliable and scalable
- Built-in retry logic

**Data Structure:**
```prisma
model AutomationSchedule {
  id                String    @id @default(cuid())
  clientId          String
  type              String    // GENERATE_DELIVERABLE, SEND_REMINDER, etc.
  triggerDate       DateTime  // When to execute
  status            String    // SCHEDULED, COMPLETED, FAILED, CANCELLED
  payload           Json      // Action-specific data
  executedAt        DateTime?
  errorMessage      String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  client            Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@index([triggerDate, status])
  @@index([type])
}
```

**Scheduling Logic:**
```typescript
// When client is onboarded
async function scheduleClientJourney(client: Client) {
  const startDate = client.programStartDate

  for (let month = 1; month <= 8; month++) {
    const monthStartDate = addDays(startDate, (month - 1) * 30)

    // Schedule deliverable generation
    await createAutomation({
      clientId: client.id,
      type: 'GENERATE_DELIVERABLE',
      triggerDate: monthStartDate,
      payload: { month }
    })

    // Schedule 3-day reminder
    await createAutomation({
      clientId: client.id,
      type: 'SEND_REMINDER',
      triggerDate: subDays(monthStartDate, 3),
      payload: { month, template: 'UPCOMING' }
    })

    // Schedule overdue follow-up
    await createAutomation({
      clientId: client.id,
      type: 'SEND_REMINDER',
      triggerDate: addDays(monthStartDate, 3),
      payload: { month, template: 'OVERDUE' }
    })

    // Schedule admin escalation
    await createAutomation({
      clientId: client.id,
      type: 'ESCALATE_TO_ADMIN',
      triggerDate: addDays(monthStartDate, 7),
      payload: { month, reason: 'OVERDUE' }
    })
  }
}
```

---

### 4. Admin Control Panel

**Journey Timeline View:**
```
+--------------------------------------------------+
| Client: Sarah Johnson                            |
| Program Start: Nov 1, 2025                       |
| Current Month: M3                   [Edit Journey]|
+--------------------------------------------------+
| Timeline (8 Months):                             |
|                                                   |
| M1 ✅ Nov 1  [Generated ✓] [Delivered ✓]        |
| M2 ✅ Dec 1  [Generated ✓] [Delivered ✓]        |
| M3 🔄 Jan 1  [Generated ✓] [Pending Review]     |
| M4 📅 Feb 1  [Scheduled]                         |
| M5 📅 Mar 1  [Scheduled]                         |
| M6 📅 Apr 1  [Scheduled]                         |
| M7 📅 May 1  [Scheduled]                         |
| M8 📅 Jun 1  [Scheduled]                         |
|                                                   |
| Scheduled Automations (Next 30 Days):            |
| • Jan 4: Send overdue reminder (M3)              |
| • Jan 29: Send upcoming reminder (M4)            |
| • Feb 1: Generate M4 deliverable                 |
|                                                   |
| Actions:                                         |
| [Pause Automation] [Adjust Timeline] [Manual Trigger]|
+--------------------------------------------------+
```

**Manual Override Options:**
- **Pause Automation** - Temporarily disable all automations for a client
- **Resume Automation** - Re-enable automations (reschedules based on new date)
- **Adjust Timeline** - Change program start date (recalculates all future automations)
- **Skip Month** - Cancel specific month's automation
- **Manual Trigger** - Force an automation to run now (e.g., generate M4 early)

---

### 5. Hold/Pause Feature

**Use Case:** Client requests 2-week break for personal reasons.

**Admin Action:**
1. Go to client profile
2. Click "Place on Hold"
3. Select hold duration or end date
4. Add optional reason note

**System Behavior:**
- Cancel all scheduled automations during hold period
- Send pause confirmation email to client
- When hold ends:
  - Recalculate journey timeline (shift all future dates)
  - Reschedule automations
  - Send "Welcome Back" email with updated timeline

**Client Notification:**
```
📧 Subject: Your Wavelaunch program is paused

Hi [Name],

We've paused your program as requested.

Pause Period: [Start Date] - [End Date]
Resume Date: [Date]

Your updated timeline:
• M4: [New Date]
• M5: [New Date]
• ... (through M8)

We'll send you a reminder 3 days before your program resumes.

Take care, and we'll see you soon!
```

---

### 6. Automation Analytics Dashboard

**Admin Dashboard Widget:**
```
+--------------------------------------------------+
| Automation Health                                 |
+--------------------------------------------------+
| Today's Activity:                                 |
| • 5 deliverables generated                       |
| • 12 reminders sent                              |
| • 2 admin escalations                            |
| • 0 failed automations                           |
|                                                   |
| This Week:                                        |
| • 98% on-time deliverable rate                   |
| • 3 clients overdue (view)                       |
| • 15 months completed                            |
|                                                   |
| Upcoming (Next 7 Days):                          |
| • 8 deliverables to generate                     |
| • 20 reminders scheduled                         |
| • 3 program completions                          |
|                                                   |
| [View Full Automation Log]                       |
+--------------------------------------------------+
```

**Automation Log:**
| Date/Time       | Client         | Type                | Status    | Details       |
|-----------------|----------------|---------------------|-----------|---------------|
| Jan 1, 9:00 AM  | Sarah Johnson  | GENERATE_DELIVERABLE| ✅ Success| M4 generated  |
| Jan 1, 9:05 AM  | Sarah Johnson  | SEND_NOTIFICATION   | ✅ Success| Email sent    |
| Jan 1, 10:00 AM | Mike Chen      | SEND_REMINDER       | ✅ Success| M3 upcoming   |
| Jan 1, 11:30 AM | Lisa Park      | ESCALATE_TO_ADMIN   | ⚠️ Alert  | 7 days overdue|

---

## Technical Architecture

### Database Schema

**Update: `Client` Table**
```prisma
model Client {
  // ... existing fields ...

  programStartDate      DateTime?   // When their 8-month journey started
  currentMonth          Int?        // 1-8, current position in journey
  isPaused              Boolean     @default(false)
  pauseStartDate        DateTime?
  pauseEndDate          DateTime?
  pauseReason           String?

  // Relations
  automations           AutomationSchedule[]
  automationLogs        AutomationLog[]
}
```

**New Table: `AutomationSchedule`**
```prisma
model AutomationSchedule {
  id                String    @id @default(cuid())
  clientId          String
  type              String    // GENERATE_DELIVERABLE, SEND_REMINDER, SEND_CELEBRATION, ESCALATE_TO_ADMIN
  triggerDate       DateTime
  status            String    // SCHEDULED, COMPLETED, FAILED, CANCELLED
  retryCount        Int       @default(0)
  maxRetries        Int       @default(3)
  payload           Json      // { month: 3, template: "UPCOMING", etc. }
  executedAt        DateTime?
  errorMessage      String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  client            Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@index([triggerDate, status])
  @@index([type])
  @@index([status])
}
```

**New Table: `AutomationLog`**
```prisma
model AutomationLog {
  id                String    @id @default(cuid())
  clientId          String
  automationId      String?
  type              String
  action            String    // What was done
  status            String    // SUCCESS, FAILED, SKIPPED
  metadata          Json?     // Additional context
  errorMessage      String?
  createdAt         DateTime  @default(now())

  // Relations
  client            Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@index([createdAt])
  @@index([type])
}
```

---

### API Endpoints

**Automation Management**
- `GET /api/admin/automations` - List all scheduled automations (filterable)
- `GET /api/clients/:id/automations` - Get automations for specific client
- `POST /api/clients/:id/automations/schedule` - Manually schedule automation
- `DELETE /api/automations/:id` - Cancel scheduled automation
- `POST /api/automations/:id/trigger` - Manually trigger automation now

**Client Journey Control**
- `POST /api/clients/:id/journey/start` - Initialize journey with start date
- `PATCH /api/clients/:id/journey/adjust` - Adjust timeline (change start date)
- `POST /api/clients/:id/journey/pause` - Pause automations
- `POST /api/clients/:id/journey/resume` - Resume automations
- `GET /api/clients/:id/journey/timeline` - Get full timeline visualization

**Analytics**
- `GET /api/admin/automations/stats` - Dashboard statistics
- `GET /api/admin/automations/logs` - Automation execution logs

---

### Automation Executor

**Background Worker:**
```typescript
// Worker runs every 5 minutes
export async function automationWorker() {
  const now = new Date()

  // Find all due automations
  const dueAutomations = await prisma.automationSchedule.findMany({
    where: {
      triggerDate: { lte: now },
      status: 'SCHEDULED',
    },
    include: { client: true },
  })

  for (const automation of dueAutomations) {
    try {
      // Check if client is paused
      if (automation.client.isPaused) {
        await rescheduleForResumeDate(automation)
        continue
      }

      // Execute automation
      await executeAutomation(automation)

      // Mark as completed
      await prisma.automationSchedule.update({
        where: { id: automation.id },
        data: {
          status: 'COMPLETED',
          executedAt: new Date(),
        },
      })

      // Log success
      await logAutomation(automation, 'SUCCESS')

    } catch (error) {
      // Retry logic
      if (automation.retryCount < automation.maxRetries) {
        await prisma.automationSchedule.update({
          where: { id: automation.id },
          data: {
            retryCount: automation.retryCount + 1,
            triggerDate: addMinutes(now, 15), // Retry in 15 min
          },
        })
      } else {
        // Max retries exceeded
        await prisma.automationSchedule.update({
          where: { id: automation.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message,
          },
        })

        // Escalate to admin
        await notifyAdminOfFailure(automation, error)
      }

      await logAutomation(automation, 'FAILED', error.message)
    }
  }
}

async function executeAutomation(automation: AutomationSchedule) {
  const { type, payload, client } = automation

  switch (type) {
    case 'GENERATE_DELIVERABLE':
      await generateDeliverable(client.id, payload.month)
      break

    case 'SEND_REMINDER':
      await sendReminderEmail(client, payload.month, payload.template)
      break

    case 'SEND_CELEBRATION':
      await sendCelebrationEmail(client, payload.month)
      break

    case 'ESCALATE_TO_ADMIN':
      await escalateToAdmin(client, payload.reason)
      break

    case 'UPDATE_STATUS':
      await updateClientStatus(client.id, payload.status)
      break

    default:
      throw new Error(`Unknown automation type: ${type}`)
  }
}
```

---

### Email Templates

**Template System:**
```typescript
type EmailTemplate = {
  id: string
  subject: string
  body: string  // HTML with placeholders: {{clientName}}, {{month}}, {{date}}
  variables: string[]
}

const templates: Record<string, EmailTemplate> = {
  REMINDER_UPCOMING: {
    id: 'reminder_upcoming',
    subject: 'Your {{monthTitle}} deliverable is coming soon!',
    body: `...`,
    variables: ['clientName', 'month', 'monthTitle', 'dueDate'],
  },
  REMINDER_READY: {
    id: 'reminder_ready',
    subject: '🎉 Your {{monthTitle}} deliverable is ready!',
    body: `...`,
    variables: ['clientName', 'month', 'monthTitle', 'deliverableLink'],
  },
  // ... more templates
}
```

---

## Implementation Plan

### Phase 1: Core Engine (Week 1-2)
- [ ] Database schema (AutomationSchedule, AutomationLog)
- [ ] Automation scheduler logic
- [ ] Background worker (runs every 5 minutes)
- [ ] Basic automation types (GENERATE, REMIND)
- [ ] Logging system

### Phase 2: Journey Orchestration (Week 2-3)
- [ ] Client onboarding → auto-schedule 8 months
- [ ] Deliverable generation automation
- [ ] Progress tracking (month completion detection)
- [ ] Timeline adjustment logic

### Phase 3: Notifications (Week 3-4)
- [ ] Email template system
- [ ] Reminder emails (upcoming, ready, overdue)
- [ ] Celebration emails (month complete, halfway, program complete)
- [ ] Admin escalation emails

### Phase 4: Pause/Resume (Week 4-5)
- [ ] Client pause/hold functionality
- [ ] Automation rescheduling on resume
- [ ] Updated timeline calculation
- [ ] Hold notification emails

### Phase 5: Admin Tools (Week 5-6)
- [ ] Timeline visualization UI
- [ ] Manual trigger controls
- [ ] Automation analytics dashboard
- [ ] Automation log viewer
- [ ] Override controls (skip, adjust, cancel)

### Phase 6: Testing & Polish (Week 6-8)
- [ ] End-to-end journey testing
- [ ] Edge case handling
- [ ] Performance optimization
- [ ] Monitoring and alerting
- [ ] Documentation

---

## Testing Strategy

### Unit Tests
- Automation scheduling logic
- Date calculation (with pauses, adjustments)
- Retry logic
- Email template rendering

### Integration Tests
- Full 8-month journey simulation (accelerated time)
- Pause/resume scenarios
- Manual overrides
- Failure recovery

### Load Tests
- 500+ clients with active automations
- Database query performance
- Worker execution time (<5 min per cycle)

---

## Success Metrics

**Automation Reliability:**
- 99%+ successful execution rate
- <1% automation failures
- Average retry resolution time <1 hour

**On-Time Delivery:**
- 95%+ deliverables generated on schedule
- 90%+ clients progress through months on time
- <5% of clients overdue by >7 days

**Admin Time Savings:**
- 80% reduction in manual deliverable generation
- 70% reduction in reminder emails sent manually
- 50% reduction in client progress tracking time
- Target: 15+ hours saved per week

**Client Satisfaction:**
- 90%+ clients report feeling "well-supported"
- 85%+ appreciate proactive reminders
- <10% clients request to disable automations

---

## Risk Mitigation

**Risk: Automation sends wrong content**
- Mitigation: Extensive testing, admin review before client delivery

**Risk: Clients feel "spammed" by emails**
- Mitigation: Email frequency limits, unsubscribe options, customizable preferences

**Risk: System doesn't adapt to edge cases**
- Mitigation: Manual override controls, admin can always take control

**Risk: Worker crashes/fails**
- Mitigation: Health monitoring, automatic restart, failure alerts

---

## Future Enhancements

- 🎯 AI-driven timeline optimization (predict delays, adjust proactively)
- 📊 A/B testing for email templates
- 🤖 Integration with AI Business Coach (trigger proactive coaching)
- 📱 SMS reminders for critical milestones
- 🔔 Slack/Discord integration for admin alerts

---

**Last Updated:** 2025-11-15
**Status:** Specification Complete - Ready for Development
