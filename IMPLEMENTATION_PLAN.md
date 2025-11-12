# WavelaunchOS CRM - Implementation Plan

**Version:** 1.0
**Date:** November 12, 2025
**Timeline:** 8 Weeks (MVP Phase 1)
**Status:** Ready for Development

---

## Executive Summary

This implementation plan covers the complete 8-week MVP development of WavelaunchOS CRM, a local-first CRM with AI-powered document generation for Wavelaunch Studio's creator brand-building program.

**Key Objectives:**
- Local-first Next.js application with SQLite database
- AI-powered business plan and deliverable generation (Claude API)
- Professional PDF export via Pandoc/XeLaTeX with Wavelaunch branding
- Manage up to 100 creator clients with 8-month engagement cycles
- Complete MVP in 8 weeks following the PRD roadmap

**Success Criteria:**
- Setup time: <10 minutes for new developers
- Business plan generation: <2 minutes
- PDF quality: 300 DPI, consulting-grade
- AI output quality: ≥80% usable with <15 min editing

---

## I. Complete File Structure

```
wavelaunch-crm/
├── .env.local                          # Environment variables
├── .env.example                        # Template for env vars
├── .gitignore
├── next.config.js                      # Next.js configuration
├── tsconfig.json                       # TypeScript config
├── tailwind.config.ts                  # Tailwind + shadcn theme
├── postcss.config.js
├── package.json
├── pnpm-lock.yaml
├── docker-compose.yml                  # Docker setup for dev
├── Dockerfile
├── README.md                           # Setup instructions
│
├── prisma/
│   ├── schema.prisma                   # Database schema
│   ├── seed.ts                         # Seed data (demo user)
│   └── migrations/                     # Migration history
│
├── public/
│   ├── favicon.ico
│   └── wavelaunch-logo.png             # Branding
│
├── src/
│   ├── app/                            # Next.js 16 App Router
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Redirect to /dashboard
│   │   ├── globals.css                 # Global styles
│   │   │
│   │   ├── (auth)/                     # Auth routes
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx              # Auth layout (no sidebar)
│   │   │
│   │   ├── (dashboard)/                # Main app routes
│   │   │   ├── layout.tsx              # Dashboard layout (sidebar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Main dashboard
│   │   │   │
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx            # Client directory
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # Onboarding form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Client overview (redirect to /overview)
│   │   │   │       ├── overview/
│   │   │   │       │   └── page.tsx    # Overview tab
│   │   │   │       ├── business-plan/
│   │   │   │       │   ├── page.tsx    # Business plan tab
│   │   │   │       │   └── [planId]/
│   │   │   │       │       └── page.tsx # Edit business plan
│   │   │   │       ├── deliverables/
│   │   │   │       │   ├── page.tsx    # Deliverables timeline
│   │   │   │       │   └── [deliverableId]/
│   │   │   │       │       └── page.tsx # Edit deliverable
│   │   │   │       ├── files/
│   │   │   │       │   └── page.tsx    # Files library
│   │   │   │       └── notes/
│   │   │   │           └── page.tsx    # Notes tab
│   │   │   │
│   │   │   ├── files/
│   │   │   │   └── page.tsx            # Global files library
│   │   │   │
│   │   │   ├── prompts/
│   │   │   │   ├── page.tsx            # Prompt template manager
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Edit template
│   │   │   │
│   │   │   ├── jobs/
│   │   │   │   └── page.tsx            # Job queue monitor
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx            # Analytics dashboard
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx            # Settings page
│   │   │
│   │   └── api/                        # API routes
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts        # NextAuth handler
│   │       │
│   │       ├── health/
│   │       │   └── route.ts            # Health check
│   │       │
│   │       ├── clients/
│   │       │   ├── route.ts            # GET all, POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts        # GET, PATCH, DELETE
│   │       │       ├── activity/
│   │       │       │   └── route.ts    # GET activity log
│   │       │       ├── business-plans/
│   │       │       │   ├── route.ts    # GET all plans
│   │       │       │   └── generate/
│   │       │       │       └── route.ts # POST generate
│   │       │       └── deliverables/
│   │       │           ├── route.ts    # GET, POST
│   │       │           └── generate/
│   │       │               └── route.ts # POST generate next
│   │       │
│   │       ├── business-plans/
│   │       │   └── [id]/
│   │       │       ├── route.ts        # GET, PATCH
│   │       │       ├── pdf/
│   │       │       │   └── route.ts    # POST generate PDF
│   │       │       └── status/
│   │       │           └── route.ts    # PATCH status
│   │       │
│   │       ├── deliverables/
│   │       │   └── [id]/
│   │       │       ├── route.ts        # GET, PATCH
│   │       │       ├── pdf/
│   │       │       │   └── route.ts    # POST generate PDF
│   │       │       └── status/
│   │       │           └── route.ts    # PATCH status
│   │       │
│   │       ├── files/
│   │       │   ├── route.ts            # GET all, POST upload
│   │       │   └── [id]/
│   │       │       ├── route.ts        # GET download, DELETE
│   │       │       └── preview/
│   │       │           └── route.ts    # GET preview
│   │       │
│   │       ├── notes/
│   │       │   ├── route.ts            # POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts        # PATCH, DELETE
│   │       │       └── toggle-important/
│   │       │           └── route.ts    # POST toggle
│   │       │
│   │       ├── prompts/
│   │       │   ├── route.ts            # GET all templates
│   │       │   └── [id]/
│   │       │       ├── route.ts        # GET, PATCH
│   │       │       └── activate/
│   │       │           └── route.ts    # POST set active
│   │       │
│   │       ├── jobs/
│   │       │   ├── route.ts            # GET all jobs
│   │       │   └── [id]/
│   │       │       ├── route.ts        # GET job status
│   │       │       ├── cancel/
│   │       │       │   └── route.ts    # POST cancel
│   │       │       └── retry/
│   │       │           └── route.ts    # POST retry
│   │       │
│   │       ├── analytics/
│   │       │   ├── admin/
│   │       │   │   └── route.ts        # GET admin dashboard
│   │       │   └── clients/
│   │       │       └── [id]/
│   │       │           └── route.ts    # GET client analytics
│   │       │
│   │       ├── backup/
│   │       │   ├── create/
│   │       │   │   └── route.ts        # POST create backup
│   │       │   ├── list/
│   │       │   │   └── route.ts        # GET backups
│   │       │   └── restore/
│   │       │       └── route.ts        # POST restore
│   │       │
│   │       ├── settings/
│   │       │   ├── route.ts            # GET, PATCH
│   │       │   └── test-integration/
│   │       │       └── route.ts        # POST test API keys
│   │       │
│   │       └── system/
│   │           └── storage/
│   │               └── route.ts        # GET storage info
│   │
│   ├── components/                     # React components
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── alert.tsx
│   │   │   └── ... (other shadcn components)
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx             # Main navigation sidebar
│   │   │   ├── header.tsx              # Top header (user menu)
│   │   │   └── breadcrumbs.tsx         # Breadcrumb navigation
│   │   │
│   │   ├── clients/
│   │   │   ├── client-card.tsx         # Client directory card
│   │   │   ├── client-filters.tsx      # Search/filter controls
│   │   │   ├── onboarding-form.tsx     # Multi-step form
│   │   │   ├── client-tabs.tsx         # Client detail tabs
│   │   │   ├── activity-timeline.tsx   # Activity log
│   │   │   ├── client-summary.tsx      # Overview section
│   │   │   └── capacity-indicator.tsx  # X/100 clients
│   │   │
│   │   ├── business-plans/
│   │   │   ├── plan-list.tsx           # Version list
│   │   │   ├── plan-editor.tsx         # Markdown editor
│   │   │   ├── plan-status-badge.tsx   # Status indicator
│   │   │   ├── generate-plan-dialog.tsx # Generation modal
│   │   │   └── version-compare.tsx     # Compare versions
│   │   │
│   │   ├── deliverables/
│   │   │   ├── deliverable-timeline.tsx # M1-M8 timeline
│   │   │   ├── deliverable-card.tsx    # Month card
│   │   │   ├── deliverable-editor.tsx  # Markdown editor
│   │   │   ├── generate-deliverable-dialog.tsx
│   │   │   └── approval-workflow.tsx   # Approve/reject UI
│   │   │
│   │   ├── files/
│   │   │   ├── file-upload.tsx         # Drag-drop upload
│   │   │   ├── file-list.tsx           # File browser
│   │   │   ├── file-preview.tsx        # Preview modal
│   │   │   ├── file-filters.tsx        # Category filters
│   │   │   └── storage-indicator.tsx   # Storage usage
│   │   │
│   │   ├── notes/
│   │   │   ├── notes-list.tsx          # Note cards
│   │   │   ├── note-editor.tsx         # Rich text editor
│   │   │   └── important-toggle.tsx    # Star/unstar
│   │   │
│   │   ├── prompts/
│   │   │   ├── template-list.tsx       # Template cards
│   │   │   ├── template-editor.tsx     # YAML editor
│   │   │   ├── template-validator.tsx  # Validation UI
│   │   │   └── variable-helper.tsx     # Mustache vars
│   │   │
│   │   ├── jobs/
│   │   │   ├── job-list.tsx            # Job queue table
│   │   │   ├── job-status.tsx          # Status indicator
│   │   │   └── job-progress.tsx        # Progress bar
│   │   │
│   │   ├── analytics/
│   │   │   ├── metric-card.tsx         # Stat card
│   │   │   ├── admin-dashboard.tsx     # Admin overview
│   │   │   ├── client-charts.tsx       # Recharts visualizations
│   │   │   └── export-button.tsx       # CSV/PDF export
│   │   │
│   │   ├── ai/
│   │   │   ├── next-steps-panel.tsx    # AI suggestions
│   │   │   └── suggestion-card.tsx     # Suggestion item
│   │   │
│   │   ├── editors/
│   │   │   ├── markdown-editor.tsx     # CodeMirror wrapper
│   │   │   ├── rich-text-editor.tsx    # TipTap wrapper
│   │   │   └── auto-save-indicator.tsx # Save status
│   │   │
│   │   └── shared/
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       ├── empty-state.tsx
│   │       ├── confirmation-dialog.tsx
│   │       └── data-table.tsx          # Reusable table
│   │
│   ├── lib/                            # Business logic
│   │   ├── db.ts                       # Prisma client singleton
│   │   │
│   │   ├── ai/
│   │   │   ├── claude.ts               # Claude API client
│   │   │   ├── generate-business-plan.ts
│   │   │   ├── generate-deliverable.ts
│   │   │   ├── summarize-thread.ts
│   │   │   └── next-steps-engine.ts    # AI suggestions
│   │   │
│   │   ├── pdf/
│   │   │   ├── generator.ts            # Pandoc/XeLaTeX pipeline
│   │   │   ├── templates/
│   │   │   │   ├── wavelaunch.tex      # LaTeX template
│   │   │   │   └── wavelaunch.yaml     # Pandoc metadata
│   │   │   └── utils.ts                # Helper functions
│   │   │
│   │   ├── files/
│   │   │   ├── storage.ts              # File operations
│   │   │   ├── upload.ts               # Upload handler
│   │   │   ├── preview.ts              # Preview generator
│   │   │   └── cleanup.ts              # Temp file cleanup
│   │   │
│   │   ├── jobs/
│   │   │   ├── queue.ts                # Job queue implementation
│   │   │   ├── workers/
│   │   │   │   ├── generate-plan-worker.ts
│   │   │   │   ├── generate-deliverable-worker.ts
│   │   │   │   ├── generate-pdf-worker.ts
│   │   │   │   ├── backup-worker.ts
│   │   │   │   └── cleanup-worker.ts
│   │   │   └── scheduler.ts            # Cron jobs
│   │   │
│   │   ├── email/
│   │   │   ├── client.ts               # Email service
│   │   │   └── templates/
│   │   │       ├── welcome.tsx         # React Email templates
│   │   │       ├── plan-ready.tsx
│   │   │       ├── deliverable-approved.tsx
│   │   │       └── notification.tsx
│   │   │
│   │   ├── backup/
│   │   │   ├── create.ts               # Backup creation
│   │   │   ├── restore.ts              # Restore logic
│   │   │   ├── verify.ts               # Integrity check
│   │   │   └── cleanup.ts              # Auto-cleanup
│   │   │
│   │   ├── prompts/
│   │   │   ├── loader.ts               # Load YAML templates
│   │   │   ├── validator.ts            # Validate templates
│   │   │   ├── renderer.ts             # Mustache rendering
│   │   │   └── context-builder.ts      # Build client context
│   │   │
│   │   ├── auth/
│   │   │   ├── nextauth.ts             # NextAuth config
│   │   │   ├── credentials.ts          # Credential provider
│   │   │   └── middleware.ts           # Auth middleware
│   │   │
│   │   ├── utils/
│   │   │   ├── formatting.ts           # Date/number formatting
│   │   │   ├── validation.ts           # Common validators
│   │   │   ├── constants.ts            # App constants
│   │   │   └── errors.ts               # Custom error classes
│   │   │
│   │   └── analytics/
│   │       ├── admin.ts                # Admin metrics
│   │       ├── client.ts               # Client metrics
│   │       └── aggregations.ts         # Data aggregations
│   │
│   ├── hooks/                          # Custom React hooks
│   │   ├── use-clients.ts              # Client data fetching
│   │   ├── use-business-plans.ts
│   │   ├── use-deliverables.ts
│   │   ├── use-files.ts
│   │   ├── use-jobs.ts
│   │   ├── use-auto-save.ts            # Auto-save logic
│   │   ├── use-debounce.ts
│   │   └── use-toast.ts                # Toast notifications
│   │
│   ├── types/                          # TypeScript types
│   │   ├── client.ts
│   │   ├── business-plan.ts
│   │   ├── deliverable.ts
│   │   ├── file.ts
│   │   ├── job.ts
│   │   ├── prompt.ts
│   │   └── api.ts                      # API response types
│   │
│   ├── schemas/                        # Zod schemas
│   │   ├── client.ts                   # Client validation
│   │   ├── business-plan.ts
│   │   ├── deliverable.ts
│   │   ├── file.ts
│   │   ├── settings.ts
│   │   └── onboarding.ts               # Onboarding form
│   │
│   └── middleware.ts                   # Next.js middleware (auth)
│
├── data/                               # Application data (local)
│   ├── wavelaunch.db                   # SQLite database
│   ├── clients/                        # Client files
│   │   └── {clientId}/
│   │       └── files/                  # Uploaded files
│   ├── prompts/                        # YAML templates
│   │   ├── business-plan.yaml
│   │   ├── deliverable-m1.yaml
│   │   ├── deliverable-m2.yaml
│   │   └── ... (m3-m8)
│   ├── backups/                        # Database backups
│   └── temp/                           # Temporary files
│
├── skills/                             # Claude Skills (reference)
│   ├── wavelaunch-brand-guidelines/
│   │   ├── SKILL.md
│   │   └── wavelaunch-brand-guidelines-v4.skill
│   └── wavelaunch-studio-creator-docs/
│       ├── SKILL.md
│       └── wavelaunch-studio-creator-docs.skill
│
├── scripts/                            # Utility scripts
│   ├── setup-fonts.sh                  # Install XeLaTeX fonts
│   ├── seed-prompts.ts                 # Seed prompt templates
│   ├── migrate.ts                      # Database migrations
│   └── test-pdf-pipeline.ts            # Test PDF generation
│
└── docs/                               # Documentation
    ├── SETUP.md                        # Setup guide
    ├── API.md                          # API documentation
    ├── DEPLOYMENT.md                   # Deployment guide
    ├── SKILLS.md                       # Using Claude Skills
    └── TROUBLESHOOTING.md              # Common issues
```

