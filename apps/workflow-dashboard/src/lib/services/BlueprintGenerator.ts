import type { BlueprintStage, Application } from '@prisma/client';
import {
  BASE_PROMPT,
  DATA_INTEGRITY_PROMPT,
  OUTPUT_FORMAT_PROMPT,
  STAGE_PROMPTS,
  EXECUTIVE_SUMMARY_PROMPT,
} from '../prompts/Prompts';
import { generateText } from '@/lib/ai/client';

export interface BlueprintGeneratorOptions {
  apiUrl?: string; // Local proxy URL, e.g., http://localhost:3003
  tavilyApiKey?: string;
}

export interface GenerateStageOptions {
  stage: BlueprintStage;
  application: Application;
  snapshotMarkdown: string;
  previousResearch?: Array<{ stage: BlueprintStage; markdown: string }>;
}

export interface GenerateStageResult {
  success: boolean;
  prompt?: string;
  response?: string;
  markdown?: string;
  metadata?: any;
  sources?: Array<{
    type: string;
    url: string;
    title: string;
    citation: string;
  }>;
  error?: string;
  tokensUsed?: number;
}

export interface GenerateExecutiveSummaryOptions {
  application: Application;
  researchStages: Array<{
    stage: BlueprintStage;
    markdown: string;
  }>;
}

export interface GenerateExecutiveSummaryResult {
  success: boolean;
  markdown?: string;
  response?: string;
  error?: string;
}

/**
 * Generates individual Blueprint stages using local AI proxy server
 */
export class BlueprintGenerator {
  private tavilyApiKey?: string;

  constructor(options: BlueprintGeneratorOptions = {}) {
    this.tavilyApiKey = options.tavilyApiKey;
  }

