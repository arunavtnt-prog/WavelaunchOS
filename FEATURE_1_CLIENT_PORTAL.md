# Feature 1: Client Portal (Web-Only)

## Executive Summary

A dedicated web portal where Wavelaunch clients can securely access their business plans, track deliverables, view progress through the 8-month journey, and communicate with the admin team—all without needing access to the main CRM.

**Priority:** HIGH
**Complexity:** Medium
**Estimated Timeline:** 3-4 weeks
**Developer Resources:** 1 full-time developer

---

## Problem Statement

**Current Pain Points:**
- Clients have no visibility into their progress without contacting admin
- Admins spend significant time responding to "where's my deliverable?" queries
- No self-service access to completed business plans and deliverables
- Manual back-and-forth for document delivery via email
- Clients feel disconnected from the 8-month journey

**Impact:**
- High admin workload for status updates
- Delayed client satisfaction
- Lack of transparency reduces trust

---

## Solution Overview

Build a separate Next.js application (or sub-route) that provides clients with:

1. **Secure login** with unique credentials (email + password)
2. **Dashboard** showing journey progress (M1-M8 timeline)
3. **Document Library** for accessing all business plans and deliverables
4. **Milestone Tracker** with completion percentages
5. **Message Center** for async communication with admin
6. **Profile Settings** to update contact info and preferences

---

## User Stories

### Client Stories

**As a client, I want to:**
1. Log in securely to view my Wavelaunch progress
2. See which month (M1-M8) I'm currently on with visual progress indicators
3. Download my business plan and all completed deliverables as PDFs
4. View upcoming milestones and expected delivery dates
5. Send messages to my admin without using email
6. Update my profile information (email, phone, social handles)
7. Receive notifications when new deliverables are available

### Admin Stories

**As an admin, I want to:**
1. Invite clients to the portal via email with temporary password
2. See which clients have activated their portal accounts
3. Receive and respond to client messages from within the CRM
4. Control what content is visible to each client
5. Track client portal engagement (login frequency, downloads)

---

## Detailed Requirements

### 1. Authentication & Authorization

**Client Account Creation:**
- Admin creates client portal account from CRM
- System generates temporary password
- Invitation email sent with login link + credentials
- Client forced to change password on first login
- Session timeout: 7 days (remember me) or 24 hours (default)

**Security:**
- bcrypt password hashing (same as admin)
- Role-based access: `CLIENT` role (new)
- Clients can only access their own data (row-level security)
- No access to other clients' information
- Two-factor authentication (optional, future phase)

**Password Reset:**
- "Forgot Password" flow with email token
- Token expires after 1 hour
- Admin can manually reset client password from CRM

---

### 2. Client Dashboard

**Layout:**
```
+--------------------------------------------------+
| Wavelaunch Studio                    [Profile ▼] |
+--------------------------------------------------+
| Welcome back, [Client Name]!                      |
|                                                   |
| Your Progress: Month 3 of 8 (38% Complete)       |
| [=========>                    ] 38%              |
|                                                   |
| +----------------+  +----------------+            |
| | Next Milestone |  | Recent Updates |            |
| | M3 Deliverable |  | 2 new messages |            |
| | Due: Dec 5     |  | 1 new document |            |
| +----------------+  +----------------+            |
|                                                   |
| Quick Actions:                                    |
| [📄 View Documents] [💬 Messages] [📊 Progress]  |
+--------------------------------------------------+
```

**Key Metrics:**
- Current month (M1-M8)
- Overall completion percentage
- Next milestone due date
- Unread message count
- New document count (since last login)

---

### 3. Journey Timeline (M1-M8 Progress)

**Visual Timeline:**
```
M1 ✅ → M2 ✅ → M3 🔄 → M4 ⏳ → M5 ⏳ → M6 ⏳ → M7 ⏳ → M8 ⏳
```

**Status Icons:**
- ✅ Completed (green)
- 🔄 In Progress (blue)
- ⏳ Upcoming (gray)
- ⚠️ Delayed (yellow)
- ❌ Blocked (red, admin-only flag)