---

## II. Week-by-Week Implementation Plan

### **Weeks 1-2: Core Infrastructure**

**Goal:** Developer can clone and run in <10 minutes

#### Week 1: Project Foundation

**Day 1-2: Project Setup**
- [ ] Initialize Next.js 16 with TypeScript, App Router
- [ ] Configure Tailwind CSS + shadcn/ui (New York theme)
- [ ] Setup ESLint, Prettier, Husky pre-commit hooks
- [ ] Create Docker Compose for development
- [ ] Configure environment variables (.env.example)
- [ ] Setup Git repository with .gitignore

**Day 3-4: Database Layer**
- [ ] Design Prisma schema (all models from PRD)
- [ ] Setup SQLite database at `/data/wavelaunch.db`
- [ ] Create initial migration
- [ ] Implement database service (`lib/db.ts`)
- [ ] Write seed script (demo admin user)
- [ ] Test migrations and seeding

**Day 5: Authentication**
- [ ] Setup NextAuth.js with credentials provider
- [ ] Implement login page (`app/(auth)/login`)
- [ ] Create auth middleware (`middleware.ts`)
- [ ] Hash passwords with bcrypt (12 rounds)
- [ ] Test authentication flow
- [ ] Session cookie configuration

#### Week 2: Dashboard Shell

