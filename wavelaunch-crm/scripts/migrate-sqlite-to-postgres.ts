#!/usr/bin/env tsx
/**
 * SQLite to PostgreSQL Data Migration Script
 *
 * This script migrates all data from the existing SQLite database
 * to the new PostgreSQL database.
 *
 * Prerequisites:
 * - SQLite database exists at ../data/wavelaunch.db
 * - PostgreSQL database is running (via docker-compose up -d postgres)
 * - Prisma schema has been migrated to PostgreSQL
 *
 * Usage:
 *   npx tsx scripts/migrate-sqlite-to-postgres.ts
 */

import { PrismaClient as SQLitePrismaClient } from '@prisma/client'
import { PrismaClient as PostgresPrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Environment variables for migration
const SQLITE_DB_URL = process.env.SQLITE_DATABASE_URL || 'file:../data/wavelaunch.db'
const POSTGRES_DB_URL = process.env.DATABASE_URL || 'postgresql://wavelaunch:wavelaunch_password@localhost:5432/wavelaunch_crm'

// Initialize clients
const sqliteClient = new SQLitePrismaClient({
  datasources: {
    db: {
      url: SQLITE_DB_URL,
    },
  },
})

const postgresClient = new PostgresPrismaClient({
  datasources: {
    db: {
      url: POSTGRES_DB_URL,
    },
  },
})

interface MigrationStats {
  model: string
  count: number
  status: 'success' | 'error'
  error?: string
}

const stats: MigrationStats[] = []

/**
 * Log migration progress
 */
function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  }[type]

  console.log(`[${timestamp}] ${prefix} ${message}`)
}

/**
 * Check if SQLite database exists
 */
async function checkSQLiteDatabase(): Promise<boolean> {
  try {
    const dbPath = SQLITE_DB_URL.replace('file:', '')
    const fullPath = path.resolve(__dirname, dbPath)

    if (!fs.existsSync(fullPath)) {
      log(`SQLite database not found at: ${fullPath}`, 'error')
      return false
    }

    log(`Found SQLite database at: ${fullPath}`, 'success')
    return true
  } catch (error) {
    log(`Error checking SQLite database: ${error}`, 'error')
    return false
  }
}

/**
 * Test PostgreSQL connection
 */
async function testPostgresConnection(): Promise<boolean> {
  try {
    await postgresClient.$queryRaw`SELECT 1`
    log('PostgreSQL connection successful', 'success')
    return true
  } catch (error) {
    log(`PostgreSQL connection failed: ${error}`, 'error')
    return false
  }
}

/**
 * Migrate Users
 */
async function migrateUsers() {
  try {
    log('Migrating Users...')
    const users = await sqliteClient.user.findMany()

    if (users.length === 0) {
      log('No users to migrate', 'warn')
      stats.push({ model: 'User', count: 0, status: 'success' })
      return
    }

    // PostgreSQL migration - preserve IDs
    for (const user of users) {
      await postgresClient.user.create({
        data: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // New fields will use defaults
        },
      })
    }

    log(`Migrated ${users.length} users`, 'success')
    stats.push({ model: 'User', count: users.length, status: 'success' })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    log(`Error migrating users: ${errorMsg}`, 'error')
    stats.push({ model: 'User', count: 0, status: 'error', error: errorMsg })
    throw error
  }
}

/**
 * Migrate Clients
 */
async function migrateClients() {
  try {
    log('Migrating Clients...')
    const clients = await sqliteClient.client.findMany()

    if (clients.length === 0) {
      log('No clients to migrate', 'warn')
      stats.push({ model: 'Client', count: 0, status: 'success' })
      return
    }

    for (const client of clients) {
      await postgresClient.client.create({
        data: {
          id: client.id,
          userId: client.userId,
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          status: client.status,
          tags: client.tags,
          source: client.source,
          notes: client.notes,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        },
      })
    }

    log(`Migrated ${clients.length} clients`, 'success')
    stats.push({ model: 'Client', count: clients.length, status: 'success' })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    log(`Error migrating clients: ${errorMsg}`, 'error')
    stats.push({ model: 'Client', count: 0, status: 'error', error: errorMsg })
    throw error
  }
}

