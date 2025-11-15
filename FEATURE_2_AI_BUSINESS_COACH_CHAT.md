# Feature 2: AI Business Coach Chat

## Executive Summary

An intelligent AI chatbot powered by Claude that provides personalized, 24/7 business coaching to Wavelaunch clients. The coach has full context of each client's onboarding data, business plan, current deliverables, and progress through the 8-month journey to deliver hyper-relevant guidance.

**Priority:** HIGH
**Complexity:** High
**Estimated Timeline:** 5-6 weeks
**Developer Resources:** 1 full-time developer

---

## Problem Statement

**Current Pain Points:**
- Clients need guidance between scheduled calls with human coaches
- Admin team cannot provide 24/7 support
- Simple questions consume valuable coaching time
- Clients feel stuck waiting for answers to basic queries
- Inconsistent advice across different support team members

**Impact:**
- Reduced client confidence and momentum
- Higher support ticket volume
- Delayed decision-making by clients
- Underutilized admin time on repetitive questions

---

## Solution Overview

Build an AI-powered chat interface that:

1. **Understands client context** - Knows their business, niche, goals, and current stage
2. **Provides personalized advice** - Tailored to their specific situation
3. **Available 24/7** - No waiting for business hours
4. **Learns from interactions** - Gets smarter with each conversation
5. **Escalates when needed** - Routes complex issues to human admins
6. **Maintains conversation history** - Picks up where you left off

---

## User Stories

### Client Stories

**As a client, I want to:**
1. Ask business questions and get instant, personalized answers
2. Have the AI coach remember our previous conversations
3. Get advice specific to my niche and current month (M1-M8)
4. See suggested questions based on my current progress
5. Request human support if AI can't help
6. Access chat from both portal and CRM (if I have access)
7. Export chat history for my records

### Admin Stories

