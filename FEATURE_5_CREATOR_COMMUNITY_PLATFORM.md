# Feature 5: Creator Community Platform

## Executive Summary

A private, members-only community space where active Wavelaunch clients can connect, share wins, collaborate, ask questions, and support each other through their creator journey. Includes discussion forums, direct messaging, success stories, resource sharing, and moderated group discussions.

**Priority:** LOW (Nice-to-have, builds network effects)
**Complexity:** High
**Estimated Timeline:** 4-6 weeks
**Developer Resources:** 1-2 full-time developers

---

## Problem Statement

**Current Pain Points:**
- Creators feel isolated working alone on their businesses
- No peer-to-peer learning opportunities
- Clients don't know who else is in the program
- Missed opportunities for collaboration and partnerships
- Lack of social proof and inspiration from fellow creators
- Admin is sole source of support and motivation

**Impact:**
- Lower client retention (feel alone)
- Reduced motivation during difficult phases
- Missed networking opportunities
- No organic testimonials or success stories
- Higher admin workload (only support source)

---

## Solution Overview

Build a private community platform that:

1. **Discussion Forums** - Topic-based conversations (niche-specific, month-specific)
2. **Wins Channel** - Share and celebrate successes
3. **Ask the Community** - Peer-to-peer Q&A
4. **Direct Messaging** - 1:1 connections between creators
5. **Events Calendar** - Live group calls, workshops, co-working sessions
6. **Resource Library** - Community-curated templates, tools, guides
7. **Accountability Partners** - Match creators for mutual support

**Core Principle:** A supportive, private space that amplifies coaching impact through peer connection.

---

## User Stories

### Client/Creator Stories

**As a creator, I want to:**
1. See what other creators in my niche are working on
2. Ask questions and get quick answers from peers
3. Share wins and receive encouragement
4. Find accountability partners to stay motivated
5. Collaborate on projects or cross-promotions
6. Access resources shared by successful creators
7. Attend live events with fellow creators
8. Direct message creators I resonate with

### Admin Stories

**As an admin, I want to:**
1. Moderate discussions to keep them positive and on-topic
2. Pin important announcements to the top
3. Highlight success stories for motivation
4. Organize events (calls, workshops)
5. See engagement metrics (who's active, who's not)
6. Remove spam or inappropriate content
7. Feature top contributors ("Community MVP")

---

## Detailed Requirements

### 1. Community Structure

**Main Sections:**

**📣 Announcements (Admin-only posts)**
- Program updates
- New features
- Upcoming events
- Spotlight on success stories

**🏆 Wins & Celebrations**
- First sale/client
- Hit follower milestone
- Launched product
- Featured in media
- Other victories

**💬 General Discussion**
- Introductions (new members)
- Off-topic (casual chat)
- Random inspiration

**📚 Niche Channels (Auto-created based on client niches)**
- Fitness & Wellness
- Finance & Investing
- Parenting & Family
- Tech & Productivity
- Creative Arts
- etc.

**🚀 Month-Specific Channels**
- M1: Foundation Excellence
- M2: Brand Readiness
- M3: Market Entry
- ... (through M8)

**❓ Ask the Community**
- Business strategy questions
- Technical help
- Marketing advice
- Platform-specific tips

**🔧 Resources & Tools**
- Templates
- Swipe files
- Tool recommendations
- Course recommendations

**🤝 Partnerships & Collabs**
- Looking for accountability partner
- Cross-promotion opportunities
- Guest appearance swaps
- Joint ventures

---

### 2. Discussion Forum Features

**Post Types:**
- **Text Post** - Standard discussion
- **Question** - Flagged for answers, can mark "Solved"
- **Win** - Auto-tagged for celebration
- **Resource** - Link + description
- **Event** - Date, time, link to join

**Post Interactions:**
- 👍 Like (quick appreciation)
- 💬 Reply (threaded comments)
- 🔖 Bookmark (save for later)
- 🔔 Watch (get notifications for new replies)
- 📤 Share (link to post)
- 🚩 Report (flag for moderation)

