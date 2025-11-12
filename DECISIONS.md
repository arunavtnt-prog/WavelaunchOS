# WavelaunchOS CRM - Confirmed Decisions

**Date:** November 12, 2025
**Status:** Approved - Ready for Implementation

---

## I. Critical Technical Decisions (CONFIRMED)

### 1. Skills Integration Strategy ✅

**Decision:** Use skills as development references to build initial YAML prompt templates. Admins can edit the markdown if they want to customize.

**Implementation:**
- Load skill files during development to create YAML templates
- Store YAML templates in `/data/prompts/`
- Provide UI for admins to edit YAML templates directly
- No runtime loading of .skill files

**Affects:** Week 5, Day 3 (Prompt Template System)

---

### 2. PDF Generation Approach ✅

**Decision:** Start with Pandoc + XeLaTeX per PRD. Can add HTML/CSS option later if needed.

**Implementation:**
- Primary: Markdown → Pandoc → XeLaTeX → PDF
- Use Wavelaunch LaTeX template with brand colors/fonts
- Bundle XeLaTeX in Docker image
- Future enhancement: Add HTML/CSS fallback option

**Affects:** Week 6, Day 1-2 (PDF Pipeline)

---

### 3. Document Generation Scope ✅

**Decision:** Start with 8 deliverables (M1-M8), one per month. The "40 documents" in the skill are subdocuments which will be decided by the admin if they should be made or not (not all generated for every client).

**Implementation:**
- Database: 8 deliverable records per client (M1-M8)
- Each month can have optional subdocuments (admin decides)
- UI: Monthly timeline showing M1-M8
- Prompt templates: Create 8 monthly templates + optional subdocument templates

**Data Model:**
```prisma
Deliverable {
  id
  clientId
  month          // 1-8
  title          // e.g., "Month 3: Market Entry Preparation"
  type           // MAIN or SUBDOCUMENT
  parentId       // null for main, references parent for subdocuments
  contentMarkdown
  status
}
```

**Affects:** Week 7, Day 1-2 (Deliverable System)

---

### 4. Prompt Template Source ✅

**Decision:** Use skill frameworks as inspiration, but create simplified prompts that work within Claude API context limits (~200k tokens).

**Implementation:**
- Extract key frameworks from creator-docs skill
- Simplify for API constraints
- Focus on quality over quantity
- Iterate based on output quality

**Affects:** Week 5, Day 3 (Prompt Templates)

---

### 5. Client Capacity Logic ✅

**Decision:** Hard block with clear error message at 100 clients.

**Implementation:**
```typescript
// API validation
if (clientCount >= 100) {
  throw new Error("Client capacity reached (100/100). Please contact Wavelaunch Studio to expand capacity.");
}
```

**UI:** Show capacity indicator in header (e.g., "95/100 clients")

**Affects:** Week 3, Day 1 (Client API)

---

### 6. File Storage Limits ✅

**Decision:** Warn at 80% (40GB), block at 100% (50GB).

**Implementation:**
- Monitor storage on every file upload
- Display storage indicator in UI
- Warning toast at 40GB: "Storage 80% full (40GB/50GB)"
- Block uploads at 50GB: "Storage full. Please delete files or contact support."

**Affects:** Week 7, Day 5 (Storage Management)

---

### 7. Backup Restoration Safety ✅

**Decision:** Both safety backup and confirmation.

**Implementation:**
1. User clicks "Restore Backup"
2. System creates safety backup first ("pre-restore-{timestamp}.db")
3. Show confirmation dialog with:
   - Backup date/size
   - Current database date/size
   - Warning about data loss
4. Require typing "RESTORE" to confirm
5. Perform restore
6. Verify integrity
7. Success/failure message

**Affects:** Week 8, Day 1 (Backup System)

---

### 8. Activity Log Detail Level ✅

**Decision:** Everything (all CRUD operations).

**Tracked Events:**
- CLIENT_CREATED
- CLIENT_UPDATED
- CLIENT_DELETED
- BUSINESS_PLAN_GENERATED
- BUSINESS_PLAN_UPDATED
- BUSINESS_PLAN_APPROVED
- BUSINESS_PLAN_DELIVERED
- DELIVERABLE_GENERATED
- DELIVERABLE_UPDATED
- DELIVERABLE_APPROVED
- DELIVERABLE_DELIVERED
- DELIVERABLE_REJECTED
- FILE_UPLOADED
- FILE_DELETED
- NOTE_CREATED
- NOTE_UPDATED
- NOTE_DELETED
- BACKUP_CREATED
- BACKUP_RESTORED

