
```markdown
# WavelaunchOS CRM - Product Requirements Document

**Version:** 2.1  
**Date:** November 12, 2025  
**Product Owner:** Arunav, Wavelaunch VC  
**Status:** Ready for Development

---

## Overview

### What It Solves

WavelaunchOS is a local-first CRM and brand-building operating system for Wavelaunch Studio, which partners with creators/influencers to launch their own brands. It consolidates client onboarding, AI-powered document generation, communication tracking, and project management into a single local application.

**Current Problem:** Manual creation of business plans and monthly deliverables takes days per document across fragmented tools.

**Solution:** Automate document generation using Claude API (≥70% time reduction), centralize operations in an offline-capable local application, deliver consulting-grade outputs with professional PDF branding.

**Templates & Framework:** Provided by Arunav via Claude Skills (.skill files) located in `/skills/` directory.

### Primary User

Arunav and Wavelaunch Studio operations team managing up to 100 concurrent creator clients.

**Goals:**
- Efficiently manage 100 creator relationships
- Generate high-quality documents in minutes (not days)
- Track campaign performance and client growth
- Maintain organized communications
- Minimize manual work

**Usage Patterns:**
- Daily: Dashboard check, review pending deliverables, respond to communications
- Weekly: Onboard clients, generate business plans, update KPIs
- Monthly: Generate deliverables, export reports, review analytics

---

## Core Features (MVP - Phase 1)

### 1. Client Management & Onboarding

**Functionality:** Dynamic onboarding form, searchable client directory, detailed profiles with activity timelines, rich note-taking.

**How it Works:**
- Public onboarding form (see questions below)
- Auto-generated client summary
- Directory with search/filter/sort (max 100 clients)
- Client detail page with tabs: Overview, Business Plan, Deliverables (M1-M8), Files, Notes
- Activity log auto-tracks interactions
- Rich text notes

**Onboarding Form Fields:**
```
REQUIRED:
- Full Name*
- Email*
- Vision for this venture*
- Target industry/niche*
- Target audience description*
- Demographic profile (age, gender, location, interests)*
- Key audience pain points*
- Unique value proposition (USPs)*
- Target demographic age*
- Brand image description*
- Brand personality (word groups)*
- Preferred brand font*

OPTIONAL:
- Professional career milestones
- Personal career turning points
- Competitive differentiation strategy
- Emerging/disruptive competitors
- Inspiration brands/influencers
- Branding aesthetics preferences
- Emotions brand should evoke
- Scaling goals
- Growth strategies/channels
- Long-term brand evolution vision
- Additional relevant information
- Specific deadlines/milestones
- Current audience acquisition channels
- Audience gender split
- Audience marital status
- Brand values/principles
```

### 2. AI-Powered Business Plan Generation

**Functionality:** One-click generation using Claude API. Generates Markdown with YAML frontmatter, exports to branded PDFs via XeLaTeX.

**How it Works:**
- Admin clicks "Generate Business Plan" on client page
- System loads client data into YAML prompt template
- Claude API generates Markdown asynchronously (job queue)
- Content appears in Markdown editor (auto-save every 30s)
- Export to PDF: Markdown → Pandoc → XeLaTeX → branded PDF
- Version tracking stores iterations
- Status workflow: Draft → Pending Review → Approved → Delivered

**PDF Pipeline:**
```
Client Data → Claude API (Markdown) 
  → YAML frontmatter injection 
  → Pandoc --pdf-engine=xelatex --template=wavelaunch.tex 
  → Professional PDF (Wavelaunch branding)