**Day 1-2: Layout Components**
- [ ] Create dashboard layout (`app/(dashboard)/layout.tsx`)
- [ ] Build sidebar navigation component
- [ ] Build header with user menu
- [ ] Implement breadcrumbs
- [ ] Add dark/light mode toggle
- [ ] Responsive mobile menu

**Day 3: Main Dashboard**
- [ ] Create dashboard page (`app/(dashboard)/dashboard/page.tsx`)
- [ ] Add metric cards (clients, pending items)
- [ ] Add recent activity feed
- [ ] Add quick actions section
- [ ] Implement auto-refresh (5 min)

**Day 4: Health & Monitoring**
- [ ] Create health check endpoint (`/api/health`)
- [ ] Add storage monitoring endpoint (`/api/system/storage`)
- [ ] Create settings page shell
- [ ] Add system info display

**Day 5: Documentation & Testing**
- [ ] Write SETUP.md with installation instructions
- [ ] Test Docker Compose setup
- [ ] Verify <10 minute setup time
- [ ] Document environment variables
- [ ] Create troubleshooting guide

**Deliverables:**
- ✅ Working Next.js app with authentication
- ✅ Database schema with migrations
- ✅ Dashboard layout with sidebar
- ✅ <10 minute setup time verified

---

### **Weeks 3-4: Client Management**

