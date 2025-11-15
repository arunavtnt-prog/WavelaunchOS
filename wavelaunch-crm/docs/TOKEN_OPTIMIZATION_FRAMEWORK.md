# Token Optimization Framework for Wavelaunch CRM

## Overview
This framework provides systematic approaches to minimize token usage while maintaining high-quality AI-generated content. Estimated savings: **40-60% reduction in token costs**.

---

## 1. PROMPT STRUCTURE FRAMEWORK

### Standard Prompt Template
All AI prompts should follow this structure to minimize tokens:

```typescript
interface OptimizedPrompt {
  role: "system" | "user" | "assistant";
  content: {
    task: string;           // Single sentence: what to generate
    context: object;        // Structured data only (no prose)
    format: string;         // Expected output structure
    constraints: string[];  // Bullet points only
  };
}
```

### Example - Business Plan Generation

**❌ Inefficient (Verbose):**
```
You are an expert business consultant with 20 years of experience helping entrepreneurs build successful businesses. I need you to carefully analyze the following client information and create a comprehensive, detailed business plan that covers all aspects of their venture. The client's name is John Doe, and they are starting a coffee shop in Seattle. They want to target millennials and offer specialty drinks. Please make sure to include market analysis, competitive landscape, financial projections, and marketing strategies. Be thorough and professional.
```
Token Count: ~110 tokens

**✅ Efficient (Structured):**
```json
{
  "task": "Generate business plan",
  "context": {
    "name": "John Doe",
    "business": "Coffee shop",
    "location": "Seattle",
    "audience": "Millennials",
    "products": ["Specialty drinks"]
  },
  "format": "markdown_sections",
  "constraints": [
    "Include: market, competition, financials, marketing",
    "Length: 2000 words",
    "Tone: professional"
  ]
}
```
Token Count: ~60 tokens
**Savings: 45%**

---

## 2. RESPONSE CACHING STRATEGY

### Cache Key Generation
```typescript
function generateCacheKey(prompt: string, model: string, params: object): string {
  const normalized = {
    prompt: normalizePrompt(prompt),  // Remove whitespace, lowercase
    model,
    temperature: params.temperature,
    max_tokens: params.max_tokens
  };
  return sha256(JSON.stringify(normalized));
}

function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .replace(/\b(the|a|an)\b/g, '') // Remove articles
    .trim();
}
```

### Cache Invalidation Rules
- **Business Plans**: Cache for 7 days
- **Deliverables**: Cache for 3 days
- **Summaries**: Cache for 24 hours
- **Max Cache Size**: 1000 entries (LRU eviction)

### When to Use Cache
```typescript
// ✅ CACHE these:
- Identical client data regeneration
- Template-based content (same structure)
- Reference materials (industry standards)
- Boilerplate sections (legal disclaimers)

// ❌ DON'T CACHE these:
- User-specific creative content
- Time-sensitive information
- Personalized recommendations
- Dynamic data (prices, dates)
```

---

## 3. SECTION-BASED GENERATION

### Break Documents into Sections
Instead of generating entire documents, generate in chunks:

```typescript
const businessPlanSections = [
  { name: "executive_summary", priority: 1, tokens: ~500 },
  { name: "market_analysis", priority: 2, tokens: ~800 },
  { name: "competitive_landscape", priority: 2, tokens: ~600 },
  { name: "product_services", priority: 3, tokens: ~700 },
  { name: "marketing_strategy", priority: 3, tokens: ~900 },
  { name: "financial_projections", priority: 4, tokens: ~1200 },
  { name: "operations_plan", priority: 4, tokens: ~600 },
  { name: "team_structure", priority: 5, tokens: ~400 }
];

// Total: ~5,700 tokens
// But you can generate only needed sections!
```

### Progressive Generation
```typescript
// Level 1: Essential (Priority 1-2) = ~1,900 tokens
// Level 2: Standard (Priority 1-3) = ~3,500 tokens
// Level 3: Complete (Priority 1-5) = ~5,700 tokens

// User chooses level → save 32-66% tokens
```

---

## 4. DIFFERENTIAL REGENERATION

### Only Regenerate Changed Sections
```typescript
async function regenerateBusinessPlan(
  clientId: string,
  changedFields: string[]
) {
  // Map changed fields to affected sections
  const affectedSections = mapFieldsToSections(changedFields);

  // Example:
  // changedFields = ["targetAudience", "demographics"]
  // affectedSections = ["market_analysis", "marketing_strategy"]

  // Only regenerate 2 sections instead of all 8
  // Savings: 75% tokens

  for (const section of affectedSections) {
    await regenerateSection(clientId, section);
  }
}

const fieldToSectionMapping = {
  "targetAudience": ["market_analysis", "marketing_strategy"],
  "uniqueValueProps": ["executive_summary", "product_services"],
  "competitors": ["competitive_landscape"],
  "financials": ["financial_projections"],
  // ... etc
};
```

---

## 5. CONTEXT COMPRESSION

