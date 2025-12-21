/**
 * Business Plan Templates
 * 
 * Pre-defined templates for business plan generation with sections,
 * variables, and conditional content.
 */

import { templateEngine, DocumentTemplate, TemplateSection, TemplateVariable } from './engine'

/**
 * Business Plan Template - Standard Version
 */
const standardBusinessPlanTemplate: DocumentTemplate = {
  id: 'business-plan-standard',
  name: 'Standard Business Plan',
  type: 'business_plan',
  version: '1.0.0',
  description: 'Comprehensive business plan template for creator brands',
  sections: [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      content: `# Executive Summary

## Business Overview
\${{client_name}} is a \${{niche}} brand focused on \${{target_audience}}. Our mission is to \${{vision_statement}}.

## Key Highlights
- **Industry**: \${{target_industry}}
- **Target Market**: \${{target_audience}}
- **Unique Value**: \${{unique_value_props}}
- **Brand Personality**: \${{brand_personality}}

## Financial Projections
{% if has_revenue_projections %}
- Year 1 Revenue: $\${{year1_revenue}}
- Year 1 Profit: $\${{year1_profit}}
- Break-even: \${{break_even_months}} months
{% endif %}

## Funding Requirements
{% if funding_needed %}
Total funding required: $\${{funding_amount}}
{% endif %}`,
      order: 1,
      required: true
    }
  ],
  variables: [
    { name: 'client_name', type: 'string' },
    { name: 'niche', type: 'string' },
    { name: 'target_audience', type: 'string' },
    { name: 'vision_statement', type: 'string' },
    { name: 'target_industry', type: 'string' },
    { name: 'unique_value_props', type: 'string' },
    { name: 'brand_personality', type: 'string' },
    { name: 'has_revenue_projections', type: 'boolean' },
    { name: 'year1_revenue', type: 'string' },
    { name: 'year1_profit', type: 'string' },
    { name: 'break_even_months', type: 'string' },
    { name: 'funding_needed', type: 'boolean' },
    { name: 'funding_amount', type: 'string' }
  ],
  metadata: {
    author: 'Wavelaunch Studio',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['business-plan', 'standard', 'comprehensive']
  }
}

/**
 * Register all business plan templates
 */
export function registerBusinessPlanTemplates(): void {
  templateEngine.registerTemplate(standardBusinessPlanTemplate)
}

/**
 * Get business plan template by ID
 */
export function getBusinessPlanTemplate(templateId: string) {
  return templateEngine.getTemplate(templateId)
}

/**
 * List all business plan templates
 */
export function listBusinessPlanTemplates() {
  return templateEngine.getTemplatesByType('business_plan')
}
