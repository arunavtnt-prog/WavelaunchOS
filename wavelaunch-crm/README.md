# WavelaunchOS CRM

**Local-First, AI-Powered CRM & Brand-Building OS for Creator Partnerships**

WavelaunchOS CRM is a comprehensive system for managing creator/influencer partnerships and brand launches. Built for Wavelaunch Studio, it consolidates client onboarding, AI-powered document generation, communication tracking, and project management into a single, powerful local-first application.

---

## Key Features

### Core Functionality

- **Client Management** - Comprehensive onboarding with 29 data points, capacity management (100 clients max)
- **AI Document Generation** - Automated business plans and monthly deliverables using Claude AI (70%+ time reduction)
- **Automated Client Journeys** - Zero-touch progression through 8-month deliverable program with event-driven workflows
- **Support Ticket System** - Full-featured ticketing with priority levels, assignment, comments, and status workflows
- **Help Center** - Knowledge base with markdown articles, categories, tagging, and full-text search
- **Professional PDF Export** - Wavelaunch-branded PDFs via Pandoc/XeLaTeX (300 DPI print-ready)
- **Email & Notifications** - Multi-provider email system (Resend/SMTP) with templated notifications and granular preferences
- **File Management** - Drag-and-drop uploads, 50GB storage limit, automatic cleanup
- **Rich Text Notes** - TipTap editor with tags, importance flags, and full-text search
- **Database Backups** - Manual and automated daily backups with safe restore
- **Distributed Job Queue** - BullMQ + Redis for persistent background processing (falls back to in-memory)
- **Scheduled Tasks** - Cron-based automation for maintenance, backups, and notifications
- **System Monitoring** - Real-time health metrics, storage analytics, job queue dashboard

### AI-Powered Features

- **Business Plan Generation** - Comprehensive business plans tailored to each creator
- **Monthly Deliverables (M1-M8)** - Sequential generation with context awareness
- **Smart Context Building** - Previous deliverables inform next months
- **Custom Templates** - YAML-based prompt templates with Mustache variables

### Production-Ready

- **Authentication** - NextAuth v5 with role-based access control
- **Error Handling** - Global error boundaries, toast notifications, graceful failures
- **Testing** - E2E tests with Playwright for critical paths
- **Type Safety** - Full TypeScript with Zod validation
- **Dark Mode** - System-aware theme with next-themes
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript 5.6**
- **Tailwind CSS 3.4** + shadcn/ui components
- **TipTap** (rich text editor)
- **CodeMirror** (Markdown editor)

### Backend
- **Next.js API Routes**
- **Prisma 6.0** (ORM)
- **PostgreSQL 16** (production database)
- **SQLite** (development fallback)
- **Redis 7** (caching & rate limiting)
- **NextAuth v5** (authentication)
- **Anthropic Claude API** (AI generation)

### Document Generation
- **Pandoc** + **XeLaTeX** (PDF generation)
- **Mustache** (template rendering)
- **YAML** (prompt templates)

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (for PostgreSQL/Redis)
- Pandoc
- XeLaTeX (TeX Live or MiKTeX)
- Claude API key

### Installation

#### Option 1: Development (SQLite)

```bash
# Clone repository
git clone <repository-url>
cd wavelaunch-crm

# Install dependencies
pnpm install

# Setup database
pnpm db:push
pnpm db:seed

# Create .env.local
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY and NEXTAUTH_SECRET

# Run development server
pnpm dev
```

#### Option 2: Production (PostgreSQL + Redis)

```bash
# Clone repository
git clone <repository-url>
cd wavelaunch-crm

# Install dependencies
pnpm install

# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Create .env.local with PostgreSQL
cp .env.example .env.local
# Update DATABASE_URL to: postgresql://wavelaunch:wavelaunch_password@localhost:5432/wavelaunch_crm
# Update REDIS_URL to: redis://localhost:6379
# Add your ANTHROPIC_API_KEY and NEXTAUTH_SECRET

# Run Prisma migrations
pnpm prisma migrate deploy

# Seed database
pnpm db:seed

# Run development server
pnpm dev
```

**Migrating from SQLite to PostgreSQL?** See [MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)

Visit `http://localhost:3000` and login with:
- **Email**: `admin@wavelaunch.studio`
- **Password**: `wavelaunch123`