**Goal:** Fully functional client management with capacity limits

#### Week 3: Client CRUD

**Day 1-2: Client API**
- [ ] Implement `/api/clients` (GET all, POST create)
- [ ] Implement `/api/clients/[id]` (GET, PATCH, DELETE)
- [ ] Create Zod validation schemas
- [ ] Add capacity validation (max 100 clients)
- [ ] Add duplicate email detection
- [ ] Write API tests

**Day 2-3: Onboarding Form**
- [ ] Create multi-step onboarding form
- [ ] Implement all required fields (11 fields)
- [ ] Implement all optional fields (18 fields)
- [ ] Add form validation (React Hook Form + Zod)
- [ ] Add progress indicator
- [ ] Auto-save to localStorage (draft recovery)
- [ ] Success modal with "View Profile" button

**Day 4-5: Client Directory**
- [ ] Create client directory page (`/clients`)
- [ ] Build client card component
- [ ] Implement search functionality
- [ ] Add filters (status, niche, onboarded date)
- [ ] Add sorting (name, date, status)
- [ ] Implement pagination (20 per page)
- [ ] Add capacity indicator (X/100)

#### Week 4: Client Detail Page

**Day 1-2: Client Profile**
- [ ] Create client detail layout with tabs
- [ ] Build Overview tab (summary, key info)
- [ ] Add client edit functionality
- [ ] Display client timeline
- [ ] Show next steps suggestions
- [ ] Add quick actions menu

**Day 3: Notes System**
- [ ] Implement notes API (`/api/notes`)
- [ ] Create rich text editor (TipTap)
- [ ] Add note list component
- [ ] Implement important/star toggle
- [ ] Add note search
- [ ] Test auto-save (30s interval)

**Day 4: Activity Log**
- [ ] Implement activity tracking middleware
- [ ] Create activity API (`/api/clients/[id]/activity`)
- [ ] Build activity timeline component
- [ ] Track events: created, updated, plan generated, etc.
- [ ] Add activity filters (type, date)
- [ ] Display user avatars/names

**Day 5: Testing & Polish**
- [ ] End-to-end test: onboard → view → edit → delete
- [ ] Test capacity limits (100 clients)
- [ ] Test duplicate email handling
- [ ] Test search performance
- [ ] Fix UI bugs and polish

**Deliverables:**
- ✅ Complete client onboarding flow
- ✅ Client directory with search/filter/sort
- ✅ Client detail page with notes and activity
- ✅ Max 100 clients enforced

---

### **Weeks 5-6: AI Business Plans**

**Goal:** Complete business plan generation with PDF export

#### Week 5: AI Infrastructure

**Day 1: Job Queue**
- [ ] Choose job queue implementation (BullMQ or file-based)
- [ ] Implement queue service (`lib/jobs/queue.ts`)
- [ ] Add job persistence (survive restarts)
- [ ] Implement retry logic (exponential backoff, max 3)
- [ ] Add concurrency limits (1 concurrent AI job)
- [ ] Create job monitoring API (`/api/jobs`)

**Day 2: Claude API Integration**
- [ ] Create Claude API client (`lib/ai/claude.ts`)
- [ ] Implement streaming support
- [ ] Add error handling (rate limits, timeouts)
- [ ] Add retry logic with exponential backoff
- [ ] Log API usage for cost tracking
- [ ] Test with sample prompts

**Day 3: Prompt Template System**
- [ ] Create YAML prompt structure
- [ ] Implement template loader (`lib/prompts/loader.ts`)
- [ ] Build Mustache renderer (`lib/prompts/renderer.ts`)
- [ ] Create context builder (client data → YAML)
- [ ] Add template validator
- [ ] Seed initial business plan template

**Day 4: Business Plan Generation**
- [ ] Create business plan API (`/api/clients/[id]/business-plans/generate`)
- [ ] Implement generation worker (`lib/jobs/workers/generate-plan-worker.ts`)
- [ ] Build job status polling system
- [ ] Add progress notifications (browser + in-app)
- [ ] Store generated Markdown in database
- [ ] Test full generation flow

**Day 5: Plan Editor**
- [ ] Create plan editor page (`/clients/[id]/business-plan/[planId]`)
- [ ] Implement Markdown editor (CodeMirror)
- [ ] Add live preview panel
- [ ] Implement auto-save (30s interval)
- [ ] Add save indicator
- [ ] Test editor performance

#### Week 6: PDF Generation & Workflow

**Day 1-2: PDF Pipeline**
- [ ] Install XeLaTeX and Pandoc (Docker image)
- [ ] Create LaTeX template (`lib/pdf/templates/wavelaunch.tex`)
- [ ] Implement PDF generator (`lib/pdf/generator.ts`)
- [ ] Add YAML frontmatter injection
- [ ] Test Markdown → PDF pipeline
- [ ] Verify 300 DPI output
- [ ] Apply Wavelaunch branding (colors, fonts, logo)

**Day 2-3: PDF Integration**
- [ ] Create PDF generation API (`/api/business-plans/[id]/pdf`)
- [ ] Implement PDF worker (`lib/jobs/workers/generate-pdf-worker.ts`)
- [ ] Store PDFs in `/data/clients/{clientId}/files/`
- [ ] Auto-categorize as BUSINESS_PLAN
- [ ] Add download button to UI
- [ ] Test full Markdown → PDF → download flow

**Day 4: Status Workflow**
- [ ] Implement status API (`/api/business-plans/[id]/status`)
- [ ] Add status badge component
- [ ] Build approval workflow UI
- [ ] Add status transitions: Draft → Pending → Approved → Delivered
- [ ] Email notifications on status change
- [ ] Track approval timestamps

