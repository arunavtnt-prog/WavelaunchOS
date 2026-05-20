# PostgreSQL Migration Guide

This guide walks you through migrating from SQLite to PostgreSQL for production deployment.

## Overview

The migration involves:
1. Starting PostgreSQL and Redis containers
2. Running Prisma migrations to create the database schema
3. Migrating data from SQLite to PostgreSQL
4. Updating environment variables
5. Testing the migration

## Prerequisites

- Docker and Docker Compose installed
- Existing SQLite database at `data/wavelaunch.db`
- Node.js and npm installed

## Step 1: Start PostgreSQL and Redis

Start the database containers using Docker Compose:

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify containers are running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Check Redis logs
docker-compose logs redis
```

You should see:
```
wavelaunch-crm-postgres-1  running (healthy)
wavelaunch-crm-redis-1     running (healthy)
```

## Step 2: Update Environment Variables

Update your `.env` file with PostgreSQL connection string:

```bash
# Old SQLite configuration (backup this)
# DATABASE_URL="file:../data/wavelaunch.db"

# New PostgreSQL configuration
DATABASE_URL="postgresql://wavelaunch:wavelaunch_password@localhost:5432/wavelaunch_crm"

# Redis configuration (for rate limiting and caching)
REDIS_URL="redis://localhost:6379"
```

**Production Note**: Change the PostgreSQL password in both `.env` and `docker-compose.yml` for production deployments.

## Step 3: Run Prisma Migrations

Create the database schema in PostgreSQL:

```bash
# Generate Prisma Client for PostgreSQL
npx prisma generate

# Run migrations to create tables
npx prisma migrate deploy

# Or create a new migration if needed
npx prisma migrate dev --name init_postgres_schema
```

This will create all tables, indexes, and constraints in PostgreSQL.

## Step 4: Migrate Data from SQLite

Run the migration script to transfer data:

```bash
# Make the script executable (Unix/Mac)
chmod +x scripts/migrate-sqlite-to-postgres.ts

# Run the migration
npx tsx scripts/migrate-sqlite-to-postgres.ts
```

The script will:
- ✅ Check SQLite database exists
- ✅ Test PostgreSQL connection
- ✅ Clear existing PostgreSQL data (for clean migration)
- ✅ Migrate all data in correct order:
  1. Users
  2. Clients
  3. Business Plans
  4. Notes
  5. Files (metadata)
  6. Deliverables
  7. Invites
- ✅ Print migration summary

### Expected Output

```
[2024-01-15T10:30:00.000Z] 📋 Starting SQLite to PostgreSQL Migration
============================================================

[2024-01-15T10:30:00.100Z] 📋 Running pre-flight checks...
[2024-01-15T10:30:00.200Z] ✅ Found SQLite database at: /path/to/wavelaunch.db
[2024-01-15T10:30:00.300Z] ✅ PostgreSQL connection successful

[2024-01-15T10:30:00.400Z] 📋 Pre-flight checks passed. Starting migration...

[2024-01-15T10:30:00.500Z] ✅ Migrated 5 users
[2024-01-15T10:30:00.600Z] ✅ Migrated 25 clients
[2024-01-15T10:30:00.700Z] ✅ Migrated 18 business plans
...

============================================================
MIGRATION SUMMARY
============================================================
✅ User: 5 records
✅ Client: 25 records
✅ BusinessPlan: 18 records
✅ Note: 47 records
✅ File: 32 records
✅ Deliverable: 15 records
✅ Invite: 3 records
============================================================
Total Records Migrated: 145
Successful Models: 7/7
Failed Models: 0/7
============================================================

✅ Migration completed successfully!
```

## Step 5: Verify Migration

Verify the data was migrated correctly:

```bash
# Open Prisma Studio to inspect data
npx prisma studio
```

Or use pgAdmin (if running):
1. Open http://localhost:5050
2. Login with:
   - Email: `admin@wavelaunch.studio`
   - Password: `admin`
3. Add server:
   - Host: `postgres`
   - Port: `5432`
   - Database: `wavelaunch_crm`
   - Username: `wavelaunch`
   - Password: `wavelaunch_password`

## Step 6: Test Application

Start the application and verify everything works:

```bash
# Start development server
npm run dev