  /**
   * Generate a specific stage
   */
  async generateStage(options: GenerateStageOptions): Promise<GenerateStageResult> {
    const { stage, application, snapshotMarkdown, previousResearch = [] } = options;

    // Validate critical inputs
    if (!snapshotMarkdown || snapshotMarkdown.trim().length < 100) {
      return {
        success: false,
        error: `Snapshot markdown is missing or too short (${snapshotMarkdown?.length || 0} chars). Cannot generate stage ${stage}. Please ensure the application has a completed snapshot.`,
      };
    }

    // Build the prompt for this stage
    const prompt = this.buildPrompt(stage, application, snapshotMarkdown, previousResearch);

    console.log(`[BlueprintGenerator] Generating stage: ${stage} for application: ${application.id}`);
    console.log(`[BlueprintGenerator] Prompt length: ${prompt.length} chars`);
    console.log(`[BlueprintGenerator] Snapshot length: ${snapshotMarkdown.length} chars`);
    console.log(`[BlueprintGenerator] Previous research items: ${previousResearch.length}`);

    try {
      const result = await generateText({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 8192,
        temperature: 0.7,
        model: 'glm-4.7',
      });
      const responseText = result.text;

      console.log(`[BlueprintGenerator] AI response received for stage: ${stage}`);
      console.log(`[BlueprintGenerator] Response length: ${responseText.length} chars`);
      console.log(`[BlueprintGenerator] Tokens used: ${result.usage?.inputTokens || 0} in, ${result.usage?.outputTokens || 0} out`);

      // Extract markdown from response
      const markdown = this.extractMarkdown(responseText);

      // Validate that we got meaningful content (not empty or just whitespace)
      const trimmedMarkdown = markdown.trim();
      if (!trimmedMarkdown || trimmedMarkdown.length < 50) {
        console.error(`Stage ${stage} generation returned empty or insufficient content. Response length: ${responseText.length}, Markdown length: ${trimmedMarkdown.length}`);
        return {
          success: false,
          error: `Generated content is too short or empty (${trimmedMarkdown.length} chars). AI may have returned an incomplete response. Response preview: ${responseText.substring(0, 200)}...`,
          prompt,
          response: responseText,
      };
      }

      console.log(`[BlueprintGenerator] Stage ${stage} generated successfully. Markdown length: ${trimmedMarkdown.length} chars`);

      // Build metadata (no fake sources)
      const metadata = {
        stage,
        model: result.model || 'glm-4.7',
        tokensUsed: (result.usage?.inputTokens || 0) + (result.usage?.outputTokens || 0),
        // Don't extract sources to avoid fake citations
        sources: [],
      };

      return {
        success: true,
        prompt,
        response: responseText,
        markdown: trimmedMarkdown,
        metadata,
        tokensUsed: metadata.tokensUsed,
      };
    } catch (error) {
      console.error(`Failed to generate stage ${stage}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate stage',
      };
    }
  }

  /**
   * Generate Executive Summary (synthesizes all stages)
   */
  async generateExecutiveSummary(
    options: GenerateExecutiveSummaryOptions
  ): Promise<GenerateExecutiveSummaryResult> {
    const { application, researchStages } = options;

    // Combine all research into context
    const allContent = researchStages.map((s) => `## ${s.stage}\n\n${s.markdown}`).join('\n\n---\n\n');

    // Use the new Executive Summary prompt
    const prompt = EXECUTIVE_SUMMARY_PROMPT
      .replace(/\{\{fullName\}\}/g, application.fullName || 'N/A')
      .replace(/\{\{industryNiche\}\}/g, application.industryNiche || 'N/A')
      .replace(/\{\{email\}\}/g, application.email || 'N/A')
      .replace(/\{\{targetAudience\}\}/g, application.targetAudience || 'Not specified')
      .replace(/\{\{currentChannels\}\}/g, application.currentChannels || 'Not specified')
      .replace(/\{\{keyPainPoints\}\}/g, application.keyPainPoints || 'Not specified')
      .replace(/\{\{brandValues\}\}/g, application.brandValues || 'Not specified')
      .replace(/\{\{productCategories\}\}/g, application.productCategories || 'Not specified')
      .replace(/\{\{scalingGoals\}\}/g, application.scalingGoals || 'Not specified')
      .replace(/\{\{differentiation\}\}/g, application.differentiation || 'Not specified')
      .replace(/\{\{uniqueValueProps\}\}/g, application.uniqueValueProps || 'Not specified')
      .replace('**INPUTS:**\n- All completed sections (Batches 1-4)\n- Four Pillars Evaluation\n- Investment Allocation\n- Vision Form data\n\n', '')
      .replace('**DELIVERABLE STRUCTURE:**\n\n', '')
      .replace(/\[All completed sections \(Batches 1-4\)\]/g, allContent);

    try {
      const result = await generateText({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 4096,
        temperature: 0.6,
        model: 'glm-4.7',
      });
      const responseText = result.text;

      // Extract and validate markdown
      const markdown = this.extractMarkdown(responseText);
      const trimmedMarkdown = markdown.trim();

      // Validate that we got meaningful content
      if (!trimmedMarkdown || trimmedMarkdown.length < 100) {
        console.error(`Executive Summary generation returned empty or insufficient content. Markdown length: ${trimmedMarkdown.length}`);
        return {
          success: false,
          error: `Executive Summary content is too short or empty (${trimmedMarkdown.length} chars). Response preview: ${responseText.substring(0, 200)}...`,
          response: responseText,
        };
      }

      return {
        success: true,
        markdown: trimmedMarkdown,
        response: responseText,
      };
    } catch (error) {
      console.error('Failed to generate Executive Summary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate Executive Summary',
      };
    }
  }

  /**
   * Build stage-specific prompt
   */
  private buildPrompt(
    stage: BlueprintStage,
    application: Application,
    snapshotMarkdown: string,
    previousResearch: Array<{ stage: BlueprintStage; markdown: string }>
  ): string {
    const basePrompt = this.getBasePrompt(application, snapshotMarkdown, previousResearch);
    const stagePrompt = this.getStagePrompt(stage, application);

    return `${basePrompt}\n\n${stagePrompt}`;
  }

  /**
   * Get base prompt used for all stages
   */
  private getBasePrompt(
    application: Application,
    snapshotMarkdown: string,
    previousResearch: Array<{ stage: BlueprintStage; markdown: string }>
  ): string {
    // Build vision form data string
    const visionFormData = this.buildVisionFormData(application);

    // Build previous research string
    let previousResearchStr = '';
    if (previousResearch.length > 0) {
      previousResearchStr = previousResearch
        .map(prev => `## ${prev.stage}\n${prev.markdown}`)
        .join('\n\n---\n\n');
    }

    // Interpolate the base prompt template
    return BASE_PROMPT
      .replace(/\{\{fullName\}\}/g, application.fullName || 'N/A')
      .replace(/\{\{industryNiche\}\}/g, application.industryNiche || 'N/A')
      .replace(/\{\{email\}\}/g, application.email || 'N/A')
      .replace(/\{\{instagramHandle\}\}/g, application.instagramHandle || 'N/A')
      .replace(/\{\{tiktokHandle\}\}/g, application.tiktokHandle || 'N/A')
      .replace(/\{\{visionFormData\}\}/g, visionFormData)
      .replace(/\{\{previousResearch\}\}/g, previousResearchStr || 'None yet')
      .replace(/\{\{snapshotMarkdown\}\}/g, snapshotMarkdown)
      .replace(/\{\{DATA_INTEGRITY\}\}/g, DATA_INTEGRITY_PROMPT.trim())
      .replace(/\{\{OUTPUT_FORMAT\}\}/g, OUTPUT_FORMAT_PROMPT.trim());
  }

  /**
   * Build vision form data string from application
   */
  private buildVisionFormData(application: Application): string {
    return `
**TARGET AUDIENCE:**
${application.targetAudience || 'Not specified'}

**DEMOGRAPHIC PROFILE:**
${application.demographicProfile || 'Not specified'}

**KEY PAIN POINTS:**
${application.keyPainPoints || 'Not specified'}

**BRAND VALUES:**
${application.brandValues || 'Not specified'}

**PRODUCT CATEGORIES:**
${application.productCategories || 'Not specified'}

**CURRENT CHANNELS:**
${application.currentChannels || 'Not specified'}

**SCALING GOALS:**
${application.scalingGoals || 'Not specified'}

**DIFFERENTIATION:**
${application.differentiation || 'Not specified'}

**UNIQUE VALUE PROPS:**
${application.uniqueValueProps || 'Not specified'}

**INSPIRATION BRANDS:**
${application.inspirationBrands || 'Not specified'}

**EMERGING COMPETITORS:**
${application.emergingCompetitors || 'Not specified'}
`.trim();
  }

  /**
   * Get stage-specific prompt
   */
  private getStagePrompt(stage: BlueprintStage, application: Application): string {
    // Get the prompt template from STAGE_PROMPTS
    const promptTemplate = STAGE_PROMPTS[stage];

    if (!promptTemplate) {
      return `Generate content for the ${stage} stage following the project requirements.`;
    }

    // Interpolate the prompt template with application data
    return this.interpolatePrompt(promptTemplate, application);
  }

  /**
   * Interpolate prompt template with application data
   */
  private interpolatePrompt(template: string, application: Application): string {
    const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return template
      .replace(/\{\{fullName\}\}/g, application.fullName || 'N/A')
      .replace(/\{\{industryNiche\}\}/g, application.industryNiche || 'N/A')
      .replace(/\{\{email\}\}/g, application.email || 'N/A')
      .replace(/\{\{instagramHandle\}\}/g, application.instagramHandle || 'N/A')
      .replace(/\{\{tiktokHandle\}\}/g, application.tiktokHandle || 'N/A')
      .replace(/\{\{targetAudience\}\}/g, application.targetAudience || 'Not specified')
      .replace(/\{\{demographicProfile\}\}/g, application.demographicProfile || 'Not specified')
      .replace(/\{\{targetDemographicAge\}\}/g, application.targetDemographicAge || 'Not specified')
      .replace(/\{\{audienceGenderSplit\}\}/g, application.audienceGenderSplit || 'Not specified')
      .replace(/\{\{audienceMaritalStatus\}\}/g, application.audienceMaritalStatus || 'Not specified')
      .replace(/\{\{keyPainPoints\}\}/g, application.keyPainPoints || 'Not specified')
      .replace(/\{\{brandValues\}\}/g, application.brandValues || 'Not specified')
      .replace(/\{\{productCategories\}\}/g, application.productCategories || 'Not specified')
      .replace(/\{\{otherProductIdeas\}\}/g, application.otherProductIdeas || 'None')
      .replace(/\{\{currentChannels\}\}/g, application.currentChannels || 'Not specified')
      .replace(/\{\{scalingGoals\}\}/g, application.scalingGoals || 'Not specified')
      .replace(/\{\{differentiation\}\}/g, application.differentiation || 'Not specified')
      .replace(/\{\{uniqueValueProps\}\}/g, application.uniqueValueProps || 'Not specified')
      .replace(/\{\{idealBrandImage\}\}/g, application.idealBrandImage || 'Not specified')
      .replace(/\{\{inspirationBrands\}\}/g, application.inspirationBrands || 'None')
      .replace(/\{\{brandingAesthetics\}\}/g, application.brandingAesthetics || 'Not specified')
      .replace(/\{\{emotionsBrandEvokes\}\}/g, application.emotionsBrandEvokes || 'Not specified')
      .replace(/\{\{brandPersonality\}\}/g, application.brandPersonality || 'Not specified')
      .replace(/\{\{preferredFont\}\}/g, application.preferredFont || 'Not specified')
      .replace(/\{\{emergingCompetitors\}\}/g, application.emergingCompetitors || 'None listed')
      .replace(/\{\{currentMonthYear\}\}/g, currentMonthYear);
  }

  /**
   * Extract markdown from AI response
   */
  private extractMarkdown(response: string): string {
    // Remove any thinking tags if present
    let cleaned = response.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');

    // Extract content between markdown fences if present
    const markdownMatch = cleaned.match(/```markdown\n([\s\S]*?)\n```/);
    if (markdownMatch) {
      return markdownMatch[1];
    }

    // Extract content between any code fences
    const codeMatch = cleaned.match(/```\n?([\s\S]*?)\n?```/);
    if (codeMatch) {
      return codeMatch[1];
    }

    // Return cleaned response as-is
    return cleaned.trim();
  }

  /**
   * Extract sources from response
   * NOTE: Disabled to avoid saving fake/hallucinated citations
   * Re-enable when integrating real web search API (Tavily/Perplexity)
   */
  private extractSources(response: string): Array<{ url: string; title: string }> {
    // Disabled - no source extraction to prevent fake citations
    return [];

    /* Original code for when web search is integrated:
    const sources: Array<{ url: string; title: string }> = [];

    // Match [Source: URL] patterns
    const sourceRegex = /\[Source:\s*(https?:[^\]\s]+)(?:,\s*([^]]+))?\]/g;
    let match;

    while ((match = sourceRegex.exec(response)) !== null) {
      sources.push({
        url: match[1],
        title: match[2] || 'Source',
      });
    }

    return sources;
    */
  }

  /**
   * Perform web search for research (using Tavily if available)
   */
  private async webSearch(query: string): Promise<Array<{ url: string; title: string; snippet: string }>> {
    if (!this.tavilyApiKey) {
      return [];
    }

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.tavilyApiKey,
          query,
          search_depth: 'basic',
          max_results: 5,
        }),
      });

      const data = await response.json();

      if (data.results) {
        return data.results.map((r: any) => ({
          url: r.url,
          title: r.title,
          snippet: r.content,
        }));
      }

      return [];
    } catch (error) {
      console.error('Web search failed:', error);
      return [];
    }
  }
}