### Client Data Compression
```typescript
// ❌ Inefficient: Send all 86 fields
const fullClient = {
  id: "cm3kpg...",
  creatorName: "John Doe",
  brandName: "Doe Coffee Co",
  email: "john@example.com",
  // ... 82 more fields
};

// ✅ Efficient: Send only relevant fields per section
const compressedContext = {
  market_analysis: {
    name: "Doe Coffee Co",
    industry: "Food & Beverage",
    audience: "Millennials",
    demographics: {...}
  },
  financial_projections: {
    name: "Doe Coffee Co",
    scalingGoals: "...",
    revenue: "..."
  }
};

// Savings: 70-80% context tokens
```

### Use References Instead of Duplication
```typescript
// Instead of repeating client data in every section prompt:
const sectionPrompt = {
  task: "Generate market analysis section",
  clientRef: "cm3kpg...",  // Just the ID
  additionalContext: {     // Only section-specific data
    competitorData: [...]
  }
};

// Server loads client data once and reuses
```

---

## 6. RESPONSE FORMATTING

### Structured Output (JSON) vs Prose
```typescript
// ❌ Verbose prose response (for market analysis):
// "The target market for this coffee shop consists primarily of millennials aged 25-35 who are interested in specialty coffee drinks and are willing to pay premium prices. The market size is estimated at approximately 500,000 potential customers in the Seattle metropolitan area. The market is growing at a rate of 8% annually..."
// Tokens: ~80

// ✅ Structured JSON response:
{
  "target": {
    "age": "25-35",
    "segment": "Millennials",
    "interests": ["specialty coffee"],
    "pricePoint": "premium"
  },
  "size": {
    "total": 500000,
    "growth": 8
  }
}
// Tokens: ~35
// Savings: 56%

// Convert to prose only when displaying to user
```

---

## 7. FEW-SHOT LEARNING OPTIMIZATION

### Minimal Examples Strategy
```typescript
// ❌ Inefficient: 5 examples
const fewShotPrompt = {
  examples: [
    { input: {...}, output: {...} },  // Example 1
    { input: {...}, output: {...} },  // Example 2
    { input: {...}, output: {...} },  // Example 3
    { input: {...}, output: {...} },  // Example 4
    { input: {...}, output: {...} }   // Example 5
  ]
};

// ✅ Efficient: 1-2 examples maximum
// Research shows 1-2 examples often sufficient
// Savings: 60-80% example tokens
```

---

## 8. CHECKPOINT-BASED RESUME

### Save State Every N Sections
```typescript
interface Checkpoint {
  jobId: string;
  completed: string[];        // ["executive_summary", "market_analysis"]
  next: string;              // "competitive_landscape"
  context: CompressedContext; // Reusable context
  tokensUsed: number;        // Track cumulative usage
}

// If generation fails at section 4 of 8:
// - Resume from section 4
// - Reuse context from checkpoint
// - Don't regenerate sections 1-3
// Savings: 50% tokens on failure recovery
```

---

## 9. MODEL SELECTION STRATEGY

### Right Model for Right Task
```typescript
const modelStrategy = {
  "executive_summary": {
    model: "gpt-4-turbo",        // Complex, needs reasoning
    cost: "$0.01/1K",
    quality: "high"
  },
  "boilerplate_sections": {
    model: "gpt-3.5-turbo",      // Simple, templated
    cost: "$0.0005/1K",
    quality: "medium",
    savings: "95% vs GPT-4"
  },
  "data_extraction": {
    model: "gpt-3.5-turbo-instruct", // Fast, cheap
    cost: "$0.00015/1K",
    quality: "medium",
    savings: "98.5% vs GPT-4"
  }
};

// Use cheapest model that meets quality bar
```

---

## 10. BATCH PROCESSING

### Combine Multiple Requests
```typescript
// ❌ Inefficient: 8 separate API calls for 8 sections
for (const section of sections) {
  await generateSection(section);  // 8 API calls
}

// ✅ Efficient: 1 API call for multiple sections
const batchPrompt = {
  task: "Generate sections 1-4",
  sections: [
    { name: "exec_summary", maxTokens: 500 },
    { name: "market", maxTokens: 800 },
    { name: "competition", maxTokens: 600 },
    { name: "products", maxTokens: 700 }
  ],
  format: "json_array"
};

// Savings:
// - Reduced overhead tokens (system prompts)
// - Single network round trip
// - Better context sharing between sections
```

---

## 11. DYNAMIC PROMPT COMPRESSION

### Real-time Compression Based on Token Budget
```typescript
async function generateWithBudget(
  prompt: OptimizedPrompt,
  maxTokens: number
) {
  let currentTokens = estimateTokens(prompt);

  if (currentTokens > maxTokens * 0.4) {  // Prompt should be <40% of budget
    // Compression strategies in order:
    prompt = removeExamples(prompt);           // Remove few-shot examples
    prompt = summarizeContext(prompt);         // Summarize long context
    prompt = useReferences(prompt);            // Replace data with refs
    prompt = simplifyConstraints(prompt);      // Reduce instruction detail
  }

  return await callAI(prompt);
}
```

