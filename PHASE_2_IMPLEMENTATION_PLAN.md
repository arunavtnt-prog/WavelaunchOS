# Phase 2 Implementation Plan: Client Portal Path

**Selected Path:** Option A - Fix tickets/help + Build Client Portal
**Timeline:** 5-6 weeks total
**Start Date:** 2025-11-15

---

## 📅 **Timeline Overview**

| Phase | Tasks | Duration | Completion |
|-------|-------|----------|------------|
| **2A** | Fix Support Tickets & Help Center | 1-2 weeks | 0% |
| **2B** | Build Client Portal | 3-4 weeks | 0% |
| **2C** | Polish & Testing | 1 week | 0% |

**Total:** 5-7 weeks to Client Portal MVP

---

## 🔧 **Phase 2A: Fix Broken Features** (Week 1-2)

### **Task 1: Support Tickets System** (3 days)

#### Day 1: Database & API
**Files to Create:**
- `prisma/schema.prisma` - Add Ticket model
- `src/app/api/tickets/route.ts` - List & create tickets
- `src/app/api/tickets/[id]/route.ts` - Get, update, delete ticket
- `src/app/api/tickets/[id]/reply/route.ts` - Add reply to ticket

**Database Schema:**
```prisma
model Ticket {
  id          String   @id @default(cuid())
  subject     String
  description String   @db.Text
  priority    String   // LOW, MEDIUM, HIGH, URGENT
  status      String   @default("OPEN") // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  createdBy   String   // User ID
  assignedTo  String?  // Admin user ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  resolvedAt  DateTime?

  replies     TicketReply[]

  @@index([status])
  @@index([createdBy])
  @@index([createdAt])
}

model TicketReply {
  id         String   @id @default(cuid())
  ticketId   String
  userId     String
  message    String   @db.Text
  isInternal Boolean  @default(false) // Admin notes
  createdAt  DateTime @default(now())

  ticket     Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([createdAt])
}
```

**API Endpoints:**
- `GET /api/tickets` - List tickets (with filters)
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details with replies
- `PATCH /api/tickets/:id` - Update ticket (status, priority, assignee)
- `DELETE /api/tickets/:id` - Delete ticket
- `POST /api/tickets/:id/reply` - Add reply

#### Day 2: Frontend Updates
**Files to Update:**
- `src/app/(dashboard)/tickets/page.tsx` - Connect to real API
- `src/components/tickets/ticket-list.tsx` - Create component
- `src/components/tickets/ticket-detail.tsx` - Create component

**Features to Add:**
- Real ticket creation (save to DB)
- Ticket listing with status filters
- Ticket detail view with reply thread
- Admin reply functionality
- Status workflow (Open → In Progress → Resolved)
- Priority badges

#### Day 3: Email Notifications
**Files to Create:**
- `src/lib/email/ticket-notifications.ts` - Email helper
- `src/emails/ticket-created.tsx` - React Email template
- `src/emails/ticket-replied.tsx` - React Email template

**Email Triggers:**
- New ticket created → Notify admins
- Admin replies → Notify ticket creator
- Ticket status changed → Notify ticket creator

---

### **Task 2: Help Center Content System** (2 days)

#### Day 1: Markdown Article System
**Files to Create:**
- `docs/help/` - Create help articles folder
- `docs/help/index.json` - Article metadata
- `src/lib/help/articles.ts` - Article loader
- `src/app/api/help/articles/route.ts` - API endpoint
- `src/app/api/help/search/route.ts` - Search endpoint

**Article Structure:**
```
docs/help/
├── index.json (metadata)
├── getting-started/
│   ├── onboarding-clients.md
│   ├── understanding-8-month-program.md
│   └── managing-deliverables.md
├── features/
│   ├── prompt-templates.md
│   ├── file-management.md
│   └── business-plan-generation.md
├── tutorials/
│   ├── crm-walkthrough.md
│   ├── first-deliverable.md
│   └── analytics-reporting.md
└── support/
    ├── contact-support.md
    ├── report-bug.md
    └── request-feature.md
```

**index.json:**
```json
{
  "categories": [
    {
      "id": "getting-started",
      "title": "Getting Started",
      "icon": "Book",
      "articles": [
        {
          "id": "onboarding-clients",
          "title": "How to onboard a new client",
          "slug": "onboarding-clients",
          "tags": ["clients", "onboarding"],
          "lastUpdated": "2025-11-15"
        }
      ]
    }
  ]
}
```

#### Day 2: UI & Search
**Files to Update:**
- `src/app/(dashboard)/help/page.tsx` - Connect to real articles
- `src/app/(dashboard)/help/[category]/[slug]/page.tsx` - Article page
- `src/components/help/article-viewer.tsx` - Markdown renderer
- `src/components/help/search-bar.tsx` - Working search

**Features:**
- Load real markdown content
- Syntax highlighting for code blocks
- Table of contents generation
- Search functionality (fuzzy search)
- Breadcrumb navigation
- "Was this helpful?" feedback

