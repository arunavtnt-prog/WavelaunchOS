# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WavelaunchOS CRM** is a local-first, AI-powered Customer Relationship Management system for Wavelaunch Studio's creator brand-building program. Built with Next.js 15, React 19, Prisma, and SQLite, it manages creator clients through 8-month engagement cycles with AI-generated business plans and monthly deliverables.

## Development Commands

### Essential Commands

```bash
# Navigate to project directory
cd wavelaunch-crm

# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Database Commands

```bash
# Generate Prisma client (run after schema changes)
npm run db:generate

# Push schema to database without migration
npm run db:push

# Create and apply migration
npm run db:migrate

# Seed database with demo data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Testing Individual Features

The application doesn't have a formal test suite yet. To test features:

1. **Authentication**: Navigate to `/login` and use credentials from seed data or environment variables
2. **Client Management**: Create a new client via `/clients/new`, then verify in client directory
3. **AI Generation**: Ensure `ANTHROPIC_API_KEY` is set, then test business plan generation from client detail page
4. **PDF Export**: Generate a business plan first, then use the PDF export button
5. **File Upload**: Navigate to Files tab for any client and test drag-drop or file selection

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, NextAuth.js v5
- **Database**: SQLite with Prisma ORM
- **AI**: Anthropic Claude API for document generation
- **Rich Text**: TipTap for notes, CodeMirror for markdown editing
- **PDF**: Pandoc + XeLaTeX pipeline (not yet fully implemented)

### Key Architectural Patterns

#### 1. Next.js App Router Structure

```
wavelaunch-crm/src/app/
├── (auth)/              # Grouped route - authentication (no sidebar)
│   └── login/           # Login page
├── (dashboard)/         # Grouped route - main app (with sidebar)
│   ├── dashboard/       # Main dashboard
│   ├── clients/         # Client management
│   │   ├── new/         # Onboarding form
│   │   └── [id]/        # Dynamic client detail pages
│   ├── files/           # Global file management
│   ├── jobs/            # Job queue monitoring
│   └── settings/        # Settings & monitoring
└── api/                 # API routes (RESTful endpoints)
    ├── auth/            # NextAuth handlers
    ├── clients/         # Client CRUD
    ├── business-plans/  # Business plan operations
    ├── deliverables/    # Deliverable operations
    └── ...
```

**Important**: Routes in parentheses `(auth)` and `(dashboard)` are **route groups** - they don't affect the URL structure but allow different layouts.

#### 2. Database Architecture (Prisma)

Core models and relationships:

- **User**: Authentication, activity tracking
- **Client**: Creator profiles with comprehensive onboarding data (29 fields)
- **BusinessPlan**: AI-generated business plans with versioning and workflow status
- **Deliverable**: Monthly deliverables (M1-M8) with parent-child relationships
- **File**: File uploads with categorization and soft delete
- **Note**: Rich text internal notes
- **Job**: Async job queue for AI generation and PDF export
- **Activity**: Audit log for all major operations

**Key relationships**:
- One Client → Many BusinessPlans (versioning support)
- One Client → Many Deliverables (M1-M8)
- One Deliverable → Many Deliverables (subdocuments via `parentId`)
- All major entities → soft delete via `deletedAt`

**Database location**: `wavelaunch-crm/data/wavelaunch.db` (SQLite)

#### 3. Authentication Pattern

Uses **NextAuth.js v5** with:
- JWT-based sessions (not database sessions)
- Credentials provider (email/password)
- bcryptjs for password hashing
- Middleware-based route protection (`src/middleware.ts`)

**Session access**:
```typescript
import { auth } from '@/lib/auth'

// In server components or API routes
const session = await auth()
if (!session) { /* redirect to login */ }
```

#### 4. AI Integration Pattern

