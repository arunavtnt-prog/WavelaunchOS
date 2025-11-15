# Feature 4: Live Social Analytics Integration

## Executive Summary

Integrate with major social media platforms (Instagram, TikTok, YouTube, Twitter/X, LinkedIn) to automatically pull real-time analytics and track creator growth metrics alongside business milestones. Provides data-driven insights and visualizations to measure coaching effectiveness and creator progress.

**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Timeline:** 3-4 weeks
**Developer Resources:** 1 full-time developer

---

## Problem Statement

**Current Pain Points:**
- Admins have no visibility into client social media performance
- Clients manually report follower counts and engagement (often inaccurate)
- No way to correlate business coaching with measurable growth
- Difficult to identify which clients are succeeding vs. struggling
- No data-driven insights to improve coaching strategies
- Can't showcase ROI to potential clients

**Impact:**
- Lack of objective success metrics
- Delayed intervention for struggling clients
- Missed opportunities to celebrate wins
- No proof of coaching effectiveness
- Manual data entry wastes time

---

## Solution Overview

Build a social media analytics integration system that:

1. **Connects accounts** via OAuth (secure, client-controlled)
2. **Pulls metrics** automatically (followers, engagement, posts, reach)
3. **Stores historical data** for trend analysis
4. **Visualizes growth** with charts and dashboards
5. **Correlates with milestones** (e.g., M3 completion → follower spike)
6. **Alerts admins** to significant changes (growth spurts or drops)
7. **Generates reports** (weekly, monthly, program completion)

**Core Principle:** Data-driven coaching with measurable outcomes.

---

## Supported Platforms

### Phase 1 (MVP):
1. **Instagram Business/Creator** - Followers, posts, engagement, reach, impressions
2. **TikTok Creator** - Followers, videos, views, likes, shares
3. **YouTube** - Subscribers, videos, views, watch time, engagement

### Phase 2 (Future):
4. **Twitter/X** - Followers, tweets, impressions, engagement
5. **LinkedIn** - Connections, posts, impressions, engagement rate
6. **Facebook Pages** - Likes, posts, reach, engagement

---

## User Stories

### Client Stories

**As a client, I want to:**
1. Connect my social media accounts securely (OAuth)
2. See my follower growth visualized over time
3. View engagement rates alongside my deliverable timeline
4. Disconnect platforms I no longer want tracked
5. See which posts performed best during my program
6. Export my growth report to share with sponsors/partners

### Admin Stories

**As an admin, I want to:**
1. See all client social media metrics in one dashboard
2. Identify top-performing clients (for case studies)
3. Get alerted when a client's growth stalls or drops
4. Correlate deliverable completion with growth spikes
5. Generate ROI reports (before vs. after Wavelaunch)
6. Filter clients by platform (e.g., all TikTok creators)
7. See aggregate growth across all clients (portfolio performance)

---

## Detailed Requirements

### 1. Account Connection (OAuth)

**Connection Flow:**
1. Client goes to Portal → Settings → Connected Accounts
2. Clicks "Connect Instagram"
3. Redirected to Instagram OAuth consent screen
4. Approves permissions (read-only analytics access)
5. Redirected back to portal with auth token
6. System exchanges token for access token + refresh token
7. Stores encrypted tokens in database
8. Immediately fetches initial analytics snapshot

**Permissions Required:**

**Instagram (Meta Graph API):**
- `instagram_basic` - Basic profile info
- `instagram_manage_insights` - Access analytics
- `pages_read_engagement` - Page-level metrics

**TikTok (TikTok for Developers):**
- `user.info.basic` - Profile info
- `video.list` - Video data
- `user.insights` - Analytics data

**YouTube (YouTube Data API v3):**
- `youtube.readonly` - Channel info
- `youtube.force-ssl` - Analytics access
- `yt-analytics.readonly` - YouTube Analytics data

**Security:**
- Tokens encrypted at rest (AES-256)
- Refresh tokens rotated regularly
- Clients can revoke access anytime
- No posting/writing permissions (read-only)

---

### 2. Data Sync System

**Sync Frequency:**
- **Initial sync:** Immediately upon connection
- **Daily sync:** 3 AM UTC (background job)
- **Manual sync:** "Refresh now" button (rate-limited to 1/hour)
- **Real-time:** WebSocket updates when data refreshes