**Day 5: Versioning & Testing**
- [ ] Implement version history
- [ ] Add "Regenerate" button (creates new version)
- [ ] Build version comparison UI
- [ ] Test: generate → edit → PDF → approve → deliver
- [ ] Test: regenerate with new version
- [ ] Performance test (generation time <2 min)

**Deliverables:**
- ✅ Claude API integration with job queue
- ✅ Business plan generation workflow
- ✅ Markdown editor with auto-save
- ✅ PDF export with Wavelaunch branding
- ✅ Version tracking and status workflow

---

### **Weeks 7-8: Deliverables & Polish**

**Goal:** Complete MVP with monthly deliverables, files, backup, AI next-steps

#### Week 7: Monthly Deliverables

**Day 1-2: Deliverable System**
- [ ] Create deliverables API (`/api/clients/[id]/deliverables`)
- [ ] Implement M1-M8 prompt templates (YAML)
- [ ] Build context-aware generation (includes previous months)
- [ ] Create deliverable timeline UI (M1-M8 cards)
- [ ] Add "Generate Next Deliverable" button
- [ ] Test sequential generation (M1 → M2 → M3)

**Day 2-3: Deliverable Editor**
- [ ] Create deliverable editor page
- [ ] Reuse Markdown editor + PDF pipeline
- [ ] Implement approval workflow (Draft → Pending → Approved → Delivered)
- [ ] Add rejection with reason
- [ ] Email notifications
- [ ] Test full M1-M8 lifecycle

**Day 4: Files Library**
- [ ] Create file upload API (`/api/files`)
- [ ] Implement drag-and-drop upload component
- [ ] Add file storage service (`lib/files/storage.ts`)
- [ ] Auto-categorize PDFs (Business Plan, Deliverable, Misc)
- [ ] Build file browser with filters
- [ ] Implement preview (PDF, images)
- [ ] Test file upload (max 10MB)

**Day 5: Storage Management**
- [ ] Add storage monitoring (50GB limit)
- [ ] Create storage indicator component
- [ ] Implement soft delete (deletedAt field)
- [ ] Add 30-day recovery window
- [ ] Create cleanup worker (delete old temp files)
- [ ] Test storage warnings (80% threshold)

#### Week 8: Backup & AI Features

**Day 1: Backup System**
- [ ] Implement backup service (`lib/backup/create.ts`)
- [ ] Add restore functionality (`lib/backup/restore.ts`)
- [ ] Create backup scheduler (daily at 2 AM)
- [ ] Add integrity verification
- [ ] Implement auto-cleanup (>30 days)
- [ ] Build backup UI in settings
- [ ] Test backup and restore flow

**Day 2: AI Next-Steps Engine**
- [ ] Create rules engine (`lib/ai/next-steps-engine.ts`)
- [ ] Define rules:
  - No plan → "Generate Business Plan"
  - M3 complete, M4 missing → "Generate M4"
  - Pending approval >7 days → "Follow up on approval"
- [ ] Add priority levels (High/Medium/Low)
- [ ] Build next-steps panel component
- [ ] Add quick action buttons
- [ ] Test suggestion accuracy

**Day 3: Settings & Configuration**
- [ ] Build settings page
- [ ] Add API key configuration (Claude, Resend)
- [ ] Add email settings (SMTP)
- [ ] Implement test integration buttons
- [ ] Add system info display
- [ ] Test settings save/load

**Day 4: Prompt Template Manager**
- [ ] Create prompt templates page (`/prompts`)
- [ ] Build YAML editor with syntax highlighting
- [ ] Add template validation UI
- [ ] Implement active template selection
- [ ] Add version history
- [ ] Test template editing and activation

**Day 5: Final Testing & Documentation**
- [ ] End-to-end test: full client lifecycle
  - Onboard → Generate plan → Edit → PDF → Approve
  - Generate M1 → Approve → M2 → M3 → ... → M8
  - Upload files → Preview → Download
  - Create backup → Restore
- [ ] Performance testing (response times)
- [ ] Security audit (input validation, auth)
- [ ] Write API documentation
- [ ] Update README with features
- [ ] Create deployment guide

**Deliverables:**
- ✅ Monthly deliverables system (M1-M8)
- ✅ Files library with upload/preview
- ✅ Database backup system
- ✅ AI next-steps suggestions
- ✅ Settings page
- ✅ Complete MVP ready for production

---

## III. Key Technical Decisions

### 1. Job Queue Implementation

**Options:**
- **BullMQ** (Redis-based): Production-grade, requires Redis
- **File-based queue**: Simpler, no Redis dependency, good for local-first

**Recommendation:** Start with file-based queue for MVP (simpler setup). Can migrate to BullMQ later if needed.

**Decision Point:** Week 5, Day 1

---

### 2. PDF Generation Strategy

**Options:**
- **Pandoc + XeLaTeX**: Recommended in PRD, consulting-grade output
- **Playwright HTML → PDF**: Alternative mentioned in brand guidelines
- **Hybrid**: Use both (XeLaTeX for main docs, Playwright for quick previews)

**Recommendation:** Use Pandoc + XeLaTeX as specified in PRD. Wavelaunch brand guidelines v4 uses HTML/CSS, but PRD explicitly requires XeLaTeX pipeline.

**Decision Point:** Week 6, Day 1

**Clarification Needed:** Should we integrate the HTML/CSS approach from brand-guidelines-v4.skill, or stick with XeLaTeX? The skill file suggests HTML/CSS is easier for Claude to work with.

---

### 3. Markdown Editor Choice

**Options:**
- **CodeMirror**: Powerful, customizable, good for technical users
- **TipTap**: Rich text with Markdown support, more user-friendly
- **React-Markdown-Editor-Lite**: Lightweight, split-pane preview

**Recommendation:** CodeMirror 6 with live preview for Markdown editing (aligns with PRD specification).

**Decision Point:** Week 5, Day 5

---

### 4. File Storage Location

**Options:**
- **Local filesystem** (`/data/clients/{id}/files/`): As specified in PRD
- **Database BLOBs**: Simpler backup, but size limitations
- **Object storage (future)**: S3-compatible for scaling