```

### 3. Monthly Deliverables System (M1-M8)

**Functionality:** Manages 8-month engagement with context-aware generation. Each month's prompt includes previous months' context.

**Month Structure:**
- M1: Discovery & Strategy
- M2: Brand Foundation
- M3-M8: Execution phases

**How it Works:**
- Deliverables tab shows M1-M8 timeline
- "Generate Next Deliverable" creates sequential month
- M5 prompt includes M1-M4 context automatically
- Same editing, versioning, PDF export as business plans
- Approval workflow: Draft → Pending → Approved → Delivered
- Status tracking with email notifications

### 4. Files Library & Document Management

**Functionality:** Centralized storage with upload, preview, search, categorization. Auto-organizes PDFs plus manual uploads.

**How it Works:**
- Files stored locally: `/data/clients/{clientId}/files/`
- Drag-and-drop upload (max 10MB per file)
- Auto-categorization: Business Plans, Deliverables, Miscellaneous
- Search by filename, filter by client/type/date
- Preview PDFs and images in-app
- Soft delete with 30-day recovery
- Storage monitoring: 50GB total, warning at 80%
- Auto-cleanup temp files >7 days old

### 5. Prompt Template Manager

**Functionality:** YAML-based system for managing Claude API prompts. Customize without code changes.

**How it Works:**
- Templates stored as YAML in `/data/prompts/`
- Web UI with syntax highlighting
- Mustache variables: `{{client_name}}`
- Template validation (required fields, valid YAML)
- Version history
- Active template selection per type (business plan, M1-M8)

### 6. Analytics Dashboard

**Functionality:** Admin dashboard showing system overview and client metrics.

**Displayed Metrics:**
- System Overview: Client count (X/100), pending deliverables, storage usage
- Client Progress: Deliverables completed (X/8), plan status
- Activity Summary: Recent generations, file uploads

**How it Works:**
- Card layout (shadcn reference style)
- Metric cards with trend indicators
- Time filters: 7 days, 30 days, 3 months
- Visual charts (Recharts)
- Auto-refresh every 5 minutes

### 7. AI Next-Steps Engine

**Functionality:** Context-aware task suggestions based on client state.

**How it Works:**
- Rules engine analyzes client state
- Suggests: "Generate M3," "Follow up on pending approval," etc.
- Priority levels: High/Medium/Low
- Appears on client pages and dashboard
- Quick action buttons
- Dismiss/complete tracking

### 8. PDF Export System

**Functionality:** Generates consulting-grade PDFs via XeLaTeX pipeline.

**Branding Specs:**
- Colors: #0F1724 (dark), #FF6B6B (accent)
- Fonts: DM Sans (headings/body), Lora (optional serif)
- Components: Logo, cover page, TOC, headers/footers
- Output: 300 DPI (print-ready)

**Implementation:**
- Markdown → Pandoc → XeLaTeX
- Custom Wavelaunch LaTeX template
- Template caching for performance
- Async generation via job queue
- Auto-stored in client files

### 9. Backup & Recovery System

**Functionality:** Automated daily database backups with restore capability.

**How it Works:**
- Scheduled job: Daily at 2 AM
- Timestamped backups: `/data/backups/`
- Integrity verification after each backup
- Auto-cleanup: Delete backups >30 days old
- Manual backup in Settings
- Restore UI with file selection
- Pre-restore safety backup

---

## Phase 2 Features (Weeks 9-12)

### 10. Chat Inbox & Email Integration (PENDING RESEARCH)

**Functionality:** Integrate with Instantly.ai to auto-ingest email campaign threads, generate AI summaries, link conversations to clients.

**Status:** Phase 2 - pending Instantly.ai API research for feasibility.

**Proposed Implementation (if feasible):**
- Background sync every 15 minutes
- AI summarizes threads (topic, action items, sentiment)
- Auto-links threads to clients by email/content
- Searchable inbox with thread viewer
- Graceful degradation: cached data when API unavailable

**Alternative:** Embed Instantly website in CRM iframe for direct access.

### 11. Campaign Analytics Integration

**Functionality:** Display Instantly.ai campaign metrics in dashboard.

**Metrics:**
- Reply rate
- Opportunities ($$$)
- Conversions
- Warm leads

**Status:** Phase 2 - dependent on Instantly.ai API research.

---

## User Flows

### Flow 1: Onboarding New Client

1. Admin clicks "New Client" from dashboard
2. Onboarding form appears (required fields marked)
3. Admin fills fields with validation
4. Click "Create Client"
5. System creates record, auto-generates summary
6. Success message with "View Profile" button
7. Client appears in directory

**Edge Cases:**
- 100 client limit → Error message
- Duplicate email → Warning with proceed/cancel
- Incomplete form → Field-level validation errors

### Flow 2: Generate Business Plan

1. Navigate to client detail page
2. Click "Generate Business Plan" on Business Plan tab
3. Modal shows prompt preview
4. Click "Generate"
5. Progress indicator with live updates
6. Async job queued
7. Notification when complete (browser notification + in-app)
8. Markdown editor opens with content
9. Admin reviews/edits (auto-save 30s)
10. Click "Generate PDF"
11. PDF pipeline executes
12. PDF stored, download link shown

**Alternative:** Click "Regenerate" for new version

### Flow 3: Monthly Deliverable Workflow

1. Navigate to client Deliverables tab
2. Timeline shows M1-M3 complete, M4 in progress
3. Click "Generate Next Deliverable" (M5)
4. System loads M5 prompt with M1-M4 context
5. Generation begins
6. Review/edit M5 content
7. Click "Submit for Review" → Status: Pending
8. Internal review
9. Click "Approve" → Status: Approved
10. Click "Generate PDF"
11. Click "Mark as Delivered"
12. Status: Delivered with timestamp

**Alternative:** Rejection requires reason, loops back to editing

### Flow 4: Finding Files

1. Admin needs specific client's business plan
2. Opens Files Library
3. Filters: Client = "X", Category = "Business Plans"
4. Results show versions with dates
5. Preview in modal
6. Download or copy link

---

## Technical Architecture

### System Components

**Frontend:**
- Next.js 16 (App Router), TypeScript, React 18+
- Tailwind CSS + shadcn/ui components
- TipTap (rich text editor)
- CodeMirror (Markdown editor with preview)
- Recharts (charts)
- Lucide React (icons)
- React Hook Form + Zod validation

**Backend:**
- Node.js via Next.js API routes
- NextAuth.js (authentication)
- Zod schemas (all endpoints)
- Services:
  - Database Service (`/lib/db`) - Prisma client
  - AI Service (`/lib/ai`) - Claude API wrapper
  - PDF Service (`/lib/pdf`) - Pandoc/XeLaTeX pipeline
  - File Service (`/lib/files`) - Upload/storage
  - Email Service (`/lib/email`) - Resend/Nodemailer
  - Backup Service (`/lib/backup`) - Database backup/restore

**Data Layer:**
- Database: SQLite + Prisma ORM at `/data/wavelaunch.db`
- File Storage: Local filesystem `/data/clients/{id}/files/`
- Config: Environment variables + YAML prompts
- Backups: `/data/backups/` (30-day retention)

**Job Queue:**
- Implementation: File-based persistent queue or BullMQ
- Job Types: generate-business-plan, generate-deliverable, generate-pdf, summarize-thread, backup-db
- Features: Persistence, retry (exponential backoff, max 3), status tracking, concurrency limits

**External Integrations:**
- **Claude API:** Document generation (model: `claude-sonnet-4-20250514`)
- **Instantly.ai:** (Phase 2, pending research)
- **Email:** Resend or Nodemailer

### Data Models (Prisma Schema)

**Core Entities:**
```
User {
  id, email, passwordHash, name, role (ADMIN/CLIENT)
}