**Starter Articles to Write (10-15):**
1. How to onboard a new client
2. Understanding the 8-month program
3. Managing deliverables
4. Using prompt templates
5. File management and uploads
6. Business plan generation
7. Generating deliverables
8. Understanding the job queue
9. Token usage and budgets
10. Analytics overview
11. Contact support team
12. Report a bug
13. Request a feature
14. Keyboard shortcuts
15. CRM overview walkthrough

---

## 🏗️ **Phase 2B: Build Client Portal** (Week 3-6)

### **Week 1: Auth System & Basic Layout**

#### Days 1-2: Database & Auth
**Files to Create:**
- Update `prisma/schema.prisma` - Add ClientPortalUser model
- `src/lib/auth/portal-auth.ts` - Portal authentication helpers
- `src/app/api/portal/auth/login/route.ts` - Portal login
- `src/app/api/portal/auth/logout/route.ts` - Portal logout
- `src/app/api/portal/auth/reset-password/route.ts` - Password reset
- `src/app/api/portal/auth/change-password/route.ts` - Change password

**Database Changes:**
```prisma
model ClientPortalUser {
  id                    String    @id @default(cuid())
  clientId              String    @unique
  email                 String    @unique
  passwordHash          String
  isActive              Boolean   @default(false)
  invitedAt             DateTime  @default(now())
  activatedAt           DateTime?
  lastLoginAt           DateTime?
  passwordChangedAt     DateTime?
  emailVerified         Boolean   @default(false)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  notifyNewDeliverable  Boolean   @default(true)
  notifyNewMessage      Boolean   @default(true)
  notifyMilestoneReminder Boolean @default(true)
  notifyWeeklySummary   Boolean   @default(false)

  client                Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  messages              PortalMessage[]
  notifications         PortalNotification[]

  @@index([email])
  @@index([clientId])
}

model Client {
  // Add relation
  portalUser  ClientPortalUser?
}
```

#### Days 3-5: Portal Layout & Dashboard
**Files to Create:**
- `src/app/portal/layout.tsx` - Portal-specific layout
- `src/app/portal/login/page.tsx` - Login page
- `src/app/portal/dashboard/page.tsx` - Client dashboard
- `src/components/portal/navbar.tsx` - Portal navigation
- `src/components/portal/progress-ring.tsx` - Progress indicator
- `src/middleware.ts` - Portal route protection

**Portal Dashboard Features:**
- Welcome message with client name
- Current month indicator (M1-M8)
- Progress ring (X% complete)
- Next milestone card
- Recent updates card
- Quick actions (View Documents, Messages)

---

### **Week 2: Document Access & Progress Tracking**

#### Days 1-3: Document Library
**Files to Create:**
- `src/app/portal/documents/page.tsx` - Document listing
- `src/app/api/portal/documents/route.ts` - API endpoint
- `src/app/api/portal/documents/[id]/download/route.ts` - Download
- `src/components/portal/document-card.tsx` - Document UI

**Features:**
- List business plans (delivered only)
- List deliverables (delivered only)
- Filter by month (M1-M8)
- Search by title
- Download PDF button
- Preview modal (PDF viewer)
- "New" badge (added in last 7 days)

#### Days 4-5: Progress Timeline
**Files to Create:**
- `src/app/portal/progress/page.tsx` - Journey timeline
- `src/app/api/portal/progress/route.ts` - API endpoint
- `src/components/portal/timeline.tsx` - Timeline component
- `src/components/portal/month-card.tsx` - Month details

**Features:**
- Visual M1-M8 timeline
- Status icons (✅ Complete, 🔄 In Progress, ⏳ Upcoming)
- Expandable month cards
- Deliverable list per month
- Expected delivery dates
- Completion percentage

---

### **Week 3: Messaging System**

#### Days 1-3: Message Models & API
**Files to Create:**
- Update `prisma/schema.prisma` - Add PortalMessage model
- `src/app/api/portal/messages/route.ts` - List & create
- `src/app/api/portal/messages/[threadId]/route.ts` - Thread details
- `src/app/api/portal/messages/[id]/read/route.ts` - Mark as read

**Database Changes:**
```prisma
model PortalMessage {
  id                String    @id @default(cuid())
  threadId          String
  clientUserId      String?
  adminUserId       String?
  clientId          String
  subject           String
  body              String    @db.Text
  isFromAdmin       Boolean
  isRead            Boolean   @default(false)
  attachmentUrl     String?
  attachmentName    String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  clientUser        ClientPortalUser? @relation(fields: [clientUserId], references: [id])
  client            Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([threadId])
  @@index([clientId])
  @@index([createdAt])
}
```

#### Days 4-5: Message UI
**Files to Create:**
- `src/app/portal/messages/page.tsx` - Message inbox
- `src/app/portal/messages/[threadId]/page.tsx` - Thread view
- `src/components/portal/message-list.tsx` - Inbox UI
- `src/components/portal/message-thread.tsx` - Conversation UI
- `src/components/portal/message-composer.tsx` - Reply form

