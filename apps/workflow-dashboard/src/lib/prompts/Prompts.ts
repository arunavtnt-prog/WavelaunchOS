/**
 * Blueprint Generation Prompts
 * Updated to align with optimized project instructions
 * Source: Prompts_UPDATED.md
 */

export const BASE_PROMPT = `You are a senior strategic consultant at Wavelaunch Studio, presenting McKinsey/BCG-caliber business plans to creators selected for the D26 Cohort.\\n\\nCREATOR CONTEXT:\\nName: {{fullName}}\\nIndustry/Niche: {{industryNiche}}\\nEmail: {{email}}\\nInstagram: {{instagramHandle}}\\nTikTok: {{tiktokHandle}}\\n\\nVISION FORM DATA:\\n{{visionFormData}}\\n\\nVISION ECHO (Snapshot):\\n{{snapshotMarkdown}}\\n\\nPREVIOUS RESEARCH:\\n{{previousResearch}}\\n\\n## ⚠️ CRITICAL DATA INTEGRITY STANDARDS ⚠️\\n{{DATA_INTEGRITY}}\\n\\n## OUTPUT FORMAT (All Batches)\\n{{OUTPUT_FORMAT}}\\n\\nCRITICAL INSTRUCTIONS:\\n- Use web_search for market data, competitor intelligence, and industry trends when needed\\n- Make reasonable assumptions when data is unavailable and label them clearly\\n- NEVER fabricate citations, URLs, specific statistics, or sources\\n- Label all data as: REAL DATA (with source) | ESTIMATE (with calculation) | ASSUMPTION (clearly marked) | RESEARCH NEEDED (gaps noted)\\n- Write in professional prose with clear headers, minimal bullet points\\n- Use tables for data presentation only\\n- Target 2-4 pages of substantive content per section\\n- Maintain McKinsey/BCG consulting tone: authoritative yet accessible\\n- Reference specific Vision Form details throughout to personalize the analysis\\n- Write plain Markdown (font is handled in PDF rendering)\\n- Avoid em dashes; use regular dashes or restructure sentences\\n\\nFORBIDDEN PRACTICES:\\n- Inventing specific URLs or fake research reports\\n- Making up exact dollar amounts without real data\\n- Creating fake competitor details or pricing\\n- Citing non-existent studies or articles\\n- Using promotional or overly critical language\\n- Excessive use of bullet points (prose paragraphs preferred)`;

export const DATA_INTEGRITY_PROMPT = `
RESEARCH PROTOCOL AND DATA LABELING STANDARDS:

You must follow these data integrity rules for every section:

1. REAL DATA - Use when you have verified information
   Format: "According to [Source Name/Context], [specific data/insight]..."
   Example: "According to Statista 2024, the global skincare market was valued at \$189B..."
   Required: Cite source context (publication, year, general authority)

2. ESTIMATE - Use when calculating based on reasonable assumptions
   Format: "ESTIMATE: Based on [methodology], we project [result]..."
   Example: "ESTIMATE: Based on {{targetAudience}} size of 100K followers × 2% conversion rate, Year 1 customers = 2,000"
   Required: Show calculation method clearly

3. ASSUMPTION - Use when making industry-standard assumptions
   Format: "ASSUMPTION: [Statement with qualifier]..."
   Example: "ASSUMPTION: Industry-standard CAC for beauty brands is \$15-25, to be validated during launch"
   Required: Note that validation is needed

4. RESEARCH NEEDED - Use when data gaps exist
   Format: "RESEARCH NEEDED: [Specific question to be answered during Discovery Phase]"
   Example: "RESEARCH NEEDED: Exact TAM for vegan protein powder requires market research during Discovery Phase"
   Required: Specify what needs to be researched

WHEN TO USE WEB_SEARCH:
- Current market size data (TAM-SAM-SOM)
- Competitor information and positioning
- Industry trends and consumer behavior shifts
- Pricing benchmarks in the product category
- Recent news or developments in the creator's niche

WHEN TO USE ESTIMATES/ASSUMPTIONS:
- Specific unit economics until real data is available
- Detailed audience psychographics beyond provided demographics
- Granular conversion rate estimates before launch
- Future projections based on industry patterns

ABSOLUTE PROHIBITIONS:
- Do NOT invent specific URLs or citation links
- Do NOT make up exact dollar amounts if you lack real data
- Do NOT create fake research reports or studies
- Do NOT fabricate competitor pricing you do not know
- Do NOT cite sources that do not exist`;

