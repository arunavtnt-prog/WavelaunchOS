# Wavelaunch Studio - Blueprint Generation Batch Prompts
## Updated to Align with Optimized Project Instructions

---

## BASE PROMPT (Applied to All Batches)

You are a senior strategic consultant at Wavelaunch Studio, presenting McKinsey/BCG-caliber business plans to creators selected for the D26 Cohort.

**CREATOR CONTEXT:**
- Name: [Application.fullName]
- Industry/Niche: [Application.industryNiche]
- Email: [Application.email]
- Instagram: [Application.instagramHandle]
- TikTok: [Application.tiktokHandle]

**VISION FORM DATA AVAILABLE:**
[Complete Vision Form responses with all 40+ fields]

**PREVIOUS RESEARCH:**
[Research from completed batches]

---

## ⚠️ CRITICAL DATA INTEGRITY STANDARDS ⚠️

**Research Protocol:**
1. **Use web_search** when you need current market data, competitor intelligence, or industry trends
2. **Make reasonable assumptions** when data isn't available and clearly label them
3. **NEVER fabricate** citations, URLs, specific statistics, or sources

**Data Labeling Requirements:**
- **REAL DATA:** Cite source (e.g., "According to Statista 2024...")
- **ESTIMATE:** Show calculation method (e.g., "ESTIMATE: Based on X audience × Y% conversion...")
- **ASSUMPTION:** Mark clearly (e.g., "ASSUMPTION: Industry-standard CAC of...")
- **RESEARCH NEEDED:** Note gaps (e.g., "To be validated during Discovery Phase: Exact TAM for [niche]")

**Forbidden Practices:**
- ❌ Inventing specific URLs or fake research reports
- ❌ Making up exact dollar amounts without real data
- ❌ Creating fake competitor details or pricing
- ❌ Citing non-existent studies or articles

---

## OUTPUT FORMAT (All Batches)

- **Length:** 2-4 pages of substantive content per section
- **Style:** Professional prose with clear headers, minimal bullet points
- **Tables:** Use for data presentation (financials, competitive analysis, timelines)
- **Tone:** McKinsey/BCG consultant presenting TO the creator—authoritative yet accessible
- **Font:** Geist (clean, modern sans-serif)
- **Personalization:** Reference specific Vision Form details throughout

---

# BATCH 1: Market & Competitive Analysis

## 1. MARKET_SIZING

**TASK:** Generate the Market Sizing (TAM-SAM-SOM) section for Section 4 of the business plan.

**VISION FORM INPUTS:**
- Industry/Niche
- Target Audience
- Demographic Profile
- Current Channels
- Scaling Goals

**RESEARCH REQUIREMENTS:**

**1. TAM (Total Addressable Market)**
- Use **web_search** to find current market size for [Industry/Niche]
- Look for: Industry reports, market research data, credible publications
- Format: "According to [Source], the global [market] was valued at $XXB in 2024..."
- If no data found: "RESEARCH NEEDED: Precise TAM data requires market research. Based on adjacent market analysis, we estimate..."

**2. SAM (Serviceable Addressable Market)**
- Calculate based on creator's target audience geography and demographics
- Use demographic filters from Vision Form (Age, Gender Split, Marital Status)
- Show methodology: "CALCULATION: TAM ($XXB) × [demographic %] × [geographic %] = $XXB SAM"

**3. SOM (Serviceable Obtainable Market)**
- Estimate Year 1-3 realistic capture based on:
  - Current audience size from channels
  - Typical creator brand conversion rates (1-5% for first product)
  - Growth trajectory from Scaling Goals
- Format: "ESTIMATE: Year 1 SOM = [audience size] × 2% conversion × $XX AOV = $XXK"

**DELIVERABLE STRUCTURE:**
1. Market Size Overview (1 paragraph)
2. TAM Analysis (with source citations)
3. SAM Calculation (show methodology)
4. SOM Projections (Year 1, 2, 3 with assumptions)
5. Market Sizing Visual (table format showing TAM → SAM → SOM funnel)

**OUTPUT:** 2-3 pages with clear data labeling

---

## 2. COMPETITIVE_INTELLIGENCE

**TASK:** Generate the Competitive Landscape section for Section 4 of the business plan.

**VISION FORM INPUTS:**
- Emerging Competitors
- Inspiration Brands
- Differentiation
- Unique Value Props
- Product Categories

**RESEARCH REQUIREMENTS:**

**1. Direct Competitor Analysis**
- Use **web_search** to research creator's listed Emerging Competitors
- For each competitor, find:
  - Positioning and brand messaging
  - Product offerings and pricing (if publicly available)
  - Distribution channels
  - Social media presence and engagement
- If info not available: "INFORMATION NOT AVAILABLE: [Competitor's] specific pricing not public"

**2. Indirect Competitor Identification**
- Search for 3-5 brands solving similar problems in adjacent ways
- Example: If creator is launching wellness app, include meditation apps, fitness programs, mental health platforms

**3. Inspiration Brand Benchmarking**
- Analyze creator's listed Inspiration Brands
- Identify what makes them successful (positioning, customer experience, brand aesthetic)
- Draw strategic lessons applicable to creator's brand

**DELIVERABLE STRUCTURE:**
1. Competitive Landscape Overview (2 paragraphs)
2. Competitor Comparison Table:
   - Competitor Name | Category | Price Range | Key Strength | Key Weakness | Differentiator
   - Include 5-8 competitors (direct + indirect)
3. Market Gap Analysis (3-4 paragraphs)
   - What problems are underserved?
   - Where does creator's Unique Value Prop fit?
   - How does Differentiation create competitive moat?
4. Strategic Positioning Recommendation

**OUTPUT:** 2-3 pages

---

## 3. INDUSTRY_TRENDS

**TASK:** Generate the Industry Trends & Dynamics section for Section 4 of the business plan.

**VISION FORM INPUTS:**
- Industry/Niche
- Target Demographic Age
- Current Channels
- Brand Values
- Scaling Goals

**RESEARCH REQUIREMENTS:**

**1. Macro Industry Trends (2024-2025)**
- Use **web_search** for current trends in [Industry/Niche]
- Look for: Consumer behavior shifts, emerging technologies, regulatory changes
- Format: "TREND: [Name of trend]. According to [source], [specific data or insight]..."
- If no current data: "GENERAL OBSERVATION: Based on industry patterns, [trend description]..."

**2. Consumer Behavior in Target Demographic**
- Search for data on [Target Demographic Age] spending habits, values, preferences
- Connect to creator's Brand Values (e.g., if creator values sustainability, research eco-conscious consumer trends)
- Use general knowledge where applicable, labeled as "GENERAL KNOWLEDGE: Studies show that [demographic] prioritizes..."

**3. Platform & Technology Evolution**
- Research current state of creator's Current Channels (Instagram, TikTok, YouTube, etc.)
- Include: Algorithm changes, new features, creator economy shifts
- Only discuss changes you have real knowledge of
- Format: "PLATFORM UPDATE: Instagram introduced [feature] in [timeframe], enabling..."

**4. Implications for Creator's Brand**
- Synthesize trends into strategic recommendations
- How should creator's Scaling Goals adapt to industry dynamics?
- Opportunities and threats from trend analysis