**Implementation:** Middleware that intercepts all API mutations

**Affects:** Week 4, Day 4 (Activity Log)

---

### 9. Email Notification Triggers ✅

**Decision:** Key events only for MVP, make configurable later.

**MVP Email Triggers:**
- Business plan generated (admin)
- Business plan approved (admin)
- Deliverable ready for review (admin)
- Deliverable approved (admin)
- Deliverable delivered (admin)

**Future:** Settings page to configure which events send emails

**Affects:** Week 6, Day 4 (Email Integration)

---

### 10. Next-Steps Engine Rules ✅

**Decision:** Show top 3 by priority, allow "Show all" expansion.

**Implementation:**
- Calculate all applicable suggestions
- Sort by priority (High → Medium → Low)
- Display top 3 in collapsed state
- "Show all suggestions (7)" button to expand
- Dismiss/complete individual suggestions

**Affects:** Week 8, Day 2 (AI Next-Steps Engine)

---

## II. Additional Features (APPROVED)

### 1. Demo Mode ✅

**Scope:** Sample data for testing and demos

**Implementation:**
- Add "Load Demo Data" button in settings
- Creates 5-10 sample clients with:
  - Completed business plans
  - Various deliverable stages (M1-M5 completed, M6 in progress)
  - Sample files
  - Activity history
  - Notes
- Warning: "This will add demo data. Recommended for new installations only."

**Affects:** Week 1, Day 4 (Seed Script) + Week 8, Day 3 (Settings)

---

### 2. PDF Quality Options (Draft/Final) ✅

**Scope:** Choose quality level for PDF generation

**Implementation:**
- Add quality selector in PDF generation UI
- **Draft:** Faster, lower DPI (150), no images/charts optimization
- **Final:** Slower, high DPI (300), optimized for print

**Benefits:**
- Quick previews with draft mode
- Final mode for client delivery

**Affects:** Week 6, Day 2 (PDF Generation)

---

### 3. Notes Tagging/Categories ✅

**Scope:** Tag notes for organization

**Data Model:**
```prisma
Note {
  id
  clientId
  content
  isImportant
  tags         String[]  // ["strategy", "follow-up", "urgent"]
  category     String?   // "General", "Strategy", "Operations", "Creative"
  authorId
}
```

**UI:**
- Tag input (multi-select)
- Category dropdown
- Filter notes by tag/category
- Tag suggestions based on previous notes

**Affects:** Week 4, Day 3 (Notes System)

---

### 4. Activity Log Export (CSV) ✅

**Scope:** Export activity log to CSV

**Implementation:**
- "Export to CSV" button on activity log
- Exports all activities for current client
- Columns: Date, User, Event Type, Description, Metadata
- Filename: `{client-name}-activity-log-{date}.csv`

**Global Export:** Option to export all activities (admin dashboard)

**Affects:** Week 4, Day 4 (Activity Log)

---

### 5. Keyboard Shortcuts ❌

**Decision:** Not included in MVP

**Rationale:** Not critical for initial launch, can add later based on user feedback

---

### 6. Autosave Conflict Resolution ✅

**Scope:** Handle multiple tabs editing same document

**Implementation:**
- Track "last saved by" timestamp
- On save attempt, check if document was modified since load
- If conflict detected:
  - Show warning modal: "This document was updated by [User] at [Time]"
  - Options: "Reload and lose changes" | "Save anyway (overwrite)" | "View changes"
  - "View changes" shows diff between versions
- Save optimistic lock timestamp with each update

**Affects:** Week 5, Day 5 (Plan Editor) + Week 7, Day 3 (Deliverable Editor)

---

### 7. Drag-and-Drop from External Sources ✅

**Scope:** Drag files from desktop/browser into file upload area

**Implementation:**
- Use `react-dropzone` library
- Support drag from:
  - Desktop (local files)
  - Browser (downloads folder)
  - Other apps
- Visual feedback (dropzone highlight)
- Multiple file upload
- File type validation
- Size validation (max 10MB per file)

**Affects:** Week 7, Day 4 (Files Library)

---

### 8. Multi-language Content ❌

**Decision:** Not included

