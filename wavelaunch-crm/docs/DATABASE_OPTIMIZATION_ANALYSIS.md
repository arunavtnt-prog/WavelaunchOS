# Database Performance Optimization Analysis

## Current Index Status

### ✅ Well-Indexed Models
- **LoginAttempt**: email+createdAt, ip+createdAt, userId+createdAt
- **Application**: email, createdAt, status
- **TokenUsage**: createdAt, operation, clientId, cacheKey
- **PromptCache**: cacheKey, expiresAt
- **ClientPortalUser**: email, clientId
- **PortalMessage**: threadId, clientId, createdAt
- **PortalNotification**: clientUserId, isRead, createdAt
- **Ticket**: clientId, assignedTo, status, priority, createdAt
- **TicketComment**: ticketId, authorId, createdAt
- **HelpArticle**: categoryId, slug, isPublished, isFeatured, viewCount

### ⚠️ Models Missing Critical Indexes

#### 1. **Client** (CRITICAL)
Current: Only email @unique (automatic index)
Missing:
- `status` - Frequently filtered (ACTIVE/INACTIVE/ARCHIVED)
- `createdAt` - Used for sorting client lists
- `onboardedAt` - Analytics queries
- `deletedAt` - Soft delete queries

**Impact**: Slow client list queries, especially with filters

#### 2. **BusinessPlan** (CRITICAL)
Current: No indexes
Missing:
- `clientId` - **MOST CRITICAL** - Every query joins on this
- `status` - Filter drafts/approved/delivered
- `generatedBy` - User analytics
- `createdAt` - Sorting by date
- Composite: `clientId + status` - Common query pattern

**Impact**: Very slow business plan fetches per client

#### 3. **Deliverable** (CRITICAL)
Current: No indexes
Missing:
- `clientId` - **MOST CRITICAL** - Every query joins on this
- `month` - Filter/sort by month (M1-M8)
- `status` - Filter by status
- `generatedBy` - User analytics
- `createdAt` - Sorting
- Composite: `clientId + month` - Unique month lookups

**Impact**: Extremely slow deliverable queries (worst offender)

#### 4. **File** (HIGH PRIORITY)
Current: No indexes
Missing:
- `clientId` - Fetch client files
- `uploadedBy` - User analytics
- `category` - Filter by type
- `uploadedAt` - Sorting
- `deletedAt` - Soft delete queries

**Impact**: Slow file lists, especially for clients with many files

#### 5. **Job** (HIGH PRIORITY)
Current: No indexes
Missing:
- `type` - Filter by job type
- `status` - **CRITICAL** - Queue processing
- `createdAt` - FIFO queue ordering
- Composite: `status + createdAt` - Optimal for queue workers

**Impact**: Job queue processing slows down significantly at scale

#### 6. **Note** (MEDIUM PRIORITY)
Current: No indexes
Missing:
- `clientId` - Fetch client notes
- `authorId` - User analytics
- `isImportant` - Filter important notes
- `createdAt` - Sorting
- `updatedAt` - Recently updated notes

**Impact**: Slow note queries for clients with many notes

#### 7. **Activity** (MEDIUM PRIORITY)
Current: No indexes
Missing:
- `clientId` - Filter client activity
- `userId` - User activity tracking
- `type` - Filter by activity type
- `createdAt` - Time-based queries

**Impact**: Activity log queries slow with large datasets

#### 8. **PromptTemplate** (LOW PRIORITY)
Current: No indexes
Missing:
- `type` - Filter by template type
- `isActive` - Find active templates
- `isDefault` - Find default template

**Impact**: Minor, templates are small dataset

#### 9. **BackupLog** (LOW PRIORITY)
Current: No indexes
Missing:
- `status` - Filter by success/failed
- `createdAt` - Sorting backups

**Impact**: Minor, backups are accessed infrequently

## Optimization Recommendations

### Phase 1: Critical Indexes (Do Immediately)
These indexes address the most severe N+1 query problems:

```prisma
// Business Plans
@@index([clientId])
@@index([status])
@@index([clientId, status]) // Composite for common queries

// Deliverables
@@index([clientId])
@@index([month])
@@index([status])
@@index([clientId, month]) // Unique month lookups

// Jobs
@@index([status])
@@index([type])
@@index([status, createdAt]) // Queue processing
```

**Expected Impact**: 50-100x faster for business plan and deliverable queries

### Phase 2: High Priority Indexes
```prisma
// Client
@@index([status])
@@index([createdAt])
@@index([deletedAt])

// File
@@index([clientId])
@@index([category])
@@index([uploadedAt])

// Note
@@index([clientId])
@@index([createdAt])
```

**Expected Impact**: 10-50x faster for client lists and file operations

### Phase 3: Analytics Indexes
```prisma
// Activity
@@index([clientId])
@@index([type])
@@index([createdAt])

// User
@@index([role])
@@index([lastLoginAt])
```

**Expected Impact**: Faster dashboards and analytics

## Query Pattern Analysis

### Most Common Queries

1. **Get client's deliverables**
   ```sql
   WHERE clientId = ? ORDER BY month ASC
   ```
   Needs: `@@index([clientId, month])`

2. **Get pending jobs**
   ```sql
   WHERE status = 'QUEUED' ORDER BY createdAt ASC
   ```
   Needs: `@@index([status, createdAt])`

3. **Get active clients**
   ```sql
   WHERE status = 'ACTIVE' ORDER BY createdAt DESC
   ```
   Needs: `@@index([status, createdAt])`

4. **Get client's business plans**
   ```sql
   WHERE clientId = ? AND status = 'APPROVED'
   ```
   Needs: `@@index([clientId, status])`

### N+1 Query Problems

Current code likely has N+1 issues in:
- `/api/clients` - Loading deliverables for each client
- `/api/deliverables` - Loading client info
- `/api/jobs/metrics` - Counting jobs by status
- Activity logs - Loading client/user for each activity

Adding indexes won't fix N+1, but will make them faster. Should also add:
- Prisma `include` statements for eager loading
- Batch queries using `findMany` with `in` operator

## Database Size Projections

With 100 clients over 2 years:
- Clients: ~100 rows
- BusinessPlans: ~100 rows (1 per client)
- Deliverables: ~800 rows (8 per client)
- Files: ~5,000 rows (50 per client avg)
- Notes: ~1,000 rows (10 per client avg)
- Activities: ~10,000 rows
- Jobs: ~50,000 rows (with cleanup)

**Index Overhead**: ~10-20MB total (negligible)
**Query Speed Improvement**: 10-100x on indexed fields

## Conclusion

Adding indexes is a **zero-risk, high-reward** optimization. The current schema is missing critical indexes that will cause significant performance degradation at scale.

**Priority Order**:
1. Deliverable indexes (most critical)
2. BusinessPlan indexes
3. Job indexes
4. Client indexes
5. File indexes
6. Everything else

**Recommendation**: Add all Phase 1 and Phase 2 indexes immediately.