**Data Retention:**
- **Historical data:** All-time (or platform limit)
- **Daily snapshots:** Stored indefinitely
- **Raw API responses:** Kept for 30 days (for debugging)

**Sync Worker Logic:**
```typescript
async function syncAllConnectedAccounts() {
  const connections = await prisma.socialConnection.findMany({
    where: { isActive: true },
    include: { client: true }
  })

  for (const connection of connections) {
    try {
      const metrics = await fetchPlatformMetrics(connection)
      await storeDailySnapshot(connection.id, metrics)
      await updateClientStats(connection.clientId)
    } catch (error) {
      if (error.code === 'TOKEN_EXPIRED') {
        await refreshToken(connection)
        retry()
      } else if (error.code === 'REVOKED_ACCESS') {
        await markConnectionInactive(connection)
        await notifyClientReconnect(connection)
      } else {
        await logSyncError(connection, error)
      }
    }
  }
}
```

---

### 3. Metrics Tracked

**Instagram:**
```typescript
type InstagramMetrics = {
  followers: number
  following: number
  mediaCount: number
  recentPosts: {
    id: string
    caption: string
    timestamp: string
    likes: number
    comments: number
    reach: number
    impressions: number
    saved: number
    engagement_rate: number
  }[]
  insights: {
    profileViews: number
    websiteClicks: number
    reach: number
    impressions: number
  }
  growthRate: number  // Calculated: (today - 30 days ago) / 30 days ago
}
```

**TikTok:**
```typescript
type TikTokMetrics = {
  followers: number
  following: number
  likes: number  // Total account likes
  videoCount: number
  recentVideos: {
    id: string
    description: string
    createTime: string
    views: number
    likes: number
    comments: number
    shares: number
    engagement_rate: number
  }[]
  insights: {
    videoViews: number  // Last 7 days
    profileViews: number
  }
  growthRate: number
}
```

**YouTube:**
```typescript
type YouTubeMetrics = {
  subscribers: number
  videoCount: number
  viewCount: number  // All-time
  recentVideos: {
    id: string
    title: string
    publishedAt: string
    views: number
    likes: number
    comments: number
    watchTimeHours: number
    averageViewDuration: number
    engagement_rate: number
  }[]
  insights: {
    views: number  // Last 28 days
    watchTimeHours: number
    estimatedRevenue: number  // If monetized
    subscribersGained: number
    subscribersLost: number
  }
  growthRate: number
}
```

---

### 4. Analytics Dashboard (Client Portal)

**Layout:**
```
+--------------------------------------------------+
| 📊 Your Social Analytics                         |
+--------------------------------------------------+
| Connected Accounts:                              |
| [Instagram ✓] [TikTok ✓] [YouTube ⚪] [+ Connect]|
|                                                   |
| Overview (All Platforms):                        |
| +----------------+  +----------------+            |
| | Total Followers|  | Total Engagement|           |
| |     15,234     |  |      4.2%      |            |
| | +523 (30d)     |  | +0.3% (30d)    |            |
| +----------------+  +----------------+            |
|                                                   |
| Growth Over Time:                                 |
| [Line Chart: Followers across all platforms]     |
|                                                   |
| Platform Breakdown:                               |
| Instagram: 8,500 followers (+300 this month)     |
| [============================>           ] 56%    |
|                                                   |
| TikTok: 6,734 followers (+223 this month)        |
| [======================>                 ] 44%    |
|                                                   |
| Top Performing Content:                           |
| 1. Instagram Post (Jan 3) - 1,234 likes          |
| 2. TikTok Video (Jan 1) - 45.6K views            |
| 3. Instagram Reel (Dec 28) - 892 likes           |
|                                                   |
| [View Detailed Reports]                          |
+--------------------------------------------------+
```

**Interactive Features:**
- Date range selector (7d, 30d, 90d, all-time, custom)
- Platform filter (view single platform or all combined)
- Metric selector (followers, engagement, reach, etc.)
- Export to PDF/CSV
- Overlay deliverable milestones on chart

---

### 5. Analytics Dashboard (Admin CRM)