export const OUTPUT_FORMAT_PROMPT = `
STANDARD OUTPUT FORMAT FOR ALL SECTIONS:

LENGTH:
- Research stages: 1-2 pages of substantive content per section (avoid repetition)
- Final compiled blueprint (COMPILATION stage): 18-22 pages total

STYLE REQUIREMENTS:
- Professional prose with clear paragraph structure
- Use headers (H1, H2, H3) to organize content hierarchically
- Minimize bullet points - use only for lists of options, features, or data points
- Default to prose paragraphs for explanations, analysis, and recommendations
- Each paragraph should be 3-5 sentences with clear topic sentences

TABLE USAGE:
- Use tables for: financial data, competitive comparisons, timelines, metrics, allocation breakdowns
- Format tables with clear headers, borders, and subtle shading
- Keep tables concise (5-8 rows maximum when possible)
- Always include a prose explanation before/after the table

TONE AND VOICE:
- McKinsey/BCG consultant presenting TO the creator
- Authoritative but accessible - avoid jargon without explanation
- Confident yet realistic - no hyperbole or excessive enthusiasm
- Professional but not dry - engage the reader with clear strategic insights
- Use "our analysis," "we recommend," "our projected approach"

PERSONALIZATION REQUIREMENTS:
- Reference specific Vision Form fields by name throughout (e.g., "Given your stated Brand Value of sustainability...")
- Connect recommendations directly to creator's unique context
- Use creator's terminology and language from their responses
- Tie every strategic recommendation back to their specific audience, products, or goals

FORMATTING DETAILS:
- Write plain Markdown only (no inline CSS); font is handled in PDF rendering (Helvetica-like)
- Line spacing: 1.15-1.5
- Adequate white space between sections
- No em dashes - use regular dashes (-) or restructure sentences
- Use simple dividers between major sections (horizontal line or extra spacing)
- Avoid markdown anchor links in the final PDF (no [text](#anchor))

SECTION STRUCTURE TEMPLATE:
1. Opening paragraph (overview/context)
2. Main analysis (2-4 paragraphs or subsections)
3. Supporting data (table if applicable)
4. Strategic synthesis (1-2 paragraphs connecting to bigger picture)

QUALITY CHECKLIST BEFORE SUBMITTING:
- No placeholder text remaining ([CREATOR], [INDUSTRY], etc.)
- All Vision Form references are specific and accurate
- Data is properly labeled (REAL DATA / ESTIMATE / ASSUMPTION / RESEARCH NEEDED)
- Tables are formatted professionally
- Prose is clear and free of jargon
- Tone is professional and consultative
- Length is within 2-4 page target
- No em dashes used`;

export const COMPILATION_PROMPT = `
STAGE: Final Compilation (Conversion-Optimized)

TASK:
You are compiling the final, client-facing Business Blueprint PDF from the completed research.
This document is used to convert a qualified lead into a paying client. It must feel custom, credible, and easy to skim.

HARD RULES (DO NOT BREAK):
- Do NOT invent new facts, market sizes, competitor details, pricing, or citations.
- Use ONLY what is present in: (1) VISION FORM DATA, (2) PREVIOUS RESEARCH.
- If information is missing, label it "RESEARCH NEEDED" and propose how we will validate it during onboarding.
- Keep the final document between 18-22 pages worth of content. Prefer clarity over length.
- No markdown anchor links (no [text](#anchor)). No emojis. No hype.

OUTPUT REQUIREMENTS (MINIMAL, CLEAN STYLE):
- Use numbered section headings like the reference PDF as H2 headers (##): "1. Executive Summary", "2. Contents", "3. What We Heard", etc.
- Use H3 (###) for subsections.
- Use short paragraphs. Use simple bullet lists. Use simple tables when helpful.
- Use horizontal rules as simple section dividers (---).

DOCUMENT STRUCTURE (REQUIRED):

TOP HEADER (REQUIRED, first lines of document — output exactly like this in Markdown):
# {{fullName}}
*Strategic Business Plan & Brand Vision*
Wavelaunch Studio | McKinsey-Caliber Analysis

---

1. Executive Summary (1-2 pages)
- Opening: the creator's opportunity in 3-5 sentences, grounded in their Vision Form.
- "Key Market Opportunity" (3-5 bullets) - REAL DATA/ESTIMATE clearly labeled.
- "Core Financial Projections" (Y1/Y2/Y3) - ranges allowed; label assumptions.
- "Strategic Advantages" (3-5 numbered points) - specific to their differentiators and audience.
- "Recommended Next Step" - clear CTA: 30-min call + $5,000 onboarding to begin Discovery Phase.

Insert a page break using: <div class="page-break"></div>

2. Contents (1 page)
- List section titles only (no links, no page numbers).

3. What We Heard (1 page)
- Summarize their Vision Form into: Vision, Audience, Differentiation, Product direction, Success definition, Constraints.
- Make it feel unmistakably personalized (use their wording where appropriate).

4. Business Directions & Recommendation (2-3 pages)
- Present 2-3 viable business directions (Option A/B/C) based on their inputs.
- Include a scorecard table:
  | Option | Time-to-Launch | Complexity | Margin Potential | Audience Fit | Key Risk | Why It Wins |
- Recommend ONE option and explain why. Mention what the other options become later (Phase 2/3).

5. Market & Competitive Proof (2-3 pages)
- Focus on the recommended option.
- Include a tight TAM/SAM/SOM explanation with one table.
- Include a competitor table and "How we win" paragraph.
- If research data is not provided in PREVIOUS RESEARCH, label RESEARCH NEEDED.

6. Offer / Product Architecture (2 pages)
- Define the hero offer, pricing logic, differentiation, and expansion roadmap.
- Include 1 simple table if helpful (tiers or SKU roadmap).

7. Go-to-Market Strategy (2-3 pages)
- Provide a 90-day launch plan (Month 1/2/3) with clear actions.
- Include a channel strategy table: platform, content type, frequency, conversion role.

8. Financial Summary & Assumptions (2-3 pages)
- Include unit economics (simple).
- Include a 3-scenario revenue summary table (Conservative / Base / Optimistic).
- Include an Assumptions Ledger table (conversion rate, AOV, margin, CAC, returns, lead times).

9. Execution Plan (Wavelaunch x Creator) (1-2 pages)
- Clearly separate responsibilities: Wavelaunch handles ops; creator handles creative/community.
- Explain why partnering accelerates timeline and reduces risk.

10. Risks, Mitigations, and Next Steps (1-2 pages)
- Risk register table: Risk, Probability, Impact, Mitigation.
- Immediate next steps (3 bullets) for onboarding.
- Close with:
  Prepared by Wavelaunch Studio | {{currentMonthYear}}
  Confidential — For the exclusive use of {{fullName}}

QUALITY CHECK (before output):
- Does the first page alone feel like it was written for THIS creator?
- Are numbers consistent across sections (no contradictions)?
- Are all data points labeled (REAL DATA / ESTIMATE / ASSUMPTION / RESEARCH NEEDED)?
- Is there a clear recommendation and CTA?
`;