Client {
  id, creatorName, brandName, email, status (ACTIVE/INACTIVE),
  niche, goals, socialHandles (JSON), onboardedAt,
  visionStatement, targetAudience, demographics, painPoints,
  uniqueValueProps, brandImage, brandPersonality, preferredFont
}

BusinessPlan {
  id, clientId, version, 
  status (DRAFT/PENDING_REVIEW/APPROVED/DELIVERED),
  contentMarkdown, pdfPath, generatedBy, approvedAt
}

Deliverable {
  id, clientId, month (1-8), title, status,
  contentMarkdown, pdfPath, rejectionReason
}

File {
  id, clientId, filename, filepath, filesize, mimetype,
  category (BUSINESS_PLAN/DELIVERABLE/UPLOAD),
  uploadedBy, deletedAt (soft delete)
}

PromptTemplate {
  id, name, type (BUSINESS_PLAN/DELIVERABLE_M1-M8),
  yamlPath, isActive
}

Job {
  id, type, status (QUEUED/PROCESSING/COMPLETED/FAILED),
  payload (JSON), attempts, result, error
}

Note {
  id, clientId, content, isImportant, authorId
}

Activity {
  id, clientId, type (CLIENT_CREATED/PLAN_GENERATED/etc),
  description, metadata (JSON)
}

