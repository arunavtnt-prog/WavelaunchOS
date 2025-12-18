/**
 * Document Template Engine
 * 
 * Unified template system for business plans, deliverables, and other documents.
 * Supports variable replacement, conditional blocks, and formatting.
 */

export type TemplateType = 'business_plan' | 'deliverable' | 'report' | 'email'

export interface TemplateVariable {
  name: string
  value?: string | number | boolean | undefined
  type?: 'string' | 'number' | 'boolean' | 'date'
  format?: string // For date formatting
}

export interface TemplateContext {
  [key: string]: TemplateVariable | string | number | boolean | undefined
}

export interface TemplateSection {
  id: string
  title: string
  content: string
  order: number
  required?: boolean
  conditions?: TemplateCondition[]
}

export interface TemplateCondition {
  variable: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'exists' | 'not_exists'
  value?: string | number | boolean
}

export interface DocumentTemplate {
  id: string
  name: string
  type: TemplateType
  version: string
  description: string
  sections: TemplateSection[]
  variables: TemplateVariable[]
  metadata: {
    author: string
    createdAt: string
    updatedAt: string
    tags: string[]
  }
}

export interface RenderedDocument {
  content: string
  metadata: {
    templateId: string
    templateName: string
    renderedAt: string
    variables: Record<string, any>
  }
}

/**
 * Template Engine Class
 */
export class TemplateEngine {
  private templates: Map<string, DocumentTemplate> = new Map()
  private cache: Map<string, RenderedDocument> = new Map()

  /**
   * Register a template
   */
  registerTemplate(template: DocumentTemplate): void {
    this.templates.set(template.id, template)
  }

  /**
   * Get a template by ID
   */
  getTemplate(templateId: string): DocumentTemplate | undefined {
    return this.templates.get(templateId)
  }

  /**
   * Render a template with context
   */
  renderTemplate(templateId: string, context: TemplateContext): RenderedDocument {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(templateId, context)
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Process sections
    const renderedSections: string[] = []
    
    for (const section of template.sections) {
      if (this.shouldRenderSection(section, context)) {
        const renderedContent = this.renderContent(section.content, context)
        renderedSections.push(`## ${section.title}\n\n${renderedContent}`)
      }
    }

    // Combine sections
    const fullContent = renderedSections.join('\n\n---\n\n')

    // Add metadata header
    const metadataHeader = this.generateMetadataHeader(template, context)
    const finalContent = `${metadataHeader}\n\n${fullContent}`

    const result: RenderedDocument = {
      content: finalContent,
      metadata: {
        templateId: template.id,
        templateName: template.name,
        renderedAt: new Date().toISOString(),
        variables: this.sanitizeContext(context),
      },
    }

    // Cache result
    this.cache.set(cacheKey, result)

    return result
  }

  /**
   * Check if a section should be rendered based on conditions
   */
  private shouldRenderSection(section: TemplateSection, context: TemplateContext): boolean {
    if (!section.conditions || section.conditions.length === 0) {
      return true
    }

    return section.conditions.every(condition => 
      this.evaluateCondition(condition, context)
    )
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(condition: TemplateCondition, context: TemplateContext): boolean {
    const value = context[condition.variable]

    switch (condition.operator) {
      case 'exists':
        return value !== undefined && value !== null && value !== ''
      case 'not_exists':
        return value === undefined || value === null || value === ''
      case 'equals':
        return value === condition.value
      case 'not_equals':
        return value !== condition.value
      case 'contains':
        return typeof value === 'string' && value.includes(String(condition.value || ''))
      case 'not_contains':
        return typeof value === 'string' && !value.includes(String(condition.value || ''))
      default:
        return true
    }
  }

  /**
   * Render content with variable replacement
   */
  private renderContent(content: string, context: TemplateContext): string {
    let rendered = content

    // Replace escaped variables first (\${{variable}} -> {{variable}})
    rendered = rendered.replace(/\\\$\{\{([^}]+)\}\}/g, '{{$1}}')

    // Replace {{variable}} syntax
    const variableRegex = /\{\{([^}]+)\}\}/g
    rendered = rendered.replace(variableRegex, (match, variableName) => {
      const value = context[variableName]
      return this.formatVariable(value, variableName, context)
    })

    // Handle conditional blocks {% if %} ... {% endif %}
    rendered = this.renderConditionals(rendered, context)

    // Handle loops {% for %} ... {% endfor %}
    rendered = this.renderLoops(rendered, context)

    return rendered
  }

  /**
   * Format a variable for output
   */
  private formatVariable(value: any, variableName: string, context: TemplateContext): string {
    if (value === undefined || value === null) {
      return ''
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }

    if (typeof value === 'number') {
      return value.toLocaleString()
    }

    if (value instanceof Date) {
      return value.toLocaleDateString()
    }

    return String(value)
  }

  /**
   * Render conditional blocks
   */
  private renderConditionals(content: string, context: TemplateContext): string {
    const ifRegex = /\{%\s*if\s+([^%]+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g
    return content.replace(ifRegex, (match, condition, body) => {
      if (this.evaluateSimpleCondition(condition.trim(), context)) {
        return this.renderContent(body, context)
      }
      return ''
    })
  }

  /**
   * Render loop blocks
   */
  private renderLoops(content: string, context: TemplateContext): string {
    const forRegex = /\{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/g
    return content.replace(forRegex, (match, itemVar, arrayVar, body) => {
      const array = context[arrayVar]
      if (!Array.isArray(array)) {
        return ''
      }

      return array.map(item => {
        const loopContext = { ...context, [itemVar]: item }
        return this.renderContent(body, loopContext)
      }).join('\n')
    })
  }

  /**
   * Evaluate simple conditions
   */
  private evaluateSimpleCondition(condition: string, context: TemplateContext): boolean {
    // Simple evaluation for common patterns
    if (condition.includes('==')) {
      const [left, right] = condition.split('==').map(s => s.trim())
      return context[left] === right.replace(/['"]/g, '')
    }
    
    if (condition.includes('!=')) {
      const [left, right] = condition.split('!=').map(s => s.trim())
      return context[left] !== right.replace(/['"]/g, '')
    }

    // Just check if variable exists and is truthy
    return Boolean(context[condition])
  }

  /**
   * Generate metadata header
   */
  private generateMetadataHeader(template: DocumentTemplate, context: TemplateContext): string {
    const metadata = [
      `---`,
      `template: ${template.name}`,
      `type: ${template.type}`,
      `version: ${template.version}`,
      `generated: ${new Date().toISOString()}`,
      `---`,
    ]
    return metadata.join('\n')
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(templateId: string, context: TemplateContext): string {
    const contextStr = JSON.stringify(context)
    return `${templateId}_${Buffer.from(contextStr).toString('base64')}`
  }

  /**
   * Sanitize context for storage
   */
  private sanitizeContext(context: TemplateContext): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value
      } else if (value instanceof Date) {
        sanitized[key] = value.toISOString()
      } else {
        sanitized[key] = String(value)
      }
    }

    return sanitized
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get all registered templates
   */
  getTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * List templates by type
   */
  getTemplatesByType(type: TemplateType): DocumentTemplate[] {
    return this.getTemplates().filter(template => template.type === type)
  }
}

// Singleton instance
export const templateEngine = new TemplateEngine()