**Recommendation:** Local filesystem as specified. Easy to back up entire `/data` folder.

**Decision Point:** Week 1, Day 3

---

### 5. Email Service

**Options:**
- **Resend**: Modern, simple API, generous free tier
- **Nodemailer + SMTP**: Self-hosted, more control
- **Both**: Resend primary, SMTP fallback

**Recommendation:** Resend (mentioned in PRD). Add SMTP fallback in settings.

**Decision Point:** Week 6, Day 4

---

### 6. Real-time Job Updates

**Options:**
- **Server-Sent Events (SSE)**: Native, simple
- **WebSockets**: Bidirectional, more complex
- **Polling**: Simplest, less efficient

**Recommendation:** Start with polling (every 2 seconds during job execution). Can upgrade to SSE later if needed.

**Decision Point:** Week 5, Day 4

---

### 7. Claude Skills Integration

**Question:** How should Claude Skills be integrated into the CRM?

**Options:**
- **A. Manual upload**: Admin uploads .skill files via UI, system reads them
- **B. Pre-loaded**: Skills bundled in `/skills` directory, system loads on startup
- **C. API integration**: System passes skill content in Claude API requests
- **D. Reference only**: Skills are documentation, not runtime dependencies

**Clarification Needed:** PRD mentions "Claude Code should read these skills before implementing document generation features." This suggests skills are development references, not runtime dependencies.

**Recommendation:** Use skills as **development references** for building prompt templates. The YAML prompt templates we create should incorporate the frameworks and structures from the skills.

**Decision Point:** Week 5, Day 3

---

### 8. Prompt Template Variable System

**Question:** What variables should be available in Mustache templates?

**Recommendation:** Standard variables:
```yaml
# Client data
{{client_name}}
{{brand_name}}
{{email}}
{{niche}}
{{vision_statement}}
{{target_audience}}
{{demographics}}
{{pain_points}}
{{unique_value_props}}
{{brand_image}}
{{brand_personality}}
{{preferred_font}}
{{social_handles}}
{{goals}}

# Context (for deliverables)
{{previous_months_summary}}  # M1-M4 context for M5
{{current_month_number}}
{{month_title}}  # e.g., "Month 3: Market Entry Preparation"

# Metadata
{{generation_date}}
{{wavelaunch_studio}}
```

**Decision Point:** Week 5, Day 3

---

### 9. Authentication Strategy

**Question:** Single admin user or multi-user system?

**PRD Context:** "Primary User: Arunav and Wavelaunch Studio operations team"

**Recommendation:** Support multiple admin users (team members). Each user has:
- Email/password login
- Role: ADMIN (full access) or CLIENT (read-only, future use)
- Activity tracking (who generated what)

**Decision Point:** Week 1, Day 5

---

### 10. XeLaTeX Font Setup

**Question:** How to handle custom fonts (DM Sans, Lora) for PDF branding?

**Options:**
- **System fonts**: Install fonts on server, reference in LaTeX
- **Embedded fonts**: Bundle fonts in Docker image
- **Font fallbacks**: Use similar system fonts if custom unavailable

**Recommendation:**
1. Bundle DM Sans and Lora in Docker image
2. Install via script (`scripts/setup-fonts.sh`)
3. Reference in `wavelaunch.tex` template

**Decision Point:** Week 6, Day 1

---

## IV. Ambiguities & Questions

### Critical Questions Requiring Clarification

#### 1. Skills Integration Strategy

**Question:** Should the `.skill` files be:
- A) Loaded at runtime by the CRM for dynamic prompt generation?
- B) Used as development references to build static YAML prompt templates?
- C) Uploaded by admins via UI for customization?

**Impact:** Affects prompt template architecture (Week 5, Day 3)

**My Assumption:** Option B - Use skills as references to build initial YAML prompt templates. This aligns with PRD's "Claude Code should read these skills" (i.e., during development, not runtime).

---

#### 2. PDF Generation Approach

**Question:** Should we use:
- A) Pandoc + XeLaTeX (as specified in PRD)
- B) HTML/CSS + Playwright (as suggested in brand-guidelines-v4.skill)
- C) Both (different use cases)

**Context:**
- PRD specifies "Markdown → Pandoc → XeLaTeX → PDF"
- Brand guidelines v4 says "HTML/CSS works better because Claude is good at HTML"

**Impact:** PDF pipeline architecture (Week 6, Day 1)

**My Assumption:** Start with Pandoc + XeLaTeX per PRD. Can add HTML/CSS option later if needed.

---

#### 3. Document Generation Scope

**Question:** Should the CRM generate:
- A) Only business plans (initial onboarding document)
- B) Business plans + 40 monthly deliverables (from creator-docs skill)
- C) Business plans + simplified 8-month deliverables (M1-M8)

**Context:**
- PRD mentions "M1-M8" (8 deliverables)
- creator-docs skill describes "40 documents across 8 months" (5 per month)

**Impact:** Deliverables data model and UI (Week 7, Day 1)

**My Assumption:** Start with 8 deliverables (M1-M8), one per month. The "40 documents" in the skill are templates/options, not all generated for every client.

---

#### 4. Prompt Template Source

**Question:** Should YAML prompt templates be:
- A) Written from scratch based on general best practices
- B) Extracted from the creator-docs skill (40 document structures)
- C) Simplified versions of skill frameworks

**Impact:** Prompt quality and generation results (Week 5, Day 3)

**My Assumption:** Option C - Use skill frameworks as inspiration, but create simplified prompts that work within Claude API context limits (~200k tokens).

---

#### 5. Client Capacity Logic

**Question:** What happens at 100 clients?
- A) Hard block: Cannot create client #101
- B) Soft warning: Can proceed but not recommended
- C) Upgrade prompt: Contact team for expanded license

**Impact:** Client creation API validation (Week 3, Day 1)

**My Assumption:** Option A - Hard block with clear error message.

---

#### 6. File Storage Limits

**Question:** What happens at 50GB storage limit?
- A) Block uploads at 50GB
- B) Warning at 80% (40GB), block at 100%
- C) Auto-cleanup to reclaim space