**Month Card Details (Expandable):**
- Month name (e.g., "M1: Foundation Excellence")
- Status badge
- Completion date (if completed)
- Expected delivery date (if upcoming)
- List of deliverables:
  - Document name
  - Status (Draft, Pending Review, Approved, Delivered)
  - Download button (if delivered)

**Interactions:**
- Click month to expand/collapse details
- Download individual deliverables as PDF
- View business plan section related to that month

---

### 4. Document Library

**List View:**
| Document Name                          | Type          | Month | Date Added  | Status    | Actions |
|----------------------------------------|---------------|-------|-------------|-----------|---------|
| Business Plan v2.0                     | Business Plan | -     | Nov 1, 2025 | Delivered | [📥 Download] |
| M1: Foundation Excellence Deliverable  | Deliverable   | M1    | Nov 8, 2025 | Delivered | [📥 Download] |
| M2: Brand Readiness Deliverable        | Deliverable   | M2    | Nov 15, 2025| Delivered | [📥 Download] |

**Filters:**
- All Documents / Business Plans / Deliverables
- By Month (M1-M8)
- By Date (newest first, oldest first)
- Search by document name

**Features:**
- Preview button (opens PDF in modal)
- Download button (direct PDF download)
- "New" badge for documents added in last 7 days
- Sort by name, date, or month

---

### 5. Message Center

**Inbox UI:**
```
+--------------------------------------------------+
| Messages                           [New Message] |
+--------------------------------------------------+
| ⭐ From Admin (Nov 14, 2025 - 2:30 PM)          |
| Your M3 deliverable is ready for review!         |
| [View Thread →]                                  |
+--------------------------------------------------+
| From You (Nov 13, 2025 - 10:15 AM)              |
| Can I schedule a call to discuss my brand...     |
| [View Thread →]                                  |
+--------------------------------------------------+
```

**Message Thread:**
- Conversation view (like email threads)
- Admin messages on left (gray bubble)
- Client messages on right (blue bubble)
- Timestamps for each message
- Rich text support (bold, italic, links, lists)
- File attachments (up to 5MB per message)

**Features:**
- Real-time notifications (WebSocket or polling)
- Unread message count badge
- Mark as read/unread
- Admin can close threads (prevent further replies)
- Search messages by keyword

**Notifications:**
- Email notification when admin sends message
- In-app badge on message icon
- Push notifications (future phase)

---

### 6. Profile & Settings

**Editable Fields:**
- Full Name
- Email (requires verification)
- Phone Number
- Social Media Handles (Instagram, TikTok, YouTube, etc.)
- Profile Photo (optional)
- Timezone (for accurate due dates)
- Email Notification Preferences:
  - [ ] New deliverable available
  - [ ] New message from admin
  - [ ] Milestone reminders (3 days before)
  - [ ] Weekly progress summary

**Non-Editable (Display Only):**
- Client ID
- Account Created Date
- Current Program Month
- Admin Contact (name + email)

**Password Change:**
- Current password required
- New password strength meter
- Confirm new password field
- Success/error messaging

---

### 7. Notifications & Alerts

**Notification Types:**
1. **New Deliverable Available**
   - Banner on dashboard
   - Email notification
   - Badge on Documents tab

2. **Message from Admin**
   - Real-time in-app notification
   - Email notification (if enabled)
   - Badge on Messages tab

3. **Milestone Reminder**
   - "Your M4 deliverable is due in 3 days"
   - Email notification 3 days before
   - Dashboard banner

4. **Account Updates**
   - Password changed successfully
   - Email address updated
   - Profile information saved

**Notification Center:**
- Bell icon in header
- Dropdown list of recent notifications
- Mark all as read
- View all notifications (history page)

---

## Technical Architecture

### Database Schema Changes