**Rich Text Editor:**
- Bold, italic, underline
- Bulleted/numbered lists
- Code blocks (for tech discussions)
- Image upload (max 5MB)
- Link embeds (YouTube, Instagram, etc.)
- Mention users (@username)
- Hashtags (#productlaunch)

**Sorting & Filtering:**
- Latest Activity (default)
- Most Liked
- Unanswered Questions
- My Posts
- My Bookmarks
- By Channel
- By Date Range

---

### 3. Direct Messaging

**1:1 Conversations:**
```
+--------------------------------------------------+
| Messages                           [New Message] |
+--------------------------------------------------+
| 👤 Sarah Johnson                 [●] Online      |
| Hey! I saw your win about hitting 10K...         |
| 2 hours ago                                      |
+--------------------------------------------------+
| 👤 Mike Chen                                     |
| Thanks for the tip on Instagram Reels!           |
| Yesterday                                        |
+--------------------------------------------------+
```

**Message Features:**
- Real-time delivery (WebSocket)
- Read receipts (optional)
- Typing indicators
- File attachments (up to 10MB)
- Message search
- Mute conversation
- Block user (if needed)

**Privacy Settings:**
- Who can message me:
  - [ ] Anyone in the community
  - [ ] Only people I follow
  - [ ] No one (DMs disabled)

**Admin Monitoring:**
- Admins can view flagged conversations
- Anti-harassment policies enforced
- Auto-flag for sensitive keywords

---

### 4. Member Profiles

**Public Profile:**
```
+--------------------------------------------------+
| Sarah Johnson                        [Follow]    |
| @sarahfitmom                      [Message]      |
+--------------------------------------------------+
| 🎯 Niche: Fitness for busy moms                  |
| 📍 Location: Austin, TX                          |
| 🗓️ Joined: Nov 2025 • Month 3 of 8              |
| 🔗 instagram.com/sarahfitmom                     |
|                                                   |
| Bio:                                              |
| Helping moms get fit in 15 minutes a day.        |
| Coffee addict ☕ Mom of 2 👶👶                   |
|                                                   |
| Stats:                                            |
| • 23 Posts                                       |
| • 156 Likes Received                             |
| • 34 Followers                                   |
|                                                   |
| Recent Activity:                                  |
| [3 latest posts/replies]                         |
|                                                   |
| Badges:                                           |
| 🏆 First Win Posted                              |
| 💬 10+ Helpful Replies                           |
| 🔥 7-Day Streak                                  |
+--------------------------------------------------+
```

**Editable Fields:**
- Display name
- Username (@handle)
- Bio (250 chars)
- Niche/industry
- Location (city, country)
- Social media links
- Profile photo
- Privacy settings

**Badges/Achievements:**
- 🎉 Welcome (joined)
- 🏆 First Win Posted
- 💬 10 Helpful Replies (voted helpful)
- 🔥 7-Day Streak (active 7 days in a row)
- 🌟 Community MVP (admin-awarded)
- 📚 Resource Contributor (3+ resources shared)
- 🤝 Accountability Partner (paired with someone)

---

### 5. Accountability Partners

**Matching System:**
```
+--------------------------------------------------+
| Find Your Accountability Partner                 |
+--------------------------------------------------+
| Answer a few questions to get matched:           |
|                                                   |
| 1. What's your niche?                            |
|    [ Fitness & Wellness ▼]                       |
|                                                   |
| 2. Where are you in your journey?                |
|    [ Month 3 ▼]                                  |
|                                                   |
| 3. What timezone are you in?                     |
|    [ US Central Time ▼]                          |
|                                                   |
| 4. How often do you want to check in?            |
|    [ ] Daily                                     |
|    [✓] Weekly                                    |
|    [ ] Bi-weekly                                 |
|                                                   |
| 5. What do you need support with?                |
|    [✓] Staying consistent with content           |
|    [✓] Overcoming mindset blocks                 |
|    [ ] Technical help                            |
|    [ ] Marketing strategy                        |
|                                                   |
| [Find My Match]                                  |
+--------------------------------------------------+
```

**Partner Match:**
```
+--------------------------------------------------+
| We found your match!                             |
+--------------------------------------------------+
| 👤 Mike Chen                                     |
| @miketechcreator                                 |
|                                                   |
| Niche: Tech productivity                         |
| Month: M3 (like you!)                            |
| Timezone: US Pacific (close!)                    |
|                                                   |
| Compatibility: 85%                                |
|                                                   |
| Similar goals:                                    |
| ✓ Staying consistent with posting               |
| ✓ Overcoming mindset blocks                      |
|                                                   |
| [Connect with Mike] [See Another Match]          |
+--------------------------------------------------+
```

**Check-In System:**
- Weekly prompt: "How's your progress this week?"
- Both partners notified to respond
- Private chat thread for accountability
- Can end partnership anytime (no hard feelings)

---

### 6. Events & Workshops

**Event Types:**
- **Group Coaching Calls** (Admin-led)
- **Co-Working Sessions** (video-on, work together)
- **Hot Seat Sessions** (get feedback from group)
- **Niche Meetups** (e.g., all fitness creators)
- **Success Story Panels** (hear from graduates)

**Event Page:**
```
+--------------------------------------------------+
| 📅 Upcoming Event                                |
+--------------------------------------------------+
| Monthly Group Coaching Call                      |
| 🗓️ Feb 5, 2026 at 6:00 PM EST                   |
| 🎥 Zoom (link sent to attendees)                 |
| 👥 12 / 50 attendees                             |
|                                                   |
| What to expect:                                   |
| • Open Q&A with Wavelaunch coaches               |
| • Hot seat: Get feedback on your strategy        |
| • Networking breakout rooms                      |
|                                                   |
| [RSVP - I'm Attending] [Add to Calendar]         |
+--------------------------------------------------+
```

**Event Calendar View:**
- Monthly calendar with all events
- Filter by type (coaching, co-working, meetup)
- RSVP tracking
- Email reminders (1 day before, 1 hour before)
- Zoom integration (auto-generate links)

---

### 7. Gamification & Engagement

**Activity Points:**
- +10 points: First post
- +5 points: Create a post
- +2 points: Reply to post
- +1 point: Like a post
- +15 points: Win posted
- +20 points: Resource shared
- +50 points: Attend event

**Leaderboard:**
```
+--------------------------------------------------+
| Top Contributors This Month                      |
+--------------------------------------------------+
| 🥇 1. Sarah Johnson - 345 points                |
| 🥈 2. Mike Chen - 298 points                    |
| 🥉 3. Lisa Park - 267 points                    |
| 4. John Doe - 234 points                         |
| 5. Jane Smith - 189 points                       |
| ...                                               |
| Your Rank: #8 (156 points)                       |
+--------------------------------------------------+
```

**Perks for Top Contributors:**
- Featured on monthly email
- "MVP" badge on profile
- Priority access to events
- Early access to new features

---

### 8. Moderation & Safety

**Community Guidelines:**
1. Be respectful and supportive
2. No spam or self-promotion outside designated areas
3. No hate speech, harassment, or bullying
4. Keep discussions on-topic
5. Respect others' privacy
6. No sharing of illegal content

**Moderation Tools:**
- **Report Post** - Flags for admin review
- **Hide Post** - Temporarily removes until reviewed
- **Delete Post** - Permanent removal (admin only)
- **Warn User** - Send warning message
- **Suspend User** - Temporary ban (1-30 days)
- **Ban User** - Permanent removal

**Auto-Moderation:**
- Keyword filter (offensive words)
- Spam detection (duplicate posts, excessive links)
- New user restrictions (can't DM for first 24 hours)

**Admin Moderation Dashboard:**
```
+--------------------------------------------------+
| Moderation Queue                                 |
+--------------------------------------------------+
| Flagged Posts: 2                                 |
| • "Help! Need sales tips" (Spam - reported 3x)   |
|   [View] [Approve] [Remove]                      |
| • "Check out my new course!" (Self-promo)        |
|   [View] [Approve] [Remove]                      |
|                                                   |
| User Warnings: 1                                  |
| • @johnspammer - Posted affiliate links 5x       |
|   [View Profile] [Send Warning] [Suspend]        |
|                                                   |
| Auto-Hidden (Keywords): 0                        |
+--------------------------------------------------+
```

---

## Technical Architecture

### Database Schema

**New Table: `CommunityPost`**
```prisma
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
  reports           CommunityReport[]
  attachments       CommunityAttachment[]

  @@index([channelId])
  @@index([authorId])
  @@index([createdAt])
  @@index([isPinned, createdAt])
}
```

**New Table: `CommunityChannel`**
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
```

**New Table: `CommunityReply`**
```prisma
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
```

**New Table: `CommunityDirectMessage`**
```prisma
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
```

**New Table: `CommunityEvent`**
```prisma
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
```

**New Table: `CommunityEventAttendee`**
```prisma
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
```

**New Table: `CommunityMemberProfile`**
```prisma
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
}
```

**Update: `Client` Table**
```prisma
model Client {
  // ... existing fields ...

  // New relations
  communityProfile  CommunityMemberProfile?
  posts             CommunityPost[] @relation("PostAuthor")
  replies           CommunityReply[] @relation("ReplyAuthor")
  sentMessages      CommunityDirectMessage[] @relation("MessageSender")
  receivedMessages  CommunityDirectMessage[] @relation("MessageReceiver")
  eventRSVPs        CommunityEventAttendee[]
}
```

---

### API Endpoints

**Posts & Discussions**
- `GET /api/community/posts` - List posts (filterable by channel)
- `POST /api/community/posts` - Create new post
- `GET /api/community/posts/:id` - Get post with replies
- `PATCH /api/community/posts/:id` - Edit post
- `DELETE /api/community/posts/:id` - Delete post
- `POST /api/community/posts/:id/like` - Like/unlike post
- `POST /api/community/posts/:id/bookmark` - Bookmark post

**Replies**
- `POST /api/community/posts/:id/replies` - Add reply
- `PATCH /api/community/replies/:id` - Edit reply
- `DELETE /api/community/replies/:id` - Delete reply
- `POST /api/community/replies/:id/like` - Like reply

**Direct Messages**
- `GET /api/community/messages` - List conversations
- `GET /api/community/messages/:conversationId` - Get messages
- `POST /api/community/messages` - Send message
- `PATCH /api/community/messages/:id/read` - Mark as read

**Profile**
- `GET /api/community/profile/:username` - Get public profile
- `PATCH /api/community/profile` - Update own profile
- `GET /api/community/leaderboard` - Top contributors

**Events**
- `GET /api/community/events` - List upcoming events
- `GET /api/community/events/:id` - Event details
- `POST /api/community/events/:id/rsvp` - RSVP to event

**Moderation (Admin)**
- `GET /api/admin/community/reports` - Flagged content
- `POST /api/admin/community/posts/:id/hide` - Hide post
- `POST /api/admin/community/users/:id/warn` - Warn user
- `POST /api/admin/community/users/:id/suspend` - Suspend user

---

### Real-Time Features

**WebSocket Events:**
```typescript
// New post in channel
socket.on('community:new_post', (post) => {
  // Update feed in real-time
})

// New reply to post you're watching
socket.on('community:new_reply', (reply) => {
  // Show notification
})

// New direct message
socket.on('community:new_message', (message) => {
  // Update inbox badge
})

// Someone is typing
socket.on('community:typing', (user) => {
  // Show typing indicator
})
```

---

## Implementation Plan

### Phase 1: Core Forum (Week 1-2)
- [ ] Database schema
- [ ] Channel creation and management
- [ ] Post creation (text only)
- [ ] Reply system (flat threads)
- [ ] Like functionality
- [ ] Basic UI (feed, post view)

### Phase 2: Rich Features (Week 2-3)
- [ ] Rich text editor (TipTap)
- [ ] Image uploads
- [ ] Mentions (@username)
- [ ] Hashtags (#topic)
- [ ] Bookmarks
- [ ] Post types (question, win, resource)

### Phase 3: Direct Messaging (Week 3-4)
- [ ] 1:1 messaging system
- [ ] Real-time delivery (WebSocket)
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Message search

### Phase 4: Community Features (Week 4-5)
- [ ] Member profiles
- [ ] Follow system
- [ ] Accountability partner matching
- [ ] Events calendar and RSVP
- [ ] Gamification (points, badges)
- [ ] Leaderboard

### Phase 5: Moderation & Polish (Week 5-6)
- [ ] Reporting system
- [ ] Auto-moderation (keywords)
- [ ] Admin moderation tools
- [ ] Community guidelines page
- [ ] Email notifications
- [ ] Mobile responsive design

---

## Success Metrics

**Adoption:**
- 60%+ of clients create a profile
- 40%+ post at least once
- 30%+ post weekly

**Engagement:**
- Average 5+ posts per day (community-wide)
- Average 3+ replies per post
- 50%+ of questions answered within 24 hours
- 20%+ find accountability partners

**Retention Impact:**
- 15%+ increase in client retention
- 25%+ increase in program completion rate
- 70%+ report community adds value

---

**Last Updated:** 2025-11-15
**Status:** Specification Complete - Ready for Development
