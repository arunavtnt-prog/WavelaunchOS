# WavelaunchOS CRM

**Local-First, AI-Powered CRM & Brand-Building OS for Creator Partnerships**

WavelaunchOS CRM is a comprehensive system for managing creator/influencer partnerships and brand launches. Built for Wavelaunch Studio, it consolidates client onboarding, AI-powered document generation, communication tracking, and project management into a single, powerful local-first application.

---

## Key Features

### Core Functionality

- **Client Management** - Comprehensive onboarding with 29 data points, capacity management (100 clients max)
- **AI Document Generation** - Automated business plans and monthly deliverables using Claude AI (70%+ time reduction)
- **Professional PDF Export** - Wavelaunch-branded PDFs via Pandoc/XeLaTeX (300 DPI print-ready)
- **File Management** - Drag-and-drop uploads, 50GB storage limit, automatic cleanup
- **Rich Text Notes** - TipTap editor with tags, importance flags, and full-text search
- **Database Backups** - Manual and automated daily backups with safe restore
- **Job Queue System** - Background processing with exponential backoff retry logic
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
- **SQLite** (database)
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
- Pandoc
- XeLaTeX (TeX Live or MiKTeX)
- Claude API key

### Installation

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

Visit `http://localhost:3000` and login with:
- **Email**: `admin@wavelaunch.studio`
- **Password**: `wavelaunch123`

### Documentation

- **[SETUP.md](./docs/SETUP.md)** - Complete setup guide
- **[API.md](./docs/API.md)** - API documentation
- **[PRD.md](./PRD.md)** - Product requirements
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Development roadmap

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

11 models with comprehensive relationships:
- User, Client, BusinessPlan, Deliverable
- File, PromptTemplate, Job, Note
- Activity, BackupLog, Settings

### Key Services

- `/src/lib/ai/` - Claude API integration
- `/src/lib/jobs/` - Background job queue
- `/src/lib/pdf/` - PDF generation pipeline
- `/src/lib/backup/` - Database backup service
- `/src/lib/files/` - File management
- `/src/lib/prompts/` - Template loading

### API Routes

28+ endpoints covering:
- Authentication (`/api/auth/*`)
- Clients (`/api/clients/*`)
- Business Plans (`/api/business-plans/*`)
- Deliverables (`/api/deliverables/*`)
- Files (`/api/files/*`)
- Notes (`/api/notes/*`)
- Jobs (`/api/jobs/*`)
- Backups (`/api/backups/*`)
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
# Required
ANTHROPIC_API_KEY=sk-ant-your-key
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Optional
DATABASE_URL=file:./dev.db
RESEND_API_KEY=your-resend-key
```

---

## Key Metrics

- **Client Capacity**: 100 clients max
- **Storage Limit**: 50GB with warnings at 80%/100%
- **Backup Retention**: 30 days
- **Job Queue**: 5 types with 3 retry attempts
- **Document Formats**: Markdown → PDF (150/300 DPI)
- **AI Model**: claude-sonnet-4-20250514

---

## Features in Detail

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

- **Authentication**: Session-based with NextAuth
- **Authorization**: Role-based access control (ADMIN/CLIENT)
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Zod schemas on all forms
- **File Upload**: MIME type validation, size limits
- **SQL Injection**: Prisma ORM with parameterized queries
- **XSS Protection**: React escaping, sanitized HTML in notes

---

## Performance

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: API response caching where applicable
- **Lazy Loading**: React lazy + Suspense for heavy components
- **Database Indexing**: Optimized Prisma schema

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
