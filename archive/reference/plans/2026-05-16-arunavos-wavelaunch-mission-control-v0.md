# ArunavOS Wavelaunch Mission Control v0 Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build the first local-first ArunavOS module around Wavelaunch Studio so D26 cohort fill and active launch operations stop depending on Arunav's memory.

**Architecture:** Use the existing WavelaunchOS CRM as the fastest wedge instead of starting from zero. Extend the existing Mission Control tables/pages into a stages 1-11 acquisition pipeline, daily brief, follow-up queue, blocked-items list, next-action generator, and outbound draft approval queue.

**Tech Stack:** Existing Next.js app at `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm`, TypeScript, Prisma/PostgreSQL, shadcn/ui, existing email draft and Mission Control schema.

---

## Operating Principles

- Wavelaunch is Slot 1: revenue engine.
- ArunavOS is Slot 2: leverage engine.
- BrandScout, PitchForge, and Lastframe stay backburner unless Arunav explicitly asks.
- Build tiny, ship daily, no big-bang launch.
- Default rule: draft, queue for approval, never auto-send.
- No public/private leakage:
  - Public: Singapore, 87+ brands, D26 40-60 creators/year, up to $250K per brand.
  - Confidential: Delhi-area location, specific pipeline creator names until launched, VC/investment partner specifics, per-brand revenue/profit, private onboarding-fee economics.
  - Model disclosure: 10/25/25 only to qualified creators after vision call, not in cold outreach or marketing.

## Wavelaunch Pipeline Surface

Priority stages 1-11:

1. Sourced
2. Qualified
3. Cold outreach sent
4. Reply received / warm lead
5. Vision form sent
6. Vision form completed
7. Blueprint drafted
8. Blueprint sent / holding email sent
9. Approval call/async
10. Offer sent
11. DocuSign signed / onboarded / D26 confirmed

These are the stages where most balls drop and therefore the first dashboard surface.

Later brand-launch stages 12-21 remain visible but secondary:
12. Product concept locked
13. Supplier/manufacturer sourced
14. Sampling
15. Branding
16. Storefront build
17. Pre-launch content
18. Launch on month 8 after onboarding
19. Growth
20. Brand deals layered in
21. Profit share reporting

## 30/60-Day Success Criteria

30-day win:
- Wavelaunch Mission Control inside ArunavOS runs daily.
- D26 cohort reaches 40 confirmed creators.

60-day win:
- First 5 D26 brands move past stage 12, product concept locked.
- Zero dropped follow-ups.

## Existing Assets Found

Primary app:
- `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm`

Important docs:
- `/Users/arunav/Desktop/WavelaunchOS/CLAUDE.md`
- `/Users/arunav/Desktop/WavelaunchOS/Wavelaunch Studio Documentation.md`
- `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm/README.md`
- `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm/docs/AUTOMATION.md`
- `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm/docs/EMAIL_SYSTEM.md`
- `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm/docs/API.md`

Existing Mission Control schema:
- `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm/prisma/schema.prisma`
- Existing models: `MCEmailReply`, `MCCreator`, `MCBlueprint`, `MCBlueprintSection`, `MCDailyAction`, `MCInstantlySync`, `MCSystemConfig`.
- Existing enum `MCCreatorStage` is too coarse and does not match Arunav's real stages 1-11.

Existing pages/components:
- `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm/src/app/(dashboard)/clients/page.tsx`
- `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm/src/app/(dashboard)/email-drafts/page.tsx`
- `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm/src/app/(dashboard)/instantly-replies/page.tsx`
- `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm/src/app/(dashboard)/blueprints/page.tsx`

Blueprint/editorial assets:
- `/Users/arunav/godo/brainstorm-session-1771098082/BLUEPRINT_ARCHITECTURE.md`
- `/Users/arunav/godo/brainstorm-session-1771098082/prompts/system-prompt.md`
- `/Users/arunav/godo/brainstorm-session-1771098082/output/*.md`
- `/Users/arunav/godo/brainstorm-session-1771098082/output-fixed/*.md`
- `/Users/arunav/geminiprojects/skills/wavelaunch-studio-creator-docs/SKILL.md`

## Immediate Product Scope

1. Pipeline tracker for stages 1-11.
2. Daily brief at 7am: priorities, open loops, follow-ups, risks.
3. Follow-up queue: warm leads not replied to in >48h.
4. Blocked-items list: creators/brands stalled at any stage >7 days.
5. Creator/application status view.
6. Next-action generator across creators and brands.
7. Outbound draft queue awaiting approval; no auto-send.

## Data Model Direction

Do not force the real pipeline into the current coarse enum.

Preferred v0 addition:
- Add a new enum or table for exact pipeline stages 1-11.
- Track `currentStage`, `stageEnteredAt`, `lastInboundAt`, `lastOutboundAt`, `nextAction`, `nextActionDueAt`, `blockedReason`, `owner`, `priority`, and `confidentialNotes`.
- Keep existing `MCCreator` but extend it rather than replacing the app.

Suggested new enum names:

```prisma
enum MCPipelineStage {
  SOURCED
  QUALIFIED
  COLD_OUTREACH_SENT
  WARM_REPLY_RECEIVED
  VISION_FORM_SENT
  VISION_FORM_COMPLETED
  BLUEPRINT_DRAFTED
  BLUEPRINT_SENT
  APPROVAL_ASYNC
  OFFER_SENT
  DOCUSIGN_SIGNED_ONBOARDED
}
```

