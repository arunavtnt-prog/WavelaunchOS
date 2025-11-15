# Database Schema Extensions for New Features

This document outlines all the Prisma schema additions needed to support the 5 new features.

---

## How to Apply These Changes

1. Add the models below to `wavelaunch-crm/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_new_features`
3. Run `npx prisma generate`
4. Run `npx ts-node prisma/seed-features.ts` to populate with dummy data

---

## Feature 1: Client Portal

### New Models

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

model PortalMessage {
  id                String    @id @default(cuid())
  threadId          String    // Group messages into conversations
  clientUserId      String?   // If from client
  adminUserId       String?   // If from admin (could link to User model)
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

### Update Existing Model

```prisma
model Client {
  // ... existing fields ...

  // New relations
  portalUser        ClientPortalUser?
  portalMessages    PortalMessage[]
}
```

---

## Feature 2: AI Business Coach Chat

### New Models

```prisma
model CoachConversation {
  id                String    @id @default(cuid())
  clientId          String
  title             String    @default("New Conversation")
  isActive          Boolean   @default(true)
  lastMessageAt     DateTime  @default(now())
  messageCount      Int       @default(0)
  totalTokens       Int       @default(0)
  averageRating     Float?
  hasEscalation     Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  client            Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  messages          CoachMessage[]

  @@index([clientId])
  @@index([lastMessageAt])
}

model CoachMessage {
  id                String    @id @default(cuid())
  conversationId    String
  role              String    // "user" or "assistant"
  content           String    @db.Text
  tokensUsed        Int?
  rating            Int?      // 1 (thumbs down), 2 (thumbs up), null (not rated)
  ratingFeedback    String?   // Optional text feedback
  isEscalation      Boolean   @default(false)
  metadata          Json?     // Store additional context
  createdAt         DateTime  @default(now())

  // Relations
  conversation      CoachConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@index([createdAt])
  @@index([rating])
}

model CoachConfig {
  id                String    @id @default(cuid())
  systemPrompt      String    @db.Text
  maxTokensPerMessage Int     @default(500)
  maxTokensPerDay   Int       @default(5000)
  enabledCapabilities Json    // Array of enabled features
  escalationKeywords Json     // Array of trigger words
  isActive          Boolean   @default(true)
  updatedAt         DateTime  @updatedAt
  updatedBy         String?

  @@map("coach_config")
}
```

### Update Existing Model

```prisma
model Client {
  // ... existing fields ...

  // New relation
  coachConversations CoachConversation[]
}
```

---

## Feature 3: Automated Client Journey Engine

### New Models

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

### Update Existing Model

```prisma
model Client {
  // ... existing fields ...

  programStartDate      DateTime?   // When their 8-month journey started
  currentMonth          Int?        // 1-8, current position in journey
  isPaused              Boolean     @default(false)
  pauseStartDate        DateTime?
  pauseEndDate          DateTime?
  pauseReason           String?

  // New relations
  automations           AutomationSchedule[]
  automationLogs        AutomationLog[]
}
```

---

## Feature 4: Live Social Analytics Integration

### New Models

```prisma
model SocialConnection {
  id                String    @id @default(cuid())
  clientId          String
  platform          String    // INSTAGRAM, TIKTOK, YOUTUBE, TWITTER, LINKEDIN
  platformUserId    String    // User ID on that platform
  platformUsername  String
  accessToken       String    // Encrypted
  refreshToken      String?   // Encrypted
  tokenExpiresAt    DateTime?
  isActive          Boolean   @default(true)
  lastSyncAt        DateTime?
  connectedAt       DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  client            Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  snapshots         SocialSnapshot[]

  @@unique([clientId, platform])
  @@index([clientId])
  @@index([platform])
  @@index([isActive])
}

model SocialSnapshot {
  id                String    @id @default(cuid())
  connectionId      String
  date              DateTime  @default(now())
  followers         Int
  following         Int?
  postsCount        Int?
  engagement        Float?    // Engagement rate (%)
  reach             Int?
  impressions       Int?
  metrics           Json      // Platform-specific metrics
  createdAt         DateTime  @default(now())

  // Relations
  connection        SocialConnection @relation(fields: [connectionId], references: [id], onDelete: Cascade)

  @@index([connectionId, date])
  @@index([date])
}

model SocialAlert {
  id                String    @id @default(cuid())
  clientId          String
  connectionId      String?
  type              String    // MILESTONE, GROWTH_SURGE, GROWTH_DECLINE, LOW_ENGAGEMENT
  severity          String    // INFO, WARNING, CRITICAL
  title             String
  message           String    @db.Text
  isRead            Boolean   @default(false)
  isSent            Boolean   @default(false)  // Email sent to admin
  createdAt         DateTime  @default(now())

  // Relations
  client            Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@index([isRead])
  @@index([createdAt])
}
```

### Update Existing Model

```prisma
model Client {
  // ... existing fields ...

  // New relations
  socialConnections SocialConnection[]
  socialAlerts      SocialAlert[]
}
```

---

## Feature 5: Creator Community Platform

### New Models

```prisma
model CommunityChannel {
  id                String    @id @default(cuid())
  name              String
  slug              String    @unique
  description       String?
  icon              String?   // Emoji or icon name
  type              String    // ANNOUNCEMENT, GENERAL, NICHE, MONTH, QA, RESOURCES
  isArchived        Boolean   @default(false)
  createdAt         DateTime  @default(now())

  // Relations
  posts             CommunityPost[]

  @@index([type])
  @@index([slug])
}

model CommunityPost {
  id                String    @id @default(cuid())
  authorId          String
  channelId         String
  type              String    // TEXT, QUESTION, WIN, RESOURCE, EVENT
  title             String?
  content           String    @db.Text
  contentHtml       String?   @db.Text  // Rendered HTML
  isPinned          Boolean   @default(false)
  isSolved          Boolean   @default(false)  // For questions
  isHidden          Boolean   @default(false)  // Moderation
  likeCount         Int       @default(0)
  replyCount        Int       @default(0)
  viewCount         Int       @default(0)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  author            Client    @relation("PostAuthor", fields: [authorId], references: [id])
  channel           CommunityChannel @relation(fields: [channelId], references: [id])
  replies           CommunityReply[]
  likes             CommunityLike[]
  bookmarks         CommunityBookmark[]
  attachments       CommunityAttachment[]

  @@index([channelId])
  @@index([authorId])
  @@index([createdAt])
  @@index([isPinned, createdAt])
}

model CommunityReply {
  id                String    @id @default(cuid())
  postId            String
  authorId          String
  parentReplyId     String?   // For nested threads
  content           String    @db.Text
  contentHtml       String?   @db.Text
  likeCount         Int       @default(0)
  isHelpful         Boolean   @default(false)  // Marked by OP
  isHidden          Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  post              CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  author            Client    @relation("ReplyAuthor", fields: [authorId], references: [id])
  parentReply       CommunityReply? @relation("NestedReplies", fields: [parentReplyId], references: [id])
  childReplies      CommunityReply[] @relation("NestedReplies")
  likes             CommunityLike[]

  @@index([postId])
  @@index([authorId])
  @@index([createdAt])
}

model CommunityLike {
  id                String    @id @default(cuid())
  userId            String
  postId            String?
  replyId           String?
  createdAt         DateTime  @default(now())

  // Relations
  user              Client    @relation(fields: [userId], references: [id])
  post              CommunityPost? @relation(fields: [postId], references: [id], onDelete: Cascade)
  reply             CommunityReply? @relation(fields: [replyId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@unique([userId, replyId])
  @@index([userId])
  @@index([postId])
  @@index([replyId])
}

model CommunityBookmark {
  id                String    @id @default(cuid())
  userId            String
  postId            String
  createdAt         DateTime  @default(now())

  // Relations
  user              Client    @relation(fields: [userId], references: [id])
  post              CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([userId])
}

model CommunityAttachment {
  id                String    @id @default(cuid())
  postId            String
  filename          String
  url               String
  mimeType          String
  size              Int       // bytes
  createdAt         DateTime  @default(now())

  // Relations
  post              CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
}

model CommunityDirectMessage {
  id                String    @id @default(cuid())
  conversationId    String
  senderId          String
  receiverId        String
  content           String    @db.Text
  isRead            Boolean   @default(false)
  createdAt         DateTime  @default(now())

  // Relations
  sender            Client    @relation("MessageSender", fields: [senderId], references: [id])
  receiver          Client    @relation("MessageReceiver", fields: [receiverId], references: [id])

  @@index([conversationId])
  @@index([senderId])
  @@index([receiverId])
  @@index([createdAt])
}

model CommunityEvent {
  id                String    @id @default(cuid())
  title             String
  description       String?   @db.Text
  type              String    // COACHING, COWORKING, HOTSEAT, MEETUP, PANEL
  startTime         DateTime
  endTime           DateTime
  timezone          String
  meetingUrl        String?
  maxAttendees      Int?
  createdAt         DateTime  @default(now())

  // Relations
  attendees         CommunityEventAttendee[]

  @@index([startTime])
  @@index([type])
}

model CommunityEventAttendee {
  id                String    @id @default(cuid())
  eventId           String
  clientId          String
  rsvpStatus        String    // GOING, MAYBE, NOT_GOING
  createdAt         DateTime  @default(now())

  // Relations
  event             CommunityEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  client            Client    @relation(fields: [clientId], references: [id])

  @@unique([eventId, clientId])
  @@index([eventId])
  @@index([clientId])
}

model CommunityMemberProfile {
  id                String    @id @default(cuid())
  clientId          String    @unique
  username          String    @unique
  bio               String?
  location          String?
  socialLinks       Json?     // {instagram: "...", tiktok: "..."}
  allowDMs          Boolean   @default(true)
  emailNotifications Boolean  @default(true)
  points            Int       @default(0)
  badges            Json?     // Array of badge IDs
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  client            Client    @relation(fields: [clientId], references: [id])

  @@index([points])  // For leaderboard
  @@index([username])
}
```

### Update Existing Model

```prisma
model Client {
  // ... existing fields ...

  // New relations
  communityProfile  CommunityMemberProfile?
  posts             CommunityPost[] @relation("PostAuthor")
  replies           CommunityReply[] @relation("ReplyAuthor")
  likes             CommunityLike[]
  bookmarks         CommunityBookmark[]
  sentMessages      CommunityDirectMessage[] @relation("MessageSender")
  receivedMessages  CommunityDirectMessage[] @relation("MessageReceiver")
  eventRSVPs        CommunityEventAttendee[]
}
```

---

## Complete Updated Client Model

Here's what the final `Client` model should look like with ALL new relations:

```prisma
model Client {
  id                    String    @id @default(cuid())
  // ... all existing fields ...

  // Feature 1: Client Portal
  portalUser            ClientPortalUser?
  portalMessages        PortalMessage[]

  // Feature 2: AI Coach
  coachConversations    CoachConversation[]

  // Feature 3: Automation Engine
  programStartDate      DateTime?
  currentMonth          Int?
  isPaused              Boolean   @default(false)
  pauseStartDate        DateTime?
  pauseEndDate          DateTime?
  pauseReason           String?
  automations           AutomationSchedule[]
  automationLogs        AutomationLog[]

  // Feature 4: Social Analytics
  socialConnections     SocialConnection[]
  socialAlerts          SocialAlert[]

  // Feature 5: Community
  communityProfile      CommunityMemberProfile?
  posts                 CommunityPost[] @relation("PostAuthor")
  replies               CommunityReply[] @relation("ReplyAuthor")
  likes                 CommunityLike[]
  bookmarks             CommunityBookmark[]
  sentMessages          CommunityDirectMessage[] @relation("MessageSender")
  receivedMessages      CommunityDirectMessage[] @relation("MessageReceiver")
  eventRSVPs            CommunityEventAttendee[]
}
```

---

## Migration Steps

### Step 1: Backup Database
```bash
# Create backup before migration
npx prisma db push --force-reset  # Only in development!
# OR for production:
pg_dump wavelaunch_db > backup_before_features.sql
```

### Step 2: Add Schema Changes
Copy all the models above into `wavelaunch-crm/prisma/schema.prisma`

### Step 3: Create Migration
```bash
cd wavelaunch-crm
npx prisma migrate dev --name add_five_new_features
```

### Step 4: Generate Prisma Client
```bash
npx prisma generate
```

### Step 5: Run Feature Seed
```bash
npx ts-node prisma/seed-features.ts
```

### Step 6: Verify
```bash
# Check that all tables exist
npx prisma studio
```

---

## Notes

- All new tables use `cuid()` for IDs (consistent with existing schema)
- Cascade deletes ensure data integrity when clients are deleted
- Indexes added for common query patterns
- JSON fields used for flexible metadata storage
- All timestamps use `DateTime` type

---

**Last Updated:** 2025-11-15
**Status:** Ready for implementation