**Claude API Integration**:
- Singleton `ClaudeClient` class in `src/lib/ai/claude.ts`
- Job queue for async processing (`src/lib/jobs/queue.ts`)
- YAML-based prompt templates with Mustache variables
- Context builder assembles client data for prompts

**Generation workflow**:
1. User triggers generation → Job created with status `QUEUED`
2. Worker picks up job → status becomes `PROCESSING`
3. Claude API called with prompt template + client context
4. Response stored as Markdown → status becomes `COMPLETED` or `FAILED`
5. UI polls job status every 2 seconds during generation

**Prompt template variables** (available in YAML templates):
```yaml
{{client_name}}
{{brand_name}}
{{niche}}
{{vision_statement}}
{{target_audience}}
{{pain_points}}
# ... and all other client fields
```

#### 5. API Route Pattern

All API routes follow RESTful conventions:

```typescript
// GET /api/clients - List all clients
// POST /api/clients - Create client
// GET /api/clients/[id] - Get single client
// PATCH /api/clients/[id] - Update client
// DELETE /api/clients/[id] - Delete client (soft delete)
```

**Request validation**: All routes use Zod schemas from `src/schemas/`

**Error handling**: Standard HTTP status codes with JSON error responses

#### 6. Component Architecture

```
src/components/
├── ui/              # shadcn/ui primitives (button, card, input, etc.)
├── layout/          # App shell (sidebar, header, breadcrumbs)
├── clients/         # Client-specific components
├── business-plans/  # Business plan components
├── deliverables/    # Deliverable components
└── shared/          # Reusable components
```

**Pattern**:
- UI primitives are from shadcn/ui (customizable, not a package)
- Business logic lives in custom hooks (`src/hooks/`)
- Server components for data fetching, client components for interactivity

#### 7. File Storage Pattern

- **Database**: `wavelaunch.db` at `wavelaunch-crm/data/wavelaunch.db`
- **Uploaded files**: Stored in filesystem with metadata in database
- **PDF exports**: Generated and stored alongside uploaded files
- **Backups**: Automated database backups in `wavelaunch-crm/data/backups/`

#### 8. Job Queue Pattern

Simple file-based job queue (no Redis required):

```typescript
// Job types
GENERATE_BUSINESS_PLAN
GENERATE_DELIVERABLE
GENERATE_PDF
BACKUP_DATABASE
CLEANUP_FILES

// Job statuses
QUEUED → PROCESSING → COMPLETED/FAILED/CANCELLED
```

**Retry logic**: Max 3 attempts with exponential backoff

**Concurrency**: Limited to 1 concurrent AI generation job to manage API rate limits

## Important Development Notes

### When Working with Database

1. **After modifying `schema.prisma`**:
   ```bash
   npm run db:generate  # Generate Prisma client types
   npm run db:push      # Apply to database (dev)
   # OR
   npm run db:migrate   # Create migration (production)
   ```

2. **Prisma client singleton**: Always import from `@/lib/db`:
   ```typescript
   import { db } from '@/lib/db'
   // NOT: import { PrismaClient } from '@prisma/client'
   ```

3. **Soft deletes**: Never hard delete. Set `deletedAt`:
   ```typescript
   await db.client.update({
     where: { id },
     data: { deletedAt: new Date() }
   })
   ```

### When Working with Authentication

1. **Protecting routes**: Middleware handles this automatically for all non-public routes
2. **Getting current user** in API routes:
   ```typescript
   import { auth } from '@/lib/auth'

   const session = await auth()
   const userId = session?.user?.id
   ```

