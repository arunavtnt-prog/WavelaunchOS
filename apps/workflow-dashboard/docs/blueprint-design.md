# Comprehensive Blueprint Generation Design

## Overview

The Blueprint is a **15-25 page** McKinsey/BCG-caliber business plan built from the Snapshot as a foundation. It follows a strict 10-section structure with real market research, source citations, and industry-specific frameworks.

---

## Blueprint Structure (10 Sections, 15-25 Pages)

| Section | Pages | Description |
|---------|-------|-------------|
| 1. Executive Summary | 1-2 | Concise overview of opportunity, market, projections, partnership rationale |
| 2. Four Pillars Evaluation | 2-3 | Wavelaunch's selection criteria: Audience, Category, Founder, Operations |
| 3. Creator Brand Assessment | 3-4 | Audience deep-dive, brand positioning, competitive differentiation |
| 4. Market & Competitive Analysis | 3-4 | TAM-SAM-SOM sizing, competitor landscape, industry trends |
| 5. Product & Revenue Strategy | 3-4 | Product architecture, revenue model, 3-year financial projections |
| 6. Go-to-Market Strategy | 2-3 | Launch framework, channel strategy, growth model |
| 7. Operational Framework | 2-3 | 8-stage launch process, tech stack, creator's role |
| 8. Implementation Roadmap | 2-3 | 90-day plan, 12-month path, 3-year trajectory |
| 9. Investment Allocation | 1-2 | $100K-$250K deployment breakdown with rationale |
| 10. Success Metrics & KPIs | 1 | Primary metrics, growth indicators, brand equity measures |

**Total: 15-25 pages**

---

## Generation Stages (Parallel Batches)

### Batch 1: Market & Industry Research (Parallel, 10-15 min)
```
STAGE 1: Market Sizing (TAM-SAM-SOM)
- Web search for market size data
- Industry growth projections
- Source citations
├→ Output: 3-4 pages for Section 4

STAGE 2: Competitive Intelligence
- Research direct/indirect competitors
- Market gap identification
- Pricing benchmarks
├→ Output: 2-3 pages for Section 4

STAGE 3: Industry Trends
- Current trends in creator's vertical
- Consumer behavior shifts
- Platform evolution impact
├→ Output: 1-2 pages for Section 4
```

### Batch 2: Brand & Audience Analysis (Depends on Batch 1, 8-12 min)
```
STAGE 4: Audience Deep-Dive
- Psychographic profiling from Vision Form
- Pain point validation
- Community strength analysis
├→ Output: 2-3 pages for Section 3

STAGE 5: Brand Positioning Framework
- Value proposition canvas
- Competitive differentiation
- Brand archetype determination
├→ Output: 1-2 pages for Section 3
```

### Batch 3: Product & Financial Modeling (Depends on Batch 1-2, 10-15 min)
```
STAGE 6: Product Architecture
- Core product line recommendations
- Phased launch sequencing
- Unit economics framework
├→ Output: 2-3 pages for Section 5

STAGE 7: Financial Projections
- 3-year revenue model
- Conservative/moderate/optimistic scenarios
- Key drivers and sensitivity
├→ Output: 1-2 pages for Section 5
```

### Batch 4: Strategy & Operations (Depends on Batch 1-3, 8-12 min)
```
STAGE 8: Go-to-Market Strategy
- 90-day pre-launch plan
- Channel optimization
- Growth acquisition model
├→ Output: 2-3 pages for Section 6

STAGE 9: Operational Framework
- Technology stack recommendations
- Team structure needs
- Creator time commitment
├→ Output: 2-3 pages for Section 7

STAGE 10: Implementation Roadmap
- 90-day critical path
- 12-month objectives
- 3-year growth trajectory
├→ Output: 2-3 pages for Section 8
```

### Final Stage: Synthesis (Sequential, 5-8 min)
```
STAGE 11: Executive Summary
- Synthesize all sections
- Investment thesis
- Partnership rationale
├→ Output: 1-2 pages for Section 1
```

---

## Database Schema