**Client Social Overview:**
```
+--------------------------------------------------+
| Client: Sarah Johnson                            |
+--------------------------------------------------+
| Connected Platforms: Instagram, TikTok           |
| Last Synced: 2 hours ago              [Refresh] |
|                                                   |
| Performance Summary:                              |
| +----------------+  +----------------+            |
| | Program Start  |  | Current        |            |
| | 5,000 followers|  | 15,234 followers|           |
| | (Nov 1, 2025)  |  | +204% growth   |            |
| +----------------+  +----------------+            |
|                                                   |
| Growth Timeline:                                  |
| [Chart with deliverable milestones marked]       |
|                                                   |
| M1 Complete (Dec 1): +500 followers              |
| M2 Complete (Jan 1): +800 followers              |
| M3 In Progress: +523 followers (so far)          |
|                                                   |
| Engagement Trend:                                 |
| [Chart showing engagement rate over time]        |
| Current: 4.2% (↑ from 2.8% at start)            |
|                                                   |
| Platform Performance:                             |
| Instagram: Strong (4.5% engagement)              |
| TikTok: Growing (3.8% engagement)                |
|                                                   |
| Alerts:                                           |
| ⚠️ TikTok growth slowed last week (-15%)         |
| ✅ Instagram engagement up 25% this month         |
|                                                   |
| [Export Growth Report] [View Raw Data]           |
+--------------------------------------------------+
```

**Portfolio Analytics:**
```
+--------------------------------------------------+
| All Clients - Social Performance                 |
+--------------------------------------------------+
| Total Followers Across Portfolio: 1.2M           |
| Average Growth Rate: +28% (last 90 days)         |
| Top Performing Platform: Instagram (52% of total)|
|                                                   |
| Leaderboard (Growth Rate - Last 30 Days):        |
| 1. Sarah Johnson - +34% (Instagram)              |
| 2. Mike Chen - +29% (TikTok)                     |
| 3. Lisa Park - +22% (YouTube)                    |
| ...                                               |
|                                                   |
| Clients Needing Attention:                       |
| ⚠️ John Doe - Negative growth (-5%) last 2 weeks|
| ⚠️ Jane Smith - Low engagement (1.2%)            |
|                                                   |
| [Generate Portfolio Report]                      |
+--------------------------------------------------+
```

---

### 6. Automated Insights & Alerts

**Growth Alerts (Admin):**
```
📧 Subject: 🚀 Sarah Johnson hit 10K followers!

Great news! Sarah just reached 10,000 Instagram followers.

Milestone: 10K followers
Current: 10,234
Growth: +234 in last 7 days

This is a 104% increase since starting Wavelaunch!

[View Analytics] [Send Congratulations]
```

**Decline Alerts (Admin):**
```
📧 Subject: ⚠️ Mike Chen's TikTok growth stalled

Alert: Mike's TikTok follower growth has dropped significantly.

Last 7 days: -50 followers
Last 30 days: +12 followers (down from +300/month average)

Possible issues:
• Posting frequency decreased (2 posts vs. usual 10)
• Recent content underperforming
• Algorithm changes

Suggested actions:
• Schedule check-in call
• Review content strategy
• Offer AI coach support

[View Full Analytics] [Contact Client]
```

**Celebration (Client):**
```
📧 Subject: 🎉 You hit 5,000 followers!

Congratulations, Sarah! You just reached 5,000 Instagram followers!

When you started Wavelaunch: 2,500 followers
Today: 5,023 followers
Growth: +100% in 2 months

Keep up the incredible work! 🚀

[View Your Growth Dashboard]
```

---

### 7. Growth Reports

**Weekly Growth Summary (Auto-generated):**
```
+--------------------------------------------------+
| Weekly Growth Report                             |
| Jan 1 - Jan 7, 2026                              |
+--------------------------------------------------+
| Sarah Johnson                                    |
|                                                   |
| Instagram:                                        |
| Followers: 8,500 → 8,723 (+223, +2.6%)          |
| Engagement: 4.1% → 4.3% (+0.2%)                  |
| Top Post: "5 Tips for Busy Moms" (1,234 likes)   |
|                                                   |
| TikTok:                                           |
| Followers: 6,600 → 6,734 (+134, +2.0%)          |
| Engagement: 3.5% → 3.8% (+0.3%)                  |
| Top Video: "Quick Morning Workout" (45.6K views) |
|                                                   |
| Overall Performance: ⭐⭐⭐⭐⭐ Excellent         |
| Keep posting consistently! Your engagement is up!|
|                                                   |
| [View Full Report]                               |
+--------------------------------------------------+
```