**Rationale:** MVP is English-only. Can add i18n later if needed.

---

### 9. Template Preview Mode ❌

**Decision:** Not included

**Rationale:** Admins can test templates by generating for a test client

---

### 10. Job Estimated Completion Times ❌

**Decision:** Not included

**Rationale:** Hard to estimate Claude API response time. Show progress indicator instead.

---

## III. Updated Technology Stack

### Additional Libraries (based on approved features)

**File Upload:**
- `react-dropzone` - Drag-and-drop file uploads

**CSV Export:**
- `papaparse` - CSV generation

**Conflict Resolution:**
- `diff-match-patch` - Text diff for conflict resolution

**Demo Data:**
- `@faker-js/faker` - Generate realistic sample data

---

## IV. Updated Week-by-Week Breakdown

### Week 4: Client Detail Page (UPDATED)

**Day 3: Notes System**
- Implement notes API with tags and categories
- Add tag input (multi-select)
- Add category dropdown
- Filter notes by tag/category
- Tag suggestions

**Day 4: Activity Log**
- Implement comprehensive activity tracking (all CRUD)
- Build activity timeline component
- Add CSV export functionality
- Test export with sample data

---

### Week 6: PDF Generation (UPDATED)

**Day 2: PDF Integration**
- Add quality selector (Draft/Final)
- Implement draft mode (150 DPI, faster)
- Implement final mode (300 DPI, optimized)
- Test both quality levels

---

### Week 7: Deliverables (UPDATED)

**Day 2: Deliverable System**
- Support main deliverables + optional subdocuments
- Add parent/child relationship
- UI for adding subdocuments to months
- Admin can choose which subdocuments to generate

**Day 3: Deliverable Editor**
- Add autosave conflict resolution
- Implement diff viewer for conflicts
- Test multi-tab editing

**Day 4: Files Library**
- Implement drag-and-drop with react-dropzone
- Support external file sources
- Test drag from desktop/browser

---

### Week 8: Final Polish (UPDATED)

**Day 3: Settings & Demo Mode**
- Add "Load Demo Data" feature
- Generate realistic sample clients with @faker-js/faker
- Create sample business plans and deliverables
- Test demo mode on fresh installation

---

## V. Success Criteria (UPDATED)

**MVP Complete When:**

**Core Features:**
- ✅ All 9 features from PRD implemented
- ✅ Demo mode with sample data
- ✅ PDF quality options (draft/final)
- ✅ Notes with tags and categories
- ✅ Activity log with CSV export
- ✅ Autosave conflict resolution
- ✅ Drag-and-drop file upload
- ✅ Client capacity hard limit (100)
- ✅ Storage warnings (80%) and limits (100%)
- ✅ Backup with safety and confirmation

**Technical:**
- ✅ Setup time <10 minutes
- ✅ All approved features working
- ✅ Comprehensive activity tracking
- ✅ Multi-tab editing safety

**Quality:**
- ✅ Business plan generation <2 minutes
- ✅ PDF quality: 300 DPI (final mode)
- ✅ AI output: ≥80% usable
- ✅ Zero data loss (backup/restore + conflict resolution)

---

## VI. Implementation Priority

### Must Have (Week 1-8)
1. ✅ All PRD core features
2. ✅ Autosave conflict resolution (critical for data integrity)
3. ✅ Activity log export (CSV)
4. ✅ Notes tagging
5. ✅ Drag-drop file upload
6. ✅ PDF quality options

### Should Have (Week 8)
7. ✅ Demo mode

### Won't Have (Post-MVP)
8. ❌ Keyboard shortcuts
9. ❌ Multi-language
10. ❌ Template preview
11. ❌ Job time estimates

---

## VII. Next Steps

**Immediate Actions:**
1. ✅ Review and approve this decisions document
2. ✅ Confirm we're ready to start Week 1-2
3. ✅ Gather assets (logo, fonts, brand colors)

**Week 1 Kickoff:**
- Day 1: Initialize Next.js project with all dependencies
- Day 2: Setup Prisma schema (including new fields for tags, categories, subdocuments)
- Day 3: First migration and demo data seed script
- Day 4: Authentication
- Day 5: Dashboard layout

**Ready to build!** All critical decisions are confirmed and documented.

---

**Approved by:** Arunav, Wavelaunch VC
**Date:** November 12, 2025
**Status:** Ready for Week 1 Implementation