```prisma
enum BlueprintStage {
  // Batch 1: Market Research (parallel)
  MARKET_SIZING              // TAM-SAM-SOM analysis
  COMPETITIVE_INTELLIGENCE   // Competitor research
  INDUSTRY_TRENDS           // Market trends

  // Batch 2: Brand Analysis (parallel, after Batch 1)
  AUDIENCE_DEEP_DIVE        // Psychographic profiling
  BRAND_POSITIONING         // Value proposition

  // Batch 3: Product & Financials (parallel, after Batch 1-2)
  PRODUCT_ARCHITECTURE      // Product line design
  FINANCIAL_PROJECTIONS     // 3-year model

  // Batch 4: Strategy (parallel, after Batch 1-3)
  GO_TO_MARKET              // GTM strategy
  OPERATIONAL_FRAMEWORK     // Ops & tech stack
  IMPLEMENTATION_ROADMAP    // Timeline & milestones

  // Final: Synthesis (sequential)
  EXECUTIVE_SUMMARY         // Final synthesis

  // Compilation
  COMPILATION               // Stitch & PDF generation
}

enum ResearchStatus {
  PENDING
  IN_PROGRESS
  COMPLETE
  FAILED
  REVIEW_REQUIRED
  APPROVED
}

model Blueprint {
  id              String   @id @default(cuid())
  applicationId   String   @unique
  application     Application @relation(fields: [applicationId], references: [id])

  // Overall status
  status          ResearchStatus @default(PENDING)
  currentBatch    Int      @default(1)  // Which batch we're on (1-5)
  progress        Float    @default(0)  // 0-100

  // Generated content
  markdown        String?  // Final compiled blueprint
  pdfPath         String?

  // Generation metadata
  startedAt       DateTime?
  completedAt     DateTime?
  lastStageAt     DateTime?

  // Token usage tracking
  totalTokensUsed Int      @default(0)
  totalSearchQueries Int   @default(0)

  // Relationships
  researchStages  BlueprintResearch[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status])
  @@index([currentBatch])
}

model BlueprintResearch {
  id              String   @id @default(cuid())
  blueprintId     String
  blueprint       Blueprint @relation(fields: [blueprintId], references: [id])

  // Stage info
  stage           BlueprintStage
  batch           Int      // Which batch (1-4) or 5 for final
  status          ResearchStatus @default(PENDING)

  // Content
  prompt          String   // What was sent to AI
  response        String?  // AI raw response
  markdown        String?  // Formatted markdown for final doc
  sectionNumber   Int?     // Which section this contributes to (1-10)

  // Research metadata
  metadata        Json?    // Sources, search queries, data points
  sources         BlueprintSource[]

  // Retry logic
  attempts        Int      @default(0)
  error           String?

  // Timestamps
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([blueprintId, stage])
  @@index([status])
  @@index([batch])
}

model BlueprintSource {
  id              String   @id @default(cuid())
  researchId      String

  // Source info
  type            String   // "web_search", "api", "report", "framework"
  url             String?
  title           String?
  author          String?
  publishedAt     DateTime?

  // Extracted data
  keyPoints       Json?
  quotes          String[]
  dataPoints      Json?    // Numbers, stats, figures

  // Citation info
  citation        String?  // Formatted citation for final doc

  // Credibility
  relevanceScore  Float?

  createdAt       DateTime @default(now())
}
```

---

## Prompt System

### Base Prompt Template
```yaml
base_prompt: |
  You are a senior strategic consultant at Wavelaunch Studio, presenting McKinsey/BCG-caliber
  business plans to creators selected for the D26 Cohort.

  CREATOR CONTEXT:
  {snapshotMarkdown}

  VISION FORM DATA:
  {applicationData}

  PREVIOUS RESEARCH (if available):
  {previousStages}

  REQUIREMENTS FOR THIS STAGE:
  {stageRequirements}

  RESEARCH REQUIREMENTS:
  - Use web_search for current market data
  - Cite all sources with URLs
  - Provide specific numbers and statistics
  - When data unavailable, note as assumption

  OUTPUT FORMAT:
  - Professional prose with clear headers
  - 2-4 pages of substantive content
  - Tables for data presentation
  - Source citations inline: [Source: URL]
```

### Stage-Specific Prompts

**STAGE 1: Market Sizing (TAM-SAM-SOM)**
```yaml
prompt_addition: |
  Generate the Market Sizing section for Section 4 (Market & Competitive Analysis).

  REQUIREMENTS:
  1. Research TAM for creator's industry/niche (global market size with CAGR)
  2. Define SAM (serviceable addressable market in their geography/segment)
  3. Calculate SOM (year 1-3 realistic capture potential)
  4. Include methodology and source citations
  5. Use creator's industryNiche and targetAudience from Vision Form

  OUTPUT:
  - TAM: Global/broad market with 2024 size and 2032 projection
  - SAM: Realistic segment they can reach
  - SOM: Year 1-3 capture with conversion assumptions
  - Table format preferred for size comparison
  - All sources cited: [Source: URL, Date]
```