# Test key functionality:
# 1. Login as admin
# 2. View clients list
# 3. Create a new client
# 4. Upload a file
# 5. Generate a business plan
# 6. Check deliverables
```

## Step 7: Backup SQLite Database

Once migration is verified, backup your SQLite database:

```bash
# Create backups directory
mkdir -p backups

# Copy SQLite database
cp data/wavelaunch.db backups/wavelaunch_$(date +%Y%m%d_%H%M%S).db

# Optional: Compress the backup
gzip backups/wavelaunch_*.db
```

## Troubleshooting

### PostgreSQL Connection Refused

```bash
# Check if container is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs for errors
docker-compose logs postgres
```

### Migration Script Errors

**Error: SQLite database not found**
```bash
# Verify SQLite database exists
ls -la data/wavelaunch.db

# Update SQLITE_DATABASE_URL if needed
export SQLITE_DATABASE_URL="file:./data/wavelaunch.db"
```

**Error: PostgreSQL connection failed**
```bash
# Ensure PostgreSQL is running
docker-compose up -d postgres

# Test connection manually
docker exec -it wavelaunch-crm-postgres-1 psql -U wavelaunch -d wavelaunch_crm

# Verify DATABASE_URL in .env is correct
```

**Error: Prisma Client not generated**
```bash
# Regenerate Prisma Client
npx prisma generate
```

### Port Conflicts

If ports 5432 (PostgreSQL) or 6379 (Redis) are already in use:

1. Edit `docker-compose.yml`:
```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Use 5433 instead
  redis:
    ports:
      - "6380:6379"  # Use 6380 instead
```

2. Update `.env`:
```bash
DATABASE_URL="postgresql://wavelaunch:wavelaunch_password@localhost:5433/wavelaunch_crm"
REDIS_URL="redis://localhost:6380"
```

## Rollback Procedure

If you need to rollback to SQLite:

1. Stop the application
2. Update `.env`:
   ```bash
   DATABASE_URL="file:../data/wavelaunch.db"
   # REDIS_URL="redis://localhost:6379"  # Comment out
   ```
3. Restart the application: `npm run dev`

## Production Deployment

For production deployment:

### 1. Use Strong Passwords

Update `docker-compose.yml`:
```yaml
environment:
  POSTGRES_PASSWORD: "your-strong-password-here"
```

Update `.env`:
```bash
DATABASE_URL="postgresql://wavelaunch:your-strong-password-here@localhost:5432/wavelaunch_crm"
```

### 2. Enable SSL/TLS

Update DATABASE_URL:
```bash
DATABASE_URL="postgresql://wavelaunch:password@localhost:5432/wavelaunch_crm?sslmode=require"
```

### 3. Configure Backups

Add to `docker-compose.yml`:
```yaml
services:
  postgres-backup:
    image: prodrigestivill/postgres-backup-local
    restart: always
    volumes:
      - ./backups:/backups
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=wavelaunch_crm
      - POSTGRES_USER=wavelaunch
      - POSTGRES_PASSWORD=wavelaunch_password
      - SCHEDULE=@daily
      - BACKUP_KEEP_DAYS=7
      - BACKUP_KEEP_WEEKS=4
      - BACKUP_KEEP_MONTHS=6
```

### 4. Use External PostgreSQL (Recommended)

For production, use a managed PostgreSQL service:
- **AWS RDS** for PostgreSQL
- **Google Cloud SQL** for PostgreSQL
- **Azure Database** for PostgreSQL
- **Supabase** (PostgreSQL + additional features)
- **Railway**, **Render**, or **Fly.io** (easy deployment)

Update `.env`:
```bash
DATABASE_URL="postgresql://user:password@your-db-host:5432/database?sslmode=require"
REDIS_URL="redis://your-redis-host:6379"
```

### 5. Monitor Performance

After migration, monitor:
- Query performance (use `EXPLAIN ANALYZE` in pgAdmin)
- Connection pool usage
- Database size growth
- Backup completion

## Next Steps

After successful migration:

1. ✅ Continue with Sprint 2: BullMQ Job Queue Implementation
2. ✅ Set up automated database backups
3. ✅ Configure monitoring and alerting
4. ✅ Update deployment documentation
5. ✅ Train team on PostgreSQL management

## Resources

- [Prisma PostgreSQL Documentation](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Redis Documentation](https://redis.io/documentation)