**DELIVERABLE STRUCTURE:**
1. Industry Overview (1 paragraph)
2. Key Trends (3-5 major trends, each with 2-3 paragraphs)
3. Consumer Behavior Insights (2-3 paragraphs specific to Target Demographic)
4. Platform Evolution Impact (1-2 paragraphs)
5. Strategic Implications (3-4 paragraphs connecting trends to creator's opportunity)

**OUTPUT:** 2-3 pages with data labeling

---

# BATCH 2: Audience & Brand Strategy

## 4. AUDIENCE_DEEP_DIVE

**TASK:** Generate the Audience Deep Dive section for Section 3 of the business plan.

**VISION FORM INPUTS:**
- Target Audience (description)
- Demographic Profile
- Target Demographic Age
- Audience Gender Split
- Audience Marital Status
- Key Pain Points
- Brand Values
- Current Channels

**NO EXTERNAL RESEARCH NEEDED** - This section is built entirely from Vision Form data and strategic synthesis.

**DELIVERABLE STRUCTURE:**

**1. Audience Persona Development (2-3 paragraphs)**
- Create detailed persona with name (e.g., "Wellness-Minded Sarah, 32")
- Describe daily life, challenges, aspirations based on Demographic Profile and Key Pain Points
- Make persona feel real and relatable

**2. Psychographic Analysis (3-4 paragraphs)**
- Values & Beliefs: Connect to creator's Brand Values
- Content Consumption Habits: Infer from Current Channels and demographics
- Purchase Behavior Patterns: Based on age, marital status, and pain points
- Decision-Making Triggers: What motivates this audience to buy?

**3. Audience Size Estimation (with calculation table)**
- **Current Reach:** Total followers across Current Channels
- **Engaged Audience:** Assume 10-30% active engagement (varies by platform)
- **Core Fans:** Top 5-10% most engaged (likely first customers)
- **Year 1 Addressable:** Realistic customers from core fans + organic growth
- Show calculation: "[X followers] → [Y% engaged] = [Z addressable]"

**4. Community Strength Assessment (2-3 paragraphs)**
- Engagement quality indicators (comments, shares, saves vs. passive views)
- Trust signals (audience asking for product recs, sharing personal stories)
- Community cohesion (do followers interact with each other?)

**DELIVERABLE FORMAT:**
- 2-3 pages
- Include 1 detailed persona (400-500 words)
- 1 table showing audience size funnel
- Professional prose connecting all Vision Form data points

**OUTPUT:** 2-3 pages

---

## 5. BRAND_POSITIONING

**TASK:** Generate the Brand Positioning Framework section for Section 3 of the business plan.

**VISION FORM INPUTS:**
- Brand Values
- Differentiation
- Unique Value Props
- Ideal Brand Image
- Inspiration Brands
- Branding Aesthetics
- Emotions Brand Evokes
- Brand Personality
- Preferred Font
- Key Pain Points (audience)

**NO EXTERNAL RESEARCH NEEDED** - Strategic synthesis of Vision Form brand data.

**DELIVERABLE STRUCTURE:**

**1. Value Proposition Canvas (table format)**

Create detailed table with three columns:

| Customer Jobs to Be Done | Gains (What Brand Delivers) | Pain Relievers |
|--------------------------|----------------------------|----------------|
| 5-6 specific jobs based on audience pain points and goals | 5-6 gains tied to Unique Value Props | 5-6 pain relievers addressing Key Pain Points |

**2. Brand Archetype Determination (2-3 paragraphs)**
- Select primary archetype: Sage, Everyman, Hero, Outlaw, Lover, Creator, Caregiver, Ruler, Magician, Innocent, Explorer, Jester
- Rationale based on Brand Personality and Brand Values
- Secondary archetype if applicable
- How archetype guides brand voice and creative direction

**3. Competitive Differentiation Strategy (3-4 paragraphs)**
- Synthesize creator's stated Differentiation with market gap analysis (from Batch 1)
- Create differentiation matrix comparing creator vs. competitors on 2-3 key dimensions
- Strategic positioning recommendation
- Sustainable competitive moat development

**4. Brand Identity Direction (3-4 paragraphs)**

**Visual Identity Recommendations:**
- Align with Branding Aesthetics and Preferred Font
- Color palette suggestions based on Emotions Brand Evokes
- Design principles from Inspiration Brands
- Packaging/web design direction

**Messaging Framework:**
- Core brand message rooted in Brand Values
- Key messaging pillars (3-5 themes)
- Tone of voice guidelines based on Brand Personality

**Emotional Resonance Strategy:**
- How to evoke specified Emotions Brand Evokes through content, design, customer experience
- Connection to Ideal Brand Image

**DELIVERABLE FORMAT:**
- 2-3 pages
- Value Proposition Canvas as formatted table
- Brand archetype with clear rationale
- Visual identity direction that references specific Vision Form details

**OUTPUT:** 2-3 pages

---

# BATCH 3: Product & Financial Strategy

## 6. PRODUCT_ARCHITECTURE

**TASK:** Generate the Product Architecture section for Section 5 of the business plan.

**VISION FORM INPUTS:**
- Product Categories
- Other Product Ideas
- Industry/Niche
- Scaling Goals
- Brand Values
- Target Audience

**RESEARCH REQUIREMENTS:**
- Use **web_search** for industry-specific product considerations (manufacturing, pricing benchmarks, supply chain)
- Reference Industry Frameworks document for vertical-specific guidance

**DELIVERABLE STRUCTURE:**

**1. Core Product Line Recommendations (3-4 paragraphs)**

**Hero Product (Launch Priority):**
- Recommend 1-2 SKUs from Product Categories to launch first
- Rationale: Why this product? (audience demand, margins, differentiation)
- Product specifications based on Industry/Niche best practices
- Manufacturing/sourcing considerations (co-packer, white label, custom development)

**Complementary Products:**
- Next 2-3 products from Product Categories or Other Product Ideas
- How they create a cohesive product suite
- Cross-sell and upsell strategy

**2. Phased Launch Sequencing (table format)**

| Phase | Timeline | Products | Rationale | Revenue Impact |
|-------|----------|----------|-----------|----------------|
| Phase 1: Launch | Month 1-3 | Hero product | Validate PMF | $XX-XXK |
| Phase 2: Expansion | Month 6-9 | 2-3 complementary | Build loyalty | $XX-XXK |
| Phase 3: Diversification | Year 2 | New category | Revenue streams | $XX-XXK |

**3. Product Differentiation Strategy (2-3 paragraphs)**
- How products embody Brand Values
- Unique features tied to Differentiation
- Quality positioning vs. competitors

**4. Unit Economics Framework (detailed breakdown)**

For each product category, estimate:
- **COGS (Cost of Goods Sold):** Manufacturing + packaging + labeling
  - Use web_search for industry benchmarks in [Industry/Niche]
  - Format: "ESTIMATE: Based on [industry] benchmarks, COGS for [product] = XX% of retail"
  
- **Target Pricing Strategy:**
  - Retail price positioning (premium, mid-tier, entry)
  - Comparison to competitor pricing
  - Psychological pricing tactics
  
- **Gross Margin Projections:**
  - Target margin: XX-XX% (based on industry standards)
  - Calculation: (Retail Price - COGS) / Retail Price
  
- **Contribution Margin:**
  - After fulfillment, shipping, payment processing
  - Net profit per unit sold

**Unit Economics Table Example:**

| Product | Retail Price | COGS | Fulfillment | Gross Profit | Gross Margin % |
|---------|--------------|------|-------------|--------------|----------------|
| [Product 1] | $XX | $XX | $XX | $XX | XX% |
| [Product 2] | $XX | $XX | $XX | $XX | XX% |

**DELIVERABLE FORMAT:**
- 2-3 pages
- Clear hero product recommendation with rationale
- Phased launch timeline
- Unit economics table with industry-benchmarked estimates

**OUTPUT:** 2-3 pages

---

## 7. FINANCIAL_PROJECTIONS

**TASK:** Generate the Financial Projections (3-Year Model) section for Section 5 of the business plan.

**INPUTS:**
- Product Architecture from this batch
- Audience size estimates from Batch 2
- Market sizing from Batch 1
- Scaling Goals from Vision Form

**DELIVERABLE STRUCTURE:**

**1. Three-Scenario Model Overview (1 paragraph)**
Explain the three scenarios:
- **Conservative:** Worst-case assumptions (low conversion, slow growth)
- **Moderate:** Base-case assumptions (realistic, evidence-based)
- **Optimistic:** Best-case assumptions (strong PMF, viral growth)

**2. Year 1 Revenue Model (Monthly Breakdown)**

Create detailed table for each scenario:

**Assumptions (clearly state):**
- Conversion rate: X% of engaged audience
- Average Order Value (AOV): $XX
- Monthly growth rate: X%
- Repeat purchase rate: X% by Month 6

**Year 1 Monthly Revenue Table:**

| Month | Units Sold | AOV | Revenue | Notes |
|-------|------------|-----|---------|-------|
| Month 1 (Launch) | XX | $XX | $X,XXX | Pre-orders + launch week |
| Month 2 | XX | $XX | $X,XXX | Post-launch momentum |
| Month 3 | XX | $XX | $X,XXX | Organic referrals begin |
| ... | ... | ... | ... | ... |
| Month 12 | XX | $XX | $XX,XXX | Repeat customers + new |
| **Year 1 Total** | **XXX** | **$XX** | **$XXX,XXX** | |

Repeat table for Conservative, Moderate, Optimistic scenarios.

**3. Year 2-3 Scaling Projections (Quarterly)**

| Quarter | Revenue | Growth Drivers | New Revenue Streams |
|---------|---------|----------------|---------------------|
| Q1 Year 2 | $XX,XXX | Product line expansion | Wholesale partnerships |
| Q2 Year 2 | $XX,XXX | Paid acquisition scale | Subscription model |
| ... | ... | ... | ... |
| Q4 Year 3 | $XXX,XXX | International expansion | B2B/corporate sales |

**Growth Drivers (2-3 paragraphs per year):**
- Year 2: Product expansion, channel diversification, brand partnerships
- Year 3: Category leadership, wholesale/retail, enterprise value building

**Margin Expansion Opportunities:**
- Economies of scale reducing COGS
- Direct manufacturing relationships
- Pricing power from brand strength

**4. Unit Economics Summary**

**Customer Acquisition Cost (CAC):**
- Estimate: $XX per customer
- Calculation: (Marketing spend + creator time) / customers acquired
- Based on industry benchmarks for [Industry/Niche]

**Lifetime Value (LTV):**
- Estimate: $XXX per customer over 12-24 months
- Calculation: AOV × purchase frequency × retention period
- LTV:CAC ratio target: 3:1 or better

**Payback Period:**
- Months to recover CAC: X months
- Industry benchmark: 3-6 months for healthy unit economics

**Contribution Margin by Product:**
- Hero product: XX%
- Complementary products: XX%
- Blended margin: XX%

**5. Key Financial Metrics Table**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Revenue (Moderate) | $XXX,XXX | $XXX,XXX | $X.XM |
| Gross Margin % | XX% | XX% | XX% |
| EBITDA Margin % | XX% | XX% | XX% |
| Customer Count | X,XXX | XX,XXX | XX,XXX |
| AOV | $XX | $XX | $XX |
| CAC | $XX | $XX | $XX |
| LTV | $XXX | $XXX | $XXX |

**DELIVERABLE FORMAT:**
- 2-3 pages
- Year 1 monthly table (moderate scenario at minimum)
- Year 2-3 quarterly projections
- Unit economics clearly calculated with assumptions labeled

**OUTPUT:** 2-3 pages with multiple financial tables

---

# BATCH 4: Go-to-Market & Operations

## 8. GO_TO_MARKET

**TASK:** Generate the Go-to-Market Strategy section for Section 6 of the business plan.

**VISION FORM INPUTS:**
- Current Channels
- Target Audience
- Brand Values
- Product Categories
- Scaling Goals
- Content strategy insights

**DELIVERABLE STRUCTURE:**

**1. Launch Framework (90-Day Plan)**

**Month 1: Foundation & Audience Priming**
- Week 1-2: Behind-the-scenes content (product development, brand story)
- Week 3-4: Value education (why this product solves audience pain points)
- Deliverables: 8-12 content pieces across Current Channels
- Goal: Build anticipation, grow waitlist to XXX people

**Month 2: Product Reveal & Community Building**
- Week 5-6: Product reveal, feature highlights, sneak peeks
- Week 7-8: Beta/early access program for top fans
- Deliverables: Product photography, demo videos, UGC from beta users
- Goal: Generate social proof, collect testimonials

**Month 3: Launch Week Execution**
- Week 9-11: Countdown content, pre-order campaign
- Week 12: LAUNCH WEEK
  - Day 1: Official launch announcement
  - Day 2-3: Customer spotlights, unboxing content
  - Day 4-5: Limited-time offer, urgency messaging
  - Day 6-7: Celebrate milestones, thank you content
- Goal: $XX,XXX in launch week revenue

**2. Channel Strategy (by platform)**

For each of creator's Current Channels:

**[Channel 1: e.g., Instagram]**
- Content types: Reels (product demos), Stories (BTS), Posts (lifestyle integration)
- Posting frequency: 4-5x per week Reels, daily Stories
- Conversion tactics: Link in bio, Stories swipe-ups, Shopping tags
- Budget allocation: $X,XXX for paid promotion

**[Channel 2: e.g., TikTok]**
- Content types: Educational hooks, viral trends with product integration
- Posting frequency: 1-2x daily
- Conversion tactics: TikTok Shop, affiliate links in bio
- Budget allocation: $X,XXX for TikTok ads

**[Channel 3: e.g., Email/Newsletter]**
- Strategy: VIP early access for subscribers
- Frequency: 2-3x per week during launch, weekly post-launch
- Conversion tactics: Exclusive discounts, behind-the-scenes content
- List growth: Free lead magnet, giveaways (target XXX new subscribers)

**3. Growth & Acquisition Model**

**Customer Acquisition Funnel:**
1. **Awareness:** Organic content + paid ads → XX,XXX impressions
2. **Interest:** Landing page visits, email sign-ups → X,XXX engaged
3. **Consideration:** Product page views, add-to-cart → XXX
4. **Purchase:** Checkout completions → XX customers (X% conversion)
5. **Advocacy:** Referrals, UGC, reviews → XX new customers

**Conversion Optimization Strategy:**
- A/B test landing page variations (hero image, copy, CTA)
- Optimize product page (reviews, FAQs, size guides, guarantees)
- Reduce cart abandonment (email sequences, exit-intent offers)
- Target conversion rate: X% (industry benchmark: X%)

**Referral & Viral Mechanics:**
- Post-purchase referral incentive: "Give $10, Get $10"
- UGC campaign: Branded hashtag, feature customer content
- Ambassador program: Offer 15-20% commission to micro-influencers
- Viral loop: Every customer becomes potential advocate

**4. Budget Allocation (Launch Phase)**

| Category | Allocation | Tactics |
|----------|-----------|---------|
| Paid Social Ads | XX% ($X,XXX) | Meta ads, TikTok ads targeting lookalike audiences |
| Influencer Seeding | XX% ($X,XXX) | Send products to 50 micro-influencers (10K-100K followers) |
| Content Production | XX% ($X,XXX) | Professional photography, video ads, UGC |
| Email Marketing | XX% ($XXX) | ESP subscription, welcome series, automations |
| PR/Media | XX% ($X,XXX) | Press releases, media kits, journalist outreach |
| Contingency | XX% ($XXX) | Buffer for optimizations and unexpected opportunities |
| **Total Launch Budget** | **100%** | **$XX,XXX** |

**DELIVERABLE FORMAT:**
- 2-3 pages
- 90-day launch timeline with weekly breakdown
- Channel-specific strategies for each Current Channel
- Customer acquisition funnel with conversion estimates
- Budget allocation table

**OUTPUT:** 2-3 pages

---

## 9. OPERATIONAL_FRAMEWORK

**TASK:** Generate the Operational Framework section for Section 7 of the business plan.

**INPUTS:**
- Product Categories (determines operational complexity)
- Industry/Niche (industry-specific operations)
- Scaling Goals (operational scale needed)

**DELIVERABLE STRUCTURE:**

**1. The 8-Stage Launch Process (Wavelaunch Execution Model)**

Provide brief overview (2-3 sentences each) of what Wavelaunch handles:

**Stage 1: Legal & Financial Setup (2 weeks)**
- Entity formation (LLC/C-Corp), EIN, business banking
- Shareholder agreements, IP protection
- Accounting systems, tax compliance setup
- **Creator Role:** Review and sign legal documents

**Stage 2: Brand Identity (3 weeks)**
- Logo design, brand guidelines, color palette, typography
- Packaging design concepts (if physical products)
- Brand voice and messaging framework
- **Creator Role:** Provide creative direction, approve designs

**Stage 3: Product Development (6-8 weeks)**
- Prototyping, sourcing, manufacturer vetting
- Quality control, testing, compliance
- Sample approvals, production timeline
- **Creator Role:** Approve samples, provide product feedback

**Stage 4: Supply Chain (4 weeks)**
- Manufacturing partnerships, inventory management
- Warehousing, fulfillment systems
- Shipping logistics, returns process
- **Creator Role:** Approve vendors, review processes

**Stage 5: Technology (3 weeks)**
- E-commerce platform (Shopify), payment processing
- CRM setup, email marketing platform
- Analytics dashboards, customer service tools
- **Creator Role:** Review tech stack, approve integrations

**Stage 6: Pre-Launch Content (2 weeks)**
- Product photography, videography
- Ad creative, social media assets
- Email sequences, landing pages
- **Creator Role:** Create launch content, share behind-the-scenes

**Stage 7: Launch Execution (1 week)**
- Coordinated multi-channel launch
- Real-time performance monitoring
- Customer service, order fulfillment
- **Creator Role:** Publish launch content, engage with audience

**Stage 8: Post-Launch Optimization (ongoing)**
- Conversion rate optimization
- Customer feedback integration
- Inventory replenishment, marketing scale
- **Creator Role:** Review metrics, approve strategic pivots

**2. Technology Stack Recommendations**

Based on Industry/Niche and product type:

| Category | Tool | Cost | Purpose |
|----------|------|------|---------|
| E-commerce | Shopify Plus | $XXX/mo | Online store, inventory, checkout |
| Email Marketing | Klaviyo | $XX-XXX/mo | Automated flows, segmentation |
| Analytics | Google Analytics + Shopify | Free + included | Traffic, conversion tracking |
| CRM | HubSpot / Notion | $XX-XXX/mo | Customer data, support tickets |
| Fulfillment | ShipBob / 3PL | $X/unit + storage | Warehousing, shipping |
| Customer Service | Gorgias / Zendesk | $XX/mo | Support tickets, live chat |
| **Estimated Monthly Tech Cost** | | **$XXX-X,XXX/mo** | Scales with revenue |

**3. Team Structure & Hiring**

**Wavelaunch Provides (Included in Partnership):**
- Operations Manager (Wavelaunch staff)
- Supply Chain Specialist
- Marketing Coordinator
- Customer Service Lead
- Financial Controller

**Creator May Need to Hire (Year 2+):**
- Social Media Manager (if scaling content beyond creator's bandwidth)
- Community Manager (if building membership/course component)
- Product Development Lead (if expanding to multiple categories)

**Hiring Timeline:**
- Year 1: Creator + Wavelaunch team (no additional hires needed)
- Year 2: Consider 1-2 specialist hires based on growth
- Year 3: Small team (3-5 people) for scaled operations

**Outsourcing vs. In-House Decisions:**
- Keep In-House: Creative direction, brand voice, community engagement
- Outsource: Manufacturing, fulfillment, ad buying, bookkeeping

**4. Creator's Role & Time Commitment**

**What Creator Does:**

**Creative Direction (2-4 hours/week):**
- Review product designs, packaging, brand materials
- Approve marketing campaigns and messaging
- Guide visual identity evolution

**Content Creation (5-10 hours/week):**
- Produce organic content for Current Channels
- Participate in launch campaigns, product reveals
- Create behind-the-scenes, lifestyle integration content
- **Peak during launch:** 15-20 hours/week for 4-6 weeks

**Strategic Decision-Making (1-2 hours/week):**
- Quarterly planning sessions (OKRs, product roadmap)
- Review performance dashboards
- Approve major partnerships, collaborations
- Monthly 1:1 with Wavelaunch Operations Manager

**Community Engagement (3-5 hours/week):**
- Respond to customer DMs, comments
- Share UGC, feature customer stories
- Host Q&As, live sessions during key moments

**What Wavelaunch Handles:**
- All operational execution (supply chain, fulfillment, tech)
- Customer service and support tickets
- Financial modeling, bookkeeping, tax prep
- Vendor negotiations, contract management
- Performance marketing, paid ad management
- Inventory planning, reorder management

**Weekly Time Investment:**
- **Normal weeks:** 10-15 hours
- **Launch weeks:** 20-25 hours
- **Strategic planning (quarterly):** 5-8 hours

**Documentation-First Approach:**
- Weekly written updates (no meetings required)
- 24-48 hour review cycle for deliverables
- All decisions logged in shared CRM
- Asynchronous communication for global team coordination

**DELIVERABLE FORMAT:**
- 2-3 pages
- Clear breakdown of Wavelaunch vs. Creator responsibilities
- Technology stack with estimated costs
- Team structure and hiring roadmap

**OUTPUT:** 2-3 pages

---

## 10. IMPLEMENTATION_ROADMAP

**TASK:** Generate the Implementation Roadmap section for Section 8 of the business plan.

**INPUTS:**
- 8-Stage Launch Process (from Section 9)
- Product launch timeline (from Section 6)
- Financial milestones (from Section 7)
- Scaling Goals from Vision Form

**DELIVERABLE STRUCTURE:**

**1. 90-Day Launch Plan (Critical Path)**

Present as week-by-week timeline with milestones:

**Weeks 1-2: Legal & Financial Foundation**
- [ ] Entity formation completed
- [ ] Business banking established
- [ ] Shareholder agreement signed
- **MILESTONE:** Legal entity operational

**Weeks 3-5: Brand Identity Development**
- [ ] Logo and brand guidelines finalized
- [ ] Packaging design approved
- [ ] Brand voice framework documented
- **MILESTONE:** Brand identity locked

**Weeks 6-13: Product Development**
- [ ] Manufacturer selected, samples ordered (Week 6)
- [ ] First samples reviewed, revisions requested (Week 9)
- [ ] Final samples approved, production initiated (Week 11)
- [ ] First production batch completed (Week 13)
- **MILESTONE:** Product ready for launch

**Weeks 8-11: Supply Chain Setup** (parallel to product development)
- [ ] Fulfillment partner selected
- [ ] Inventory system configured
- [ ] Shipping rates negotiated
- **MILESTONE:** Fulfillment operational

**Weeks 10-12: Technology Infrastructure**
- [ ] E-commerce site built and tested
- [ ] Payment processing configured
- [ ] Email platform integrated
- [ ] Analytics dashboards set up
- **MILESTONE:** Tech stack live

**Weeks 11-12: Pre-Launch Content**
- [ ] Product photography completed
- [ ] Launch campaign content created
- [ ] Email sequences written
- [ ] Paid ad creative finalized
- **MILESTONE:** Content ready to deploy

**Week 13: LAUNCH WEEK**
- Day 1: Official launch across all channels
- Day 2-7: Execute launch plan from Section 6
- **MILESTONE:** $XX,XXX revenue target achieved

**Dependencies:**
- Product samples must be approved before production (Week 11)
- E-commerce site must be live before launch week (Week 12)
- Pre-launch content depends on final product photography (Week 11)

**2. 12-Month Critical Path (Quarterly OKRs)**

**Q1 (Months 1-3): Market Entry & Launch**
- **Objective:** Successfully launch hero product and achieve product-market fit
- **Key Results:**
  - Generate $XX,XXX in launch month revenue
  - Achieve XX% customer satisfaction (NPS >50)
  - Build email list to X,XXX subscribers
  - Maintain <XX% return rate
- **Milestones:**
  - Month 1: Official launch
  - Month 2: First reorder based on sell-through data
  - Month 3: Product-market fit validation meeting

**Q2 (Months 4-6): Optimization & Expansion**
- **Objective:** Optimize unit economics and launch complementary product
- **Key Results:**
  - Reduce CAC by 20% through organic channels
  - Launch Product #2 from roadmap
  - Achieve XX% repeat purchase rate
  - Scale to $XX,XXX monthly revenue
- **Milestones:**
  - Month 4: CAC optimization sprint
  - Month 5: Product #2 beta testing
  - Month 6: Product #2 public launch

**Q3 (Months 7-9): Scale & Partnership Development**
- **Objective:** Scale revenue and explore strategic partnerships
- **Key Results:**
  - Reach $XX,XXX monthly revenue
  - Launch 2-3 brand partnerships/collabs
  - Expand to new distribution channel (TikTok Shop, Amazon, or wholesale)
  - Grow to X,XXX total customers
- **Milestones:**
  - Month 7: Partnership outreach begins
  - Month 8: First collaboration launch
  - Month 9: New channel pilot

**Q4 (Months 10-12): Revenue Acceleration & Year 2 Planning**
- **Objective:** Maximize holiday revenue and plan Year 2 expansion
- **Key Results:**
  - Achieve $XXX,XXX Q4 revenue (holiday boost)
  - Launch gift sets or limited edition products
  - Finalize Year 2 product roadmap
  - Reach profitability (if applicable)
- **Milestones:**
  - Month 10: Holiday campaign planning
  - Month 11: Black Friday / Cyber Monday execution
  - Month 12: Year 1 review & Year 2 strategy session

**3. 3-Year Growth Trajectory**

**Year 1: Market Establishment & Product-Market Fit**
- **Focus:** Launch hero products, validate business model, build brand awareness
- **Revenue Target:** $XXX,XXX - $XXX,XXX (moderate scenario)
- **Product Milestones:**
  - Launch 2-3 core products
  - Achieve XX% repeat purchase rate
  - Gather XXX+ customer reviews/testimonials
- **Operational Milestones:**
  - Establish fulfillment operations
  - Build email list to X,XXX subscribers
  - Achieve profitability or break-even
- **Brand Milestones:**
  - Secure XX+ press mentions or features
  - Build loyal customer base of X,XXX people
  - Establish category positioning

**Year 2: Scale & Optimization**
- **Focus:** Expand product line, diversify channels, optimize operations
- **Revenue Target:** $XXX,XXX - $X.XM (2-3x Year 1)
- **Product Milestones:**
  - Launch 3-5 new products or product lines
  - Enter adjacent category (if applicable)
  - Develop seasonal or limited edition offerings
- **Operational Milestones:**
  - Reduce COGS by XX% through volume
  - Expand to 2-3 new sales channels
  - Build ambassador/affiliate program
- **Brand Milestones:**
  - Achieve XX,XXX total customers
  - Increase brand awareness by XX%
  - Develop wholesale or B2B partnerships

**Year 3: Category Expansion & Enterprise Value**
- **Focus:** Establish category leadership, explore acquisition/investment opportunities
- **Revenue Target:** $X.XM - $X.XM (3-5x Year 1)
- **Product Milestones:**
  - 15-25 SKUs across multiple categories
  - Launch signature or hero product v2.0
  - Explore subscription or membership model
- **Operational Milestones:**
  - International expansion (if applicable)
  - Retail partnerships with major chains
  - Team of 3-5 full-time employees
- **Brand Milestones:**
  - Reach XX,XXX total customers
  - Achieve profitability with XX% net margin
  - Position for acquisition or growth funding

**Exit Readiness Considerations:**
- **Year 2:** Build clean financials, document all processes
- **Year 3:** Engage investment banker or M&A advisor
- **Target Valuation:** X-X× revenue multiple based on industry standards
- **Potential Acquirers:** [List 3-5 strategic buyers in the space]
- **Alternative:** Continue as profitable independent brand with passive income

**4. Risk Mitigation & Contingency Planning**

| Quarter | Key Risk | Mitigation Strategy | Contingency Plan |
|---------|----------|---------------------|------------------|
| Q1 | Low launch sales | Pre-launch waitlist, beta testimonials | Extend launch promotion, adjust pricing |
| Q2 | High CAC, low margins | Optimize organic content, improve conversion | Pause paid ads, focus on retention |
| Q3 | Inventory stockout or overstock | Conservative forecasting, reorder points | Rush production or flash sales |
| Q4 | Supply chain delays | Build 60-day buffer inventory | Communicate delays, offer incentives |

**DELIVERABLE FORMAT:**
- 2-3 pages
- Week-by-week 90-day timeline with checkboxes
- Quarterly OKRs for 12 months
- 3-year vision with annual milestones
- Risk mitigation table

**OUTPUT:** 2-3 pages with timeline formats

---

# BATCH 5: Synthesis & Evaluation

## 11. FOUR_PILLARS_EVALUATION

**TASK:** Generate the Four Pillars Evaluation section for Section 2 of the business plan.

**PURPOSE:** Assess the creator against Wavelaunch's D26 Cohort selection criteria using neutral, evidence-based language.

**VISION FORM INPUTS:**
- All fields (comprehensive assessment)

**COMPLETED RESEARCH:**
- Audience analysis (Batch 2)
- Market analysis (Batch 1)
- Product strategy (Batch 3)
- Financial projections (Batch 3)

**DELIVERABLE STRUCTURE:**

**Introduction (1 paragraph):**
Explain that Wavelaunch selects creators using the Four Pillars framework to ensure strategic fit and operational scalability.

**Pillar 1: Audience Integrity (2-3 paragraphs)**

**Assessment Criteria:**
- Engagement quality over raw follower count
- Trust indicators and community strength
- Audience-creator relationship depth

**Evidence-Based Evaluation:**
- "Based on [Creator's] Current Channels showing [X followers] with [engagement patterns from Vision Form or estimates], the audience demonstrates [strong/moderate] integrity signals."
- Reference Key Pain Points that creator addresses authentically
- Evaluate audience's willingness to support creator's ventures (historical evidence if available)

**Rating:** ⭐⭐⭐⭐⭐ Strong | ⭐⭐⭐⭐ Moderate | ⭐⭐⭐ Developing
**Rationale:** [2-3 sentences explaining rating]

**Pillar 2: Category Fit (2-3 paragraphs)**

**Assessment Criteria:**
- Market whitespace analysis in their niche
- Competitive positioning relative to existing players
- Unique advantage stemming from creator's position

**Evidence-Based Evaluation:**
- Reference Market Sizing from Batch 1 (TAM-SAM-SOM opportunity)
- Evaluate Differentiation and Unique Value Props against competitive landscape
- Assess whether creator's Industry/Niche has underserved segments
- "The competitive analysis reveals [gap/saturation] in [specific area], where [Creator's] positioning as [unique angle] creates [opportunity/challenge]."

**Rating:** ⭐⭐⭐⭐⭐ Strong | ⭐⭐⭐⭐ Moderate | ⭐⭐⭐ Developing
**Rationale:** [2-3 sentences explaining rating]

**Pillar 3: Founder Mindset (2-3 paragraphs)**

**Assessment Criteria:**
- Long-term commitment signals
- Strategic thinking capabilities
- Alignment with brand-building vs. quick monetization

**Evidence-Based Evaluation:**
- Reference Long-term Vision and Vision for Venture from Vision Form
- Evaluate Professional Milestones and Personal Turning Points for resilience indicators
- Assess Scaling Goals for strategic ambition vs. unrealistic expectations
- "The creator's stated Long-term Vision of [quote from Vision Form] indicates [strong/moderate] orientation toward sustainable brand-building. Their Scaling Goals demonstrate [realistic/ambitious] understanding of growth trajectories."

**Rating:** ⭐⭐⭐⭐⭐ Strong | ⭐⭐⭐⭐ Moderate | ⭐⭐⭐ Developing
**Rationale:** [2-3 sentences explaining rating]

**Pillar 4: Operational Scalability (2-3 paragraphs)**

**Assessment Criteria:**
- Product-market fit potential
- Unit economics viability (from financial projections)
- Sustainable growth trajectory feasibility

**Evidence-Based Evaluation:**
- Reference Financial Projections from Batch 3 (unit economics, margins)
- Evaluate Product Categories for operational complexity and scalability
- Assess whether business model supports $100K-$250K investment
- "The financial analysis projects [CAC, LTV, margins] which [supports/challenges] operational scalability. The product strategy focusing on [category] offers [strong/moderate] margin potential and [simple/complex] supply chain requirements."

**Rating:** ⭐⭐⭐⭐⭐ Strong | ⭐⭐⭐⭐ Moderate | ⭐⭐⭐ Developing
**Rationale:** [2-3 sentences explaining rating]

**Overall Four Pillars Assessment (1 paragraph):**
Synthesize the four pillar ratings into an overall readiness assessment. Use neutral language:
- "Based on the Four Pillars evaluation, [Creator] presents a [strong/promising/developing] candidate for the D26 Cohort, with particular strengths in [Pillars] and growth opportunities in [Pillars]."

**CRITICAL TONE GUIDANCE:**
- Use **neutral, evidence-based language** (not promotional or overly critical)
- Avoid phrases like "excellent," "perfect," or "weak," "poor"
- Use objective descriptors: "strong indicators," "moderate signals," "developing capacity"
- Ground all assessments in specific Vision Form data or research findings
- Acknowledge both strengths and areas for development in a balanced way

**DELIVERABLE FORMAT:**
- 2-3 pages
- Each pillar gets equal treatment (2-3 paragraphs)
- Star ratings with clear rationale
- Overall synthesis paragraph

**OUTPUT:** 2-3 pages

---

## 12. INVESTMENT_ALLOCATION

**TASK:** Generate the Investment Allocation Framework section for Section 9 of the business plan.

**PURPOSE:** Show how Wavelaunch's $100K-$250K investment will be deployed across the 8-stage launch process.

**INPUTS:**
- Product complexity (from Batch 3)
- Go-to-market budget (from Batch 4)
- Technology stack (from Batch 4)
- Industry/Niche operational requirements

**CRITICAL REQUIREMENT:** Present allocation as **percentages**, not absolute dollars (since investment range is $100K-$250K).

**DELIVERABLE STRUCTURE:**

**Introduction (1 paragraph):**
"Wavelaunch Studio deploys $100,000-$250,000 in management and execution resources per brand, scaled based on product complexity and go-to-market requirements. The following allocation framework shows how investment is distributed across the 8-stage launch process for [Creator's] brand."

**Investment Allocation Breakdown (table format):**

| Category | % Allocation | Purpose & Rationale |
|----------|--------------|---------------------|
| **Product Development** | 25-30% | Prototyping, sourcing, manufacturing setup, quality control, regulatory compliance. [Higher % for complex products like beauty/food, lower for digital/simple products] |
| **Brand & Creative** | 15-20% | Visual identity, packaging design, photography, videography, brand guidelines, content production. [Higher % for visually-driven brands like fashion/beauty] |
| **Technology Infrastructure** | 10-15% | E-commerce platform, CRM, analytics, email marketing, automation tools, customer service systems. [Higher % for tech-heavy businesses like digital products/subscriptions] |
| **Marketing & Launch** | 20-25% | Paid acquisition, influencer seeding, content creation, PR, launch campaign execution. [Higher % for crowded categories requiring aggressive customer acquisition] |
| **Operations & Fulfillment** | 10-15% | Inventory systems, warehousing setup, 3PL partnerships, returns management, customer service. [Higher % for physical products with complex logistics] |
| **Legal & Administrative** | 5-8% | Entity formation, contracts, IP protection, financial systems, compliance, insurance. [Consistent across all businesses] |
| **Contingency & Optimization** | 5-10% | Buffer for unforeseen challenges, post-launch optimization, rapid response to market feedback. [Higher % for new/unproven product categories] |
| **TOTAL** | **100%** | |

**Allocation Rationale by Category (2-3 paragraphs total):**

Explain why specific categories receive higher/lower allocation for this creator:

"For [Creator's] [Industry/Niche] brand, we recommend allocating XX-XX% to Product Development due to [reason: complex formulation, custom manufacturing, regulatory requirements, etc.]. This ensures [specific outcome: quality control, compliance, differentiation]."

"Marketing & Launch receives XX-XX% allocation to support [specific strategy: paid acquisition in competitive category, influencer partnerships, content production]. This investment targets [goal: achieving $XX,XXX in Year 1 revenue, building XX,XXX email subscribers, etc.]."

"Technology Infrastructure is allocated XX-XX% to enable [specific capability: subscription management, complex product customization, omnichannel commerce]. This foundational investment ensures scalability as the brand grows."

**Scaling Investment with Business Growth:**

| Investment Tier | Product Complexity | Go-to-Market Intensity | Recommended Allocation |
|-----------------|-------------------|------------------------|------------------------|
| **$100K-$150K** | Simple (1-2 SKUs, proven supply chain) | Organic-focused (existing audience) | Lower product %, higher creative % |
| **$150K-$200K** | Moderate (3-5 SKUs, custom formulation) | Balanced (organic + paid) | Balanced allocation per table above |
| **$200K-$250K** | Complex (5+ SKUs, new category creation) | Aggressive (paid-heavy, wholesale) | Higher product + marketing % |

**Return on Investment (ROI) Projection:**

"Based on financial projections in Section 5, Wavelaunch's investment of $[range] is projected to generate Year 1 revenue of $XXX,XXX-$XXX,XXX, representing a X-X× return. By Year 3, cumulative revenue of $X.X-X.XM creates enterprise value of $X.X-X.XM (at X-X× revenue multiple), demonstrating [XX-XX]× ROI on initial capital deployment."

**Wavelaunch Partnership Value Beyond Capital:**

(1 paragraph emphasizing operational capacity, not just money)

"Beyond financial investment, Wavelaunch provides approximately $XXX,XXX in management capacity and execution resources annually, including dedicated Operations Manager, Supply Chain Specialist, Marketing Coordinator, and Financial Controller. This 'deployed capacity' model ensures [Creator] focuses on creative direction and content while Wavelaunch handles end-to-end operational execution."

**DELIVERABLE FORMAT:**
- 1-2 pages
- Allocation table showing percentages totaling 100%
- Clear rationale tied to creator's specific product/industry
- Scaling guidance based on investment tier
- ROI projection connecting to financial model

**OUTPUT:** 1-2 pages

---

## 13. EXECUTIVE_SUMMARY

**TASK:** Generate the Executive Summary section for Section 1 of the business plan (written LAST, after all research complete).

**PURPOSE:** Synthesize all completed research into a compelling 1-2 page overview that demonstrates the strategic opportunity and Wavelaunch's value.

**INPUTS:**
- All completed sections (Batches 1-4)
- Four Pillars Evaluation
- Investment Allocation
- Vision Form data

**DELIVERABLE STRUCTURE:**

**Opening Hook (1-2 paragraphs):**
Begin with a compelling statement about the creator's unique opportunity:

"[Creator Name] has built a [size] community of [Target Audience description] through [Current Channels], establishing authentic trust and engagement in the [Industry/Niche] space. With [specific differentiator from Vision Form], [Creator] is positioned to capture a significant share of the $XXB [market] by launching [product category] that solves [key pain point]."

**Market Opportunity (1 paragraph):**
Synthesize market sizing from Batch 1:

"The market opportunity is substantial: [Industry] represents a $XXB TAM, with [specific segment] accounting for $XXB SAM. Based on [Creator's] audience of [X followers] across [channels] and realistic conversion assumptions, the SOM projects $XXX,XXX-$XXX,XXX in Year 1 revenue, scaling to $X.X-X.XM by Year 3."

**Core Business Model (1 paragraph):**
Summarize product strategy and revenue model from Batch 3:

"The business model centers on [hero product] launching in Month 1-3, followed by [complementary products] in Months 6-12. With unit economics of [XX% gross margin] and [CAC, LTV metrics], the brand achieves profitability by [Quarter/Year]. Revenue streams include [primary, secondary, tertiary streams]."

**Strategic Differentiation (1 paragraph):**
Highlight competitive positioning from Batches 1-2:

"Unlike competitors who [competitor approach], [Creator's] brand differentiates through [Unique Value Props + Differentiation from Vision Form]. This positioning addresses the market gap of [specific underserved need], validated by [evidence from competitive analysis]."

**Go-to-Market Strategy (1 paragraph):**
Summarize launch approach from Batch 4:

"The 90-day launch strategy leverages [Creator's] existing channels ([Current Channels with follower counts]) to generate [X,XXX] waitlist sign-ups pre-launch. With a marketing budget of $XX,XXX allocated to [key channels], projections indicate $XX-XXK in launch month revenue and [X% conversion rate] from engaged audience."

**Wavelaunch Partnership Rationale (1 paragraph):**
Explain why Wavelaunch investment is critical:

"Wavelaunch Studio's investment of $100K-$250K and operational partnership enables [Creator] to execute a professional brand launch without operational bottlenecks. Our deployed capacity model provides [specific capabilities: supply chain, tech, fulfillment] while [Creator] focuses on [creative direction, content creation, community engagement]. This partnership de-risks execution and accelerates time-to-market by [X months]."

**Key Success Metrics (bullet points or table):**

| Metric | Year 1 Target | Year 3 Target |
|--------|---------------|---------------|
| Revenue | $XXX,XXX-$XXX,XXX | $X.X-X.XM |
| Customers | X,XXX-X,XXX | XX,XXX-XX,XXX |
| Gross Margin | XX% | XX% |
| CAC | $XX | $XX |
| LTV | $XXX | $XXX |
| Email Subscribers | X,XXX | XX,XXX |

**Critical Milestones (bullet points):**
- **Month 1-3:** Product launch, achieve $XX-XXK revenue
- **Month 6:** Launch Product #2, reach X,XXX total customers
- **Month 12:** Achieve $XXX-XXXK annual revenue, achieve profitability
- **Year 2:** Expand to [new channel/category], reach $XXX,XXX-X.XM revenue
- **Year 3:** Establish category leadership, position for exit or continued growth

**Four Pillars Summary (1 paragraph):**
Reference evaluation from Batch 5:

"Based on Wavelaunch's Four Pillars evaluation, [Creator] demonstrates [strong/promising] readiness across Audience Integrity ([rating]), Category Fit ([rating]), Founder Mindset ([rating]), and Operational Scalability ([rating]). Particular strengths include [top 2 pillars], positioning [Creator] as a compelling candidate for the D26 Cohort."

**Next Steps / Call to Action (1 paragraph):**
Clear path forward:

"Upon acceptance into the D26 Cohort and payment of the $5,000 commitment fee, [Creator] and Wavelaunch will enter a 1-week Discovery Phase to finalize the Brand Blueprint. The 8-stage launch process begins immediately thereafter, with product launch targeted for [Month/Quarter]. This partnership positions [Creator] to build a [7/8/9]-figure independent brand while retaining 90% ownership and focusing on [what creator loves: content, community, creative direction]."

**TONE & STYLE:**
- Confident but realistic (not hyperbolic)
- Data-driven (include specific numbers from research)
- Strategic (demonstrate thoughtfulness, not just enthusiasm)
- Consultative (McKinsey/BCG presenting opportunity to client)

**DELIVERABLE FORMAT:**
- 1-2 pages (800-1,200 words)
- Clear headers for each subsection
- Include at least one table or visual element (metrics or milestones)
- No fluff—every sentence should contain specific information

**OUTPUT:** 1-2 pages

---

## 14. SUCCESS_METRICS

**TASK:** Generate the Success Metrics & KPIs section for Section 10 of the business plan.

**PURPOSE:** Define measurable indicators that track brand performance and guide decision-making.

**INPUTS:**
- Financial projections (Batch 3)
- Product strategy (Batch 3)
- Industry benchmarks from Industry Frameworks

**DELIVERABLE STRUCTURE:**

**Introduction (1 paragraph):**
"Success for [Creator's] brand will be measured across three categories: Primary Financial Metrics (revenue and profitability), Growth Indicators (customer acquisition and retention), and Brand Equity Measures (long-term value creation). These KPIs align with quarterly objectives and inform strategic adjustments."

**1. Primary Financial Metrics (table format)**

| Metric | Definition | Year 1 Target | Year 2 Target | Year 3 Target | Benchmark |
|--------|------------|---------------|---------------|---------------|-----------|
| **Revenue** | Total sales across all channels | $XXX-XXXK | $XXX-XXXK | $X.X-X.XM | Industry avg: $XXX-XXXK for creator brands |
| **Gross Margin %** | (Revenue - COGS) / Revenue | XX-XX% | XX-XX% | XX-XX% | Industry avg: XX-XX% for [category] |
| **Net Profit Margin %** | Net income / Revenue | (X-X)% to XX% | XX-XX% | XX-XX% | Healthy: >15% by Year 3 |
| **EBITDA** | Earnings before interest, taxes, depreciation | $XX-XXK | $XX-XXXK | $XXX-XXXK | Profitability milestone |
| **Monthly Burn Rate** | Operating expenses per month (Year 1) | $X-XXK | N/A | N/A | Goal: Breakeven by Month X |

**2. Growth Indicators (table format)**

| Metric | Definition | Year 1 Target | Year 2 Target | Year 3 Target | Benchmark |
|--------|------------|---------------|---------------|---------------|-----------|
| **CAC (Customer Acquisition Cost)** | Marketing spend / new customers | $XX-XX | $XX-XX | $XX-XX | Goal: Decrease as brand builds |
| **LTV (Lifetime Value)** | Revenue per customer over 12-24 months | $XXX-XXX | $XXX-XXX | $XXX-XXX | Target: 3-5× CAC |
| **LTV:CAC Ratio** | Lifetime value / acquisition cost | 3-5:1 | 4-6:1 | 5-8:1 | Healthy: >3:1 |
| **Payback Period** | Months to recover CAC | X-X months | X-X months | X-X months | Ideal: <6 months |
| **MoM Revenue Growth %** | Monthly growth rate | XX-XX% | XX-XX% | X-XX% | Early stage: 10-30% |
| **Customer Count** | Total unique customers acquired | X,XXX-X,XXX | XX,XXX-XX,XXX | XX,XXX-XX,XXX | Cumulative growth |
| **Repeat Purchase Rate** | % customers who buy 2+ times | XX-XX% | XX-XX% | XX-XX% | Consumables: 30-50% |
| **Email List Growth** | New subscribers per month | XXX-X,XXX | X,XXX-X,XXX | X,XXX-X,XXX | Owned audience building |

**3. Operational Excellence Metrics (table format)**

| Metric | Definition | Target | Benchmark |
|--------|------------|--------|-----------|
| **Conversion Rate** | Website visitors → purchases | X-X% | Industry avg: 1-3% |
| **Average Order Value (AOV)** | Revenue per transaction | $XX-XX | Optimize over time |
| **Cart Abandonment Rate** | % who add to cart but don't buy | <XX% | Industry avg: 60-70% |
| **Return/Refund Rate** | % orders returned or refunded | <XX% | Fashion: 20-30%, Beauty: <10% |
| **Inventory Turnover** | How often inventory sells (per year) | X-X× | Healthy: 4-6× for most categories |
| **Net Promoter Score (NPS)** | Customer satisfaction metric | >XX | >50 is good, >70 is excellent |

**4. Brand Equity Measures (qualitative + quantitative)**

| Metric | Definition | Year 1 Target | Year 2 Target | Year 3 Target |
|--------|------------|---------------|---------------|---------------|
| **Brand Awareness** | % of target audience who recognize brand | X-XX% | XX-XX% | XX-XX% |
| **Social Media Following** | Total followers across platforms | XX-XXXK | XXX-XXXK | XXX-XXXK+ |
| **Press Mentions / Features** | Media coverage earned | XX+ | XX+ | XX+ |
| **UGC (User-Generated Content)** | Customer posts featuring brand | XXX+ posts | X,XXX+ posts | X,XXX+ posts |
| **Category Leadership Indicators** | Rankings, awards, "best of" lists | N/A | Top XX in [category] | Top X in [category] |

**5. Dashboard & Reporting Cadence**

**Weekly Metrics (Operations Team monitors):**
- Daily revenue and order volume
- Website traffic and conversion rate
- Paid ad performance (ROAS, CPM, CPC)
- Customer service tickets and response time

**Monthly Review (Creator + Wavelaunch):**
- Revenue vs. target
- CAC, LTV, and margin trends
- Product performance (which SKUs selling best)
- Channel performance (which platforms driving sales)

**Quarterly Strategic Review (OKR Assessment):**
- Progress toward quarterly objectives
- Financial health (burn rate, profitability trajectory)
- Brand equity growth
- Year-end projections and adjustments

**6. Red Flags & Intervention Triggers**

| Red Flag | Trigger | Intervention |
|----------|---------|--------------|
| High CAC | CAC > $XX or LTV:CAC < 2:1 | Pause paid ads, optimize organic content |
| Low Conversion Rate | <X% for 2+ months | A/B test landing pages, improve product page |
| High Return Rate | >XX% | Investigate product quality, update descriptions |
| Inventory Issues | Stockout or >90 days unsold inventory | Adjust reorder timing, run promotions |
| Negative Cash Flow | Burn rate exceeds projections | Cut non-essential spend, focus on profitability |

**DELIVERABLE FORMAT:**
- 1-2 pages
- Multiple tables clearly organized by metric category
- Include both targets and industry benchmarks for context
- Connect metrics to strategic objectives from roadmap

**OUTPUT:** 1-2 pages

---

# FINAL COMPILATION

## 15. DOCUMENT_ASSEMBLY

**TASK:** Compile all completed sections into final PDF business plan.

**AUTOMATED PROCESS** (handled by system, not manual prompt):

**Final Document Structure:**
1. Cover Page (Creator Name, "D26 Cohort Business Plan," Date, Wavelaunch Studio branding)
2. Table of Contents (auto-generated with page numbers)
3. **Section 1:** Executive Summary (Batch 5, Stage 13)
4. **Section 2:** Four Pillars Evaluation (Batch 5, Stage 11)
5. **Section 3:** Creator Brand Assessment
   - Audience Deep Dive (Batch 2, Stage 4)
   - Brand Positioning Framework (Batch 2, Stage 5)
6. **Section 4:** Market & Competitive Analysis
   - Market Sizing / TAM-SAM-SOM (Batch 1, Stage 1)
   - Competitive Landscape (Batch 1, Stage 2)
   - Industry Trends & Dynamics (Batch 1, Stage 3)
7. **Section 5:** Product & Revenue Strategy
   - Product Architecture (Batch 3, Stage 6)
   - Financial Projections (Batch 3, Stage 7)
8. **Section 6:** Go-to-Market Strategy (Batch 4, Stage 8)
9. **Section 7:** Operational Framework (Batch 4, Stage 9)
10. **Section 8:** Implementation Roadmap (Batch 4, Stage 10)
11. **Section 9:** Investment Allocation Framework (Batch 5, Stage 12)
12. **Section 10:** Success Metrics & KPIs (Batch 5, Stage 14)

**Formatting Standards:**
- **Font:** Geist throughout (headings, body, tables)
- **Length:** 15-25 pages total
- **Headers:** Clear section headers with consistent hierarchy (H1, H2, H3)
- **Tables:** Professional formatting with borders, subtle shading for headers
- **Spacing:** Adequate white space, 1.15-1.5 line spacing
- **Visual Elements:** Tables for data, subtle dividers between sections
- **Page Numbers:** Bottom right, starting after cover page
- **Footers:** "Confidential - Wavelaunch Studio D26 Cohort"

**Quality Checks Before Export:**
- [ ] All 10 main sections present
- [ ] No placeholder text ([CREATOR], [INDUSTRY], etc.) remaining
- [ ] All Vision Form fields referenced appropriately
- [ ] Tables and data properly formatted
- [ ] Sources cited or assumptions labeled
- [ ] 15-25 page target met
- [ ] Professional tone throughout
- [ ] No redundancy between sections

**Output Format:** PDF with professional design, ready for creator review

---

## BATCH EXECUTION SUMMARY

### Batch 1: Market & Competitive Analysis
- **Stages:** Market Sizing, Competitive Intelligence, Industry Trends
- **Focus:** External market research
- **Data Sources:** web_search + training knowledge + labeled assumptions
- **Output:** 6-9 pages total

### Batch 2: Audience & Brand Strategy
- **Stages:** Audience Deep Dive, Brand Positioning
- **Focus:** Creator brand data synthesis
- **Data Sources:** Vision Form only (no external research)
- **Output:** 4-6 pages total

### Batch 3: Product & Financial Strategy
- **Stages:** Product Architecture, Financial Projections
- **Focus:** Product planning and revenue modeling
- **Data Sources:** Vision Form + industry benchmarks + frameworks
- **Output:** 4-5 pages total

### Batch 4: Go-to-Market & Operations
- **Stages:** Go-to-Market, Operational Framework, Implementation Roadmap
- **Focus:** Execution planning
- **Data Sources:** Best practices + Vision Form + previous research
- **Output:** 6-9 pages total

### Batch 5: Synthesis & Evaluation
- **Stages:** Four Pillars Evaluation, Investment Allocation, Executive Summary, Success Metrics
- **Focus:** Strategic synthesis and assessment
- **Data Sources:** All previous batches + Vision Form
- **Output:** 5-8 pages total

**TOTAL BUSINESS PLAN:** 15-25 pages (optimized for comprehensive yet concise strategic planning)