**STAGE 2: Competitive Intelligence**
```yaml
prompt_addition: |
  Generate the Competitive Landscape section for Section 4.

  REQUIREMENTS:
  1. Research 8-12 direct competitors in creator's niche
  2. Analyze their positioning, pricing, content strategy
  3. Identify market gaps and opportunities
  4. Include creator's listed emergingCompetitors and inspirationBrands
  5. Create comparison table

  OUTPUT:
  - Competitor analysis table with pricing, strengths, weaknesses
  - Market gap identification
  - Competitive moat strategy for creator
  - All sources cited
```

**STAGE 4: Audience Deep-Dive**
```yaml
prompt_addition: |
  Generate the Audience Analysis section for Section 3.

  USE VISION FORM DATA:
  - targetAudience, demographicProfile, targetDemographicAge
  - audienceGenderSplit, keyPainPoints
  - currentChannels, brandValues

  REQUIREMENTS:
  1. Build detailed persona using demographic data
  2. Psychographic analysis based on pain points and values
  3. Audience size estimation (research benchmarks for engagement rates)
  4. Community strength assessment

  OUTPUT:
  - Detailed persona (2-3 paragraphs)
  - Psychographic profile
  - Audience size estimate with methodology
  - No external research needed (use Vision Form + benchmarks)
```

**STAGE 7: Financial Projections**
```yaml
prompt_addition: |
  Generate the Financial Projections section for Section 5.

  USE PREVIOUS STAGE OUTPUT:
  - Market sizing from Stage 1
  - Product architecture from Stage 6
  - Unit economics from Stage 6

  REQUIREMENTS:
  1. Build 3-year revenue model
  2. Include conservative, moderate, optimistic scenarios
  3. Show monthly ramp for Year 1
  4. Include key assumptions and sensitivity

  OUTPUT:
  - Year 1: $380K-$590K breakdown
  - Year 2: $780K-$1.1M scaling
  - Year 3: $1.5M-$2.2M maturity
  - Scenario table with key drivers
  - Unit economics summary
```

---

## Web Search Integration

### Search API Options

| API | Cost | Best For |
|-----|------|----------|
| **Tavily** | Free tier: 1K searches/month | Real-time search, structured results |
| **Perplexity** | $5-20/month | AI-curated search, cited sources |
| **Serper** | Pay-as-you-go | Google Search API |

### Search Strategy by Stage

```yaml
MARKET_SIZING:
  queries:
    - "{industry} market size 2024 CAGR"
    - "{industry} TAM SAM SOM"
    - "{niche} market growth projections"
  expected_sources: 3-5

COMPETITIVE_INTELLIGENCE:
  queries:
    - "{industry} DTC brands competitors"
    - "{product category} pricing comparison"
    - "{niche} creator brands analysis"
  expected_sources: 8-12

INDUSTRY_TRENDS:
  queries:
    - "{industry} trends 2024 2025"
    - "{target demographic} behavior shifts"
    - "{platform} algorithm changes {industry}"
  expected_sources: 4-6

GO_TO_MARKET:
  queries:
    - "{industry} customer acquisition cost benchmarks"
    - "{platform} engagement rates 2024"
    - "{industry} influencer marketing ROI"
  expected_sources: 3-5
```

---

## Orchestrator Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INITIATE BLUEPRINT                                      │
│    - Create Blueprint record (status: PENDING → IN_PROGRESS)│
│    - Create 11 BlueprintResearch records                   │
│    - Set currentBatch: 1                                   │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ BATCH 1: Market Research (PARALLEL)                        │
│ ├─ Stage 1: Market Sizing (web_search)                     │
│ ├─ Stage 2: Competitive Intelligence (web_search)          │
│ └─ Stage 3: Industry Trends (web_search)                   │
│    → All complete → currentBatch: 2                        │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ BATCH 2: Brand Analysis (PARALLEL, uses Batch 1 data)      │
│ ├─ Stage 4: Audience Deep-Dive (Vision Form + benchmarks) │
│ └─ Stage 5: Brand Positioning (uses competitive data)      │
│    → All complete → currentBatch: 3                        │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ BATCH 3: Product & Financials (PARALLEL)                   │
│ ├─ Stage 6: Product Architecture (Vision Form + research)  │
│ └─ Stage 7: Financial Projections (uses market data)       │
│    → All complete → currentBatch: 4                        │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ BATCH 4: Strategy & Operations (PARALLEL)                  │
│ ├─ Stage 8: Go-to-Market Strategy (uses audience data)     │
│ ├─ Stage 9: Operational Framework (template + custom)      │
│ └─ Stage 10: Implementation Roadmap (uses all stages)      │
│    → All complete → currentBatch: 5                        │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ BATCH 5: Synthesis & Compilation (SEQUENTIAL)              │
│ ├─ Stage 11: Executive Summary (synthesizes all)           │
│ └─ Stage 12: Compilation (stitch + PDF generation)         │
│    → status: COMPLETE, progress: 100                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Industry Frameworks Mapping

