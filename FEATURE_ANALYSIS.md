# Wavelaunch CRM - Feature Analysis & Implementation Plan

## Overview
This document analyzes the existing features in the Wavelaunch CRM and identifies gaps that need to be implemented based on the requirements.

---

## ✅ Already Implemented Features

### Client Management
- ✅ Client CRUD operations (Create, Read, Update)
- ✅ Soft delete with `deletedAt` field
- ✅ Client search functionality
- ✅ Client capacity tracking (100 clients max)
- ✅ 29+ onboarding fields
- ✅ Client detail view with stats
- ✅ Activity logging for all client actions

### File Management
- ✅ File upload/download
- ✅ Category-based organization (BUSINESS_PLAN, DELIVERABLE, UPLOAD, MISC)
- ✅ Storage limits (50GB total, 10MB per file)
- ✅ Storage usage tracking with warnings
- ✅ File deletion with confirmation
- ✅ Drag-and-drop upload
- ✅ Category filtering

### AI Generation & Token Management
- ✅ Claude API integration (claude-sonnet-4-20250514)
- ✅ Max token limit (8000 tokens per request)
- ✅ Job queue for background processing
- ✅ Rate limiting (1 concurrent AI job)
- ✅ Streaming support for long generations
- ✅ Approximate token counting

### Business Plans & Deliverables
- ✅ Business plan generation with versioning
- ✅ 8-month deliverable system (M1-M8)
- ✅ PDF export for documents
- ✅ Status workflow (DRAFT → PENDING_REVIEW → APPROVED → DELIVERED)
- ✅ Context-aware sequential generation

### Activity & Audit
- ✅ Comprehensive activity logging
- ✅ 20+ activity types tracked
- ✅ Soft delete recovery support

---

## ❌ Missing Features (To Be Implemented)

### 1. File Management Enhancements

#### 1.1 Bulk File Operations
**Status:** ❌ Not Implemented
**Priority:** High
**Impact:** Improves productivity for managing multiple files

**Requirements:**
- Select multiple files with checkboxes
- Bulk delete selected files
- Bulk download selected files (as ZIP)
- "Select All" functionality
- Selected count indicator
- Bulk action confirmation dialogs

**Implementation Plan:**
- Add checkbox column to file list table
- Create `selectedFiles` state array
- Add "Select All" toggle in table header
- Create bulk action buttons (Delete Selected, Download Selected)
- Implement API endpoint: `POST /api/files/bulk-delete`
- Implement API endpoint: `POST /api/files/bulk-download` (creates ZIP)
- Add confirmation modals for bulk actions

**Files to Modify:**
- `wavelaunch-crm/src/app/(dashboard)/files/page.tsx`
- `wavelaunch-crm/src/app/api/files/bulk-delete/route.ts` (new)
- `wavelaunch-crm/src/app/api/files/bulk-download/route.ts` (new)

---

#### 1.2 File Preview
**Status:** ❌ Not Implemented
**Priority:** Medium
**Impact:** Better UX, reduces unnecessary downloads

**Requirements:**
- Preview button for each file
- Modal preview for common file types:
  - Images (PNG, JPG, GIF, WebP)
  - PDFs (embedded viewer)
  - Text files (TXT, MD, JSON)
  - Code files (TS, JS, CSS with syntax highlighting)
- Download option from preview modal
- Next/Previous navigation in preview
- Close on ESC key

**Implementation Plan:**
- Create `FilePreviewModal` component
- Add preview icon button to file list
- Implement file type detection
- Use `react-pdf` for PDF viewing
- Use `next/image` for image preview
- Use CodeMirror for code preview
- Add keyboard navigation

**Files to Create/Modify:**
- `wavelaunch-crm/src/components/files/file-preview-modal.tsx` (new)
- `wavelaunch-crm/src/app/(dashboard)/files/page.tsx`

**Dependencies to Add:**
```bash
npm install react-pdf @react-pdf-viewer/core
```

---

#### 1.3 Advanced File Filters
**Status:** ❌ Not Implemented (only category filter exists)
**Priority:** Medium
**Impact:** Faster file discovery

**Requirements:**
- Search by filename (fuzzy search)
- Filter by upload date range (date picker)
- Filter by file size range
- Filter by uploader (user dropdown)
- Filter by MIME type
- Combine multiple filters
- Clear all filters button
- URL query params for shareable filters

**Implementation Plan:**
- Create `FileFilters` component with filter UI
- Add search input with debounce
- Add date range picker (using shadcn/ui Calendar)
- Add size range slider
- Add uploader dropdown (fetch users)
- Update API to accept filter params
- Store filter state in URL query params

**Files to Create/Modify:**
- `wavelaunch-crm/src/components/files/file-filters.tsx` (new)
- `wavelaunch-crm/src/app/(dashboard)/files/page.tsx`
- `wavelaunch-crm/src/app/api/files/route.ts`