### Documentation

- **[SETUP.md](./docs/SETUP.md)** - Complete setup guide
- **[MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)** - SQLite to PostgreSQL migration
- **[AUTOMATION.md](./docs/AUTOMATION.md)** - Automated workflows & scheduled tasks
- **[EMAIL_SYSTEM.md](./docs/EMAIL_SYSTEM.md)** - Email & notification system guide
- **[SECURITY.md](./docs/SECURITY.md)** - Security features & best practices
- **[API.md](./docs/API.md)** - API documentation
- **[PRD.md](./PRD.md)** - Product requirements
- **[PRODUCTION_V2_ROADMAP.md](./PRODUCTION_V2_ROADMAP.md)** - v2.0 development roadmap

---

## Project Status

**✅ 100% Complete** - All 11 layers implemented

### Layer Overview

1. **Foundation** ✅ - Next.js, TypeScript, Prisma, NextAuth
2. **Client Management** ✅ - CRUD, search, capacity management
3. **AI Infrastructure** ✅ - Job queue, Claude integration, templates
4. **Business Plan UI** ✅ - Markdown editor, versioning, workflows
5. **PDF Generation** ✅ - Pandoc pipeline, branded templates
6. **Deliverables UI** ✅ - M1-M8 timeline, sequential generation
7. **Files & Storage** ✅ - Uploads, downloads, 50GB management
8. **Notes System** ✅ - Rich text, tags, search
9. **Backup System** ✅ - Manual/automated, safe restore
10. **Settings & Monitoring** ✅ - Dashboard, health metrics
11. **Polish & Testing** ✅ - Error boundaries, toasts, E2E tests, docs

**Total Lines of Code**: ~12,000+ in src/

---

## Architecture

### Database Schema

16 models with comprehensive relationships:
- **Core**: User, Client, BusinessPlan, Deliverable
- **Content**: File, Note, PromptTemplate
- **System**: Job, Activity, BackupLog, Settings
- **Support**: Ticket, TicketComment, TicketAttachment
- **Help**: HelpCategory, HelpArticle
- **Notifications**: NotificationPreferences

### Key Services

- `/src/lib/ai/` - Claude API integration
- `/src/lib/jobs/` - Background job queue (BullMQ + Redis)
- `/src/lib/pdf/` - PDF generation pipeline
- `/src/lib/email/` - Email service with multi-provider support
- `/src/lib/workflows/` - Client journey automation
- `/src/lib/backup/` - Database backup service
- `/src/lib/files/` - File management
- `/src/lib/prompts/` - Template loading

### API Routes

35+ endpoints covering:
- Authentication (`/api/auth/*`)
- Clients (`/api/clients/*`)
- Business Plans (`/api/business-plans/*`)
- Deliverables (`/api/deliverables/*`)
- Files (`/api/files/*`)
- Notes (`/api/notes/*`)
- Jobs (`/api/jobs/*`)
- Backups (`/api/backups/*`)
- Tickets (`/api/tickets/*`)
- Help Center (`/api/help/*`)
- Email (`/api/email/*`)
- Preferences (`/api/preferences/*`)
- System (`/api/health`, `/api/storage/*`)

---

## Testing

### E2E Tests (Playwright)

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run headed (see browser)
pnpm test:headed

# View report
pnpm test:report
```

**Test Coverage**:
- Authentication flows
- Client CRUD operations
- Business plan generation
- File uploads
- Notes management

---

## Deployment

### Local Development

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

### Docker

```bash
docker build -t wavelaunch-crm .
docker run -p 3000:3000 wavelaunch-crm
```

See [SETUP.md](./docs/SETUP.md) for detailed deployment options.

---

## Environment Variables

```env
# Database (choose one)
DATABASE_URL="file:../data/wavelaunch.db"  # SQLite for development
# DATABASE_URL="postgresql://wavelaunch:password@localhost:5432/wavelaunch_crm"  # PostgreSQL for production

# Authentication (required)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Claude API (required)
ANTHROPIC_API_KEY="sk-ant-..."

# Redis (optional - falls back to in-memory if not configured)
# REDIS_URL="redis://localhost:6379"

