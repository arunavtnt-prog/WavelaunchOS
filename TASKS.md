# WavelaunchOS CRM - Task Breakdown

**Status:** In Progress
**Goal:** Ship MVP ASAP

---

## LAYER 1: FOUNDATION (Must Complete First)

### Task 1.1: Project Initialization
- [x] Next.js 16 + TypeScript + App Router
- [ ] Tailwind CSS + PostCSS config
- [ ] shadcn/ui installation (New York theme)
- [ ] ESLint + Prettier setup
- [ ] Package.json dependencies
- [ ] tsconfig.json configuration
- [ ] Environment variables structure

### Task 1.2: Database Schema
- [ ] Complete Prisma schema (all models)
- [ ] Initial migration
- [ ] Database service singleton
- [ ] Seed script with demo data

### Task 1.3: Authentication
- [ ] NextAuth.js setup
- [ ] Credentials provider
- [ ] Login page
- [ ] Auth middleware
- [ ] Password hashing (bcrypt)
- [ ] Session management

### Task 1.4: Base Layout
- [ ] Root layout with providers
- [ ] Dashboard layout with sidebar
- [ ] Navigation component
- [ ] Header with user menu
- [ ] Dark/light mode toggle
- [ ] Responsive mobile menu

---

## LAYER 2: CLIENT MANAGEMENT

### Task 2.1: Client API
- [ ] Zod validation schemas
- [ ] GET /api/clients (list with filters)
- [ ] POST /api/clients (create with capacity check)
- [ ] GET /api/clients/[id] (single)
- [ ] PATCH /api/clients/[id] (update)
- [ ] DELETE /api/clients/[id] (soft delete)

### Task 2.2: Client UI - Directory
- [ ] Client directory page
- [ ] Client card component
- [ ] Search functionality
- [ ] Filters (status, niche, date)
- [ ] Sorting (name, date)
- [ ] Pagination (20 per page)
- [ ] Capacity indicator (X/100)
- [ ] "New Client" button

### Task 2.3: Client UI - Onboarding
- [ ] Multi-step form component
- [ ] All 29 fields (11 required, 18 optional)
- [ ] Form validation (React Hook Form + Zod)
- [ ] Progress indicator
- [ ] Draft save to localStorage
- [ ] Success modal

### Task 2.4: Client UI - Detail Page
- [ ] Client detail layout with tabs
- [ ] Overview tab (summary + timeline)
- [ ] Edit client functionality
- [ ] Quick actions menu

### Task 2.5: Notes System
- [ ] Notes API (CRUD)
- [ ] Rich text editor (TipTap)
- [ ] Tags input (multi-select)
- [ ] Category dropdown
- [ ] Filter by tag/category
- [ ] Important toggle
- [ ] Auto-save (30s)

### Task 2.6: Activity Log
- [ ] Activity tracking middleware
- [ ] Activity API
- [ ] Timeline component
- [ ] Filter by type/date
- [ ] CSV export functionality
- [ ] Track all CRUD operations

---

## LAYER 3: AI INFRASTRUCTURE

### Task 3.1: Job Queue
- [ ] File-based queue implementation
- [ ] Job persistence (survive restarts)
- [ ] Retry logic (exponential backoff)
- [ ] Concurrency limits
- [ ] Job status tracking
- [ ] Job API (GET, cancel, retry)
- [ ] Job monitoring UI

### Task 3.2: Claude API Integration
- [ ] Claude API client wrapper
- [ ] Streaming support
- [ ] Error handling (rate limits, timeouts)
- [ ] Retry logic
- [ ] Cost tracking
- [ ] API key configuration

### Task 3.3: Prompt Template System
- [ ] YAML template structure
- [ ] Template loader
- [ ] Mustache renderer
- [ ] Context builder (client data → YAML)
- [ ] Template validator
- [ ] Initial templates from skills

---

## LAYER 4: BUSINESS PLANS