---

### 2. Client Management Enhancements

#### 2.1 Archive/Restore UI
**Status:** ❌ Not Implemented (`deletedAt` field exists but no UI)
**Priority:** High
**Impact:** Better client lifecycle management

**Requirements:**
- "Archive" button on client cards
- Archived clients section (toggle view)
- Restore button for archived clients
- Permanent delete option for archived clients
- Archive confirmation modal
- Archive reason field (optional)
- Show archived count in stats

**Implementation Plan:**
- Add "Archive Client" button to client detail page
- Create `/clients/archived` route for archived view
- Implement soft delete by setting `deletedAt`
- Add "Restore" button that clears `deletedAt`
- Add permanent delete option (requires confirmation)
- Update client listing to exclude deleted by default
- Add toggle to show/hide archived

**Files to Create/Modify:**
- `wavelaunch-crm/src/app/(dashboard)/clients/archived/page.tsx` (new)
- `wavelaunch-crm/src/app/(dashboard)/clients/page.tsx`
- `wavelaunch-crm/src/app/(dashboard)/clients/[id]/page.tsx`
- `wavelaunch-crm/src/app/api/clients/[id]/archive/route.ts` (new)
- `wavelaunch-crm/src/app/api/clients/[id]/restore/route.ts` (new)

---

#### 2.2 Bulk Client Operations
**Status:** ❌ Not Implemented
**Priority:** Medium
**Impact:** Improves admin efficiency

**Requirements:**
- Select multiple clients with checkboxes
- Bulk status change (ACTIVE ↔ INACTIVE ↔ ARCHIVED)
- Bulk delete/archive
- Bulk tag assignment (if tags added)
- "Select All" on current page
- Selected count indicator
- Bulk action confirmation

**Implementation Plan:**
- Add checkbox column to client grid
- Create `selectedClients` state array
- Add "Select All" toggle
- Create bulk action dropdown menu
- Implement API endpoint: `POST /api/clients/bulk-update`
- Implement API endpoint: `POST /api/clients/bulk-archive`
- Add confirmation modals

**Files to Modify:**
- `wavelaunch-crm/src/app/(dashboard)/clients/page.tsx`
- `wavelaunch-crm/src/app/api/clients/bulk-update/route.ts` (new)
- `wavelaunch-crm/src/app/api/clients/bulk-archive/route.ts` (new)

---

### 3. Token Optimization Enhancements

#### 3.1 Token Budget Alerts
**Status:** ❌ Not Implemented
**Priority:** High
**Impact:** Cost control and transparency

**Requirements:**
- Display current token usage for generation
- Show estimated cost before generation
- Warning when approaching limit (e.g., 80% of 8000)
- Monthly token usage dashboard
- Per-client token tracking
- Token usage history chart
- Budget threshold settings

**Implementation Plan:**
- Create token usage tracking table in database
- Log tokens used for each generation job
- Create dashboard widget showing token stats
- Add pre-generation estimate modal
- Implement warning threshold (configurable)
- Create `/settings/token-usage` page
- Add monthly usage chart with Recharts

**Files to Create/Modify:**
- `prisma/schema.prisma` - Add `TokenUsage` model
- `wavelaunch-crm/src/app/(dashboard)/settings/token-usage/page.tsx` (new)
- `wavelaunch-crm/src/lib/ai/usage-tracking.ts` (new)
- `wavelaunch-crm/src/lib/ai/generate.ts` - Add usage logging
- `wavelaunch-crm/src/components/dashboard/token-usage-widget.tsx` (new)

**Schema Addition:**
```prisma
model TokenUsage {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  jobId           String?
  jobType         String   // BUSINESS_PLAN, DELIVERABLE, etc.
  clientId        String?
  promptTokens    Int
  completionTokens Int
  totalTokens     Int
  estimatedCost   Float?
  model           String

  client          Client?  @relation(fields: [clientId], references: [id])

  @@index([clientId])
  @@index([createdAt])
  @@index([jobType])
}
```

---

#### 3.2 Content Caching for Similar Requests
**Status:** ❌ Not Implemented
**Priority:** Low (Nice to have)
**Impact:** Token savings for duplicate queries

**Requirements:**
- Hash prompt templates to detect duplicates
- Cache AI responses for identical prompts
- TTL for cache (e.g., 7 days)
- Cache hit/miss statistics
- Manual cache invalidation
- Exclude client-specific data from cache key

**Implementation Plan:**
- Create `GenerationCache` table in database
- Hash prompt template + key params
- Check cache before AI call
- Store successful responses in cache
- Implement TTL-based cleanup job
- Add cache stats to admin dashboard

**Files to Create/Modify:**
- `prisma/schema.prisma` - Add `GenerationCache` model
- `wavelaunch-crm/src/lib/ai/cache.ts` (new)
- `wavelaunch-crm/src/lib/ai/generate.ts` - Add cache layer