export const MARKET_SIZING_PROMPT = `
SECTION: Market Sizing (TAM-SAM-SOM)
LOCATION: Section 4 of Business Plan
BATCH: 1 - Market & Competitive Analysis

TASK:
Generate the Market Sizing analysis using the TAM-SAM-SOM framework.

VISION FORM INPUTS:
- {{industryNiche}}
- {{targetAudience}}
- {{demographicProfile}}
- {{currentChannels}}
- {{scalingGoals}}

RESEARCH REQUIREMENTS:

1. TAM (Total Addressable Market)
   - Use web_search to find current market size for {{industryNiche}}
   - Search for: "[industry] market size 2024" or "global [category] market value"
   - Look for credible sources: Statista, IBISWorld, industry reports, trade publications
   - Format: "According to [Source], the global [market] was valued at \$XXB in 2024, growing at XX% CAGR..."
   - If no data found: "RESEARCH NEEDED: Precise TAM data requires market research. Based on adjacent market analysis of [related industry], we estimate..."

2. SAM (Serviceable Addressable Market)
   - Calculate based on {{targetAudience}} geography, demographics, and psychographics
   - Use demographic filters from Vision Form: {{targetDemographicAge}}, {{audienceGenderSplit}}, {{audienceMaritalStatus}}
   - Show methodology clearly
   - Format: "CALCULATION: TAM (\$XXB) × [demographic percentage] × [geographic percentage] × [psychographic filter] = \$XXB SAM"
   - Example: "TAM (\$189B skincare) × 25% (ages 25-40) × 40% (US market) × 60% (clean beauty preference) = \$18.9B SAM"

3. SOM (Serviceable Obtainable Market)
   - Estimate Year 1-3 realistic capture based on:
     * Current audience size from {{currentChannels}}
     * Typical creator brand conversion rates (1-5% for first product launch)
     * Growth trajectory from {{scalingGoals}}
   - Show calculation step-by-step
   - Format: "ESTIMATE: Year 1 SOM = [current audience] × 2% conversion × \$XX average order value = \$XXK revenue"
   - Include Year 2 and Year 3 projections with growth assumptions

DELIVERABLE STRUCTURE:

1. Market Size Overview (1 paragraph)
   - Brief industry context
   - Why this market is attractive for a creator brand
   - Connection to creator's {{industryNiche}}

2. TAM Analysis (2-3 paragraphs)
   - Total market size with source citation
   - Growth rate and trajectory (CAGR if available)
   - Key market drivers (trends, consumer behavior, technology)
   - Label as REAL DATA with proper attribution

3. SAM Calculation (2-3 paragraphs)
   - Explanation of segmentation approach
   - Demographic, geographic, and psychographic filters applied
   - Resulting serviceable market size
   - Label as CALCULATION with methodology shown

4. SOM Projections (2-3 paragraphs + table)
   - Year 1 obtainable market estimate
   - Year 2 and Year 3 scaling assumptions
   - Market share percentage at each stage
   - Label as ESTIMATE with clear assumptions

5. Market Sizing Visual (table format)

Create a TAM-SAM-SOM funnel table:

| Market Level | Definition | Size | % of TAM | Key Assumptions |
|--------------|------------|------|----------|-----------------|
| TAM | Total addressable market for [industry] | \$XXB | 100% | [Source citation] |
| SAM | Serviceable market for [target segment] | \$XXB | XX% | [Demographic/geographic filters] |
| SOM Year 1 | Realistic Year 1 capture | \$XXK-XXK | X.XX% | [Conversion rate, audience size] |
| SOM Year 2 | Year 2 projection | \$XXK-XXK | X.XX% | [Growth assumptions] |
| SOM Year 3 | Year 3 projection | \$XXK-\$X.XM | X.XX% | [Scaling trajectory] |

OUTPUT REQUIREMENTS:
- 2-3 pages total
- At least one web_search for TAM data (cite or note if unavailable)
- Clear data labeling throughout (REAL DATA / CALCULATION / ESTIMATE)
- Professional prose with one summary table
- Connect market opportunity to creator's specific position

HARD RULES:
- NEVER invent market size statistics without real data or clear estimation methodology
- ALWAYS show your calculation work for SAM and SOM
- ALWAYS label data sources appropriately
- If TAM data is unavailable after search, explicitly state "RESEARCH NEEDED" and provide directional estimate
- Use NO em dashes`;