**Features:**
- Message inbox (threaded conversations)
- New message button
- Reply to messages
- Unread badge count
- Message search
- Real-time updates (polling every 10s)
- File attachments (up to 5MB)

---

### **Week 4: Notifications & Polish**

#### Days 1-2: Notification System
**Files to Create:**
- Update `prisma/schema.prisma` - Add PortalNotification model
- `src/app/api/portal/notifications/route.ts` - List notifications
- `src/app/api/portal/notifications/[id]/read/route.ts` - Mark read
- `src/app/api/portal/notifications/mark-all-read/route.ts` - Bulk read
- `src/components/portal/notification-bell.tsx` - Bell icon with badge
- `src/components/portal/notification-dropdown.tsx` - Dropdown list

**Database Changes:**
```prisma
model PortalNotification {
  id                String    @id @default(cuid())
  clientUserId      String
  type              String    // NEW_DELIVERABLE, NEW_MESSAGE, MILESTONE_REMINDER, ACCOUNT_UPDATE
  title             String
  message           String    @db.Text
  actionUrl         String?
  isRead            Boolean   @default(false)
  createdAt         DateTime  @default(now())

  clientUser        ClientPortalUser @relation(fields: [clientUserId], references: [id], onDelete: Cascade)

  @@index([clientUserId])
  @@index([isRead])
  @@index([createdAt])
}
```

**Notification Types:**
- New deliverable available
- New message from admin
- Milestone reminder (3 days before)
- Account update confirmations

#### Days 3-4: Admin CRM Integration
**Files to Create:**
- `src/app/(dashboard)/clients/[id]/portal/page.tsx` - Portal tab
- `src/app/api/clients/[id]/portal/invite/route.ts` - Send invitation
- `src/app/api/clients/[id]/portal/reset-password/route.ts` - Admin reset
- `src/app/api/clients/[id]/portal/activity/route.ts` - View activity
- `src/components/clients/portal-invitation.tsx` - Invite UI
- `src/components/clients/portal-activity.tsx` - Activity log

**Admin Features:**
- Send portal invitation button
- Generate temporary password
- View portal activity (logins, downloads, messages)
- Deactivate portal access
- Reset client password

#### Day 5: Polish & Testing
**Tasks:**
- Mobile responsive design
- Loading states everywhere
- Error handling and validation
- Toast notifications
- Accessibility (WCAG AA)
- Cross-browser testing
- End-to-end test for full portal flow

---

## 🧪 **Phase 2C: Testing & Polish** (Week 7)

### **Day 1-2: Testing**
- [ ] E2E tests (Playwright)
  - Client portal login flow
  - Document download
  - Message sending
  - Progress tracking
- [ ] Unit tests for critical functions
- [ ] API integration tests
- [ ] Security testing (OWASP top 10)

### **Day 3-4: Performance**
- [ ] Database query optimization
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Lighthouse score 90+

### **Day 5: Documentation**
- [ ] Portal user guide
- [ ] Admin guide (inviting clients)
- [ ] API documentation
- [ ] Update README
- [ ] Create video walkthrough

---

## 📊 **Success Criteria**

### Phase 2A (Fixes):
- ✅ Support tickets save to database
- ✅ Admin can reply to tickets
- ✅ Email notifications sent
- ✅ Help center has 15+ articles
- ✅ Search returns relevant results

### Phase 2B (Client Portal):
- ✅ Clients can log in successfully
- ✅ Document download works
- ✅ Progress timeline displays correctly
- ✅ Messaging works bidirectionally
- ✅ Notifications appear in real-time
- ✅ Mobile responsive (all pages)

### Phase 2C (Quality):
- ✅ <2s average page load
- ✅ 90+ Lighthouse score
- ✅ Zero critical bugs
- ✅ 95%+ uptime

---

## 🚀 **Deployment Plan**

### Week 7: Production Release
1. **Staging deployment** (Day 1-2)
   - Deploy to staging environment
   - Full QA testing
   - Load testing

2. **Beta testing** (Day 3-4)
   - Invite 3-5 clients to beta
   - Collect feedback
   - Fix critical issues

3. **Production deployment** (Day 5)
   - Deploy to production
   - Send invitations to all clients
   - Monitor for issues

---

## 📝 **Immediate Next Steps**

**Starting NOW:**

1. ✅ Create Phase 2 implementation plan (this document)
2. ⏳ **Task 1.1:** Add Ticket model to Prisma schema
3. ⏳ **Task 1.2:** Create ticket API endpoints
4. ⏳ **Task 1.3:** Update tickets page UI
5. ⏳ **Task 1.4:** Add email notifications

**Timeline:**
- Today: Start Task 1 (Support Tickets)
- Tomorrow: Continue Task 1
- Day 3: Finish Task 1
- Day 4-5: Complete Task 2 (Help Center)
- Week 2 onwards: Client Portal build

---

**Ready to start? I'll begin with the Support Tickets system right now! 🚀**

---

**Last Updated:** 2025-11-15
**Status:** Ready to implement
**Current Task:** Support Tickets System - Day 1