/**
 * Migrate Business Plans
 */
async function migrateBusinessPlans() {
  try {
    log('Migrating Business Plans...')
    const plans = await sqliteClient.businessPlan.findMany()

    if (plans.length === 0) {
      log('No business plans to migrate', 'warn')
      stats.push({ model: 'BusinessPlan', count: 0, status: 'success' })
      return
    }

    for (const plan of plans) {
      await postgresClient.businessPlan.create({
        data: {
          id: plan.id,
          clientId: plan.clientId,
          userId: plan.userId,
          content: plan.content,
          status: plan.status,
          version: plan.version,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        },
      })
    }

    log(`Migrated ${plans.length} business plans`, 'success')
    stats.push({ model: 'BusinessPlan', count: plans.length, status: 'success' })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    log(`Error migrating business plans: ${errorMsg}`, 'error')
    stats.push({ model: 'BusinessPlan', count: 0, status: 'error', error: errorMsg })
    throw error
  }
}

/**
 * Migrate Notes
 */
async function migrateNotes() {
  try {
    log('Migrating Notes...')
    const notes = await sqliteClient.note.findMany()

    if (notes.length === 0) {
      log('No notes to migrate', 'warn')
      stats.push({ model: 'Note', count: 0, status: 'success' })
      return
    }

    for (const note of notes) {
      await postgresClient.note.create({
        data: {
          id: note.id,
          clientId: note.clientId,
          userId: note.userId,
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
      })
    }

    log(`Migrated ${notes.length} notes`, 'success')
    stats.push({ model: 'Note', count: notes.length, status: 'success' })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    log(`Error migrating notes: ${errorMsg}`, 'error')
    stats.push({ model: 'Note', count: 0, status: 'error', error: errorMsg })
    throw error
  }
}

/**
 * Migrate Files
 */
async function migrateFiles() {
  try {
    log('Migrating Files...')
    const files = await sqliteClient.file.findMany()

    if (files.length === 0) {
      log('No files to migrate', 'warn')
      stats.push({ model: 'File', count: 0, status: 'success' })
      return
    }

    for (const file of files) {
      await postgresClient.file.create({
        data: {
          id: file.id,
          clientId: file.clientId,
          userId: file.userId,
          name: file.name,
          path: file.path,
          mimeType: file.mimeType,
          size: file.size,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
        },
      })
    }

    log(`Migrated ${files.length} files`, 'success')
    stats.push({ model: 'File', count: files.length, status: 'success' })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    log(`Error migrating files: ${errorMsg}`, 'error')
    stats.push({ model: 'File', count: 0, status: 'error', error: errorMsg })
    throw error
  }
}

/**
 * Migrate Deliverables
 */
async function migrateDeliverables() {
  try {
    log('Migrating Deliverables...')
    const deliverables = await sqliteClient.deliverable.findMany()

    if (deliverables.length === 0) {
      log('No deliverables to migrate', 'warn')
      stats.push({ model: 'Deliverable', count: 0, status: 'success' })
      return
    }

    for (const deliverable of deliverables) {
      await postgresClient.deliverable.create({
        data: {
          id: deliverable.id,
          clientId: deliverable.clientId,
          userId: deliverable.userId,
          title: deliverable.title,
          description: deliverable.description,
          status: deliverable.status,
          dueDate: deliverable.dueDate,
          completedAt: deliverable.completedAt,
          fileId: deliverable.fileId,
          createdAt: deliverable.createdAt,
          updatedAt: deliverable.updatedAt,
        },
      })
    }

    log(`Migrated ${deliverables.length} deliverables`, 'success')
    stats.push({ model: 'Deliverable', count: deliverables.length, status: 'success' })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    log(`Error migrating deliverables: ${errorMsg}`, 'error')
    stats.push({ model: 'Deliverable', count: 0, status: 'error', error: errorMsg })
    throw error
  }
}

/**
 * Migrate Invites
 */
async function migrateInvites() {
  try {
    log('Migrating Invites...')
    const invites = await sqliteClient.invite.findMany()

    if (invites.length === 0) {
      log('No invites to migrate', 'warn')
      stats.push({ model: 'Invite', count: 0, status: 'success' })
      return
    }

    for (const invite of invites) {
      await postgresClient.invite.create({
        data: {
          id: invite.id,
          clientId: invite.clientId,
          userId: invite.userId,
          token: invite.token,
          email: invite.email,
          expiresAt: invite.expiresAt,
          usedAt: invite.usedAt,
          createdAt: invite.createdAt,
          updatedAt: invite.updatedAt,
        },
      })
    }

    log(`Migrated ${invites.length} invites`, 'success')
    stats.push({ model: 'Invite', count: invites.length, status: 'success' })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    log(`Error migrating invites: ${errorMsg}`, 'error')
    stats.push({ model: 'Invite', count: 0, status: 'error', error: errorMsg })
    throw error
  }
}

/**
 * Print migration summary
 */
function printSummary() {
  log('\n' + '='.repeat(60))
  log('MIGRATION SUMMARY', 'info')
  log('='.repeat(60))

  let totalRecords = 0
  let successCount = 0
  let errorCount = 0

  for (const stat of stats) {
    const status = stat.status === 'success' ? '✅' : '❌'
    const errorInfo = stat.error ? ` (${stat.error})` : ''
    log(`${status} ${stat.model}: ${stat.count} records${errorInfo}`)

    totalRecords += stat.count
    if (stat.status === 'success') {
      successCount++
    } else {
      errorCount++
    }
  }

  log('='.repeat(60))
  log(`Total Records Migrated: ${totalRecords}`)
  log(`Successful Models: ${successCount}/${stats.length}`)
  log(`Failed Models: ${errorCount}/${stats.length}`)
  log('='.repeat(60) + '\n')

  if (errorCount > 0) {
    log('Migration completed with errors. Please review the errors above.', 'warn')
  } else {
    log('Migration completed successfully!', 'success')
  }
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    log('Starting SQLite to PostgreSQL Migration', 'info')
    log('='.repeat(60) + '\n')

    // Pre-flight checks
    log('Running pre-flight checks...')
    const sqliteExists = await checkSQLiteDatabase()
    if (!sqliteExists) {
      log('SQLite database not found. Exiting.', 'error')
      process.exit(1)
    }

    const postgresConnected = await testPostgresConnection()
    if (!postgresConnected) {
      log('PostgreSQL connection failed. Make sure PostgreSQL is running.', 'error')
      log('Run: docker-compose up -d postgres', 'info')
      process.exit(1)
    }

    log('\nPre-flight checks passed. Starting migration...\n')

    // Clear existing data in PostgreSQL (for clean migration)
    log('Clearing existing PostgreSQL data...')
    await postgresClient.loginAttempt.deleteMany()
    await postgresClient.invite.deleteMany()
    await postgresClient.deliverable.deleteMany()
    await postgresClient.file.deleteMany()
    await postgresClient.note.deleteMany()
    await postgresClient.businessPlan.deleteMany()
    await postgresClient.client.deleteMany()
    await postgresClient.user.deleteMany()
    log('PostgreSQL data cleared\n', 'success')

    // Migrate data in correct order (respecting foreign keys)
    await migrateUsers()
    await migrateClients()
    await migrateBusinessPlans()
    await migrateNotes()
    await migrateFiles()
    await migrateDeliverables()
    await migrateInvites()

    // Print summary
    printSummary()

  } catch (error) {
    log(`\nMigration failed: ${error}`, 'error')
    printSummary()
    process.exit(1)
  } finally {
    // Disconnect clients
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

// Run migration
migrate()