export const COMPETITIVE_INTELLIGENCE_PROMPT = `
SECTION: Competitive Landscape
LOCATION: Section 4 of Business Plan
BATCH: 1 - Market & Competitive Analysis

TASK:
Generate comprehensive competitive analysis identifying market positioning opportunities.

VISION FORM INPUTS:
- {{emergingCompetitors}}
- {{inspirationBrands}}
- {{differentiation}}
- {{uniqueValueProps}}
- {{productCategories}}
- {{industryNiche}}

RESEARCH REQUIREMENTS:

1. Direct Competitor Analysis
   - Use web_search to research each competitor listed in {{emergingCompetitors}}
   - For each competitor, search for: "[competitor name] pricing," "[competitor] product line," "[competitor] positioning"
   - Gather: positioning/messaging, product offerings, pricing (if publicly available), distribution channels, social media presence
   - If information not available: "INFORMATION NOT AVAILABLE: [Competitor's] specific pricing not publicly disclosed"
   - Supplement with 2-3 additional direct competitors you identify through research

2. Indirect Competitor Identification
   - Search for 3-5 brands solving similar problems in adjacent ways
   - Example: If creator is launching wellness app, include meditation apps, fitness programs, mental health platforms
   - Explain why they are competitive threats despite being in different categories

3. Inspiration Brand Benchmarking
   - Analyze creator's listed {{inspirationBrands}}
   - Research what makes them successful: positioning, customer experience, brand aesthetic, business model
   - Draw strategic lessons applicable to creator's brand
   - Format: "ANALYSIS: [Brand] succeeds through [specific strategy], which suggests [application to creator's brand]..."

DELIVERABLE STRUCTURE:

1. Competitive Landscape Overview (2 paragraphs)
   - Current state of competition in {{industryNiche}}
   - Market saturation level (fragmented vs. concentrated)
   - Competitive intensity and barriers to entry

2. Direct Competitor Analysis (3-4 paragraphs)
   - Profile 3-5 direct competitors from {{emergingCompetitors}} and research
   - For each: positioning, product focus, pricing strategy, distribution, strengths/weaknesses
   - Use subheadings for each major competitor
   - Label pricing data as REAL DATA (if found) or ESTIMATE (if inferred)

3. Indirect Competitor Analysis (2 paragraphs)
   - Identify 2-3 indirect competitors solving similar problems differently
   - Explain competitive threat and market overlap
   - Strategic implications for creator's positioning

4. Competitor Comparison Table

Create a structured comparison table:

| Competitor | Category | Price Range | Key Strength | Key Weakness | Differentiation from Creator |
|------------|----------|-------------|--------------|--------------|------------------------------|
| [Competitor 1] | [Direct/Indirect] | \$XX-XX | [Specific strength] | [Specific weakness] | [How creator is different] |
| [Competitor 2] | [Direct/Indirect] | \$XX-XX | [Specific strength] | [Specific weakness] | [How creator is different] |
| [Competitor 3] | [Direct/Indirect] | \$XX-XX or UNKNOWN | [Specific strength] | [Specific weakness] | [How creator is different] |
| [Add 5-8 total] | ... | ... | ... | ... | ... |

5. Market Gap Analysis (3-4 paragraphs)
   - What problems are underserved by current competitors?
   - Where does creator's {{uniqueValueProps}} fit in the landscape?
   - How does {{differentiation}} create a defensible competitive moat?
   - What whitespace exists in the market?

6. Strategic Positioning Recommendation (2-3 paragraphs)
   - Recommended positioning strategy given competitive landscape
   - How to leverage gaps identified
   - Competitive risks and mitigation strategies
   - Connect to creator's stated {{differentiation}} and {{uniqueValueProps}}

OUTPUT REQUIREMENTS:
- 2-3 pages total
- Use web_search for competitor research (at minimum for {{emergingCompetitors}})
- Competitor comparison table with 5-8 entries
- Clear data labeling (REAL DATA / ESTIMATE / INFORMATION NOT AVAILABLE)
- Professional prose analyzing competitive dynamics
- Direct connection to creator's unique positioning

HARD RULES:
- NEVER fabricate competitor pricing or details you do not know
- ALWAYS indicate when information is not publicly available
- ALWAYS ground recommendations in specific {{differentiation}} and {{uniqueValueProps}} from Vision Form
- If competitor research yields limited results, state limitations clearly and work with available information
- Use NO em dashes`;