Suggested fields on `MCCreator`:

```prisma
pipelineStage       MCPipelineStage @default(SOURCED)
stageEnteredAt      DateTime        @default(now())
lastInboundAt       DateTime?
lastOutboundAt      DateTime?
nextAction          String?
nextActionDueAt     DateTime?
blockedReason       String?
priority            String          @default("normal")
source              String?
creatorHandle       String?
audienceNiche       String?
confidentialNotes   String?
```

## Implementation Tasks

### Task 1: Confirm current repo health

**Objective:** Know whether the existing CRM builds before modifying it.

**Files:** none.

**Steps:**
1. Run `cd /Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm && git status --short`.
2. Run `pnpm install` only if dependencies are missing.
3. Run `pnpm lint`.
4. Run `pnpm build` if lint is clean enough.
5. Record failures in this plan under an execution log before changing code.

### Task 2: Add exact Wavelaunch pipeline stage model

**Objective:** Replace coarse Mission Control stages with the real stages 1-11 while preserving old records.

**Files:**
- Modify: `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm/prisma/schema.prisma`

**Steps:**
1. Add `MCPipelineStage` enum.
2. Add pipeline fields to `MCCreator`.
3. Run `pnpm prisma format`.
4. Run `pnpm db:generate`.
5. Create migration or push schema depending current dev DB setup.

### Task 3: Add pipeline API endpoints

**Objective:** Expose data for dashboard cards, pipeline list, follow-up queue, and blocked list.

**Files:**
- Create: `src/app/api/mission-control/pipeline/route.ts`
- Create: `src/app/api/mission-control/actions/route.ts`
- Create: `src/lib/mission-control/pipeline.ts`

**Required API outputs:**
- Weekly metrics: sourced, outreach sent, replies, reply rate, forms sent/completed, blueprints sent/approved, D26 signed, active brands by stage.
- Follow-up queue: `lastInboundAt > lastOutboundAt` or warm status with no outbound for >48h.
- Blocked queue: `now - stageEnteredAt > 7 days` or `blockedReason != null`.
- Next-action list: one recommended action per creator/brand.

### Task 4: Build Wavelaunch Mission Control page

**Objective:** Create one page Arunav can open every morning.

**Files:**
- Create: `src/app/(dashboard)/mission-control/page.tsx`
- Create: `src/components/mission-control/pipeline-board.tsx`
- Create: `src/components/mission-control/daily-brief.tsx`
- Create: `src/components/mission-control/follow-up-queue.tsx`
- Create: `src/components/mission-control/blocked-items.tsx`
- Create: `src/components/mission-control/next-actions.tsx`

**Layout:**
1. Top: D26 progress toward 40 confirmed creators.
2. Row: weekly metrics.
3. Left: pipeline stages 1-11.
4. Right: next actions.
5. Below: follow-up queue and blocked items.
6. Footer/section: outbound drafts awaiting approval.

### Task 5: Make approval queue safe by default

**Objective:** Ensure outbound drafts cannot be accidentally sent by automation.

**Files:**
- Modify: `src/app/(dashboard)/email-drafts/page.tsx`
- Inspect/modify: `src/app/api/email-drafts/**`

**Rules:**
- Draft creation/update is allowed.
- Sending requires explicit button click by Arunav.
- No scheduler/job should call a send endpoint.
- UI copy must say "Approve and Send" or "Save Draft" clearly.
- If a future autonomous job creates drafts, status must be `PENDING_REVIEW`.

### Task 6: Daily 7am brief generation

**Objective:** Generate the daily priorities/open loops/follow-ups/risks brief.

**Files:**
- Create/modify a scheduled task in existing scheduler layer after inspecting `/docs/AUTOMATION.md`.
- Store generated brief in database, not just stdout.

**Brief sections:**
1. Today’s priorities.
2. Open loops.
3. Follow-ups >48h.
4. Blocked stages >7d.
5. Risks.
6. Suggested next moves awaiting approval.

### Task 7: Local-first source of truth

**Objective:** Decide whether v0 stores notes in app DB, Obsidian markdown, or both.

**Default recommendation:** app DB for structured pipeline, markdown vault for narrative brain dumps and editorial references.

**Need from Arunav later:** preferred vault path if Obsidian is used.

## Open Questions That Actually Matter

1. Where should ArunavOS live long-term: extend `/Users/arunav/Desktop/WavelaunchOS/wavelaunch-crm` or create a clean `/Users/arunav/Desktop/ArunavOS` wrapper that imports Wavelaunch as first module?
2. What is the current real D26 creator source list? Sheets, Instantly export, local CSV, or manual import?
3. What email/outreach system is authoritative right now: Instantly, Gmail, or something else?
4. Should v0 use Postgres only, or should it support SQLite for local-first offline operation?
5. Where should the permanent brain/vault live: Obsidian, app notes, or `~/ArunavOS` markdown?

## Recommendation

Do not start a fresh app yet. The fastest path is to harden and reshape the existing WavelaunchOS CRM into the first ArunavOS module, then later wrap it under a broader ArunavOS shell.

The first visible ship should be `/mission-control`: a single page that tells Arunav who to follow up with, what is blocked, what is closest to revenue, and what drafts are waiting for approval.