3. **Environment variables required**:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
   ```

### When Working with AI Generation

1. **Required environment variable**: `ANTHROPIC_API_KEY`
2. **Prompt templates**: Located in `wavelaunch-crm/prompts/` (YAML format)
3. **Testing**: Always test with a real client to ensure context building works
4. **Cost management**: Each business plan generation costs ~$0.30-0.50. Monitor usage in jobs table.

### When Working with Components

1. **shadcn/ui components**: Add new components via:
   ```bash
   npx shadcn@latest add <component-name>
   ```
   This installs source code in `src/components/ui/`, not as a package dependency.

2. **Styling**: Use Tailwind utility classes. Theme configured in `tailwind.config.js`
3. **Icons**: Import from `lucide-react`
4. **Forms**: Use React Hook Form + Zod schemas from `src/schemas/`

### Path Aliases

TypeScript is configured with path alias `@/*` → `src/*`:

```typescript
import { db } from '@/lib/db'           // ✓ Correct
import { db } from '../../../lib/db'    // ✗ Avoid
```

### Environment Variables

Required `.env` variables (see `.env.example`):

```bash
# Database
DATABASE_URL="file:./data/wavelaunch.db"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<your-secret>"

# AI Integration
ANTHROPIC_API_KEY="<your-api-key>"

# Optional: Email
RESEND_API_KEY="<your-api-key>"

# Optional: Storage limits
MAX_FILE_SIZE_MB=10
STORAGE_LIMIT_GB=50
```

## Common Development Workflows

### Adding a New Feature

1. **Plan the data model**: Update `prisma/schema.prisma` if needed
2. **Create migration**: `npm run db:migrate`
3. **Add Zod schema**: Create validation schema in `src/schemas/`
4. **Build API route**: Create endpoint in `src/app/api/`
5. **Create UI components**: Build in appropriate `src/components/` subfolder
6. **Add to navigation**: Update sidebar in `src/components/layout/sidebar.tsx`

### Debugging Database Issues

```bash
# Open Prisma Studio to inspect data
npm run db:studio

# Check SQLite database directly
cd wavelaunch-crm/data
sqlite3 wavelaunch.db
.tables
.schema clients
SELECT * FROM clients;
```

### Debugging AI Generation

1. Check job status in database or `/jobs` page
2. Review error logs in job record
3. Test prompt template rendering in `src/lib/prompts/context-builder.ts`
4. Verify API key is set correctly

### Working with File Uploads

- Max file size: 10MB (configurable via `MAX_FILE_SIZE_MB`)
- Accepted formats: All files accepted, but PDFs are auto-categorized
- Storage limit: 50GB total (configurable via `STORAGE_LIMIT_GB`)
- File deletion: Soft delete with 30-day recovery window

## Implementation Status

**Current Layer**: Layer 10 - Settings & Monitoring (91% complete)

**Completed features**:
- ✅ Authentication & user management
- ✅ Client CRUD with comprehensive onboarding
- ✅ AI-powered business plan generation
- ✅ Monthly deliverables (M1-M8)
- ✅ Rich text notes (TipTap editor)
- ✅ File management with upload/download
- ✅ Job queue for async processing
- ✅ Database backup system
- ✅ Settings & monitoring dashboard

**Known limitations**:
- PDF generation pipeline (Pandoc + XeLaTeX) not fully implemented
- Email notifications not configured (requires Resend API key)
- No formal test suite yet
- Analytics dashboard is basic

## Code Style & Conventions

1. **TypeScript**: Strict mode enabled. All new code should be typed.
2. **Components**: Prefer function components with hooks
3. **Naming**:
   - Files: kebab-case (`client-card.tsx`)
   - Components: PascalCase (`ClientCard`)
   - Functions: camelCase (`generateBusinessPlan`)
4. **Imports**: Use path aliases (`@/`) and organize imports (types, libs, components)
5. **Error handling**: Always handle errors gracefully with user-friendly messages
6. **Validation**: All user input must be validated with Zod schemas

## Getting Help

- **Setup issues**: Refer to IMPLEMENTATION_PLAN.md for detailed setup instructions
- **Architecture questions**: Review PRD.md for product requirements and design decisions
- **Database schema**: Check `prisma/schema.prisma` for complete data model
- **API endpoints**: All routes documented in their respective `route.ts` files