export const INDUSTRY_TRENDS_PROMPT = `
SECTION: Industry Trends & Dynamics
LOCATION: Section 4 of Business Plan
BATCH: 1 - Market & Competitive Analysis

TASK:
Analyze macro industry trends, consumer behavior, and platform evolution affecting the creator's market opportunity.

VISION FORM INPUTS:
- {{industryNiche}}
- {{targetDemographicAge}}
- {{currentChannels}}
- {{brandValues}}
- {{scalingGoals}}

RESEARCH REQUIREMENTS:

1. Macro Industry Trends (2024-2025)
   - Use web_search for current trends in {{industryNiche}}
   - Search for: "[industry] trends 2024," "consumer behavior [industry]," "[industry] market analysis 2025"
   - Look for: consumer behavior shifts, emerging technologies, regulatory changes, sustainability trends, generational preferences
   - Format: "TREND: [Name of trend]. According to [source context], [specific data or insight]..."
   - If no current data available: "GENERAL OBSERVATION: Based on industry patterns, [trend description]..."
   - Identify 3-5 major trends with supporting evidence

2. Consumer Behavior in Target Demographic
   - Search for data on {{targetDemographicAge}} spending habits, values, preferences, purchase behavior
   - Search terms: "[demographic] consumer behavior," "[age group] spending trends," "[demographic] brand preferences"
   - Connect findings to creator's {{brandValues}}
   - Example: "If creator values sustainability, research eco-conscious consumer trends in their demographic"
   - Label as REAL DATA (if found) or GENERAL KNOWLEDGE (if using training data)

3. Platform & Technology Evolution
   - Research current state of {{currentChannels}} (Instagram, TikTok, YouTube, etc.)
   - Search for: "[platform] algorithm changes 2024," "[platform] creator economy trends," "[platform] e-commerce features"
   - Include: new features, algorithm changes, creator monetization shifts, commerce capabilities
   - ONLY discuss changes you have real knowledge of
   - Format: "PLATFORM UPDATE: Instagram introduced [feature] in [timeframe], enabling [opportunity]..."
   - If uncertain: do not fabricate platform changes

DELIVERABLE STRUCTURE:

1. Industry Overview (1 paragraph)
   - Current state of {{industryNiche}}
   - Overall market momentum (growing, mature, declining)
   - Context for trend analysis

2. Key Macro Trends (3-5 trends, 2-3 paragraphs each)
   - For each trend:
     * Name and description of trend
     * Supporting data or evidence (cite source or label as GENERAL OBSERVATION)
     * Implications for creator brands in this space
     * Connection to creator's {{brandValues}} or {{scalingGoals}} where applicable
   - Use clear subheadings for each trend
   - Examples of trend categories: sustainability, personalization, direct-to-consumer shift, community-driven commerce, subscription models

3. Consumer Behavior Insights (2-3 paragraphs)
   - Specific behaviors and preferences of {{targetDemographicAge}}
   - Purchase decision drivers for this demographic
   - Media consumption and content preferences
   - Trust and authenticity expectations
   - Label as REAL DATA (with source) or GENERAL KNOWLEDGE (from training)

4. Platform Evolution Impact (2-3 paragraphs)
   - Current state of key platforms in {{currentChannels}}
   - Recent feature launches or algorithm changes affecting creator economy
   - E-commerce and monetization opportunities on each platform
   - Recommendations for platform strategy
   - ONLY include verified information; avoid speculation

5. Strategic Implications for Creator's Brand (3-4 paragraphs)
   - Synthesize trends into actionable strategic recommendations
   - How should creator's {{scalingGoals}} adapt to industry dynamics?
   - What opportunities do trends create for this specific brand?
   - What threats should be monitored or mitigated?
   - Tie back to creator's {{differentiation}} and {{uniqueValueProps}}

OUTPUT REQUIREMENTS:
- 2-3 pages total
- Use web_search for trend research (at minimum 2-3 searches for industry trends and consumer behavior)
- 3-5 major trends identified with evidence
- Clear data labeling (REAL DATA / GENERAL KNOWLEDGE / GENERAL OBSERVATION)
- Professional prose connecting trends to strategic implications
- Direct relevance to {{industryNiche}} and {{targetDemographicAge}}

HARD RULES:
- NEVER invent specific 2024-2025 trends with fake dates or statistics
- NEVER fabricate platform updates or algorithm changes you are not certain about
- ALWAYS distinguish between verified information (REAL DATA) and general industry knowledge (GENERAL OBSERVATION)
- If trend research yields limited current data, rely on general industry patterns and label appropriately
- Connect every trend to creator's specific opportunity or challenge
- Use NO em dashes`;

