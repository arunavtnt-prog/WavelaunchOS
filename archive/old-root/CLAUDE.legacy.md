# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WavelaunchOS CRM** is an AI-powered Customer Relationship Management system for managing creator/influencer partnerships and brand launches. It consolidates client onboarding, AI-powered document generation, communication tracking, and project management.

- **Type**: Full-stack Next.js monolithic app
- **Main Directory**: `wavelaunch-crm/`
- **Status**: Production-ready (v1.0.0)

## Quick Start Commands

```bash
# All commands run from wavelaunch-crm/ directory
cd wavelaunch-crm

# Development
pnpm install              # Install dependencies
pnpm db:push              # Sync database schema
pnpm db:seed              # Seed with test data
pnpm dev                  # Start dev server (http://localhost:3000)

# Database
pnpm db:generate          # Generate Prisma client after schema changes
pnpm db:migrate           # Create and run migration
pnpm db:studio            # Open Prisma Studio GUI

# Testing
pnpm test                 # Run Playwright E2E tests
pnpm test:ui              # Run tests in interactive UI mode
pnpm test:headed          # Run tests with visible browser
pnpm test:report          # View HTML test report

# Quality & Build
pnpm lint                 # ESLint check
pnpm build                # Production build
pnpm start                # Start production server
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14.2.15 (App Router), React 18.2 |
| Language | TypeScript 5.6 (strict mode) |
| Styling | Tailwind CSS 3.4, shadcn/ui (Radix UI) |
| Database | PostgreSQL (prod), SQLite (dev option) |
| ORM | Prisma 6.0 (24 models, 15 enums) |
| Auth | NextAuth v5-beta, bcryptjs |
| AI | Anthropic Claude SDK 0.27 |
| Queue | BullMQ 5.63 + Redis (ioredis) |
| PDF | Pandoc + XeLaTeX |
| Email | Resend (primary), Nodemailer/SMTP (fallback) |
| Testing | Playwright E2E |

## Architecture

### Directory Structure

```
wavelaunch-crm/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Public auth routes (login)
│   │   ├── (dashboard)/        # Protected admin routes
│   │   ├── api/                # REST API endpoints
│   │   ├── apply/              # Public application form
│   │   └── portal/             # Client portal (separate auth)
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui base components
│   │   └── [feature]/          # Feature-specific components
│   ├── lib/                    # Core services
│   │   ├── ai/                 # Claude integration (cache, checkpoints, tokens)
│   │   ├── auth/               # NextAuth config
│   │   ├── jobs/               # BullMQ job queue
│   │   ├── pdf/                # PDF generation
│   │   ├── prompts/            # YAML prompt templates
│   │   └── email/              # Email service
│   ├── schemas/                # Zod validation schemas
│   └── types/                  # TypeScript definitions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
└── tests/e2e/                  # Playwright tests
```

### Two Authentication Systems

1. **Admin Auth** (NextAuth v5): JWT-based for `/dashboard/*` routes
2. **Portal Auth**: Separate token-based auth for `/portal/*` (ClientPortalUser model)

### Database Models (Prisma)

**Auth**: User, LoginAttempt, ClientPortalUser
**Core**: Client, BusinessPlan, Deliverable, Application
**Content**: File, Note, PromptTemplate
**Support**: Ticket, TicketComment, TicketAttachment
**Help**: HelpCategory, HelpArticle
**AI/Analytics**: TokenUsage, PromptCache, GenerationCheckpoint, DocumentSection, TokenBudget
**Notifications**: NotificationPreferences, PortalMessage, PortalNotification
**System**: Job, Activity, BackupLog, Settings

## Key Patterns

### Soft Deletes
```typescript
// Query active records
where: { deletedAt: null }

// Soft delete
update: { deletedAt: new Date() }
```

### Status Workflows
```
DocumentStatus: DRAFT → PENDING_REVIEW → APPROVED → DELIVERED/REJECTED
ClientStatus: ACTIVE → INACTIVE → ARCHIVED
JobStatus: QUEUED → PROCESSING → COMPLETED/FAILED/CANCELLED
TicketStatus: OPEN → IN_PROGRESS → WAITING_ON_* → RESOLVED → CLOSED
```

### API Response Format
```typescript
// All API endpoints return this shape
{
  success: boolean,
  data?: T,
  error?: string,
  pagination?: { page, pageSize, total, totalPages }
}
```

### Error Handling
Use custom error classes from `lib/utils/errors.ts`:
- ValidationError (400), NotFoundError (404), UnauthorizedError (401)
- ForbiddenError (403), ConflictError (409), CapacityError (429)

### API Route Pattern
```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Validate with Zod, query with Prisma, return { success: true, data }
}
```

## Environment Variables

```bash
# Required
DATABASE_URL=                    # PostgreSQL connection string
NEXTAUTH_SECRET=                 # Generate: openssl rand -base64 32
ANTHROPIC_API_KEY=sk-ant-...     # Claude API key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (one required)
RESEND_API_KEY=                  # OR
SMTP_HOST=, SMTP_PORT=, SMTP_USER=, SMTP_PASSWORD=

# Optional
REDIS_URL=redis://localhost:6379  # Required for prod job queue
ENABLE_SCHEDULER=true
```

## System Limits

- Client capacity: 100 clients
- Storage quota: 50GB total
- File size: 10MB per file
- API timeout: 2 minutes

## Test Credentials

```
Admin: admin@wavelaunch.studio / wavelaunch123
```

## Git Workflow

- Main branch: `main`
- Commit style: Conventional commits (feat:, fix:, docs:, refactor:, test:, chore:)