### Task 4.1: Business Plan API
- [ ] Business plan schema
- [ ] POST /api/clients/[id]/business-plans/generate
- [ ] GET /api/clients/[id]/business-plans
- [ ] GET /api/business-plans/[id]
- [ ] PATCH /api/business-plans/[id]
- [ ] PATCH /api/business-plans/[id]/status
- [ ] Generation worker

### Task 4.2: Business Plan UI
- [ ] Business plan tab
- [ ] Version list
- [ ] "Generate" button with modal
- [ ] Progress indicator
- [ ] Status badges
- [ ] Approval workflow UI

### Task 4.3: Markdown Editor
- [ ] CodeMirror 6 setup
- [ ] Live preview panel
- [ ] Auto-save (30s)
- [ ] Conflict resolution (multi-tab)
- [ ] Diff viewer for conflicts
- [ ] Save indicator

### Task 4.4: Version Control
- [ ] Version tracking
- [ ] "Regenerate" creates new version
- [ ] Version comparison UI
- [ ] Version history list

---

## LAYER 5: PDF GENERATION

### Task 5.1: PDF Pipeline Setup
- [ ] Docker: Install XeLaTeX + Pandoc
- [ ] Font installation (DM Sans, Lora)
- [ ] LaTeX template (wavelaunch.tex)
- [ ] Pandoc YAML metadata
- [ ] Test pipeline (Markdown → PDF)

### Task 5.2: PDF Generator Service
- [ ] PDF generator implementation
- [ ] YAML frontmatter injection
- [ ] Quality options (draft/final)
- [ ] Brand styling (colors, fonts, logo)
- [ ] 300 DPI verification
- [ ] PDF worker for job queue

### Task 5.3: PDF Integration
- [ ] POST /api/business-plans/[id]/pdf
- [ ] File storage in /data/clients/
- [ ] Auto-categorization
- [ ] Download button UI
- [ ] Preview functionality

---

## LAYER 6: DELIVERABLES

### Task 6.1: Deliverable System
- [ ] Deliverable schema (with subdocuments)
- [ ] M1-M8 prompt templates
- [ ] Context-aware generation (includes previous months)
- [ ] POST /api/clients/[id]/deliverables/generate
- [ ] GET /api/clients/[id]/deliverables
- [ ] Deliverable worker

### Task 6.2: Deliverable UI
- [ ] M1-M8 timeline view
- [ ] Month cards with status
- [ ] "Generate Next" button
- [ ] Subdocument support
- [ ] Admin can choose subdocuments

### Task 6.3: Deliverable Editor
- [ ] Editor page (reuse Markdown editor)
- [ ] Approval workflow
- [ ] Rejection with reason
- [ ] PDF generation (reuse pipeline)
- [ ] Status tracking

---

## LAYER 7: FILES & STORAGE

### Task 7.1: File Upload
- [ ] File storage service
- [ ] POST /api/files (upload)
- [ ] Drag-and-drop UI (react-dropzone)
- [ ] File validation (type, size)
- [ ] Auto-categorization
- [ ] Multiple file support

### Task 7.2: File Management
- [ ] GET /api/files (list with filters)
- [ ] GET /api/files/[id] (download)
- [ ] DELETE /api/files/[id] (soft delete)
- [ ] File browser UI
- [ ] Preview modal (PDF, images)
- [ ] Search and filters

### Task 7.3: Storage Monitoring
- [ ] Storage calculation service
- [ ] GET /api/system/storage
- [ ] Storage indicator component
- [ ] Warning at 80% (40GB)
- [ ] Block at 100% (50GB)
- [ ] Cleanup worker (temp files)

---

## LAYER 8: BACKUP & SETTINGS

### Task 8.1: Backup System
- [ ] Backup creation service
- [ ] Restore service with safety backup
- [ ] Integrity verification
- [ ] Auto-cleanup (>30 days)
- [ ] Daily scheduler (2 AM)
- [ ] POST /api/backup/create
- [ ] POST /api/backup/restore
- [ ] GET /api/backup/list