**Impact:** File upload API and storage monitoring (Week 7, Day 5)

**My Assumption:** Option B - Warn at 80%, block at 100%.

---

#### 7. Backup Restoration Safety

**Question:** When restoring a backup:
- A) Create safety backup first (PRD mentions this)
- B) Require confirmation with timestamp verification
- C) Both A and B

**Impact:** Backup restore flow (Week 8, Day 1)

**My Assumption:** Option C - Both safety backup and confirmation.

---

#### 8. Activity Log Detail Level

**Question:** What events should be tracked?
- A) Everything (all CRUD operations)
- B) Key events only (created, plan generated, approved, delivered)
- C) Configurable per admin preference

**Impact:** Activity tracking middleware (Week 4, Day 4)

**My Assumption:** Option B - Key events only to avoid noise.

**Suggested Events:**
- CLIENT_CREATED
- CLIENT_UPDATED
- BUSINESS_PLAN_GENERATED
- BUSINESS_PLAN_APPROVED
- DELIVERABLE_GENERATED
- DELIVERABLE_APPROVED
- DELIVERABLE_DELIVERED
- FILE_UPLOADED
- NOTE_CREATED
- BACKUP_CREATED

---

#### 9. Email Notification Triggers

**Question:** Which events should trigger email notifications?
- A) All status changes
- B) Only client-facing events (plan ready, deliverable approved)
- C) Configurable in settings

**Impact:** Email service integration (Week 6, Day 4)

**My Assumption:** Option B for MVP, make configurable later.

**Suggested Emails:**
- Business plan generated (admin)
- Business plan approved (admin + future client notification)
- Deliverable ready for review (admin)
- Deliverable delivered (admin + future client notification)

---

#### 10. Next-Steps Engine Rules

**Question:** How aggressive should AI suggestions be?
- A) Show 1-3 high-priority suggestions per client
- B) Show all applicable suggestions (could be 5-10)
- C) Prioritize and show top 3, hide rest

**Impact:** Next-steps engine design (Week 8, Day 2)

**My Assumption:** Option C - Show top 3 by priority, allow "Show all" expansion.

---

### Non-Critical Questions (Can decide during development)

11. Should there be a "Demo Mode" with sample data?
12. Should PDF generation have quality options (draft/final)?
13. Should notes support tagging/categories?
14. Should activity log be exportable (CSV/PDF)?
15. Should there be keyboard shortcuts for common actions?
16. Should the editor support autosave conflict resolution (multiple tabs)?
17. Should file uploads support drag-and-drop from external sources?
18. Should the system support multi-language content (future)?
19. Should there be a "Preview" mode for templates before generation?
20. Should jobs have estimated completion times displayed?

---

## V. Technology Stack Summary

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.x
- **Component Library:** shadcn/ui (New York theme)
- **Rich Text Editor:** TipTap (for notes)
- **Markdown Editor:** CodeMirror 6
- **Charts:** Recharts
- **Icons:** Lucide React
- **Form Validation:** React Hook Form + Zod
- **State Management:** React Context + SWR (data fetching)

### Backend
- **Runtime:** Node.js 20+
- **API Routes:** Next.js API routes
- **Authentication:** NextAuth.js
- **Validation:** Zod schemas

### Data Layer
- **Database:** SQLite
- **ORM:** Prisma 5.x
- **File Storage:** Local filesystem
- **Backup:** SQLite backup + filesystem sync

### External Services
- **AI:** Claude API (claude-sonnet-4-20250514)
- **Email:** Resend (primary), Nodemailer (fallback)
- **PDF Generation:** Pandoc 3.x + XeLaTeX

### DevOps
- **Package Manager:** pnpm 8+
- **Containerization:** Docker + Docker Compose
- **Process Manager:** PM2 (production)
- **Version Control:** Git + GitHub

---

## VI. Risk Assessment

### High-Risk Items

#### 1. XeLaTeX PDF Generation Complexity
**Risk:** XeLaTeX setup and font configuration may be complex and brittle.

**Mitigation:**
- Bundle everything in Docker image
- Provide detailed troubleshooting guide
- Create test script to verify PDF pipeline
- Have HTML/CSS fallback option ready

**Timeline Impact:** Could add 2-3 days if issues arise

---

#### 2. Claude API Cost & Rate Limits
**Risk:** Generating 40-document sets per client could be expensive and hit rate limits.

**Mitigation:**
- Add cost estimation before generation
- Implement request throttling (1 concurrent AI job)
- Cache prompt templates
- Monitor API usage in dashboard

**Timeline Impact:** Low (built into job queue design)

---

#### 3. Prompt Template Quality
**Risk:** Generic prompts may not produce "consulting-grade" output per PRD requirements (≥80% usable).

**Mitigation:**
- Use skill frameworks as foundation
- Test with real creator data early
- Iterate on prompt quality in Week 5
- Budget time for prompt refinement

**Timeline Impact:** May need extra 1-2 days in Week 5

---

#### 4. File Storage at Scale
**Risk:** 100 clients × 8 months × 5MB avg = ~4GB. Business plans with images could exceed 50GB limit.

**Mitigation:**
- Implement storage monitoring early
- Add file compression for uploads
- Implement cleanup workers
- Warn users at 80% capacity

**Timeline Impact:** Low (monitoring built into Week 7)

---

#### 5. Auto-Save Conflicts
**Risk:** Multiple tabs editing same document could cause data loss.

**Mitigation:**
- Add "last saved by" timestamp
- Warn user if document changed since load
- Implement optimistic locking
- Add conflict resolution UI

**Timeline Impact:** Could add 1 day in Week 5-6

---

### Medium-Risk Items

6. **Docker Setup Complexity:** May take >10 minutes on slow machines
7. **Backup Restore Reliability:** Data integrity issues if restore fails mid-process
8. **Browser Notification Support:** May not work on all browsers
9. **Search Performance:** SQLite full-text search may be slow at scale
10. **Job Queue Persistence:** File-based queue may have race conditions

---

