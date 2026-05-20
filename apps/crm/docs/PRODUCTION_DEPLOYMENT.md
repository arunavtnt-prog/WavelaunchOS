# Production Deployment Guide

Complete guide for deploying WavelaunchOS CRM to production with optimal performance and security.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Infrastructure Setup](#infrastructure-setup)
- [Database Migration](#database-migration)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Security Checklist](#security-checklist)

## Prerequisites

### Server Requirements

**Minimum (Up to 50 clients):**
- 2 CPU cores
- 4GB RAM
- 50GB SSD storage
- Ubuntu 22.04 LTS or similar

**Recommended (Up to 100 clients):**
- 4 CPU cores
- 8GB RAM
- 100GB SSD storage
- Ubuntu 22.04 LTS

### Software Requirements

- Docker 24+ & Docker Compose 2+
- SSL certificates (Let's Encrypt recommended)
- Domain name with DNS configured
- SMTP service or Resend account (for emails)

## Infrastructure Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create application directory
sudo mkdir -p /opt/wavelaunch
sudo chown $USER:$USER /opt/wavelaunch
cd /opt/wavelaunch
```

### 2. Clone Repository

```bash
git clone <repository-url> .
```

### 3. SSL Certificates

#### Option A: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to nginx directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/chain.pem nginx/ssl/
```

#### Option B: Custom SSL

Place your SSL certificates in `nginx/ssl/`:
- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key
- `chain.pem` - Intermediate certificates

## Database Migration

### From SQLite to PostgreSQL

If migrating from development:

```bash
# 1. Backup SQLite database
cp data/wavelaunch.db data/wavelaunch.db.backup

# 2. Start PostgreSQL
docker-compose -f docker-compose.production.yml up -d postgres
sleep 10 # Wait for PostgreSQL to be ready

# 3. Run migration
DATABASE_URL="postgresql://wavelaunch:password@localhost:5432/wavelaunch_crm" \
node scripts/migrate-sqlite-to-postgres.ts

# 4. Verify migration
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U wavelaunch -d wavelaunch_crm -c "SELECT COUNT(*) FROM clients;"
```

### Fresh Installation

```bash
# Start PostgreSQL
docker-compose -f docker-compose.production.yml up -d postgres
sleep 10

# Run migrations
docker-compose -f docker-compose.production.yml exec app \
  npx prisma migrate deploy

# Seed database (creates admin user)
docker-compose -f docker-compose.production.yml exec app \
  npm run db:seed
```

## Environment Configuration

### 1. Create Production Environment File

```bash
cp .env.example .env.production
```

### 2. Configure Environment Variables

Edit `.env.production`:

```env
# ============================================================
# DATABASE
# ============================================================
POSTGRES_USER=wavelaunch
POSTGRES_PASSWORD=<STRONG_PASSWORD_HERE>
POSTGRES_DB=wavelaunch_crm
POSTGRES_PORT=5432

# ============================================================
# REDIS
# ============================================================
REDIS_PORT=6379

# ============================================================
# APPLICATION
# ============================================================
NODE_ENV=production
NEXTAUTH_SECRET=<GENERATE_WITH_openssl_rand_base64_32>
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
APP_PORT=3000

# ============================================================
# AI
# ============================================================
ANTHROPIC_API_KEY=sk-ant-...

# ============================================================
# EMAIL
# ============================================================
# Option 1: Resend (recommended)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Wavelaunch Studio

# Option 2: SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=app-password

ENABLE_EMAIL_WORKFLOWS=true

# ============================================================
# SYSTEM
# ============================================================
LOG_LEVEL=info
MAX_FILE_SIZE_MB=10
STORAGE_LIMIT_GB=50

# ============================================================
# ADMIN
# ============================================================
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<STRONG_PASSWORD_HERE>
```

### 3. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate strong passwords
openssl rand -base64 24
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Check status
docker-compose -f docker-compose.production.yml ps
```

### Option 2: Manual Deployment

See [MANUAL_DEPLOYMENT.md](./MANUAL_DEPLOYMENT.md) for non-Docker deployment.

## Performance Optimization

### 1. Apply Database Indexes

```bash
# Run performance indexes migration
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U wavelaunch -d wavelaunch_crm -f /app/prisma/migrations/add_performance_indexes/migration.sql
```

### 2. Configure Redis for Production

Redis is configured with:
- 512MB max memory
- LRU eviction policy
- AOF persistence

### 3. Enable Caching

Caching is automatic when Redis is available. Verify:

```bash
curl -H "Authorization: Bearer <admin-token>" \
  https://yourdomain.com/api/monitoring/performance
```

### 4. Nginx Optimization

The provided `nginx.conf` includes:
- Gzip compression
- Static file caching
- Connection pooling
- Rate limiting
- HTTP/2

### 5. Next.js Optimization

Build with production optimizations:

```bash
# Already configured in Dockerfile.production
ENV NODE_ENV=production
```

## Monitoring & Maintenance

### Performance Monitoring

Access performance dashboard:

```
GET https://yourdomain.com/api/monitoring/performance
Authorization: Bearer <admin-token>
```

Monitors:
- Request timing (p50, p95, p99)
- Slow endpoints
- Database query performance
- Cache hit rates

### Health Checks

```bash
# Application health
curl https://yourdomain.com/api/health

# Database health
docker-compose -f docker-compose.production.yml exec postgres pg_isready

# Redis health
docker-compose -f docker-compose.production.yml exec redis redis-cli ping
```

### Database Backups

#### Automated Backups

Backups run daily at midnight (configured in automation system).

#### Manual Backup

```bash
# Create backup
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U wavelaunch wavelaunch_crm > backup-$(date +%Y%m%d).sql

# Restore backup
docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U wavelaunch wavelaunch_crm < backup-20250101.sql
```

### Log Management

```bash
# View application logs
docker-compose -f docker-compose.production.yml logs -f app

# View nginx logs
docker-compose -f docker-compose.production.yml logs -f nginx

# View PostgreSQL logs
docker-compose -f docker-compose.production.yml logs -f postgres

# Export logs
docker-compose -f docker-compose.production.yml logs --since 24h > logs-$(date +%Y%m%d).txt
```

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Run migrations (if needed)
docker-compose -f docker-compose.production.yml exec app \
  npx prisma migrate deploy
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs app

# Common issues:
# 1. Missing environment variables
# 2. Database connection failed
# 3. Port already in use
```

### Slow Performance

```bash
# Check performance metrics
curl https://yourdomain.com/api/monitoring/performance

# Check database indexes
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U wavelaunch -d wavelaunch_crm \
  -c "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';"

# Check Redis memory
docker-compose -f docker-compose.production.yml exec redis redis-cli INFO memory
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Restart services
docker-compose -f docker-compose.production.yml restart

# Clear caches
curl -X DELETE -H "Authorization: Bearer <admin-token>" \
  https://yourdomain.com/api/cache/clear
```

### Database Issues

```bash
# Check connections
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U wavelaunch -d wavelaunch_crm \
  -c "SELECT count(*) FROM pg_stat_activity;"

# Vacuum database
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U wavelaunch -d wavelaunch_crm -c "VACUUM ANALYZE;"
```

## Security Checklist

Before going live:

- [ ] Strong passwords for PostgreSQL, Redis, Admin account
- [ ] NEXTAUTH_SECRET generated with cryptographic randomness
- [ ] SSL/TLS certificates installed and configured
- [ ] HTTPS-only (HTTP redirects to HTTPS)
- [ ] Security headers configured in Nginx
- [ ] Rate limiting enabled
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSH key-based authentication (disable password auth)
- [ ] Regular security updates enabled
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Environment variables secured (not in git)
- [ ] Database backups encrypted
- [ ] CORS properly configured
- [ ] File upload validation enabled
- [ ] XSS prevention enabled

## Performance Benchmarks

Expected performance with recommended hardware:

- **API response time**: <200ms (p95)
- **Database queries**: <50ms (p95)
- **Cache hit rate**: >70%
- **Concurrent users**: 100+
- **File uploads**: 10MB in <5s
- **PDF generation**: Business plan in <30s

## Resource Limits

Configured in `docker-compose.production.yml`:

- **App**: 4GB RAM limit, 2 CPU cores
- **PostgreSQL**: 2GB RAM limit, 2 CPU cores
- **Redis**: 512MB RAM limit, 1 CPU core
- **Nginx**: 256MB RAM limit, 0.5 CPU cores

## Scaling Recommendations

### Vertical Scaling (Easier)

Increase server resources:
- 8GB → 16GB RAM
- 4 cores → 8 cores
- 100GB → 200GB storage

### Horizontal Scaling (Advanced)

For > 100 clients:
- Separate database server
- Redis cluster for high availability
- Load balancer with multiple app instances
- CDN for static assets

## Support

For deployment issues:

1. Check this documentation
2. Review logs
3. Check `/api/health` and `/api/monitoring/performance`
4. File an issue on GitHub

---

**Production Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

**Last Updated**: Sprint 5 - Performance & Production Readiness
**Version**: 2.0.0
