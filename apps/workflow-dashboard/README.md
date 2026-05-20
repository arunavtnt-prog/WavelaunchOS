# Wavelaunch Workflow Dashboard

Standalone Next.js application for automating the submission-to-delivery pipeline by integrating with the CRM database, blueprint-engine service, and local AI (GLM-4.7 via z.ai) / proxy.

## Features

- **Queue Management**: Review and approve/reject applications for workflow processing
- **Blueprint Generation**: AI-powered business plan generation using Claude
- **Email Approval**: Review, edit, and approve personalized email drafts
- **Conversion Tracking**: Track and manage application conversions
- **Automation Orchestrator**: Automated workflow state transitions

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (shared with CRM)
- Blueprint Engine service running on port 3001
- CRM API running on port 3000
- GLM API key (z.ai) or local AI proxy

### Installation

```bash
cd workflow-dashboard
pnpm install
```

### Configuration

1. Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Configure environment variables:

```bash
# Database (shared with CRM)
DATABASE_URL="postgresql://user:password@localhost:5432/wavelaunch"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://127.0.0.1:3007"

# API URLs
CRM_API_URL="http://localhost:3000"
BLUEPRINT_ENGINE_URL="http://localhost:3010"
NEXT_PUBLIC_APP_URL="http://127.0.0.1:3007"

# AI
AI_PROVIDER="zai"
GLM_API_KEY="your-zai-api-key"

# Optional: Vision Form sync (CRM base URL)
# If you want the dashboard to pull submissions from the deployed CRM (where you can see them at /submissions),
# set the source to the CRM domain and provide the external token.
VISION_FORM_SOURCE_URL="https://login.wavelaunch.org"
VISION_FORM_EXTERNAL_TOKEN="your-crm-external-api-token"

# Optional: DB fallback (avoids needing a public list endpoint on the CRM)
# VISION_FORM_SOURCE_DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

3. Generate Prisma client:

```bash
pnpm db:generate
```

### Development

```bash
pnpm dev
```

The dashboard will be available at http://127.0.0.1:3007

### Build for Production

```bash
pnpm build
pnpm start
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              Workflow Dashboard (Port 3007)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Queue → Blueprint → Email → Convert              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  CRM Database    │  │ Blueprint Engine │  │   Claude AI      │
│  (PostgreSQL)    │  │   (Port 3001)    │  │  (Anthropic)     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

## Workflow States

1. **SUBMITTED** - Application ingested, awaiting review
2. **SNAPSHOT_QUEUED** - Approved, queued for snapshot generation
3. **SNAPSHOT_GENERATING** - Snapshot being generated
4. **SNAPSHOT_COMPLETE** - Snapshot complete (triggers blueprint pipeline)
5. **SNAPSHOT_FAILED** - Snapshot generation failed (needs attention)
6. **EMAIL_REVIEW_PENDING** - Draft email ready for review (manual send)
7. **EMAIL_SENT** - Marked as sent
8. **AWAITING_RESPONSE** - Waiting for prospect response
9. **CONVERTED** - Prospect became a client
10. **REJECTED** - Application rejected
11. **ARCHIVED** - Workflow archived

## Pages

- `/` - Dashboard with statistics and quick actions
- `/queue` - Application review queue
- `/blueprints` - Blueprint generation and preview
- `/emails` - Email draft review and approval
- `/conversions` - Conversion tracking
- `/settings` - System status and configuration
  - Use **Sync Vision Form submissions** to pull intake submissions into `/queue`.

## Services

- **QueueManager** - Manages application queue operations
- **BlueprintGenerator** - Generates AI-powered business plans
- **EmailDraftComposer** - Composes personalized email drafts
- **WorkflowOrchestrator** - Coordinates workflow automation

## Authentication

Uses NextAuth v5 with shared credentials from the CRM. Only ADMIN role users can access the dashboard.

Default credentials (from CRM):
- Email: admin@wavelaunch.studio
- Password: wavelaunch123

## API Endpoints

- `GET/POST /api/workflow/queue` - Queue management
- `POST /api/workflow/queue/[id]` - Update single application
- `GET/POST /api/workflow/blueprints` - Blueprint generation
- `GET/POST /api/workflow/emails` - Email draft management
- `POST /api/workflow/emails/[id]/send` - Send approved email

## Database Schema

Uses shared CRM database with additional models:

- `WorkflowState` - Workflow status tracking
- `WorkflowAuditLog` - Audit trail
- `EmailDraft` - Email drafts with approval status
- `ExecutionLog` - Batch execution tracking

## License

Part of WavelaunchOS. Internal use only.