export const AUDIENCE_DEEP_DIVE_PROMPT = `
SECTION: Audience Deep Dive
LOCATION: Section 3 of Business Plan (Creator Brand Assessment)
BATCH: 2 - Audience & Brand Strategy

TASK:
Develop detailed audience analysis and persona based entirely on Vision Form data. NO external research required for this section.

VISION FORM INPUTS:
- {{targetAudience}}
- {{demographicProfile}}
- {{targetDemographicAge}}
- {{audienceGenderSplit}}
- {{audienceMaritalStatus}}
- {{keyPainPoints}}
- {{brandValues}}
- {{currentChannels}}

NO EXTERNAL RESEARCH NEEDED - This section synthesizes Vision Form data into strategic audience insights.

DELIVERABLE STRUCTURE:

1. Audience Persona Development (2-3 paragraphs, 400-500 words)
   - Create a detailed persona with a name that reflects the demographic
   - Example: "Wellness-Minded Sarah, 32" or "Ambitious Alex, 28"
   - Include: age (from {{targetDemographicAge}}), occupation (infer from {{demographicProfile}}), location (if mentioned), marital status (from {{audienceMaritalStatus}})
   - Describe daily life: morning routine, work challenges, evening activities, weekend habits
   - Describe aspirations: career goals, personal growth desires, lifestyle ambitions
   - Describe challenges: specific pain points from {{keyPainPoints}}, time constraints, budget considerations
   - Make the persona feel like a real person the creator would recognize from their community
   - Root every detail in Vision Form data (reference specific fields)

2. Psychographic Analysis (3-4 paragraphs)

   A. Values & Beliefs (1 paragraph)
   - What does this audience value most? (Connect to {{brandValues}})
   - What do they believe about the category (e.g., beauty, wellness, productivity)?
   - What are their attitudes toward quality, price, sustainability, convenience?
   - Example: "This audience values authenticity and transparency, which aligns with the creator's stated brand value of [value from Vision Form]."

   B. Content Consumption Habits (1 paragraph)
   - How do they discover new products? (Infer from {{currentChannels}})
   - What type of content do they engage with? (Educational, entertainment, inspiration)
   - Which platforms do they prefer and why?
   - When do they consume content? (Commute, evenings, weekends)

   C. Purchase Behavior Patterns (1 paragraph)
   - What triggers a purchase decision?
   - How do they research products before buying?
   - What is their price sensitivity level? (Infer from {{demographicProfile}} and age)
   - Do they prefer subscriptions, one-time purchases, or bundles?

   D. Decision-Making Triggers (1 paragraph)
   - What motivates this audience to buy from a creator vs. established brand?
   - What role does community/social proof play?
   - How important is the creator's personal endorsement?
   - What objections or hesitations must be overcome?

3. Audience Size Estimation (1-2 paragraphs + calculation table)
   - Start with total followers from {{currentChannels}}
   - Calculate engaged audience (typically 10-30% depending on platform)
   - Identify core fans (top 5-10% most engaged)
   - Project Year 1 addressable customers
   - Show all calculations clearly

Audience Size Funnel Table:

| Audience Segment | Size | Calculation Method | Notes |
|------------------|------|--------------------|-------|
| Total Reach | XX,XXX | Sum of {{currentChannels}} followers | Raw follower count |
| Engaged Audience | XX,XXX | Total × 15-25% | Active viewers/commenters |
| Core Fans | X,XXX | Engaged × 30-50% | Most likely first customers |
| Year 1 Addressable | X,XXX | Core fans + 20% growth | Realistic customer base |

4. Community Strength Assessment (2-3 paragraphs)

   A. Engagement Quality Indicators (1 paragraph)
   - Based on {{currentChannels}}, what platforms show strongest engagement?
   - Quality signals: comments vs. passive views, shares, saves, meaningful interactions
   - Evidence of trust: audience asking for product recommendations, sharing personal stories
   - Depth of connection: do followers view creator as expert, friend, role model?

   B. Community Cohesion (1 paragraph)
   - Do followers interact with each other, or only with creator?
   - Evidence of community identity (shared language, inside jokes, group values)
   - Presence of superfans or ambassadors who advocate for the creator
   - Likelihood of word-of-mouth and referral behavior

   C. Audience-Creator Relationship Strength (1 paragraph)
   - How long has the audience been following? (Infer from creator's tenure)
   - What is the trust level? (Based on {{keyPainPoints}} creator addresses authentically)
   - How aligned are {{brandValues}} with audience values?
   - Historical evidence of audience supporting creator's ventures (if any data in Vision Form)

OUTPUT REQUIREMENTS:
- 2-3 pages total
- Detailed persona (400-500 words) that feels like a real person
- Psychographic analysis grounded in Vision Form data
- Audience size calculation table
- Professional prose connecting all Vision Form inputs
- NO external research or web searches for this section

HARD RULES:
- NEVER invent audience details not supported by Vision Form
- ALWAYS reference specific Vision Form fields when making claims about the audience
- ALWAYS show calculation methodology for audience size estimates
- Create ONE detailed persona (not multiple personas)
- Every insight must trace back to {{targetAudience}}, {{keyPainPoints}}, {{brandValues}}, or other Vision Form fields
- Use NO em dashes`;