BackupLog {
  id, filename, filepath, filesize,
  status (SUCCESS/FAILED), verified
}
```

**Relationships:**
- Client → One-to-Many → BusinessPlans, Deliverables, Files, Notes, Activities
- User → One-to-Many → BusinessPlans (generatedBy), Files (uploadedBy)

### API Routes

**Auth:**
- `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`

**Clients:**
- `/api/clients` (GET, POST)
- `/api/clients/:id` (GET, PATCH, DELETE)
- `/api/clients/:id/activity` (GET)

**Business Plans:**
- `/api/clients/:clientId/business-plans` (GET)
- `/api/clients/:clientId/business-plans/generate` (POST)
- `/api/business-plans/:id` (GET, PATCH)
- `/api/business-plans/:id/pdf` (POST)
- `/api/business-plans/:id/status` (PATCH)

**Deliverables:**
- `/api/clients/:clientId/deliverables` (GET, POST)
- `/api/deliverables/:id` (GET, PATCH)
- `/api/deliverables/:id/pdf` (POST)
- `/api/deliverables/:id/status` (PATCH)

**Files:**
- `/api/files` (GET, POST upload)
- `/api/files/:id` (GET download, PATCH, DELETE)

**Analytics:**
- `/api/analytics/admin` (GET)
- `/api/analytics/clients/:id` (GET)

**Prompts:**
- `/api/prompts` (GET)
- `/api/prompts/:id` (GET, PATCH)

**Jobs:**
- `/api/jobs` (GET)
- `/api/jobs/:id` (GET, cancel, retry)

**System:**
- `/api/health` (GET)
- `/api/system/storage` (GET)
- `/api/backup/create` (POST)
- `/api/backup/list` (GET)
- `/api/backup/restore` (POST)

**Settings:**
- `/api/settings` (GET, PATCH)
- `/api/settings/test-integration` (POST)

### Infrastructure

**Development:**
- Hardware: 16GB+ RAM, 100GB+ disk
- Software: Node.js 20+, pnpm 8+, XeLaTeX (`texlive-xetex`), Pandoc 3.x, Docker/Compose
- Setup: <10 minutes

**Production (Local):**
- Hardware: Mac Mini or similar, 32GB RAM, 256GB+ SSD
- Software: Node.js 20+, PM2/systemd, XeLaTeX, Pandoc
- Deployment: `pnpm build && pnpm start`
- Access: `http://localhost:3000` or `http://{local-ip}:3000`

**Security:**
- Database file permissions (owner-only)
- API keys in env vars
- Password hashing (bcrypt, 12 rounds)
- HTTP-only session cookies
- Input validation (Zod)
- HTTPS (self-signed cert for local)

---

## Design System

**Reference:** shadcn/ui v4 dashboard  
- Demo: https://ui.shadcn.com/view/new-york-v4/dashboard-01
- GitHub: https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard

**Theme:** Default (supports dark/light mode toggle)

**Typography:**
- **DM Sans:** UI, body text, headings, documents
- **Lora:** Optional serif for document accents

**Colors:**
- Primary Dark: #0F1724
- Accent Red: #FF6B6B
- shadcn default palette for UI components

**Components:** shadcn/ui library

**Layout:**
- Dashboard-centric with persistent sidebar
- Contextual slide-in panels
- Progressive disclosure
- Status indicators everywhere
- Inline editing with auto-save

**Responsive:**
- Desktop: 1920x1080 primary
- Tablet: 768px
- Mobile: 375px
- Touch-friendly: 44x44px min buttons

---

## Development Roadmap

### Phase 1: MVP Foundation (Weeks 1-8)

#### Weeks 1-2: Core Infrastructure
**Deliverables:**
- Next.js 16 + TypeScript + Tailwind + shadcn/ui initialized
- Docker Compose setup
- Prisma + SQLite with full schema
- NextAuth authentication
- Base dashboard layout with navigation
- Health check endpoint

**Outcome:** Developer can clone and run in <10 minutes.

#### Weeks 3-4: Client Management
**Deliverables:**
- Client onboarding form with all fields (validation)
- Client directory (search, filter, sort)
- Client detail page with tabs
- Notes system (rich text)
- Activity log tracking
- Capacity validation (max 100)

**Outcome:** Fully functional client management.

