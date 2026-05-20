-- Sprint 5: Database Performance Optimization
-- Add strategic indexes for frequently queried fields

-- =================================================================
-- USER INDEXES
-- =================================================================
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_lastLoginAt_idx" ON "users"("lastLoginAt");
CREATE INDEX IF NOT EXISTS "users_lockedUntil_idx" ON "users"("lockedUntil");

-- =================================================================
-- CLIENT INDEXES
-- =================================================================
CREATE INDEX IF NOT EXISTS "clients_status_idx" ON "clients"("status");
CREATE INDEX IF NOT EXISTS "clients_createdAt_idx" ON "clients"("createdAt");
CREATE INDEX IF NOT EXISTS "clients_onboardedAt_idx" ON "clients"("onboardedAt");
CREATE INDEX IF NOT EXISTS "clients_deletedAt_idx" ON "clients"("deletedAt");

-- =================================================================
-- BUSINESS PLAN INDEXES (CRITICAL)
-- =================================================================
CREATE INDEX IF NOT EXISTS "business_plans_clientId_idx" ON "business_plans"("clientId");
CREATE INDEX IF NOT EXISTS "business_plans_status_idx" ON "business_plans"("status");
CREATE INDEX IF NOT EXISTS "business_plans_generatedBy_idx" ON "business_plans"("generatedBy");
CREATE INDEX IF NOT EXISTS "business_plans_createdAt_idx" ON "business_plans"("createdAt");
CREATE INDEX IF NOT EXISTS "business_plans_clientId_status_idx" ON "business_plans"("clientId", "status");

-- =================================================================
-- DELIVERABLE INDEXES (CRITICAL)
-- =================================================================
CREATE INDEX IF NOT EXISTS "deliverables_clientId_idx" ON "deliverables"("clientId");
CREATE INDEX IF NOT EXISTS "deliverables_month_idx" ON "deliverables"("month");
CREATE INDEX IF NOT EXISTS "deliverables_status_idx" ON "deliverables"("status");
CREATE INDEX IF NOT EXISTS "deliverables_generatedBy_idx" ON "deliverables"("generatedBy");
CREATE INDEX IF NOT EXISTS "deliverables_createdAt_idx" ON "deliverables"("createdAt");
CREATE INDEX IF NOT EXISTS "deliverables_clientId_month_idx" ON "deliverables"("clientId", "month");
CREATE INDEX IF NOT EXISTS "deliverables_clientId_status_idx" ON "deliverables"("clientId", "status");

-- =================================================================
-- FILE INDEXES
-- =================================================================
CREATE INDEX IF NOT EXISTS "files_clientId_idx" ON "files"("clientId");
CREATE INDEX IF NOT EXISTS "files_uploadedBy_idx" ON "files"("uploadedBy");
CREATE INDEX IF NOT EXISTS "files_category_idx" ON "files"("category");
CREATE INDEX IF NOT EXISTS "files_uploadedAt_idx" ON "files"("uploadedAt");
CREATE INDEX IF NOT EXISTS "files_deletedAt_idx" ON "files"("deletedAt");

-- =================================================================
-- PROMPT TEMPLATE INDEXES
-- =================================================================
CREATE INDEX IF NOT EXISTS "prompt_templates_type_idx" ON "prompt_templates"("type");
CREATE INDEX IF NOT EXISTS "prompt_templates_isActive_idx" ON "prompt_templates"("isActive");
CREATE INDEX IF NOT EXISTS "prompt_templates_isDefault_idx" ON "prompt_templates"("isDefault");

-- =================================================================
-- JOB INDEXES (CRITICAL)
-- =================================================================
CREATE INDEX IF NOT EXISTS "jobs_type_idx" ON "jobs"("type");
CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs"("status");
CREATE INDEX IF NOT EXISTS "jobs_createdAt_idx" ON "jobs"("createdAt");
CREATE INDEX IF NOT EXISTS "jobs_status_createdAt_idx" ON "jobs"("status", "createdAt");

-- =================================================================
-- NOTE INDEXES
-- =================================================================
CREATE INDEX IF NOT EXISTS "notes_clientId_idx" ON "notes"("clientId");
CREATE INDEX IF NOT EXISTS "notes_authorId_idx" ON "notes"("authorId");
CREATE INDEX IF NOT EXISTS "notes_isImportant_idx" ON "notes"("isImportant");
CREATE INDEX IF NOT EXISTS "notes_createdAt_idx" ON "notes"("createdAt");
CREATE INDEX IF NOT EXISTS "notes_updatedAt_idx" ON "notes"("updatedAt");

-- =================================================================
-- ACTIVITY INDEXES
-- =================================================================
CREATE INDEX IF NOT EXISTS "activities_clientId_idx" ON "activities"("clientId");
CREATE INDEX IF NOT EXISTS "activities_userId_idx" ON "activities"("userId");
CREATE INDEX IF NOT EXISTS "activities_type_idx" ON "activities"("type");
CREATE INDEX IF NOT EXISTS "activities_createdAt_idx" ON "activities"("createdAt");
CREATE INDEX IF NOT EXISTS "activities_clientId_createdAt_idx" ON "activities"("clientId", "createdAt");

-- =================================================================
-- BACKUP LOG INDEXES
-- =================================================================
CREATE INDEX IF NOT EXISTS "backup_logs_status_idx" ON "backup_logs"("status");
CREATE INDEX IF NOT EXISTS "backup_logs_createdAt_idx" ON "backup_logs"("createdAt");

-- =================================================================
-- PERFORMANCE VERIFICATION
-- =================================================================
-- After running this migration, verify indexes with:
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;
