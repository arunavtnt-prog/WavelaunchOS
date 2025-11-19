# Mac Local Setup Guide

## Quick Start (5 Minutes)

This guide addresses common Mac-specific issues when setting up WavelaunchOS CRM locally.

---

## ⚠️ Common Mac Errors & Fixes

### 1. **"Prisma Client Not Generated"**
```bash
# Run this first, before anything else
pnpm db:generate
```

### 2. **"Cannot find module '@prisma/client'"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
pnpm install
pnpm db:generate
```

### 3. **".env file not found" or "NEXTAUTH_SECRET not set"**
```bash
# Create .env.local file (NOT .env)
cp .env.example .env.local

# Generate a secure secret
openssl rand -base64 32

# Add to .env.local:
# NEXTAUTH_SECRET="paste-the-generated-secret-here"
```

### 4. **"Database file not found"**
```bash
# Create data directory
mkdir -p data

# Update DATABASE_URL in .env.local:
# DATABASE_URL="file:./data/wavelaunch.db"

# Then run:
pnpm db:push
pnpm db:seed
```

### 5. **"Port 3000 already in use"**
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port in .env.local:
# PORT=3001
```

### 6. **"Redis connection failed" (optional)**
```bash
# Redis is OPTIONAL. If you see this error, either:

# Option A: Install Redis (recommended for production)
brew install redis
brew services start redis

# Option B: Ignore it (app will use in-memory fallback)
# No action needed - the app works without Redis
```

### 7. **TypeScript/ESLint errors**
```bash
# Install dependencies properly
pnpm install

# Restart your IDE/editor
# VSCode: Cmd+Shift+P -> "Reload Window"
```

---

## Step-by-Step Setup

### 1. Prerequisites

**Install Homebrew** (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Install Node.js 18+**:
```bash
brew install node@20
```

**Install pnpm**:
```bash
npm install -g pnpm
```

**Install Pandoc** (for PDF generation):
```bash
brew install pandoc
```

**Install XeLaTeX** (for PDF generation):
```bash
brew install --cask mactex-no-gui
# OR full version (larger):
brew install --cask mactex
```

**Verify installations**:
```bash
node --version      # Should be v18+ or v20+
pnpm --version      # Should be v8+
pandoc --version    # Should show version
xelatex --version   # Should show version
```

---

### 2. Clone & Install

```bash
cd ~/Projects  # or your preferred directory
git clone <your-repo-url>
cd wavelaunch-crm

# Install dependencies
pnpm install
```

---

### 3. Environment Configuration

**Create `.env.local` file** (critical - use `.env.local` NOT `.env`):

```bash
cp .env.example .env.local
```

**Edit `.env.local` with required values**:

```bash
# Use nano or your preferred editor
nano .env.local
```

**Minimum required configuration**:

```env
# Database (SQLite for local dev)
DATABASE_URL="file:./data/wavelaunch.db"

# NextAuth (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"  # Generate with: openssl rand -base64 32

# Claude API (REQUIRED for AI features)
ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (OPTIONAL - comment out if not needed)
# RESEND_API_KEY="re_your_key"

# Redis (OPTIONAL - app works without it)
# REDIS_URL="redis://localhost:6379"

# Optional Features
ENABLE_SCHEDULER="false"
ENABLE_EMAIL_WORKFLOWS="false"
AUTO_GENERATE_PDF="false"
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
# Copy output to .env.local
```

---

### 4. Database Setup

```bash
# Create data directory
mkdir -p data

# Generate Prisma Client (CRITICAL - run this first!)
pnpm db:generate

# Create database schema
pnpm db:push

# Seed with default admin user and templates
pnpm db:seed
```

**Expected output**:
```
✅ Database schema pushed
✅ Admin user created: admin@wavelaunch.studio / wavelaunch123
✅ Prompt templates loaded
✅ Seed completed
```

---

### 5. Run the Application

```bash
# Development mode with hot reload
pnpm dev
```

**Open browser**: http://localhost:3000

**Login credentials**:
- Email: `admin@wavelaunch.studio`
- Password: `wavelaunch123`

---

## Debugging Checklist

If you're still getting errors, check this list:

- [ ] `.env.local` file exists (NOT `.env`)
- [ ] `NEXTAUTH_SECRET` is set in `.env.local`
- [ ] `ANTHROPIC_API_KEY` is set (if using AI features)
- [ ] `DATABASE_URL` points to `file:./data/wavelaunch.db`
- [ ] `data/` directory exists
- [ ] Ran `pnpm db:generate` successfully
- [ ] Ran `pnpm db:push` successfully
- [ ] Ran `pnpm db:seed` successfully
- [ ] No other process using port 3000
- [ ] Node version is 18+ or 20+
- [ ] Cleared browser cache if getting auth errors

---

## Common Error Messages & Solutions

### "Error: P1003: Database does not exist"
```bash
mkdir -p data
pnpm db:push
```

### "Error: ENOENT: no such file or directory"
```bash
mkdir -p data uploads backups
```

### "Error: Invalid environment variable"
```bash
# Check .env.local has no quotes around simple values
# Bad:  DATABASE_URL=file:./data/wavelaunch.db
# Good: DATABASE_URL="file:./data/wavelaunch.db"
```

### "Error: Cannot find module"
```bash
rm -rf node_modules .next
pnpm install
pnpm db:generate
```

### "Error: prisma.client.$connect is not a function"
```bash
pnpm db:generate
rm -rf .next
pnpm dev
```

---

## Optional: Redis Setup

Redis improves performance but is NOT required. The app works perfectly without it.

**Install & Run**:
```bash
brew install redis
brew services start redis

# Add to .env.local:
REDIS_URL="redis://localhost:6379"
```

**Verify Redis**:
```bash
redis-cli ping
# Should return: PONG
```

---

## Viewing the Database

```bash
# Open Prisma Studio (visual database editor)
pnpm db:studio

# Opens at: http://localhost:5555
```

---

## Resetting Everything

If you want to start fresh:

```bash
# Stop the dev server (Ctrl+C)

# Delete database and generated files
rm -rf data node_modules .next

# Reinstall
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed

# Start fresh
pnpm dev
```

---

## What Errors Are You Seeing?

**Tell me specifically what errors you're getting and I can help fix them. Common areas:**

1. **Database errors** → Check `.env.local` DATABASE_URL
2. **Auth errors** → Check NEXTAUTH_SECRET is set
3. **Module not found** → Run `pnpm db:generate`
4. **Port errors** → Kill process on port 3000
5. **TypeScript errors** → Reload your IDE
6. **Build errors** → Delete `.next` and rebuild

**Share the exact error message and I'll provide the specific fix!**