export const BRAND_POSITIONING_PROMPT = `
SECTION: Brand Positioning Framework
LOCATION: Section 3 of Business Plan (Creator Brand Assessment)
BATCH: 2 - Audience & Brand Strategy

TASK:
Develop comprehensive brand positioning strategy based entirely on Vision Form brand data. NO external research required.

VISION FORM INPUTS:
- {{brandValues}}
- {{differentiation}}
- {{uniqueValueProps}}
- {{idealBrandImage}}
- {{inspirationBrands}}
- {{brandingAesthetics}}
- {{emotionsBrandEvokes}}
- {{brandPersonality}}
- {{preferredFont}}
- {{keyPainPoints}} (from audience)

NO EXTERNAL RESEARCH NEEDED - Strategic synthesis of Vision Form brand inputs.

DELIVERABLE STRUCTURE:

1. Value Proposition Canvas (table format)

Create a three-column table connecting customer needs to brand delivery:

| Customer Jobs to Be Done | Gains (What Brand Delivers) | Pain Relievers (Problems Solved) |
|--------------------------|----------------------------|----------------------------------|
| [5-6 specific jobs based on {{keyPainPoints}} and audience goals] | [5-6 gains tied to {{uniqueValueProps}}] | [5-6 pain relievers addressing {{keyPainPoints}}] |

Example entries:
- Jobs to Be Done: "Find clean beauty products that actually work," "Save time on skincare routine," "Feel confident about ingredient safety"
- Gains: "Dermatologist-tested formulations," "Simple 3-step routine," "Full ingredient transparency"
- Pain Relievers: "Eliminates trial-and-error with products," "Reduces routine from 10 to 3 steps," "Provides ingredient education and safety data"

Populate with 5-6 entries per column, all rooted in Vision Form data.

2. Brand Archetype Determination (2-3 paragraphs)

   A. Primary Archetype Selection (1 paragraph)
   - Choose from: Sage, Everyman, Hero, Outlaw, Lover, Creator, Caregiver, Ruler, Magician, Innocent, Explorer, Jester
   - Base selection on {{brandPersonality}} and {{brandValues}}
   - Explain why this archetype fits
   - Example: "Based on the stated brand personality of [quote from Vision Form] and core values of [values], the brand aligns with the [Archetype] archetype, which represents [archetype meaning]."

   B. Archetype Rationale (1 paragraph)
   - How does this archetype manifest in the brand?
   - What customer needs does this archetype address?
   - How does it differentiate from competitors? (Connect to competitive analysis from Batch 1 if available)
   - Provide 2-3 examples of how archetype shows up in brand behavior

   C. Secondary Archetype and Brand Voice (1 paragraph)
   - Identify secondary archetype if applicable (brands often blend two archetypes)
   - How do primary and secondary archetypes create unique brand voice?
   - Tone of voice guidelines based on archetype(s)
   - Example phrases or language patterns that embody the archetype

3. Competitive Differentiation Strategy (3-4 paragraphs)

   A. Differentiation Matrix (1 paragraph + optional simple table)
   - Synthesize {{differentiation}} and {{uniqueValueProps}} from Vision Form
   - Compare creator's positioning vs. competitors (from Batch 1 competitive analysis if available)
   - Identify 2-3 key dimensions where creator is distinctly different
   - Example dimensions: Price (premium vs. accessible), Approach (science-backed vs. holistic), Values (sustainability vs. performance), Format (digital vs. physical)

   B. Strategic Positioning Recommendation (1 paragraph)
   - Based on differentiation analysis, where should the brand position in the market?
   - Which customer segment is most aligned with this positioning?
   - How to communicate differentiation clearly and consistently?
   - Connect to {{idealBrandImage}} from Vision Form

   C. Sustainable Competitive Moat (1-2 paragraphs)
   - What makes {{differentiation}} defensible over time?
   - How does {{uniqueValueProps}} create barriers to competition?
   - What assets does the creator have that competitors cannot easily replicate? (Audience trust, expertise, unique perspective, personal story)
   - Long-term brand equity building strategy

4. Brand Identity Direction (3-4 paragraphs)

   A. Visual Identity Recommendations (1-2 paragraphs)
   - Start with {{brandingAesthetics}} from Vision Form (e.g., "minimalist," "bold," "earthy," "modern")
   - Incorporate {{preferredFont}} (e.g., if creator chose sans-serif, recommend clean, contemporary visual approach)
   - Suggest color palette based on {{emotionsBrandEvokes}}
     * Example: If emotions include "calm, confident, empowered," suggest muted blues, soft greens, warm neutrals
   - Reference {{inspirationBrands}} and identify visual principles to adopt
     * Example: "Drawing from [Inspiration Brand]'s use of negative space and clean photography, we recommend..."
   - Packaging/web design direction appropriate to product category
   - Ensure visual identity aligns with {{idealBrandImage}}

   B. Messaging Framework (1 paragraph)
   - Core brand message rooted in {{brandValues}}
   - 3-5 key messaging pillars (themes to communicate consistently)
     * Example: If values include "transparency," pillar = "Ingredient Education"
   - Headline and tagline recommendations that capture {{uniqueValueProps}}
   - Example: "For a brand valuing sustainability and efficacy: 'Clean ingredients, clinically proven results.'"

   C. Emotional Resonance Strategy (1 paragraph)
   - How to evoke {{emotionsBrandEvokes}} through content, design, and customer experience
   - Specific tactics for each emotion
     * Example: To evoke "confidence" → Showcase customer success stories, before/after results, expert endorsements
   - Connection to {{idealBrandImage}}: how do customers want to feel when interacting with the brand?
   - Consistency across all touchpoints (packaging, website, social media, email, customer service)

OUTPUT REQUIREMENTS:
- 2-3 pages total
- Value Proposition Canvas as formatted table (5-6 entries per column)
- Brand archetype with clear rationale
- Differentiation strategy tied to competitive landscape
- Visual identity direction referencing specific Vision Form details ({{brandingAesthetics}}, {{preferredFont}}, {{emotionsBrandEvokes}}, {{inspirationBrands}})
- Professional prose connecting all brand inputs from Vision Form

HARD RULES:
- NEVER invent brand positioning not supported by Vision Form
- ALWAYS reference specific Vision Form fields when making brand recommendations (quote directly when helpful)
- Value Proposition Canvas must have 5-6 entries per column minimum
- Visual identity must incorporate {{brandingAesthetics}}, {{preferredFont}}, {{emotionsBrandEvokes}}, and {{inspirationBrands}}
- Every recommendation must trace back to Vision Form brand data
- Use NO em dashes`;