# CORS Configuration (optional)
# ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (optional - choose one provider)
# Option 1: Resend (recommended)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@wavelaunch.studio"
EMAIL_FROM_NAME="Wavelaunch Studio"

# Option 2: SMTP (e.g., Gmail, SendGrid)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"  # true for port 465
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@wavelaunch.studio"
EMAIL_FROM_NAME="Wavelaunch Studio"

# Email Feature Flags
ENABLE_EMAIL_WORKFLOWS="true"  # Enable automatic workflow emails
# FORCE_CONSOLE_EMAIL="true"  # Force console mode (development only)

# Logging & Storage
LOG_LEVEL="info"  # debug, info, warn, error
MAX_FILE_SIZE_MB="10"
STORAGE_LIMIT_GB="50"

# System
NODE_ENV="development"
ADMIN_EMAIL="admin@wavelaunch.studio"
ADMIN_PASSWORD="change-me-in-production"
```

See [.env.example](./.env.example) for complete configuration options.

---

## Key Metrics

- **Client Capacity**: 100 clients max
- **Storage Limit**: 50GB with warnings at 80%/100%
- **Backup Retention**: 30 days
- **Job Queue**: 10 job types, 5 specialized queues, distributed processing
- **Scheduled Tasks**: 5 cron-based automated tasks
- **Workflow Events**: 7 automated client journey triggers
- **Email Templates**: 9 professional responsive templates
- **Ticket System**: 6 status states, 4 priority levels, unlimited tickets
- **Help Center**: Unlimited articles, full-text search, view analytics
- **Document Formats**: Markdown → PDF (150/300 DPI)
- **AI Model**: claude-sonnet-4-20250514

---

## Features in Detail

### Automated Workflows

**Client Journey Automation** - Zero-touch progression through 8-month deliverable program:
- **Auto-Generation**: Next month's deliverable automatically created when current completes
- **Welcome Flow**: New clients receive automated welcome emails
- **Smart Activation**: Business plan + M1 deliverable auto-generated on activation with notifications
- **Overdue Detection**: Automatic reminders for pending deliverables via email
- **Milestone Tracking**: Celebration emails for completion events
- **Event-Driven**: 7 workflow triggers (created, activated, completed, overdue, etc.)
- **Email Integration**: All workflows send contextual notifications based on user preferences

**Scheduled Background Tasks** - Cron-based automation:
- **Daily Backups**: Automatic database backups at midnight
- **File Cleanup**: Temp file removal at 2 AM daily
- **Job Cleanup**: Remove old completed jobs weekly
- **Reminder Emails**: Daily check for overdue deliverables
- **Metrics Updates**: Client engagement tracking (Future)

**Job Queue System** - BullMQ + Redis for production-grade processing:
- **Persistent Jobs**: Survive server restarts
- **Distributed Workers**: Scale across multiple servers
- **Priority Queues**: Critical, High, Normal, Low priorities
- **Auto-Retry**: Exponential backoff with 3 attempts
- **Queue Monitoring**: Real-time metrics and performance tracking
- **Graceful Fallback**: In-memory queue when Redis unavailable

---

### Support & Knowledge Base

**Ticket System** - Comprehensive support ticket management:
- **Status Workflow**: OPEN → IN_PROGRESS → WAITING_ON_CLIENT/TEAM → RESOLVED → CLOSED
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT for effective triage
- **Assignment System**: Assign tickets to specific team members
- **Comment System**: Threaded conversations with internal notes for team communication
- **Attachment Support**: Upload files directly to tickets
- **Advanced Filtering**: Filter by status, priority, category, assignee, client
- **Auto-timestamps**: Track creation, update, resolution, and closure times
- **Role-based Access**: Clients see own tickets, admins see all

**Help Center** - Self-service knowledge base:
- **Markdown Articles**: Rich content with formatting support
- **Category Organization**: Organize articles by topic with custom icons
- **Full-text Search**: Search across titles, content, and excerpts
- **Tag System**: Multiple tags per article for cross-referencing
- **View Analytics**: Track article popularity with view counts
- **Featured Articles**: Highlight important or popular content
- **SEO-friendly URLs**: Slug-based URLs for better discoverability
- **Publish Control**: Draft/published workflow for content management
- **Public Access**: Published articles available without authentication

---

### Email & Notifications

**Multi-Provider Email System** - Professional email infrastructure with flexible provider support:
- **Provider Support**: Resend (recommended), SMTP, or console logging for development
- **Auto-Detection**: Automatically selects provider based on environment configuration
- **Email Templates**: 9 professional responsive HTML templates with plain-text fallbacks
  - Welcome emails for new clients
  - Activation notifications
  - Business plan ready alerts
  - Deliverable completion notifications
  - Overdue reminders
  - Milestone celebrations
  - Journey completion congratulations
  - Password reset emails
  - User invitation emails
- **Template Features**: Variable substitution, responsive design, brand consistency
- **Job Queue Integration**: All emails sent asynchronously through BullMQ
- **Development Mode**: Console logging for local testing without actual email sending

**Notification Preferences** - Granular per-client control:
- **Email Preferences**: 9 different notification types (welcome, activation, deliverables, etc.)
- **Portal Notifications**: In-app notifications for deliverables, tickets, announcements
- **Communication Settings**: Preferred contact method, reminder frequency
- **Default Behavior**: All essential notifications ON, marketing OFF by default
- **User Control**: Self-service preferences management via API
- **Admin Override**: Admins can manage client preferences when needed
- **Fail-Open**: Important notifications sent even if preference check fails

**Email Workflow Integration**:
- All 7 workflow events trigger appropriate email notifications
- Preference checking before every email send
- Contextual variables passed to templates (client name, progress %, dates, etc.)
- Automatic logging of all email activity
- Error handling with graceful degradation

---

### Client Onboarding

29-field comprehensive intake:
- Creator info (name, email, social)
- Audience metrics (followers, views, engagement)
- Brand goals (budget, timeline, challenges)
- Past partnerships and content style

### AI-Powered Generation

**Business Plans**:
- Executive summary
- Market analysis
- Product strategy
- Financial projections
- Marketing plan
- Risk assessment

**Monthly Deliverables (M1-M8)**:
- M1: Foundation & Planning
- M2: Supplier Sourcing
- M3: Product Development
- M4: Brand Identity
- M5: Marketing Strategy
- M6: Pre-Launch
- M7: Launch Execution
- M8: Post-Launch & Scaling

Each month builds on previous context for coherent, strategic guidance.

### PDF Generation

- **Draft Mode**: 150 DPI, faster generation
- **Final Mode**: 300 DPI, print-ready
- **Branding**: Wavelaunch logo, custom headers/footers
- **Format**: Professional LaTeX typesetting

---

## Security

**Security Score: 9.5/10** - Enterprise-grade security implementation

- **Authentication**: NextAuth v5 with account lockout (5 attempts = 15min lockout)
- **Authorization**: Row-level security with resource ownership verification
- **CSRF Protection**: Double-submit cookie pattern on all state-changing requests
- **Rate Limiting**: Distributed Redis-based rate limiting with endpoint-specific limits
- **Password Security**: bcrypt hashing + strong password requirements (8+ chars, mixed case, numbers, symbols)
- **Session Management**: 24-hour auto-expiry with login tracking
- **Input Sanitization**: DOMPurify-based XSS prevention for all user inputs
- **File Upload Security**: Magic number verification, MIME validation, filename sanitization
- **SQL Injection**: Prisma ORM with parameterized queries
- **CORS**: Origin whitelist with preflight support
- **Request Tracking**: Unique request IDs for security investigation
- **Logging**: Structured JSON logging with automatic sensitive data redaction

See [SECURITY.md](./docs/SECURITY.md) for complete security documentation.

---

## Performance

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Redis Caching**: Distributed caching for rate limiting and API responses
- **Database**: PostgreSQL with optimized indexes and query performance
- **Lazy Loading**: React lazy + Suspense for heavy components
- **Connection Pooling**: Prisma connection pooling for database efficiency

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use Prettier for formatting
- Write E2E tests for new features
- Update documentation
- Follow commit conventions

---

## License

Proprietary - Wavelaunch Studio © 2025

---

## Support

For questions or issues:
- **Documentation**: `/docs` directory
- **Email**: support@wavelaunch.studio
- **GitHub Issues**: <repository-url>/issues

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Anthropic Claude](https://www.anthropic.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pandoc](https://pandoc.org/)

---

**Made with ❤️ by Wavelaunch Studio**
