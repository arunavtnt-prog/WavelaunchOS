# CLAUDE.md - WavelaunchOS CRM

## Project Overview

**WavelaunchOS CRM** is a production-ready, AI-powered Customer Relationship Management system for managing creator/influencer partnerships and brand launches. It's a local-first platform consolidating client onboarding, AI-powered document generation, communication tracking, and project management.

- **Type**: Full-stack Next.js 15 monolithic app
- **Status**: Production-ready (v1.0.0)
- **Size**: ~12,000 lines across 240 TypeScript/TSX files
- **Main Directory**: `wavelaunch-crm/`

## Quick Start Commands

```bash
# Development
pnpm install              # Install dependencies
pnpm db:push              # Sync database schema
pnpm db:seed              # Seed with test data
pnpm dev                  # Start dev server (http://localhost:3000)

# Database
pnpm db:generate          # Generate Prisma client
pnpm db:migrate           # Run migrations
pnpm db:studio            # Open Prisma Studio

# Testing & Quality
pnpm test                 # Run Playwright E2E tests
pnpm lint                 # ESLint check

# Production
pnpm build                # Production build
pnpm start                # Start production server
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript 5.6 (strict mode) |
| Styling | Tailwind CSS 3.4, shadcn/ui |
| Database | PostgreSQL 16 (prod), SQLite (dev) |
| ORM | Prisma 6.0 (16 models) |
| Auth | NextAuth v5-beta, bcryptjs |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Queue | BullMQ 5.63 + Redis 7 |
| PDF | Pandoc + XeLaTeX |
| Email | Resend (primary), SMTP (fallback) |
| Testing | Playwright E2E |

## Directory Structure

```
wavelaunch-crm/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Public routes (login)
│   │   ├── (dashboard)/        # Protected admin routes
│   │   ├── api/                # REST API (35+ endpoints)
│   │   └── portal/             # Client portal pages
│   ├── components/             # React components (39 files)
│   │   ├── ui/                 # shadcn/ui base components
│   │   └── [feature]/          # Feature-specific components
│   ├── lib/                    # Core services
│   │   ├── ai/                 # Claude AI integration
│   │   ├── auth/               # NextAuth config
│   │   ├── jobs/               # BullMQ job queue
│   │   ├── pdf/                # PDF generation
│   │   ├── prompts/            # YAML prompt templates
│   │   ├── email/              # Email service
│   │   └── [service]/          # Other services
│   ├── schemas/                # Zod validation
│   ├── types/                  # TypeScript definitions
│   └── hooks/                  # React hooks
├── prisma/
│   ├── schema.prisma           # Database schema (16 models)
│   └── seed.ts                 # Seed data
├── tests/e2e/                  # Playwright tests
└── docs/                       # Documentation (21 files)
```

## Required Environment Variables

```bash
# Critical
ANTHROPIC_API_KEY=sk-ant-...     # Claude API key
NEXTAUTH_SECRET=...              # Generate: openssl rand -base64 32
DATABASE_URL=...                 # PostgreSQL or SQLite path
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Important
REDIS_URL=redis://localhost:6379  # Required for production
NODE_ENV=development|production

# Email (one required)
RESEND_API_KEY=...               # OR
SMTP_HOST=..., SMTP_PORT=..., SMTP_USER=..., SMTP_PASSWORD=...

# Optional Feature Flags
ENABLE_SCHEDULER=true
ENABLE_EMAIL_WORKFLOWS=true
AUTO_GENERATE_PDF=true
```

## Database Models (Prisma)

**Auth**: User, LoginAttempt
**Core**: Client, BusinessPlan, Deliverable
**Content**: File, Note, PromptTemplate
**Support**: Ticket, TicketComment, TicketAttachment
**Help**: HelpCategory, HelpArticle
**System**: Job, Activity, BackupLog, Settings
**Notifications**: NotificationPreferences, MessageThread, Message
**Webhooks**: Webhook, WebhookDelivery

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
JobStatus: QUEUED → PROCESSING → COMPLETED/FAILED
```

### API Response Format
```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  pagination?: { page, pageSize, total, totalPages }
}
```

### Error Handling
Use custom error classes from `lib/utils/errors.ts`:
- ValidationError, AuthenticationError, AuthorizationError
- NotFoundError, ConflictError, CapacityError

## Common Development Tasks

### Adding an API Endpoint
1. Create `/src/app/api/[feature]/route.ts`
2. Add Zod schema in `/src/schemas/`
3. Use `createApiResponse()` helper
4. Handle errors with custom classes

### Adding a Component
1. Create in `/src/components/[category]/`
2. Use shadcn/ui as base
3. Add TypeScript interfaces for props

### Adding a Database Model
1. Add to `/prisma/schema.prisma`
2. Add indexes for queried fields
3. Run `pnpm db:migrate`

### Creating a Background Job
1. Add type to `lib/jobs/types.ts`
2. Implement in `lib/jobs/executor.ts`
3. Enqueue: `jobQueue.enqueue(...)`

## System Limits

- Client capacity: 100 clients
- Storage quota: 50GB total
- File size: 10MB per file
- API timeout: 2 minutes
- Rate limits: 10 req/s API, 5 req/min auth

## Test Credentials

```
Admin: admin@wavelaunch.studio / wavelaunch123
```

## Documentation Reference

Key docs in `/docs/`:
- `SETUP.md` - Installation guide
- `TECHNICAL_OVERVIEW.md` - Architecture
- `API.md` - API documentation
- `SECURITY.md` - Security practices
- `PRODUCTION_DEPLOYMENT.md` - Deployment guide

## Git Workflow

- Main branch: `main`
- Current worktree: `ecstatic-hugle`
- Commit style: Conventional commits (feat:, fix:, docs:, etc.)