**Note:** This is lower priority as it may reduce response quality if context changes.

---

#### 3.3 Section-Based Regeneration
**Status:** ❌ Not Implemented
**Priority:** Medium
**Impact:** Fine-grained control, token savings

**Requirements:**
- Identify sections in generated documents
- "Regenerate Section" button for each section
- Only regenerate selected section, keep rest
- Section-specific prompts
- Version history for sections
- Preview before applying regeneration

**Implementation Plan:**
- Parse generated documents into sections
- Add section markers in templates
- Create UI for section selection
- Implement section-only regeneration endpoint
- Store section versions separately
- Add diff viewer for before/after

**Files to Create/Modify:**
- `wavelaunch-crm/src/lib/ai/section-generator.ts` (new)
- `wavelaunch-crm/src/app/api/business-plans/[id]/regenerate-section/route.ts` (new)
- `wavelaunch-crm/src/app/(dashboard)/business-plans/[id]/page.tsx`
- Update prompt templates with section markers

---

#### 3.4 Resume from Checkpoint on Retry
**Status:** ❌ Not Implemented
**Priority:** Medium
**Impact:** Faster retries, reduced waste

**Requirements:**
- Auto-save generation progress at intervals
- Store partial content in Job payload
- On retry, continue from last checkpoint
- Show resume option in UI
- Clear checkpoints on successful completion
- Checkpoint indicator in job status

**Implementation Plan:**
- Modify job queue to support streaming checkpoints
- Store partial results in Job.result field
- Add `lastCheckpoint` timestamp to Job model
- Update retry logic to resume from checkpoint
- Add UI indicator for resumable jobs
- Implement checkpoint cleanup

**Files to Modify:**
- `wavelaunch-crm/src/lib/jobs/queue.ts`
- `wavelaunch-crm/src/lib/ai/generate.ts`
- `wavelaunch-crm/src/app/(dashboard)/jobs/page.tsx`
- `prisma/schema.prisma` - Add `lastCheckpoint` field to Job

---

## Implementation Priority Matrix

| Feature | Priority | Complexity | Impact | Estimated Time |
|---------|----------|-----------|--------|---------------|
| Bulk File Operations | High | Low | High | 2-3 hours |
| File Preview | Medium | Medium | Medium | 3-4 hours |
| Advanced File Filters | Medium | Medium | Medium | 3-4 hours |
| Archive/Restore UI | High | Low | High | 2-3 hours |
| Bulk Client Operations | Medium | Low | Medium | 2-3 hours |
| Token Budget Alerts | High | Medium | High | 4-5 hours |
| Section-Based Regeneration | Medium | High | Medium | 6-8 hours |
| Resume from Checkpoint | Medium | High | Medium | 6-8 hours |
| Content Caching | Low | Medium | Low | 4-5 hours |

---

## Recommended Implementation Order

### Phase 1: Quick Wins (High Priority, Low Complexity)
1. **Bulk File Operations** - Immediate productivity boost
2. **Archive/Restore UI** - Complete existing soft delete feature
3. **Bulk Client Operations** - Consistent with file bulk ops

### Phase 2: Enhanced UX (Medium Priority)
4. **File Preview** - Better user experience
5. **Advanced File Filters** - Improved file discovery
6. **Token Budget Alerts** - Cost transparency

### Phase 3: Advanced Features (Complex but high value)
7. **Section-Based Regeneration** - Fine-grained control
8. **Resume from Checkpoint** - Reliability improvement

### Phase 4: Optimization (Nice to have)
9. **Content Caching** - Token savings

---

## Technical Considerations

### Database Changes Required
- Add `TokenUsage` model for tracking
- Add `GenerationCache` model for caching
- Add `lastCheckpoint` field to Job model
- Consider adding `archiveReason` to Client model

### Dependencies to Add
```bash
npm install react-pdf @react-pdf-viewer/core  # For file preview
npm install archiver                           # For ZIP creation (bulk download)
```

### API Endpoints to Create
- `POST /api/files/bulk-delete`
- `POST /api/files/bulk-download`
- `POST /api/clients/bulk-update`
- `POST /api/clients/bulk-archive`
- `POST /api/clients/[id]/archive`
- `POST /api/clients/[id]/restore`
- `POST /api/business-plans/[id]/regenerate-section`
- `GET /api/token-usage/stats`

---

## Testing Requirements

Each feature should include:
- ✅ Unit tests for utility functions
- ✅ Integration tests for API routes
- ✅ E2E tests for critical user flows
- ✅ Manual QA checklist
- ✅ Performance testing (especially for bulk operations)

---

## Documentation Updates

After implementation:
- Update main README with new features
- Create feature-specific guides
- Update API documentation
- Record video tutorials for complex features

---

**Last Updated:** 2025-11-15
**Status:** Ready for implementation - Phase 1 features prioritized