**Program Completion Report:**
```
+--------------------------------------------------+
| Wavelaunch Impact Report                         |
| Sarah Johnson - Program Completed                |
| Nov 1, 2025 - Jun 30, 2026 (8 months)            |
+--------------------------------------------------+
| Starting Stats (Nov 1, 2025):                    |
| Instagram: 5,000 followers, 2.8% engagement      |
| TikTok: 3,500 followers, 2.1% engagement         |
| Total: 8,500 followers                           |
|                                                   |
| Final Stats (Jun 30, 2026):                      |
| Instagram: 18,500 followers, 4.5% engagement     |
| TikTok: 12,300 followers, 3.9% engagement        |
| Total: 30,800 followers                          |
|                                                   |
| Growth:                                           |
| +262% total follower growth                      |
| +1.8% average engagement increase                |
|                                                   |
| Milestones:                                       |
| ✅ Hit 10K followers (Instagram) - Month 3       |
| ✅ Reached 5K followers (TikTok) - Month 4       |
| ✅ 100K+ video views in 1 month - Month 6        |
| ✅ Featured on TikTok For You Page - Month 7     |
|                                                   |
| Best Performing Content Theme: Fitness tips      |
| Best Posting Time: 6-8 AM weekdays               |
|                                                   |
| Congratulations on an incredible journey! 🎉     |
|                                                   |
| [Download PDF] [Share on LinkedIn]               |
+--------------------------------------------------+
```

---

## Technical Architecture

### Database Schema

**New Table: `SocialConnection`**
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
```

**New Table: `SocialSnapshot`**
```prisma
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
```

**New Table: `SocialAlert`**
```prisma
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

**Update: `Client` Table**
```prisma
model Client {
  // ... existing fields ...

  // New relations
  socialConnections SocialConnection[]
  socialAlerts      SocialAlert[]
}
```

---

### API Endpoints

**Connection Management**
- `GET /api/portal/social/connections` - List client's connected accounts
- `POST /api/portal/social/connect/:platform` - Initiate OAuth flow
- `GET /api/portal/social/callback/:platform` - OAuth callback handler
- `DELETE /api/portal/social/connections/:id` - Disconnect account
- `POST /api/portal/social/connections/:id/refresh` - Manual refresh

**Analytics**
- `GET /api/portal/social/overview` - Combined analytics across all platforms
- `GET /api/portal/social/:platform/metrics` - Platform-specific metrics
- `GET /api/portal/social/:platform/growth` - Growth chart data
- `GET /api/portal/social/top-content` - Best performing posts/videos

**Admin Analytics**
- `GET /api/admin/social/clients/:id` - Client social overview
- `GET /api/admin/social/portfolio` - All clients aggregated
- `GET /api/admin/social/leaderboard` - Top performers
- `GET /api/admin/social/alerts` - Recent alerts

**Reports**
- `GET /api/portal/social/report/weekly` - Weekly growth report
- `GET /api/portal/social/report/program` - Full program impact report
- `GET /api/portal/social/export` - Export data (CSV/PDF)

---

### Platform API Integration