**As an admin, I want to:**
1. View all client-coach conversations for quality assurance
2. See when AI escalates to human support
3. Override AI responses if they're incorrect
4. Set AI coaching boundaries (what it can/can't advise on)
5. Track AI usage and costs per client
6. Monitor AI performance (satisfaction ratings)

---

## Detailed Requirements

### 1. Chat Interface

**UI Layout:**
```
+--------------------------------------------------+
| 💬 AI Business Coach                    [×]      |
+--------------------------------------------------+
| You're currently in Month 3 of your journey      |
| Ask me anything about your creator business!     |
+--------------------------------------------------+
|                                                   |
| 🤖 Hi Sarah! I see you're working on your M3     |
|    deliverable. How can I help you today?        |
|                                      2:30 PM      |
|                                                   |
|                          I'm struggling with     |
|                          pricing my course. 💬   |
|                                      2:31 PM      |
|                                                   |
| 🤖 Great question! Based on your niche (fitness  |
|    for busy moms) and your target audience...    |
|                                                   |
|    Here are 3 pricing strategies:                |
|    1. Tiered pricing ($97/$197/$497)             |
|    2. Payment plans ($67/mo for 3 months)        |
|    3. Early bird special ($147 → $197)           |
|                                                   |
|    Which approach resonates with your audience?  |
|                                      2:31 PM      |
|                                                   |
+--------------------------------------------------+
| [Type your message...                    ] [Send]|
| Suggested: "Help me choose" "Create pricing page"|
+--------------------------------------------------+
```

**Features:**
- **Typing indicator** - Shows "Coach is thinking..." while generating
- **Message timestamps** - Relative (2 min ago) and absolute (2:30 PM)
- **Rich text formatting** - Bold, italic, lists, code blocks, links
- **Suggested responses** - AI-generated quick replies
- **Conversation starters** - Pre-defined questions based on current month
- **Copy message** - Copy AI response to clipboard
- **Rate response** - 👍/👎 feedback on each AI message
- **Export chat** - Download conversation as PDF/TXT
- **Clear conversation** - Start fresh (with confirmation)

---

### 2. AI Context & Personalization

**Client Context Provided to AI:**
```json
{
  "client": {
    "id": "client_123",
    "name": "Sarah Johnson",
    "businessName": "FitMom Academy",
    "niche": "Fitness for busy moms",
    "currentMonth": "M3",
    "monthStartDate": "2025-11-01",
    "onboardingData": {
      "experienceLevel": "Beginner",
      "socialFollowing": "5,000 Instagram followers",
      "currentIncome": "$500/month",
      "incomeGoal": "$10,000/month",
      "challenges": ["Time management", "Pricing strategy", "Content consistency"],
      "strengths": ["Authentic storytelling", "Engaged audience"]
    },
    "businessPlan": {
      "summary": "Launch an online fitness program for busy moms...",
      "targetAudience": "Moms aged 28-45 with kids under 10...",
      "valueProposition": "15-minute home workouts that fit your schedule..."
    },
    "recentDeliverables": [
      {
        "month": "M2",
        "title": "Brand Readiness & Productization",
        "completedAt": "2025-10-28",
        "keyTakeaways": ["Defined brand colors", "Created logo", "Outlined course structure"]
      }
    ],
    "upcomingMilestones": [
      {
        "month": "M3",
        "title": "Market Entry Preparation",
        "dueDate": "2025-12-01",
        "status": "In Progress"
      }
    ]
  },
  "conversationHistory": [
    // Previous 10 messages for context
  ]
}
```

**Context Refresh:**
- Client data refreshed at start of each conversation
- Real-time updates when client completes a milestone
- Business plan context updated when new version approved

---

### 3. AI Capabilities

**What the AI Coach CAN do:**
- ✅ Answer questions about creator business fundamentals
- ✅ Provide niche-specific advice (fitness, finance, parenting, etc.)
- ✅ Help brainstorm content ideas
- ✅ Suggest pricing strategies
- ✅ Review business plan sections (give feedback)
- ✅ Explain deliverable requirements
- ✅ Recommend next steps based on current month
- ✅ Share relevant case studies or examples
- ✅ Help overcome common creator challenges
- ✅ Clarify Wavelaunch program structure

**What the AI Coach CANNOT do:**
- ❌ Give legal or tax advice (escalate to human)
- ❌ Make financial guarantees or promises
- ❌ Access or modify CRM data (read-only context)
- ❌ Send messages to admin on client's behalf
- ❌ Share other clients' information
- ❌ Provide medical/health advice
- ❌ Override admin decisions or policies

**Guardrails:**
- Prompt includes strict guidelines about boundaries
- If asked for restricted advice, politely decline and suggest human support
- Flag conversations for admin review if sensitive topics detected
- Limit response length to 500 tokens (concise, actionable advice)

---

### 4. Conversation Flow

**Greeting (First Message):**
```
🤖 Hi [Client Name]! I'm your AI Business Coach, here to support you
   24/7 throughout your Wavelaunch journey.

   I see you're currently working on Month [X]: [Month Title].

   Here's what I can help with:
   • Brainstorm ideas for your [niche] business
   • Answer questions about your deliverables
   • Provide feedback on your strategies
   • Help you overcome challenges

   What would you like to work on today?
```

**Suggested Prompts (Based on Month):**

**M1 Prompts:**
- "Help me refine my niche"
- "What makes a strong value proposition?"
- "How do I validate my business idea?"

**M3 Prompts:**
- "I need help pricing my product"
- "How do I create a compelling offer?"
- "What's the best way to pre-sell?"

**M6 Prompts:**
- "My soft launch isn't getting traction"
- "How do I collect testimonials?"
- "Should I adjust my pricing?"

**Follow-up Questions:**
- AI asks clarifying questions to understand context
- Example: "Tell me more about your target audience demographics"
- Example: "What pricing have you tried so far?"

**Response Format:**
```
🤖 [Direct answer to question]

   [Explanation or reasoning]

   [Actionable next steps - numbered list]

   [Follow-up question to keep conversation going]
```

---

### 5. Escalation to Human Support

**When to Escalate:**
- Client explicitly asks for human help
- AI detects sensitive topic (legal, medical, financial guarantees)
- Client rates multiple AI responses negatively (3+ 👎 in a row)
- Complex technical issue beyond AI scope
- Client seems frustrated or confused

**Escalation Flow:**
```
🤖 I think this question would be best answered by our human team.
   I've created a support ticket for you.

   Your admin will respond within 24 hours.

   In the meantime, is there anything else I can help with?
```

**Auto-creates:**
- Support ticket in admin CRM
- Includes full conversation context
- Tags ticket with "AI_ESCALATION"
- Notifies admin via email

---

### 6. Admin Controls

**Coach Configuration Page (Admin CRM):**
```
+--------------------------------------------------+
| 🤖 AI Coach Settings                             |
+--------------------------------------------------+
| System Prompt Template                           |
| [Edit in YAML] [Test Prompt] [Restore Default]  |
|                                                   |
| Enabled Capabilities:                            |
| ✅ General business advice                       |
| ✅ Content ideation                              |
| ✅ Pricing strategy                              |
| ✅ Marketing guidance                            |
| ❌ Legal advice (escalate)                       |
| ❌ Financial guarantees (escalate)               |
|                                                   |
| Token Limits:                                    |
| Max per message: [500] tokens                    |
| Max per client/day: [5000] tokens                |
|                                                   |
| Auto-escalation Rules:                           |
| ✅ 3+ negative ratings → create ticket           |
| ✅ Keywords: "lawyer", "accountant", "sue"       |
| ✅ Client says "talk to human" or similar        |
+--------------------------------------------------+
```

**Conversation Monitoring:**
- Admin can view all client-coach conversations
- Filter by client, date, rating, escalation status
- Search conversations by keyword
- Export conversation data (CSV)

**Quality Assurance:**
- Random sampling of conversations for review
- Dashboard showing average satisfaction rating
- Alerts for low-rated conversations
- Ability to "correct" AI responses (for future training)

---

## Technical Architecture

### Database Schema

**New Table: `CoachConversation`**
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
```

**New Table: `CoachMessage`**
```prisma
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
```

**New Table: `CoachConfig`**
```prisma
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

**Update: `Client` Table**
```prisma
model Client {
  // ... existing fields ...

  // New relation
  coachConversations CoachConversation[]
}
```

---

### API Endpoints

**Chat API**
- `POST /api/coach/chat` - Send message and get AI response
  - Input: `{ conversationId?, message: string }`
  - Output: `{ conversationId, response, tokensUsed, suggestedPrompts }`

- `GET /api/coach/conversations` - List all conversations for client
- `GET /api/coach/conversations/:id` - Get conversation with full message history
- `POST /api/coach/conversations/:id/archive` - Archive conversation
- `DELETE /api/coach/conversations/:id` - Delete conversation

**Rating API**
- `POST /api/coach/messages/:id/rate` - Rate a message (👍/👎)
  - Input: `{ rating: 1 | 2, feedback?: string }`

**Export API**
- `GET /api/coach/conversations/:id/export` - Export as PDF/TXT

**Admin API**
- `GET /api/admin/coach/config` - Get coach configuration
- `PATCH /api/admin/coach/config` - Update configuration
- `GET /api/admin/coach/conversations` - List all client conversations (paginated)
- `GET /api/admin/coach/stats` - Get usage stats and ratings
- `POST /api/admin/coach/test` - Test prompt with sample data

---

### AI Integration

**Claude API Configuration:**
```typescript
const coachConfig = {
  model: 'claude-sonnet-4-20250514',
  max_tokens: 500,
  temperature: 0.7,
  system: `You are an expert business coach for Wavelaunch Studio...
           [Full system prompt with guidelines and context]`,
  messages: [
    { role: 'user', content: clientMessage },
    // Previous conversation history (last 10 messages)
  ]
}
```

**System Prompt Structure:**
```yaml
role: "AI Business Coach for Wavelaunch Studio"

identity: |
  You are a knowledgeable, supportive, and actionable business coach.
  You specialize in helping creators build sustainable online businesses.

guidelines:
  - Always be encouraging but realistic
  - Provide specific, actionable advice
  - Ask clarifying questions when needed
  - Keep responses concise (under 300 words)
  - Use bullet points and numbered lists
  - Reference the client's specific context
  - Never make income guarantees
  - Escalate legal/medical/tax questions

tone:
  - Friendly and conversational
  - Professional but not corporate
  - Empathetic to creator struggles
  - Motivating without being pushy

context_awareness: |
  You have access to:
  - Client's business plan and goals
  - Current month in 8-month program
  - Onboarding data (niche, experience, goals)
  - Recent deliverables and milestones

  Always reference this context to personalize advice.

prohibited_topics:
  - Legal advice (trademark, contracts, liability)
  - Medical/health advice
  - Tax preparation or accounting
  - Financial guarantees or projections
  - Personal relationship counseling

  When asked, politely decline and offer human escalation.

response_format: |
  1. Direct answer to the question
  2. Brief explanation or reasoning
  3. 2-4 actionable next steps
  4. Optional follow-up question
```

**Token Management:**
- Track tokens per message
- Accumulate daily total per client
- Warn client at 80% of daily limit
- Block further messages at 100% (reset at midnight UTC)
- Admin can override limits for specific clients

**Error Handling:**
- Retry failed API calls (3 attempts with backoff)
- Fallback message if Claude API unavailable
- Log all errors for debugging
- Graceful degradation (suggest contact support)

---

### Folder Structure

```
wavelaunch-crm/
├── src/
│   ├── app/
│   │   ├── portal/
│   │   │   └── coach/
│   │   │       ├── page.tsx              # Chat interface
│   │   │       └── [conversationId]/
│   │   │           └── page.tsx          # Specific conversation
│   │   ├── (dashboard)/
│   │   │   └── coach/
│   │   │       ├── page.tsx              # Admin coach overview
│   │   │       ├── config/
│   │   │       │   └── page.tsx          # Coach configuration
│   │   │       └── conversations/
│   │   │           └── [id]/
│   │   │               └── page.tsx      # View conversation
│   │   └── api/
│   │       ├── coach/
│   │       │   ├── chat/
│   │       │   │   └── route.ts          # Main chat endpoint
│   │       │   ├── conversations/
│   │       │   │   ├── route.ts
│   │       │   │   └── [id]/
│   │       │   │       ├── route.ts
│   │       │   │       └── export/
│   │       │   │           └── route.ts
│   │       │   └── messages/
│   │       │       └── [id]/
│   │       │           └── rate/
│   │       │               └── route.ts
│   │       └── admin/
│   │           └── coach/
│   │               ├── config/
│   │               │   └── route.ts
│   │               ├── conversations/
│   │               │   └── route.ts
│   │               └── stats/
│   │                   └── route.ts
│   ├── components/
│   │   └── coach/
│   │       ├── ChatInterface.tsx
│   │       ├── MessageBubble.tsx
│   │       ├── SuggestedPrompts.tsx
│   │       ├── TypingIndicator.tsx
│   │       ├── RatingButtons.tsx
│   │       └── ConversationList.tsx
│   ├── lib/
│   │   └── coach/
│   │       ├── client.ts                # Claude API client for coaching
│   │       ├── context-builder.ts       # Build client context
│   │       ├── prompt-templates.ts      # System prompts
│   │       ├── escalation.ts            # Escalation logic
│   │       └── token-tracker.ts         # Token usage tracking
```

---

### Real-Time Features

**WebSocket Integration:**
- Real-time typing indicators
- Instant message delivery
- Live conversation updates
- Presence indicators (admin viewing conversation)

**Alternative (Simpler):**
- HTTP polling every 3 seconds while chat is open
- Server-Sent Events (SSE) for streaming AI responses

**Streaming Response:**
```typescript
// Stream AI response word-by-word
const stream = await claude.messages.stream({
  // ... config
})

for await (const chunk of stream) {
  // Send chunk to client via WebSocket or SSE
  socket.send({ type: 'chunk', content: chunk.delta.text })
}

socket.send({ type: 'complete' })
```

---

## UI/UX Design

**Design Principles:**
- **Accessible** - Keyboard navigation, screen reader support
- **Mobile-first** - Works great on phones
- **Fast** - Responses feel instant (<2s to first token)
- **Forgiving** - Easy to edit/delete messages
- **Transparent** - Clear that it's AI, not human

**Chat Widget Options:**

**Option A: Dedicated Page**
- `/portal/coach` route
- Full-screen chat experience
- Conversation sidebar on desktop

**Option B: Floating Widget**
- Bottom-right corner bubble icon
- Expands to chat window
- Available on all portal/CRM pages
- Minimizes to notification badge

**Option C: Hybrid (Recommended)**
- Dedicated page for deep conversations
- Floating widget for quick questions
- Same conversation synced across both

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema and migrations
- [ ] Basic chat UI (send/receive messages)
- [ ] Claude API integration
- [ ] System prompt engineering
- [ ] Client context builder

### Phase 2: Core Features (Week 2-3)
- [ ] Conversation management (list, archive, delete)
- [ ] Message rating system
- [ ] Suggested prompts based on month
- [ ] Token tracking and limits
- [ ] Error handling and retries

### Phase 3: Advanced Features (Week 3-4)
- [ ] Escalation logic and ticket creation
- [ ] Real-time features (WebSocket or polling)
- [ ] Export conversations
- [ ] Admin configuration panel
- [ ] Admin conversation monitoring

### Phase 4: Polish & Testing (Week 4-5)
- [ ] Streaming responses
- [ ] Mobile responsive design
- [ ] Accessibility improvements
- [ ] Comprehensive testing
- [ ] Prompt optimization based on testing
- [ ] Load testing (concurrent chats)

### Phase 5: Launch & Monitor (Week 5-6)
- [ ] Beta testing with 5-10 clients
- [ ] Collect feedback and iterate
- [ ] Monitor AI response quality
- [ ] Adjust prompts based on real usage
- [ ] Documentation for clients and admins
- [ ] Full rollout

---

## Testing Strategy

### Prompt Testing
- Test with 50+ sample questions across all months
- Verify appropriate responses to prohibited topics
- Ensure escalation triggers work correctly
- Check for hallucinations or incorrect advice
- Test with edge cases (rude questions, nonsense input)

### Integration Testing
- Client context correctly loaded
- Conversation history maintained
- Token limits enforced
- Rating system works
- Export functionality

### Performance Testing
- Response time <2s for first token
- Handle 50+ concurrent chats
- Database queries optimized
- Token usage tracking accurate

### Security Testing
- Cannot access other clients' data
- Prompt injection attacks blocked
- XSS attempts sanitized
- Rate limiting enforced

---

## Success Metrics

**Usage:**
- 60%+ of clients use coach at least once per month
- Average 10+ messages per active user per month
- 40%+ of clients use coach weekly

**Quality:**
- Average rating 4.0+ out of 5 (⭐⭐⭐⭐)
- <10% escalation rate
- <5% negative rating rate
- >70% clients find responses helpful (survey)

**Impact:**
- 30% reduction in basic support tickets
- 20% increase in deliverable completion rates (clients get unstuck)
- 4.5/5 client satisfaction with AI coach feature

**Cost Efficiency:**
- Average $2-5 per client per month in API costs
- ROI: Save 10+ admin hours/month = $300-500 value

---

## Cost Analysis

**Claude API Pricing (Estimated):**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Usage Assumptions:**
- Average client: 20 messages/month
- Average message length: 100 tokens (client) + 300 tokens (AI)
- Context per message: 2000 tokens (client data + history)

**Monthly Cost per Client:**
```
Input tokens:  (100 + 2000) × 20 = 42,000 tokens = $0.13
Output tokens: 300 × 20 = 6,000 tokens = $0.09
Total: ~$0.22 per client per month
```

**100 Active Clients:**
- Monthly: $22
- Annually: $264

**500 Active Clients (at scale):**
- Monthly: $110
- Annually: $1,320

**Conclusion:** Extremely cost-effective compared to human coaching time.

---

## Future Enhancements

### Phase 2 Features
- 🎤 Voice input (speech-to-text)
- 🔊 Voice output (text-to-speech for AI responses)
- 📷 Image upload (analyze graphics, branding, content)
- 📊 Coach suggests data-driven insights from analytics
- 🤝 Group coaching mode (multiple clients discuss topic)

### Phase 3 Features
- 🧠 Proactive coaching (AI initiates conversations when milestones approach)
- 📚 Resource recommendations (links to courses, articles, templates)
- 🎯 Goal tracking (set goals, coach checks in on progress)
- 💡 Daily inspiration (motivational message based on client's journey)

---

## Open Questions

1. **Should clients have unlimited daily messages or cap at 50/day?**
   - Recommendation: Cap at 50 to prevent abuse, expandable by admin

2. **Allow clients to create multiple conversations or force single thread?**
   - Recommendation: Allow multiple for topic organization

3. **Should AI remember client preferences (communication style)?**
   - Recommendation: Yes, store in client profile metadata

4. **Include AI coach in mobile app or web-only for now?**
   - Recommendation: Web first, mobile in Phase 2

5. **Should admins be able to "take over" a conversation?**
   - Recommendation: Yes, seamless handoff from AI to human

---

**Last Updated:** 2025-11-15
**Status:** Specification Complete - Ready for Development
