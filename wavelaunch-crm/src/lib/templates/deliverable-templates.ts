/**
 * Monthly Deliverable Templates
 * 
 * Templates for the 8-month client journey from Foundation to Market Domination.
 */

import { templateEngine, DocumentTemplate, TemplateSection, TemplateVariable } from './engine'

/**
 * Month 1: Foundation Excellence Template
 */
const month1FoundationTemplate: DocumentTemplate = {
  id: 'deliverable-month-1-foundation',
  name: 'Month 1: Foundation Excellence',
  type: 'deliverable',
  version: '1.0.0',
  description: 'Foundation planning and brand identity basics',
  sections: [
    {
      id: 'foundation-overview',
      title: 'Foundation Overview',
      content: `
# Month 1: Foundation Excellence

## Welcome to Your Journey!
Welcome {{client_name}}! This month we're building the essential foundation for your {{niche}} brand.

## Month Focus Areas
- Brand identity refinement
- Target audience validation  
- Core value proposition
- Initial market research
- Legal structure setup

## Expected Outcomes
By the end of this month, you will have:
- A clear brand positioning statement
- Validated target audience profile
- Basic legal structure in place
- Market research insights
- Foundation for product development
      `.trim(),
      order: 1
    },
    {
      id: 'brand-identity',
      title: 'Brand Identity Development',
      content: `
# Brand Identity Development

## Brand Personality
Your brand personality: **{{brand_personality}}**

## Core Brand Elements
### Brand Voice
{{brand_voice_guidelines}}

### Visual Identity Guidelines
- Color Palette: {{color_palette}}
- Typography: {{typography_choices}}
- Logo Usage: {{logo_guidelines}}

### Brand Values
{% for value in brand_values %}
- **{{value.name}}**: {{value.description}}
{% endfor %}

## Competitive Positioning
Your unique position in the {{target_industry}} market:
{{competitive_positioning}}

## Brand Story
{{brand_story_framework}}
      `.trim(),
      order: 2
    },
    {
      id: 'target-audience',
      title: 'Target Audience Deep Dive',
      content: `
# Target Audience Deep Dive

## Primary Audience Profile
**Demographics:**
- Age Range: {{target_demographic_age}}
- Location: {{target_location}}
- Income Level: {{target_income}}
- Education: {{target_education}}

**Psychographics:**
- Interests: {{target_interests}}
- Values: {{target_values}}
- Lifestyle: {{target_lifestyle}}
- Pain Points: {{key_pain_points}}

## Audience Validation
{% if audience_research_complete %}
### Research Findings
{% for finding in audience_research %}
- {{finding.insight}}
{% endfor %}

### Validation Metrics
- Survey Responses: {{survey_responses}}
- Interview Count: {{interview_count}}
- Confidence Score: {{confidence_score}}%
{% endif %}

## Audience Engagement Strategy
{{engagement_strategy}}
      `.trim(),
      order: 3
    },
    {
      id: 'action-items',
      title: 'Action Items & Next Steps',
      content: `
# Action Items for Month 1

## Immediate Actions (Week 1)
{% for action in week1_actions %}
- [ ] {{action.task}} (Due: {{action.due_date}})
{% endfor %}

## Foundation Tasks (Week 2-3)
{% for action in foundation_tasks %}
- [ ] {{action.task}} (Due: {{action.due_date}})
{% endfor %}

## Legal & Admin (Week 4)
{% for action in legal_tasks %}
- [ ] {{action.task}} (Due: {{action.due_date}})
{% endfor %}

## Preparation for Month 2
{% for action in month2_prep %}
- [ ] {{action.task}} (Due: {{action.due_date}})
{% endfor %}

## Success Metrics for Month 1
{% for metric in success_metrics %}
- {{metric.name}}: {{metric.target}}
{% endfor %}
      `.trim(),
      order: 4
    }
  ],
  variables: [
    { name: 'client_name', type: 'string', required: true },
    { name: 'niche', type: 'string', required: true },
    { name: 'brand_personality', type: 'string', required: true },
    { name: 'brand_voice_guidelines', type: 'string', required: false },
    { name: 'color_palette', type: 'string', required: false },
    { name: 'typography_choices', type: 'string', required: false },
    { name: 'logo_guidelines', type: 'string', required: false },
    { name: 'brand_values', type: 'string', required: true },
    { name: 'competitive_positioning', type: 'string', required: true },
    { name: 'brand_story_framework', type: 'string', required: true },
    { name: 'target_demographic_age', type: 'string', required: false },
    { name: 'target_location', type: 'string', required: false },
    { name: 'target_income', type: 'string', required: false },
    { name: 'target_education', type: 'string', required: false },
    { name: 'target_interests', type: 'string', required: false },
    { name: 'target_values', type: 'string', required: false },
    { name: 'target_lifestyle', type: 'string', required: false },
    { name: 'key_pain_points', type: 'string', required: true },
    { name: 'audience_research_complete', type: 'boolean', required: false },
    { name: 'survey_responses', type: 'string', required: false },
    { name: 'interview_count', type: 'string', required: false },
    { name: 'confidence_score', type: 'string', required: false },
    { name: 'engagement_strategy', type: 'string', required: false },
    { name: 'week1_actions', type: 'string', required: false },
    { name: 'foundation_tasks', type: 'string', required: false },
    { name: 'legal_tasks', type: 'string', required: false },
    { name: 'month2_prep', type: 'string', required: false },
    { name: 'success_metrics', type: 'string', required: false }
  ],
  metadata: {
    author: 'Wavelaunch Studio',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['deliverable', 'month-1', 'foundation', 'brand-identity']
  }
}

/**
 * Register all deliverable templates
 */
export function registerDeliverableTemplates(): void {
  templateEngine.registerTemplate(month1FoundationTemplate)
  
  // TODO: Add templates for months 2-8
}

/**
 * Get deliverable template by month
 */
export function getDeliverableTemplate(month: number) {
  const templateMap: Record<number, string> = {
    1: 'deliverable-month-1-foundation',
    // TODO: Add mappings for months 2-8
  }
  
  const templateId = templateMap[month]
  if (!templateId) {
    throw new Error(`No template found for month ${month}`)
  }
  
  return templateEngine.getTemplate(templateId)
}

/**
 * List all deliverable templates
 */
export function listDeliverableTemplates() {
  return templateEngine.getTemplatesByType('deliverable')
}