**New Table: `ClientPortalUser`**
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

  // Email preferences
  notifyNewDeliverable  Boolean   @default(true)
  notifyNewMessage      Boolean   @default(true)
  notifyMilestoneReminder Boolean @default(true)
  notifyWeeklySummary   Boolean   @default(false)

  // Relations
  client                Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  messages              PortalMessage[]
  notifications         PortalNotification[]

  @@index([email])
  @@index([clientId])
}
```

**New Table: `PortalMessage`**
```prisma
model PortalMessage {
  id                String    @id @default(cuid())
  threadId          String    // Group messages into conversations
  clientUserId      String?   // If from client
  adminUserId       String?   // If from admin
  clientId          String    // Always reference client
  subject           String
  body              String    @db.Text
  isFromAdmin       Boolean
  isRead            Boolean   @default(false)
  attachmentUrl     String?
  attachmentName    String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  clientUser        ClientPortalUser? @relation(fields: [clientUserId], references: [id])
  client            Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([threadId])
  @@index([clientId])
  @@index([createdAt])
}
```

**New Table: `PortalNotification`**
```prisma
model PortalNotification {
  id                String    @id @default(cuid())
  clientUserId      String
  type              String    // NEW_DELIVERABLE, NEW_MESSAGE, MILESTONE_REMINDER, ACCOUNT_UPDATE
  title             String
  message           String    @db.Text
  actionUrl         String?   // Link to relevant page
  isRead            Boolean   @default(false)
  createdAt         DateTime  @default(now())

  // Relations
  clientUser        ClientPortalUser @relation(fields: [clientUserId], references: [id], onDelete: Cascade)

  @@index([clientUserId])
  @@index([isRead])
  @@index([createdAt])
}
```

**Update Existing: `Client` Table**
```prisma
model Client {
  // ... existing fields ...

  // New relations
  portalUser        ClientPortalUser?
  portalMessages    PortalMessage[]
}
```

---

### API Endpoints

**Authentication**
- `POST /api/portal/auth/login` - Client login
- `POST /api/portal/auth/logout` - Client logout
- `POST /api/portal/auth/forgot-password` - Send reset email
- `POST /api/portal/auth/reset-password` - Reset with token
- `POST /api/portal/auth/change-password` - Change password (authenticated)
- `GET /api/portal/auth/session` - Get current session

**Dashboard**
- `GET /api/portal/dashboard` - Dashboard stats and overview
- `GET /api/portal/progress` - M1-M8 journey progress

**Documents**
- `GET /api/portal/documents` - List all accessible documents
- `GET /api/portal/documents/:id` - Get document details
- `GET /api/portal/documents/:id/download` - Download PDF

**Messages**
- `GET /api/portal/messages` - List message threads
- `GET /api/portal/messages/:threadId` - Get thread messages
- `POST /api/portal/messages` - Send new message
- `PATCH /api/portal/messages/:id/read` - Mark as read

**Notifications**
- `GET /api/portal/notifications` - List notifications
- `PATCH /api/portal/notifications/:id/read` - Mark as read
- `POST /api/portal/notifications/mark-all-read` - Mark all as read

**Profile**
- `GET /api/portal/profile` - Get client profile
- `PATCH /api/portal/profile` - Update profile
- `PATCH /api/portal/profile/preferences` - Update email preferences

**Admin CRM Endpoints (for managing portal)**
- `POST /api/clients/:id/portal/invite` - Send portal invitation
- `DELETE /api/clients/:id/portal` - Deactivate portal access
- `POST /api/clients/:id/portal/reset-password` - Admin password reset
- `GET /api/clients/:id/portal/activity` - View client portal activity

---

### Folder Structure

```
wavelaunch-crm/
├── src/
│   ├── app/
│   │   ├── portal/              # Client portal routes
│   │   │   ├── layout.tsx       # Portal-specific layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── progress/
│   │   │   │   └── page.tsx
│   │   │   ├── documents/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [threadId]/
│   │   │   │       └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── notifications/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   └── portal/          # Portal API routes
│   │   │       ├── auth/
│   │   │       ├── dashboard/
│   │   │       ├── documents/
│   │   │       ├── messages/
│   │   │       ├── notifications/
│   │   │       └── profile/
│   ├── components/
│   │   └── portal/              # Portal-specific components
│   │       ├── ProgressTimeline.tsx
│   │       ├── DocumentCard.tsx
│   │       ├── MessageThread.tsx
│   │       ├── NotificationBell.tsx
│   │       └── PortalNavbar.tsx
│   ├── lib/
│   │   └── portal/
│   │       ├── auth.ts          # Portal authentication helpers
│   │       ├── permissions.ts   # Client permission checks
│   │       └── notifications.ts # Notification service
```

---

### UI/UX Design

**Design System:**
- Consistent with main CRM (shadcn/ui + Tailwind)
- Simplified navigation (fewer options than admin)
- Mobile-first responsive design
- Accessibility: WCAG 2.1 AA compliant

**Color Scheme:**
- Primary: Same as CRM brand colors
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Info: Blue (#3B82F6)

**Typography:**
- Headings: Inter (sans-serif)
- Body: Inter
- Monospace: JetBrains Mono (for IDs/codes)

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

### Security Considerations

**Access Control:**
- Clients can only access their own data (enforced at DB query level)
- Middleware checks for valid `CLIENT` role
- API routes validate client ID matches authenticated user
- No admin routes accessible from portal session

**Data Privacy:**
- Client emails are unique and private
- No client can see other clients' information
- Portal users cannot access CRM admin panel
- Separate session tokens for portal vs admin

**Rate Limiting:**
- Login attempts: 5 per 15 minutes per IP
- Message sending: 10 per hour per client
- API requests: 100 per minute per client
- Password reset: 3 requests per hour per email

**Audit Logging:**
- Log all client logins (timestamp, IP, user agent)
- Track document downloads
- Record profile changes
- Monitor failed login attempts

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Database schema migrations
- [ ] Portal authentication system
- [ ] Basic portal layout and navigation
- [ ] Login/logout functionality
- [ ] Password reset flow

### Phase 2: Core Features (Week 2)
- [ ] Dashboard with progress metrics
- [ ] M1-M8 journey timeline component
- [ ] Document library with download
- [ ] Profile management page

### Phase 3: Communication (Week 3)
- [ ] Message center UI
- [ ] Message API and real-time updates
- [ ] Notification system
- [ ] Email notification service

### Phase 4: Polish & Testing (Week 4)
- [ ] Responsive design refinements
- [ ] Admin CRM integration (invite clients)
- [ ] Portal activity tracking
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Documentation

---

## Testing Strategy

### Unit Tests
- Authentication helpers
- Permission checks
- Notification service
- Date/progress calculations

### Integration Tests
- Login/logout flow
- Document download
- Message sending/receiving
- Profile updates

### E2E Tests (Playwright)
1. Client invitation and first login
2. Navigate all portal pages
3. Download business plan
4. Send message to admin
5. Update profile settings

### Security Tests
- SQL injection attempts
- XSS attack vectors
- CSRF protection
- Session hijacking scenarios
- Rate limit enforcement

---

## Success Metrics

**Adoption:**
- 80%+ of clients activate portal within 7 days of invitation
- 90%+ of clients log in at least once per month

**Engagement:**
- Average 3+ logins per client per month
- 60%+ document download rate
- 2+ messages sent per client per month

**Admin Impact:**
- 50% reduction in "status update" support tickets
- 40% reduction in manual document delivery emails
- 5+ hours saved per week on client communication

**Client Satisfaction:**
- 4.5/5 average portal satisfaction rating
- 80%+ report feeling more informed about progress
- 70%+ prefer portal over email for updates

---

## Future Enhancements (Post-MVP)

### Phase 2 Features
- 📱 Mobile app (React Native)
- 🔔 Push notifications
- 🎥 Video messages from admin
- 📅 Integrated calendar for milestone due dates
- 💳 Payment portal for invoices

### Phase 3 Features
- 🤝 Peer connections (see other clients in same month)
- 📊 Personal analytics dashboard
- 🏆 Gamification (badges for completing months)
- 📝 Client journal/reflection prompts
- 🎓 Resource library (courses, templates, guides)

---

## Open Questions

1. **Should clients be able to see draft deliverables?**
   - Recommendation: No, only show "Delivered" status documents

2. **Can clients download business plans before paying in full?**
   - Recommendation: Configurable per client (admin flag)

3. **Should there be a "chat" vs "ticket" system for messages?**
   - Recommendation: Start with threaded messages (like tickets)

4. **How to handle clients with multiple programs?**
   - Recommendation: One portal account, switch between programs

5. **Should clients be able to request edits to deliverables?**
   - Recommendation: Yes, via message center with "Request Revision" button

---

**Last Updated:** 2025-11-15
**Status:** Specification Complete - Ready for Development