### Low-Risk Items

11. shadcn/ui component compatibility
12. NextAuth session management
13. Tailwind CSS build performance
14. Prisma migration reliability
15. Email delivery (using Resend)

---

## VII. Success Criteria

### MVP Completion Checklist

**Core Features:**
- [ ] Client onboarding with all 29 fields (11 required, 18 optional)
- [ ] Client directory with search, filter, sort (max 100)
- [ ] Business plan generation via Claude API (<2 min)
- [ ] Markdown editor with auto-save (30s)
- [ ] PDF export with Wavelaunch branding (300 DPI)
- [ ] Monthly deliverables (M1-M8) with context awareness
- [ ] File upload/download with preview (max 10MB)
- [ ] Storage monitoring (50GB limit, 80% warning)
- [ ] Database backup (daily, 30-day retention)
- [ ] Activity log tracking
- [ ] Notes system (rich text)
- [ ] AI next-steps suggestions
- [ ] Settings page (API keys, integrations)
- [ ] Prompt template manager (YAML)

**Technical Requirements:**
- [ ] Setup time <10 minutes
- [ ] Authentication with NextAuth
- [ ] API validation with Zod (all endpoints)
- [ ] Job queue with retry logic
- [ ] Auto-save (30s interval)
- [ ] Dark/light mode support
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Error handling (graceful degradation)

**Quality Metrics:**
- [ ] Business plan generation: <2 minutes
- [ ] PDF quality: 300 DPI, zero layout issues
- [ ] AI output: ≥80% usable with <15 min editing
- [ ] Zero data corruption (backup/restore tested)
- [ ] API response times: <500ms (excluding AI generation)

**Documentation:**
- [ ] SETUP.md with installation guide
- [ ] API.md with endpoint documentation
- [ ] DEPLOYMENT.md with production guide
- [ ] TROUBLESHOOTING.md with common issues
- [ ] README.md with feature overview

---

## VIII. Phase 2 Preview (Weeks 9-12)

**Not included in MVP, but important for planning:**

### Phase 2 Features
1. **Instantly.ai Integration** (Pending API research)
   - Email campaign sync
   - Thread auto-summarization
   - Auto-linking to clients
   - Campaign analytics dashboard

2. **Advanced Analytics**
   - Client KPI tracking
   - Revenue forecasting
   - Engagement metrics
   - Export to CSV/PDF

3. **Enhanced Notifications**
   - Browser push notifications
   - Email digests
   - Slack integration (optional)

**Prerequisites:**
- [ ] Complete MVP (Phase 1)
- [ ] Research Instantly.ai API documentation
- [ ] Confirm API access and pricing
- [ ] Test API endpoints in development

---

## IX. Next Steps

### Immediate Actions (Before Week 1)

1. **Confirm Technical Decisions**
   - Review Section III (Key Technical Decisions)
   - Answer critical questions in Section IV (Ambiguities)
   - Approve/modify recommendations

2. **Gather Assets**
   - Wavelaunch Studio logo (PNG, 150x60px for headers)
   - DM Sans font files (.ttf)
   - Lora font files (.ttf)
   - Brand color codes (confirm #0F1724, #FF6B6B)

3. **Setup Development Environment**
   - Install Docker Desktop
   - Install Node.js 20+
   - Install pnpm 8+
   - Setup IDE (VS Code recommended)

4. **Create Repository**
   - Initialize GitHub repository
   - Add collaborators
   - Setup branch protection (main branch)
   - Create project board for tracking

5. **Clarify Ambiguities**
   - Review all questions in Section IV
   - Provide answers/guidance
   - Document decisions

### Week 1 Kickoff

Once decisions are confirmed:
1. **Day 1:** Initialize Next.js project, setup Docker Compose
2. **Day 2:** Configure Tailwind + shadcn/ui, design Prisma schema
3. **Day 3:** First migration, seed database, test setup
4. **Day 4:** Implement authentication
5. **Day 5:** Build dashboard layout

**Expected Deliverable:** Working authenticated dashboard by end of Week 1

---

## X. Open Questions for Discussion

### Priority 1 (Must answer before Week 1)

1. **PDF Generation Strategy:** Pandoc+XeLaTeX or HTML/CSS+Playwright?
2. **Skills Integration:** Runtime or development reference?
3. **Document Scope:** 8 deliverables (M1-M8) or 40 documents (5 per month)?
4. **Multi-user Support:** Single admin or team access?

### Priority 2 (Must answer before Week 5)

5. **Prompt Template Source:** How much content to extract from creator-docs skill?
6. **Context Limits:** How much previous content to include in M5+ generation?
7. **Job Queue:** File-based or BullMQ?
8. **Real-time Updates:** Polling or SSE?

### Priority 3 (Can decide during development)

9. File storage cleanup strategy
10. Email notification triggers
11. Activity log detail level
12. Next-steps suggestion aggressiveness

---

## XI. Estimated Effort

**Total Development Time:** 8 weeks (320 hours)

**Breakdown:**
- Weeks 1-2 (Infrastructure): 80 hours
- Weeks 3-4 (Client Management): 80 hours
- Weeks 5-6 (AI + PDF): 80 hours
- Weeks 7-8 (Deliverables + Polish): 80 hours

**Team Size:** 1-2 full-time developers

**Realistic Buffer:** Add 10-15% for unexpected issues (1-2 extra days per 2-week sprint)

---

## XII. Conclusion

This implementation plan provides a comprehensive roadmap for building WavelaunchOS CRM MVP in 8 weeks. The plan follows the PRD specifications closely while identifying key technical decisions and ambiguities that need clarification.

**Strengths of this plan:**
- Clear week-by-week breakdown with daily tasks
- Complete file structure (easy to scaffold)
- Identified technical risks and mitigation strategies
- Explicit decision points with recommendations
- Success criteria for each phase

**Next Step:** Review this plan, answer the critical questions in Section IV, and approve the technical decisions in Section III. Once confirmed, we can begin Week 1 implementation immediately.

**Ready to build?** Let's start with Week 1-2 (Core Infrastructure) once you approve this plan.