### Task 8.2: Backup UI
- [ ] Backup list in settings
- [ ] Manual backup button
- [ ] Restore confirmation dialog
- [ ] Progress indicators
- [ ] Success/failure messages

### Task 8.3: Settings Page
- [ ] Settings API (GET, PATCH)
- [ ] API key configuration (Claude, Resend)
- [ ] Email settings (SMTP)
- [ ] Test integration buttons
- [ ] System info display
- [ ] Demo mode loader

---

## LAYER 9: AI FEATURES

### Task 9.1: Next-Steps Engine
- [ ] Rules engine implementation
- [ ] Rule definitions (no plan, next deliverable, etc.)
- [ ] Priority calculation
- [ ] Next-steps panel component
- [ ] Quick action buttons
- [ ] Dismiss/complete tracking

### Task 9.2: Prompt Template Manager
- [ ] Template list page
- [ ] YAML editor (syntax highlighting)
- [ ] Template validation UI
- [ ] Active template selection
- [ ] Version history
- [ ] Variable helper

---

## LAYER 10: ANALYTICS & POLISH

### Task 10.1: Admin Dashboard
- [ ] GET /api/analytics/admin
- [ ] Metric cards (clients, pending, storage)
- [ ] Recent activity feed
- [ ] Quick actions section
- [ ] Auto-refresh (5 min)
- [ ] Charts (Recharts)

### Task 10.2: Email Notifications
- [ ] Email service setup (Resend)
- [ ] React Email templates
- [ ] Notification triggers (key events)
- [ ] Template rendering
- [ ] Send queue
- [ ] Error handling

### Task 10.3: Demo Mode
- [ ] Demo data generator (@faker-js/faker)
- [ ] 5-10 sample clients
- [ ] Sample business plans
- [ ] Sample deliverables (various stages)
- [ ] Sample files
- [ ] Load demo data button

### Task 10.4: Final Polish
- [ ] Error boundaries
- [ ] Loading states
- [ ] Empty states
- [ ] Toast notifications
- [ ] Confirmation dialogs
- [ ] Responsive design testing
- [ ] Performance optimization

---

## LAYER 11: DOCUMENTATION & DEPLOYMENT

### Task 11.1: Documentation
- [ ] SETUP.md (installation guide)
- [ ] API.md (endpoint documentation)
- [ ] DEPLOYMENT.md (production guide)
- [ ] TROUBLESHOOTING.md
- [ ] README.md update

### Task 11.2: Docker & Deployment
- [ ] Dockerfile optimization
- [ ] Docker Compose for production
- [ ] Environment variables documentation
- [ ] Health check endpoint
- [ ] Startup scripts
- [ ] PM2 configuration

### Task 11.3: Testing
- [ ] End-to-end test: full client lifecycle
- [ ] Performance testing
- [ ] Security audit
- [ ] Backup/restore verification
- [ ] Multi-tab conflict testing
- [ ] Demo mode testing

---

## CRITICAL PATH (Minimum Viable)

**Phase 1: Foundation** (Do First)
1. Project init → Database → Auth → Layout

**Phase 2: Core CRM** (Essential)
2. Client API → Client UI → Notes → Activity

**Phase 3: AI Core** (Key Feature)
3. Job Queue → Claude API → Prompts → Business Plans → PDF

**Phase 4: Deliverables** (Second Key Feature)
4. Deliverable System → UI → Editor

**Phase 5: Complete MVP**
5. Files → Backup → Settings → Dashboard → Polish

---

## EXECUTION STRATEGY

1. **Start with Layer 1** (Foundation) - Can't build without it
2. **Parallelize when possible** - Multiple files at once
3. **Test as we go** - Don't accumulate bugs
4. **Ship features incrementally** - Each layer should work
5. **No perfectionism** - MVP first, polish later

**Current Status:** Ready to start Layer 1.1
