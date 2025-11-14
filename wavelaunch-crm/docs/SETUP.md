# WavelaunchOS CRM - Setup Guide

This guide will help you set up the WavelaunchOS CRM application for local development or production deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8 or higher) - Install via `npm install -g pnpm`
- **Pandoc** (for PDF generation) - [Download](https://pandoc.org/installing.html)
- **XeLaTeX** (for PDF generation) - Install TeX Live or MiKTeX
- **Claude API Key** - Get from [console.anthropic.com](https://console.anthropic.com/)

### Optional Dependencies

- **Docker** - For containerized deployment
- **PM2** - For process management in production

---

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd wavelaunch-crm
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Verify Pandoc and XeLaTeX installation**

```bash
pandoc --version
xelatex --version
```

If either command fails, install the missing dependencies.

---

## Database Setup

The application uses SQLite for local development and can be configured for PostgreSQL in production.

### 1. Generate Prisma Client

```bash
pnpm db:generate
```

### 2. Push Database Schema

```bash
pnpm db:push
```

This creates the database file at `prisma/dev.db` with all tables.

### 3. Seed the Database

```bash
pnpm db:seed
```

This creates:
- Default admin user: `admin@wavelaunch.studio` / `wavelaunch123`
- Prompt templates for AI generation
- Sample data (optional)

### 4. View Database (Optional)

```bash
pnpm db:studio
```

Opens Prisma Studio at `http://localhost:5555` to browse database.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here-generate-with-openssl

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Database (SQLite by default)
DATABASE_URL="file:./dev.db"

# Optional: Resend (Email)
RESEND_API_KEY=your-resend-api-key

# Optional: Production PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/wavelaunch_crm"
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Use the output as your `NEXTAUTH_SECRET`.

---

## Running the Application

### Development Mode

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

Default login credentials:
- **Email**: `admin@wavelaunch.studio`
- **Password**: `wavelaunch123`

### Production Mode

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

---

## Testing

### E2E Tests with Playwright

The application includes comprehensive E2E tests covering critical user flows.

#### Run tests headless

```bash
pnpm test
```

#### Run tests with UI

```bash
pnpm test:ui
```

#### Run tests in headed mode (see browser)

```bash
pnpm test:headed
```

#### View test report

```bash
pnpm test:report
```

### Test Coverage

Current tests cover:
- Authentication (login, logout, errors)
- Client management (CRUD operations, search)
- Business plan generation and editing
- Deliverables workflow
- Notes system
- File uploads

---

## Production Deployment

### Option 1: Docker Deployment

1. **Build Docker image**

```bash
docker build -t wavelaunch-crm .
```

2. **Run container**

```bash
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your-key \
  -e NEXTAUTH_SECRET=your-secret \
  -v $(pwd)/data:/app/data \
  wavelaunch-crm
```

### Option 2: PM2 Process Manager

1. **Install PM2**

```bash
npm install -g pm2
```

2. **Build the application**

```bash
pnpm build
```

3. **Start with PM2**

```bash
pm2 start pnpm --name wavelaunch-crm -- start
pm2 save
pm2 startup
```

### Option 3: Vercel/Netlify

**Note**: File-based features (PDF generation, file uploads, backups) require a VPS or containerized deployment. For serverless, you'll need to use cloud storage (S3, Cloudinary, etc.).

1. Connect repository to Vercel/Netlify
2. Add environment variables
3. Deploy

---

## System Requirements

### Minimum

- 2GB RAM
- 2 CPU cores
- 10GB disk space

### Recommended

- 4GB RAM
- 4 CPU cores
- 50GB disk space (for files and backups)

---

## Initial Configuration

### 1. Create Admin User

The seed script creates a default admin user. To create additional users:

```typescript
// Use Prisma Studio or direct database access
// Users table -> Add new user with hashed password
```

### 2. Configure AI Prompts

Prompt templates are stored in the database. Edit via Prisma Studio or the settings page (coming soon).

### 3. Configure File Storage

Default: `./data/uploads` (50GB limit)

To change:
- Update `FILE_STORAGE_PATH` in `.env.local`
- Ensure directory has write permissions

### 4. Configure Backups

Default: `./data/backups` (30-day retention)

To change:
- Update `BACKUP_PATH` in `.env.local`
- Configure automated backup schedule in settings

---

## Troubleshooting

### Issue: "Prisma Client Not Found"

```bash
pnpm db:generate
```

### Issue: "PDF Generation Fails"

Ensure Pandoc and XeLaTeX are installed:

```bash
pandoc --version
xelatex --version
```

### Issue: "Port 3000 Already in Use"

Change port in `.env.local`:

```env
PORT=3001
```

Or find and kill the process:

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Database Locked"

Close Prisma Studio or any other database connections, then try again.

### Issue: "Claude API Quota Exceeded"

Check your Anthropic console for usage limits and billing.

---

## Next Steps

- Read [API.md](./API.md) for API documentation
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment details
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues

---

## Support

For issues or questions:
- Check documentation in `/docs`
- Review GitHub Issues
- Contact: support@wavelaunch.studio
