# WavelaunchOS CRM - Codebase Structure Overview

Generated: 2025-11-14

## Quick Navigation

This document provides a comprehensive overview of the WavelaunchOS CRM codebase structure, organization, and key architectural patterns.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Core Services](#core-services)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Component Organization](#component-organization)
7. [Key Patterns](#key-patterns)
8. [Getting Started](#getting-started)

---

## Project Overview

**WavelaunchOS CRM** is an AI-powered Customer Relationship Management system designed for managing creator/influencer partnerships and brand launches.

### Key Facts
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.6
- **Database**: Prisma 6.0 with SQLite
- **AI**: Anthropic Claude API integration
- **Status**: 100% complete, production-ready
- **Size**: 12,000+ lines of code across 11 layers

### Core Technologies
- **Frontend**: React 19, Tailwind CSS 3.4, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Auth**: NextAuth v5 with JWT
- **Documents**: Pandoc + XeLaTeX for PDF generation
- **Testing**: Playwright E2E tests

---

## Directory Structure

### `/src/` - Application Source Code

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public routes (login)
│   ├── (dashboard)/              # Protected dashboard routes
│   ├── api/                      # REST API endpoints (28+)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui base components
│   ├── layout/                   # Sidebar, header
│   ├── editor/                   # Markdown and rich text editors
│   ├── notes/                    # Notes-specific components
│   ├── files/                    # File upload component
│   └── error-boundary.tsx
│
├── lib/                          # Core services
│   ├── ai/                       # Claude AI integration
│   ├── auth/                     # NextAuth configuration
│   ├── jobs/                     # Background job queue
│   ├── pdf/                      # PDF generation pipeline
│   ├── prompts/                  # Template loading & rendering
│   ├── backup/                   # Database backup service
│   ├── files/                    # File management utilities
│   ├── utils/                    # Constants, errors, helpers
│   └── db.ts                     # Prisma client
│
├── schemas/                      # Zod validation schemas
├── types/                        # TypeScript definitions
└── hooks/                        # React custom hooks
```

### `/prisma/` - Database

```
prisma/
├── schema.prisma                 # Complete database schema (11 models)
├── migrations/                   # Database migration history
└── seed.ts                       # Initial data seeding
```

### Other Directories

```
/tests/                          # Playwright E2E tests
/docs/                           # Project documentation
/templates/                       # LaTeX templates for PDFs
/scripts/                        # Utility scripts
```

---

## Core Services

### 1. AI Generation (`lib/ai/`)

**ClaudeClient** - Anthropic API Wrapper
- `generate()` - Single request generation
- `generateStream()` - Streaming generation with callbacks
- `countTokens()` - Approximate token counting

**generateBusinessPlan.ts**
- Takes client data and prompt template
- Generates comprehensive business plans
- Creates version history
- Logs activity

**generateDeliverable.ts**
- Generates monthly deliverables (M1-M8)
- Builds context from previous months
- Tracks version and status

### 2. Prompt Management (`lib/prompts/`)

**PromptLoader**
- Loads YAML template files
- Renders templates with Mustache variables
- In-memory caching for performance
- Manages template versioning

**contextBuilder**
- Fetches client information
- Retrieves previous deliverables
- Builds structured context object
- Passes to prompt renderer

### 3. Job Queue (`lib/jobs/queue.ts`)

**JobQueue Class**
- Single-threaded processing (max 1 concurrent AI job)
- Database-persisted queue state
- Exponential backoff retry logic (2s, 4s, 8s)
- Max 3 retry attempts per job

**Supported Job Types**:
- GENERATE_BUSINESS_PLAN
- GENERATE_DELIVERABLE
- GENERATE_PDF
- BACKUP_DATABASE
- CLEANUP_FILES

### 4. PDF Generation (`lib/pdf/`)

**Markdown → PDF Pipeline**:
1. Fetch document markdown from database
2. Convert to LaTeX using Pandoc
3. Apply Wavelaunch branding template
4. Compile with XeLaTeX
5. Output at specified DPI (150 draft, 300 final)

### 5. Authentication (`lib/auth/`)

**NextAuth v5 Configuration**
- Email/password credentials provider
- bcrypt password hashing
- JWT token strategy
- Role-based access control (ADMIN/CLIENT)

### 6. Database (`lib/db.ts`)

**Prisma Client Singleton**
- Single connection instance
- All models accessible via `db.modelName`
- Type-safe queries with full autocomplete

### 7. Backup Service (`lib/backup/`)

**Database Backups**
- Copy SQLite database file
- Gzip compression
- Manual and automated (daily at 2 AM)
- Safe restore with verification
- 30-day retention policy

### 8. File Management (`lib/files/`)

**File Cleanup**
- Identify orphaned files
- Remove unreferenced files
- Update storage statistics
- Run as background job

---

## Database Schema

### 11 Core Models

**User**
- Authentication and audit tracking
- Roles: ADMIN, CLIENT
- Relationships to all content models

**Client**
- Core entity: creator/brand information
- 29 onboarding data points
- Status: ACTIVE, INACTIVE, ARCHIVED
- Soft delete with `deletedAt` timestamp

**BusinessPlan**
- Versioned strategic documents
- Status workflow: DRAFT → PENDING_REVIEW → APPROVED → DELIVERED
- Markdown content + optional PDF path
- Tracks generator and approval chain

**Deliverable**
- Monthly guidance (M1-M8)
- Parent-child relationships for subdocuments
- Same status workflow as BusinessPlan
- Markdown content + optional PDF

**File**
- File metadata and storage tracking
- Categories: BUSINESS_PLAN, DELIVERABLE, UPLOAD, MISC
- References to client (optional)
- Soft delete support

**PromptTemplate**
- YAML-based template management
- Type-specific (BUSINESS_PLAN, DELIVERABLE_M1-M8)
- Version tracking
- Active/inactive toggle

**Job**
- Background job queue persistence
- Payload and result stored as JSON
- Attempts counter for retries
- Time tracking (createdAt, startedAt, completedAt)

**Note**
- Rich text notes with metadata
- Tags and importance flags
- Categories
- Attached to clients

**Activity**
- Comprehensive audit log
- 20+ activity types
- Optional metadata as JSON
- Soft deletes for full history

**BackupLog**
- Backup history and verification
- Status: SUCCESS, FAILED
- File metadata (name, size, path)
- Integrity verification tracking

**Settings**
- System configuration key-value store
- JSON values for complex data
- Global application settings

### Key Relationships

```
User       1→N → BusinessPlan, Deliverable, File, Note, Activity
Client     1→N → BusinessPlan, Deliverable, File, Note, Activity
Deliverable 1→N → Deliverable (self-referential for subdocuments)
```

### Important Patterns

**Soft Deletes**
```prisma
deletedAt DateTime?  // null = active, timestamp = deleted
```
Used in: Client, File
Queries must include: `where: { deletedAt: null }`

**Versioning**
```prisma
version Int @default(1)  // Incremented on each generation
```
Used in: BusinessPlan, PromptTemplate

**Status Workflows**
```
DocumentStatus: DRAFT → PENDING_REVIEW → APPROVED → DELIVERED → REJECTED
ClientStatus: ACTIVE → INACTIVE/ARCHIVED
JobStatus: QUEUED → PROCESSING → COMPLETED/FAILED/CANCELLED
```

---

## API Routes

### Structure: 28+ RESTful Endpoints

#### Client Management (`/api/clients/`)
```
GET    /api/clients                    List (paginated, filterable)
POST   /api/clients                    Create
GET    /api/clients/[id]               Get details
PATCH  /api/clients/[id]               Update
DELETE /api/clients/[id]               Delete (soft)
GET    /api/clients/[id]/activity      Get activity log
```

#### Business Plans (`/api/business-plans/`)
```
POST   /api/business-plans/generate            Queue generation
GET    /api/business-plans                     List
GET    /api/business-plans/[id]                Get
PATCH  /api/business-plans/[id]                Update
POST   /api/business-plans/[id]/generate-pdf   Queue PDF
```

#### Deliverables (`/api/deliverables/`)
```
POST   /api/deliverables/generate              Queue generation
GET    /api/deliverables                       List
GET    /api/deliverables/[id]                  Get
PATCH  /api/deliverables/[id]                  Update
POST   /api/deliverables/[id]/generate-pdf     Queue PDF
```

#### File Management (`/api/files/`)
```
POST   /api/files/upload                       Upload
GET    /api/files                              List
GET    /api/files/[id]/download                Download
DELETE /api/files/[id]/delete                  Delete
```

#### Notes (`/api/notes/`)
```
POST   /api/notes                              Create
GET    /api/notes                              List
PATCH  /api/notes/[id]                         Update
DELETE /api/notes/[id]                         Delete
```

#### Job Queue (`/api/jobs/`)
```
POST   /api/jobs                               Enqueue
GET    /api/jobs                               List all
GET    /api/jobs/[id]                          Get status
PATCH  /api/jobs/[id]                          Retry job
```

#### Backups (`/api/backups/`)
```
POST   /api/backups                            Create manual
GET    /api/backups                            List
POST   /api/backups/[filename]/restore         Restore
DELETE /api/backups/[filename]                 Delete
POST   /api/backups/automated                  Automated (cron)
```

#### System (`/api/`)
```
GET    /api/auth/[...nextauth]                 NextAuth routes
GET    /api/health                             Health check
GET    /api/system/stats                       Server metrics
GET    /api/storage/stats                      Storage usage
```

### Response Format

All API endpoints return:
```typescript
{
  success: boolean
  data?: T                          // Response data
  error?: string                    // Error message
  message?: string                  // User-friendly message
  pagination?: {                    // For list endpoints
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
```

---

## Component Organization

### UI Components (`components/ui/`)

Base shadcn/ui components with Tailwind customization:
- **Forms**: button, input, label, checkbox, textarea
- **Feedback**: alert, alert-dialog, toast, toaster, progress
- **Containers**: card, dialog
- **Data**: badge, skeleton

### Layout Components (`components/layout/`)

**Sidebar** - Main navigation
- Dashboard, Clients, Files, Prompts, Jobs, Analytics, Settings
- Active route highlighting
- User logout button

**Header** - Top navigation
- Breadcrumbs
- User menu
- Dark mode toggle
- Notifications (optional)

### Content Editors (`components/editor/`)

**MarkdownEditor** - CodeMirror-based
- Syntax highlighting
- Line numbers
- Bracket matching
- Markdown-specific language support

**RichTextEditor** (in `/components/notes/`) - TipTap-based
- WYSIWYG formatting
- Bold, italic, underline, strikethrough
- Links, lists, code blocks
- Heading levels

### Specialized Components

**FileUpload** (`components/files/`)
- Drag-and-drop interface
- File preview
- Size validation
- Progress indication

**ErrorBoundary** (`components/error-boundary.tsx`)
- React error boundary wrapper
- Graceful error UI
- Error logging
- Recovery button

### Hooks (`hooks/`)

**useToast** - Toast notification hook
- Show success/error/info messages
- Auto-dismiss
- Queue management

---

## Key Patterns & Architecture

### 1. Route Groups

```
(auth)      → Public routes (login)
(dashboard) → Protected routes (require session)
```

Benefits: Separate layouts, clear organization, easy access control

### 2. Job Queue Processing

```
1. User triggers action (generate, backup)
2. API creates Job record in database
3. JobQueue.enqueue() adds to processing
4. Background processing picks up next job
5. executeJob() based on JobType
6. On success: store result, mark COMPLETED
7. On error: retry with exponential backoff
8. On max retries: mark FAILED
```

### 3. AI Generation Pipeline

```
1. Load YAML prompt template (cached)
2. Build context from client + previous docs
3. Render with Mustache {{variables}}
4. Call Claude API (streaming or full)
5. Save markdown to database
6. Create version record
7. Log activity
8. Queue PDF generation separately
```

### 4. PDF Generation Pipeline

```
1. Fetch markdown from database
2. Pandoc: Markdown → LaTeX
3. Apply Wavelaunch template
4. XeLaTeX compile: LaTeX → PDF
5. Output at DPI (150 draft, 300 final)
6. Save path to database
7. Log activity
```

### 5. Authentication & Authorization

```
1. POST /api/auth/[...nextauth] with credentials
2. Validate with CredentialsProvider
3. Compare password with bcrypt
4. Create JWT token on success
5. Set secure session cookie
6. Subsequent requests check session
7. Protected routes use auth() function
```

### 6. File Upload

```
1. Frontend: validate MIME + size
2. POST /api/files/upload with FormData
3. Backend: re-validate + check quota
4. Save to disk
5. Create File record
6. Return metadata
```

### 7. Soft Deletes

```
delete field:  deletedAt DateTime?
Query filter:  where: { deletedAt: null }
Recovery:      update deletes by setting deletedAt = null
Audit:         Activity log tracks deletions
```

### 8. Error Handling

```
Custom Error Classes:
- ValidationError
- AuthenticationError
- AuthorizationError
- NotFoundError
- ConflictError
- CapacityError

Global Response:
{
  success: false
  error: "User-friendly message"
  statusCode: HTTP status
}

UI Feedback:
- Toast notifications
- Error boundaries
- Fallback pages
```

---

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:push          # Sync schema to SQLite
pnpm db:seed          # Load test data

# Environment setup
cp .env.example .env.local
# Add: ANTHROPIC_API_KEY, NEXTAUTH_SECRET

# Start development
pnpm dev
```

Visit `http://localhost:3000`
Login: `admin@wavelaunch.studio` / `wavelaunch123`

### Available Scripts

```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm start            # Production server
pnpm lint             # ESLint check

pnpm test             # E2E tests (Playwright)
pnpm test:ui          # Interactive test runner
pnpm test:headed      # See browser during tests

pnpm db:push          # Sync schema
pnpm db:migrate       # Create migration
pnpm db:seed          # Seed database
pnpm db:studio        # Visual DB explorer
```

### Key Files to Review

1. `/README.md` - Project overview
2. `/prisma/schema.prisma` - Database schema
3. `/src/lib/jobs/queue.ts` - Job queue implementation
4. `/src/lib/ai/claude.ts` - Claude API integration
5. `/src/app/api/clients/route.ts` - Example API route
6. `/src/lib/auth/config.ts` - Authentication setup

### System Limits

- **Clients**: 100 max
- **Storage**: 50GB total
- **File Size**: 10MB per file
- **Job Retries**: 3 attempts with exponential backoff
- **Backup Retention**: 30 days
- **API Timeout**: 2 minutes

---

## Documentation References

- **README.md** - Project overview and features
- **docs/SETUP.md** - Detailed setup and deployment
- **docs/API.md** - API endpoint documentation
- **CODEBASE_STRUCTURE.md** - This file
- **prisma/schema.prisma** - Database model definitions

---

## Summary

WavelaunchOS CRM is a **production-ready, full-featured application** demonstrating:

- Modern Next.js 15 with App Router
- Full-stack TypeScript for type safety
- Comprehensive AI integration with Claude
- Robust background job processing
- Professional document generation (Markdown → PDF)
- Complete audit logging and activity tracking
- Secure authentication with NextAuth
- Extensive error handling and validation
- Production-grade database design

The architecture is **scalable**, **maintainable**, and **extensible** for future enhancements.

---

*Last Updated: 2025-11-14*