**Instagram (Meta Graph API):**
```typescript
async function fetchInstagramMetrics(connection: SocialConnection) {
  const { accessToken, platformUserId } = connection

  // Get profile info
  const profile = await fetch(
    `https://graph.instagram.com/${platformUserId}?fields=followers_count,follows_count,media_count&access_token=${accessToken}`
  )

  // Get recent posts (last 25)
  const media = await fetch(
    `https://graph.instagram.com/${platformUserId}/media?fields=id,caption,timestamp,like_count,comments_count,media_url&limit=25&access_token=${accessToken}`
  )

  // Get insights (requires business/creator account)
  const insights = await fetch(
    `https://graph.instagram.com/${platformUserId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${accessToken}`
  )

  return {
    followers: profile.followers_count,
    following: profile.follows_count,
    mediaCount: profile.media_count,
    recentPosts: media.data.map(post => ({
      ...post,
      engagement_rate: ((post.like_count + post.comments_count) / profile.followers_count) * 100
    })),
    insights: {
      profileViews: insights.data.find(i => i.name === 'profile_views')?.values[0]?.value,
      reach: insights.data.find(i => i.name === 'reach')?.values[0]?.value,
      impressions: insights.data.find(i => i.name === 'impressions')?.values[0]?.value,
    }
  }
}
```

**TikTok (TikTok for Developers):**
```typescript
async function fetchTikTokMetrics(connection: SocialConnection) {
  const { accessToken } = connection

  // Get user info
  const user = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  // Get recent videos
  const videos = await fetch(
    `https://open.tiktokapis.com/v2/video/list/?fields=id,title,create_time,view_count,like_count,comment_count,share_count&max_count=20`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  return {
    followers: user.data.follower_count,
    following: user.data.following_count,
    likes: user.data.likes_count,
    videoCount: user.data.video_count,
    recentVideos: videos.data.videos.map(video => ({
      ...video,
      engagement_rate: ((video.like_count + video.comment_count + video.share_count) / user.data.follower_count) * 100
    }))
  }
}
```

**YouTube (YouTube Data API v3 + Analytics API):**
```typescript
async function fetchYouTubeMetrics(connection: SocialConnection) {
  const { accessToken, platformUserId } = connection

  // Get channel stats
  const channel = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${platformUserId}&access_token=${accessToken}`
  )

  // Get recent videos
  const videos = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${platformUserId}&order=date&maxResults=10&access_token=${accessToken}`
  )

  // Get analytics (requires YouTube Analytics API)
  const analytics = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${platformUserId}&startDate=2025-01-01&endDate=2025-01-31&metrics=views,estimatedMinutesWatched,subscribersGained,subscribersLost&access_token=${accessToken}`
  )

  return {
    subscribers: channel.items[0].statistics.subscriberCount,
    videoCount: channel.items[0].statistics.videoCount,
    viewCount: channel.items[0].statistics.viewCount,
    recentVideos: videos.items,
    insights: {
      views: analytics.rows[0][0],
      watchTimeHours: analytics.rows[0][1] / 60,
      subscribersGained: analytics.rows[0][2],
      subscribersLost: analytics.rows[0][3]
    }
  }
}
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Database schema (SocialConnection, SocialSnapshot, SocialAlert)
- [ ] OAuth integration for Instagram
- [ ] Token encryption/decryption
- [ ] Basic metrics fetching
- [ ] Daily sync worker

### Phase 2: Multi-Platform (Week 1-2)
- [ ] TikTok OAuth and metrics
- [ ] YouTube OAuth and metrics
- [ ] Platform-agnostic data model
- [ ] Error handling and token refresh

### Phase 3: Dashboards (Week 2-3)
- [ ] Client portal analytics page
- [ ] Growth charts (Recharts)
- [ ] Platform comparison view
- [ ] Admin client social overview
- [ ] Portfolio analytics dashboard

### Phase 4: Intelligence (Week 3-4)
- [ ] Alert system (growth milestones, declines)
- [ ] Automated insights generation
- [ ] Top content detection
- [ ] Growth rate calculations
- [ ] Admin notifications

### Phase 5: Reporting (Week 4)
- [ ] Weekly growth report generator
- [ ] Program completion report
- [ ] PDF export functionality
- [ ] CSV data export
- [ ] Report scheduling

---

## Testing Strategy

### OAuth Testing
- Test each platform's OAuth flow
- Token refresh logic
- Revoked access scenarios
- Expired token handling

### Data Accuracy
- Compare API data with platform UI
- Verify calculations (engagement rate, growth rate)
- Test historical data retrieval
- Edge cases (0 followers, private accounts)

### Performance
- Sync 100+ connections in <5 minutes
- Chart rendering with 365 data points
- Database query optimization

---

## Success Metrics

**Adoption:**
- 70%+ clients connect at least one platform
- 40%+ clients connect 2+ platforms
- 90%+ connections remain active (not revoked)

**Usage:**
- 60%+ clients check analytics weekly
- 80%+ admins use social data for coaching decisions
- 50%+ clients export growth report

**Value:**
- Average +45% follower growth during program
- Measurable correlation between deliverables and growth
- 5+ case studies with 100%+ growth

---

**Last Updated:** 2025-11-15
**Status:** Specification Complete - Ready for Development