---

## 12. SMART CACHING HIERARCHY

### Multi-Level Cache System
```typescript
// Level 1: Exact Match (100% token savings)
const exactCache = getFromCache(exactKey);

// Level 2: Semantic Match (80% token savings)
if (!exactCache) {
  const similarCached = findSimilarPrompt(prompt, threshold=0.95);
  if (similarCached) {
    return await minorRegeneration(similarCached, delta);
  }
}

// Level 3: Template Match (50% token savings)
if (!similarCached) {
  const template = getTemplate(promptType);
  return await fillTemplate(template, context);
}

// Level 4: Full Generation (0% savings)
return await fullGeneration(prompt);
```

---

## 13. ESTIMATED COST SAVINGS

### Token Reduction by Feature:

| Feature | Token Savings | Cost Savings | Implementation Effort |
|---------|---------------|--------------|----------------------|
| Structured Prompts | 40-50% | $$$ | Low |
| Response Caching | 60-90% | $$$$ | Medium |
| Section-Based Gen | 32-66% | $$$ | Medium |
| Differential Regen | 70-85% | $$$$ | High |
| Context Compression | 70-80% | $$$$ | Low |
| JSON Responses | 50-60% | $$$ | Low |
| Model Selection | 90-95% | $$$$$ | Low |
| Batch Processing | 20-30% | $$ | Medium |
| Dynamic Compression | 30-40% | $$$ | High |
| Smart Caching | 50-80% | $$$$ | High |

**Combined Estimated Savings: 60-75% total token reduction**

---

## 14. IMPLEMENTATION CHECKLIST

### Phase 1: Quick Wins (Week 1)
- [ ] Implement structured prompt templates
- [ ] Add JSON response formatting
- [ ] Set up basic response caching
- [ ] Implement model selection strategy
- [ ] Add context compression

### Phase 2: Advanced Features (Week 2)
- [ ] Build section-based generation
- [ ] Implement checkpoint/resume
- [ ] Add differential regeneration
- [ ] Build smart caching hierarchy
- [ ] Add token budget tracking

### Phase 3: Optimization (Week 3)
- [ ] Implement batch processing
- [ ] Add dynamic prompt compression
- [ ] Build analytics dashboard
- [ ] Set up automated alerts
- [ ] Performance testing & tuning

---

## 15. MONITORING & ANALYTICS

### Key Metrics to Track
```typescript
interface TokenMetrics {
  totalTokensUsed: number;
  tokensPerOperation: Record<string, number>;
  cacheHitRate: number;        // Target: >60%
  averageCostPerDocument: number;
  tokensSavedByCache: number;
  costSavings: number;         // USD
  budgetUtilization: number;   // Percentage
}
```

---

## 16. EXAMPLE: COMPLETE WORKFLOW

```typescript
async function generateBusinessPlan(clientId: string) {
  // 1. Check cache
  const cacheKey = generateCacheKey(clientId, "business_plan");
  const cached = await checkCache(cacheKey);
  if (cached) {
    await logTokenUsage({ operation: "BUSINESS_PLAN", cacheHit: true, tokensSaved: 5000 });
    return cached;
  }

  // 2. Load compressed context
  const context = await loadCompressedContext(clientId, "business_plan");

  // 3. Check for existing checkpoint
  const checkpoint = await getCheckpoint(clientId);
  const startSection = checkpoint?.next || 0;

  // 4. Generate section by section with optimal model
  const sections = [];
  for (let i = startSection; i < 8; i++) {
    const section = SECTIONS[i];
    const model = selectOptimalModel(section.complexity);

    try {
      const result = await generateSection({
        section,
        context: context[section.name],
        model,
        format: "json"
      });

      sections.push(result);

      // Save checkpoint every 2 sections
      if (i % 2 === 1) {
        await saveCheckpoint({
          clientId,
          completed: sections.map(s => s.name),
          next: i + 1,
          context
        });
      }

      // Log token usage
      await logTokenUsage({
        operation: "GENERATE_SECTION",
        section: section.name,
        model,
        tokens: result.tokensUsed,
        cost: calculateCost(result.tokensUsed, model)
      });

    } catch (error) {
      // Can resume from checkpoint later
      throw error;
    }
  }

  // 5. Combine sections
  const fullPlan = combineSections(sections);

  // 6. Cache result
  await cacheResponse(cacheKey, fullPlan, ttl: 7 * 24 * 3600);

  return fullPlan;
}
```

---

## CONCLUSION

This framework can reduce token usage by **60-75%** through:
1. Structured prompts (45% savings)
2. Smart caching (60-90% on cache hits)
3. Section-based generation (32-66% flexibility)
4. Optimal model selection (90-95% on simple tasks)
5. Context compression (70-80% savings)

**Estimated monthly savings for 100 clients:**
- Without optimization: ~10M tokens = $200/month
- With optimization: ~2.5M tokens = $50/month
- **Savings: $150/month (75%)**