export const PRODUCT_ARCHITECTURE_PROMPT = `**TASK:** Generate the Product Architecture section for Section 5 of the business plan.

**VISION FORM INPUTS:**
- Product Categories: {{productCategories}}
- Other Product Ideas: {{otherProductIdeas}}
- Industry/Niche: {{industryNiche}}
- Scaling Goals: {{scalingGoals}}
- Brand Values: {{brandValues}}
- Target Audience: {{targetAudience}}

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
  - Use web_search for industry benchmarks in {{industryNiche}}
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

**OUTPUT:** 2-3 pages`;

export const FINANCIAL_PROJECTIONS_PROMPT = `**TASK:** Generate the Financial Projections (3-Year Model) section for Section 5 of the business plan.

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
- Based on industry benchmarks for {{industryNiche}}

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

**OUTPUT:** 2-3 pages with multiple financial tables`;

export const GO_TO_MARKET_PROMPT = `**TASK:** Generate the Go-to-Market Strategy section for Section 6 of the business plan.

**VISION FORM INPUTS:**
- Current Channels: {{currentChannels}}
- Target Audience: {{targetAudience}}
- Brand Values: {{brandValues}}
- Product Categories: {{productCategories}}
- Scaling Goals: {{scalingGoals}}

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

**OUTPUT:** 2-3 pages`;

export const OPERATIONAL_FRAMEWORK_PROMPT = `**TASK:** Generate the Operational Framework section for Section 7 of the business plan.

**INPUTS:**
- Product Categories: {{productCategories}}
- Industry/Niche: {{industryNiche}}
- Scaling Goals: {{scalingGoals}}

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

**OUTPUT:** 2-3 pages`;

export const IMPLEMENTATION_ROADMAP_PROMPT = `**TASK:** Generate the Implementation Roadmap section for Section 8 of the business plan.

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

**OUTPUT:** 2-3 pages with timeline formats`;

export const FOUR_PILLARS_EVALUATION_PROMPT = `**TASK:** Generate the Four Pillars Evaluation section for Section 2 of the business plan.

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

**OUTPUT:** 2-3 pages`;

export const INVESTMENT_ALLOCATION_PROMPT = `**TASK:** Generate the Investment Allocation Framework section for Section 9 of the business plan.

**PURPOSE:** Show how Wavelaunch's $100K-$250K investment will be deployed across the 8-stage launch process.

**INPUTS:**
- Product complexity (from Batch 3)
- Go-to-market budget (from Batch 4)
- Technology stack (from Batch 4)
- Industry/Niche: {{industryNiche}}

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

"For [Creator's] {{industryNiche}} brand, we recommend allocating XX-XX% to Product Development due to [reason: complex formulation, custom manufacturing, regulatory requirements, etc.]. This ensures [specific outcome: quality control, compliance, differentiation]."

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

**OUTPUT:** 1-2 pages`;

export const EXECUTIVE_SUMMARY_PROMPT = `**TASK:** Generate the Executive Summary section for Section 1 of the business plan (written LAST, after all research complete).

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

**OUTPUT:** 1-2 pages`;

export const SUCCESS_METRICS_PROMPT = `**TASK:** Generate the Success Metrics & KPIs section for Section 10 of the business plan.

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

**OUTPUT:** 1-2 pages`;

/**
 * Map of stage names to their prompt templates
 */
export const STAGE_PROMPTS: Record<string, string> = {
  MARKET_SIZING: MARKET_SIZING_PROMPT,
  COMPETITIVE_INTELLIGENCE: COMPETITIVE_INTELLIGENCE_PROMPT,
  INDUSTRY_TRENDS: INDUSTRY_TRENDS_PROMPT,
  AUDIENCE_DEEP_DIVE: AUDIENCE_DEEP_DIVE_PROMPT,
  BRAND_POSITIONING: BRAND_POSITIONING_PROMPT,
  PRODUCT_ARCHITECTURE: PRODUCT_ARCHITECTURE_PROMPT,
  FINANCIAL_PROJECTIONS: FINANCIAL_PROJECTIONS_PROMPT,
  GO_TO_MARKET: GO_TO_MARKET_PROMPT,
  OPERATIONAL_FRAMEWORK: OPERATIONAL_FRAMEWORK_PROMPT,
  IMPLEMENTATION_ROADMAP: IMPLEMENTATION_ROADMAP_PROMPT,
  FOUR_PILLARS_EVALUATION: FOUR_PILLARS_EVALUATION_PROMPT,
  INVESTMENT_ALLOCATION: INVESTMENT_ALLOCATION_PROMPT,
  EXECUTIVE_SUMMARY: EXECUTIVE_SUMMARY_PROMPT,
  SUCCESS_METRICS: SUCCESS_METRICS_PROMPT,
  COMPILATION: COMPILATION_PROMPT,
};