#### Weeks 5-6: AI Business Plans
**Deliverables:**
- Claude API integration with retry logic
- Prompt template manager (YAML)
- Business plan generation workflow
- Markdown editor with auto-save
- PDF generation via Pandoc/XeLaTeX with Wavelaunch branding
- Versioning and status tracking
- Job queue for async generation

**Outcome:** Complete business plan feature end-to-end.

#### Weeks 7-8: Deliverables & Polish
**Deliverables:**
- Monthly deliverables system (M1-M8)
- Context-aware generation (includes previous months)
- Editor, approval workflow, PDF export
- Files library (upload, preview, search)
- Storage monitoring (50GB, alert at 80%)
- Database backup system (daily, 30-day retention)
- Settings page (API keys, integrations)
- AI Next-Steps Engine

**Outcome:** Complete MVP ready for production use.

---

### Phase 2: Chat Integration & Analytics (Weeks 9-12)

**Prerequisites:** Instantly.ai API research completed and feasibility confirmed.

#### Weeks 9-10: Instantly.ai Integration (if feasible)
- API client with graceful degradation
- Campaign metrics sync (15 min intervals)
- Email thread ingestion
- Chat inbox UI with thread viewer
- Auto-summarization (Claude API)
- Auto-linking threads to clients

#### Weeks 11-12: Analytics Dashboards
- Admin dashboard with Instantly.ai metrics
- System overview (clients, pending items, storage)
- Client dashboard with brand KPIs
- KPI data entry and visualization
- Analytics export (CSV/PDF)

---

## Logical Dependency Chain

### Layer 1: Foundation (Weeks 1-2)
1. Project Setup
2. Database Schema
3. Authentication
4. Dashboard Shell

### Layer 2: Core Data (Weeks 3-4)
5. Client API
6. Client Onboarding UI
7. Client Directory
8. Client Detail Shell
9. Notes & Activity

### Layer 3: AI Infrastructure (Week 5 first half)
10. Job Queue
11. Claude API Integration
12. Prompt Templates

### Layer 4: Business Plan Feature (Weeks 5-6)
13. Plan Generation
14. Plan Editor
15. Plan Versioning
16. Plan Status Workflow

### Layer 5: PDF Generation (Week 6)
17. XeLaTeX + Pandoc Setup
18. PDF Templates (Wavelaunch branding)
19. PDF Export Integration (job queue)

### Layer 6: Deliverables (Week 7)
20. Deliverable API
21. Deliverable UI
22. Context-Aware Generation
23. Deliverable Editor/Workflow

### Layer 7: Files & Storage (Week 8 first half)
24. File Storage
25. File Upload
26. Files Library UI
27. Auto-Categorization

### Layer 8: Backup (Week 8 second half)
28. Backup Engine
29. Backup Scheduler
30. Backup UI

### Layer 9: Settings & AI Suggestions (Week 8 final)
31. Settings Framework
32. API Configuration
33. System Monitoring
34. AI Next-Steps Engine

---

## Provided Skill Files

The following Claude Skills will be provided in `/skills/` directory:

1. **wavelaunch-brand-guidelines.skill**
   - Location: `/skills/wavelaunch-brand-guidelines/`
   - Purpose: PDF branding, LaTeX templates, design system specs
   
2. **wavelaunch-studio-creator-docs.skill**
   - Location: `/skills/wavelaunch-studio-creator-docs/`
   - Purpose: Document generation frameworks (business plan structure, M1-M8 templates)

Claude Code should read these skills before implementing document generation features.

---

## Environment Variables

```bash
DATABASE_URL="file:./data/wavelaunch.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[generate-random]"
ANTHROPIC_API_KEY="sk-ant-..."
RESEND_API_KEY="re_..." # Or SMTP credentials
SMTP_HOST/PORT/USER/PASS
NODE_ENV="development"
MAX_FILE_SIZE_MB="10"
STORAGE_LIMIT_GB="50"
```

---

## Success Metrics (MVP)

- **Setup Time:** Developer can run locally in <10 minutes
- **Generation Speed:** Business plan generated in <2 minutes
- **PDF Quality:** 300 DPI, zero layout issues, consulting-grade typography
- **AI Quality:** ≥80% usable with <15 min editing
- **System Reliability:** Zero data corruption, successful backup/restore tests
- **Usage:** Admin generates ≥5 business plans in first month

---

**End of PRD**
```