When generating content, reference the appropriate industry framework:

| Creator Niche | Framework File | Key Adjustments |
|---------------|----------------|-----------------|
| Fashion/Apparel | `Wavelaunch_Industry_Frameworks.md` §1 | Size inclusivity, seasonal cycles, sustainability |
| Beauty/Skincare | `Wavelaunch_Industry_Frameworks.md` §2 | FDA compliance, ingredient trends, clean beauty |
| Wellness/Fitness | `Wavelaunch_Industry_Frameworks.md` §3 | Certification requirements, community building |
| Education/Coaching | `Wavelaunch_Industry_Frameworks.md` §4 | Course architecture, cohort vs self-paced |
| Food/Culinary | `Wavelaunch_Industry_Frameworks.md` §5 | Food safety, co-packer selection, shelf stability |

---

## Implementation Plan

### Phase 1: Database & Models (Immediate)
1. Create Prisma migration for Blueprint models
2. Add BlueprintStage enum with 12 stages
3. Set up BlueprintResearch with source tracking
4. Test migrations locally

### Phase 2: Search API Integration (Week 1)
1. Integrate Tavily or Perplexity API
2. Create search service with query templates
3. Build source citation formatter
4. Test search quality for each stage

### Phase 3: Blueprint Orchestrator (Week 1-2)
1. Create `BlueprintOrchestrator.ts` service
2. Implement batch execution (parallel stages)
3. Build prompt assembler with stage templates
4. Add retry logic and error handling

### Phase 4: Blueprint Generator (Week 2)
1. Create 11 stage-specific prompt templates
2. Build markdown formatter for each stage
3. Implement research synthesis
4. Add source citation injector

### Phase 5: UI & Workflow (Week 2-3)
1. Create `/blueprints` page (separate from `/snapshots`)
2. Build progress visualization (batch stages)
3. Add review/regenerate controls per stage
4. Implement source citation viewer
5. PDF generation with professional formatting

### Phase 6: Testing & Refinement (Week 3-4)
1. End-to-end test with sample applications
2. Measure actual token usage and timing
3. Refine prompts based on output quality
4. Optimize batch execution for speed

---

## Cost & Performance Estimates

| Metric | Estimate |
|--------|----------|
| **Total generation time** | 30-45 minutes |
| **Token usage per blueprint** | 80K-120K tokens |
| **Cost per blueprint (Claude)** | $3-6 USD |
| **Search queries** | 30-50 searches |
| **Search API cost** | $0.50-2 USD |
| **Total cost per blueprint** | ~$5-8 USD |

---

## File Structure

```
workflow-dashboard/
├── prisma/
│   └── schema.prisma          # Add Blueprint models
├── src/
│   ├── lib/
│   │   ├── services/
│   │   │   ├── BlueprintOrchestrator.ts   # Main orchestrator
│   │   │   ├── BlueprintGenerator.ts      # Stage generators
│   │   │   └── SearchService.ts           # Web search integration
│   │   ├── prompts/
│   │   │   ├── blueprint/
│   │   │   │   ├── base-prompt.yaml       # Base template
│   │   │   │   ├── stage-01-market-sizing.yaml
│   │   │   │   ├── stage-02-competitive.yaml
│   │   │   │   └── ... (11 more stage files)
│   │   │   └── industry-frameworks/
│   │   │       └── Wavelaunch_Industry_Frameworks.md
│   │   └── formatters/
│   │       └── BlueprintFormatter.ts     # Markdown → Section format
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── blueprints/               # NEW PAGE
│   │   │       ├── page.tsx             # Blueprint list & progress
│   │   │       └── [id]/
│   │   │           └── page.tsx         # Blueprint detail view
│   │   └── api/
│   │       └── workflow/
│   │           └── blueprints/
│   │               ├── route.ts         # List, create, trigger
│   │               └── [id]/
│   │                   └── route.ts     # Get, regenerate stage
│   └── components/
│       └── blueprints/
│           ├── BlueprintProgressCard.tsx
│           ├── StageView.tsx
│           └── SourceCitationList.tsx
```

---

## Next Steps

1. **Confirm design alignment** with your vision
2. **Create Prisma migration** for Blueprint models
3. **Choose web search API** (Tavily recommended for free tier)
4. **Build prompt templates** for each of 11 stages
5. **Implement BlueprintOrchestrator** with batch execution
6. **Create /blueprints UI** with progress tracking
