/**
 * Template Engine
 * 
 * Core template processing system for document generation with
 * variable substitution and conditional content.
 */

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  variables?: TemplateVariable[];
  condition?: string;
  order?: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  version: string;
  description: string;
  sections: TemplateSection[];
  variables?: TemplateVariable[];
  metadata?: Record<string, any>;
}

export interface TemplateContext {
  [key: string]: any;
}

export class TemplateEngine {
  private templates: Map<string, DocumentTemplate> = new Map();
  
  /**
   * Register a template
   */
  registerTemplate(template: DocumentTemplate): void {
    this.templates.set(template.id, template);
  }
  
  /**
   * Get a registered template
   */
  getTemplate(id: string): DocumentTemplate | undefined {
    return this.templates.get(id);
  }
  
  /**
   * Get all registered templates
   */
  getAllTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values());
  }
  
  /**
   * Get templates by type
   */
  getTemplatesByType(type: string): DocumentTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.type === type);
  }
  
  /**
   * Process a template with given context
   */
  processTemplate(template: DocumentTemplate, context: TemplateContext): string {
    let processedContent = '';
    
    // Process sections in order
    const sortedSections = template.sections
      .filter(section => this.shouldIncludeSection(section, context))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    for (const section of sortedSections) {
      processedContent += this.processSection(section, context) + '\n\n';
    }
    
    return processedContent.trim();
  }
  
  /**
   * Process a single section
   */
  private processSection(section: TemplateSection, context: TemplateContext): string {
    let content = section.content;
    
    // Replace variables in content
    content = this.replaceVariables(content, context);
    
    return content;
  }
  
  /**
   * Replace template variables with context values
   */
  private replaceVariables(content: string, context: TemplateContext): string {
    // Match ${variable} patterns
    return content.replace(/\$\{([^}]+)\}/g, (match, variablePath) => {
      const value = this.getNestedValue(context, variablePath);
      return value !== undefined ? String(value) : match;
    });
  }
  
  /**
   * Get nested value from context using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
  
  /**
   * Check if section should be included based on conditions
   */
  private shouldIncludeSection(section: TemplateSection, context: TemplateContext): boolean {
    if (!section.condition) {
      return true;
    }
    
    try {
      // Simple condition evaluation - can be enhanced
      return this.evaluateCondition(section.condition, context);
    } catch (error) {
      console.warn(`Failed to evaluate condition for section ${section.id}:`, error);
      return true; // Include section if condition fails
    }
  }
  
  /**
   * Simple condition evaluator
   */
  private evaluateCondition(condition: string, context: TemplateContext): boolean {
    // Replace variables in condition
    const processedCondition = this.replaceVariables(condition, context);
    
    // Basic evaluation - can be enhanced with proper expression parser
    try {
      // This is a simplified evaluation - in production, use a proper expression parser
      return Function('"use strict"; return (' + processedCondition + ')')();
    } catch {
      return false;
    }
  }
  
  /**
   * Validate template context against required variables
   */
  validateContext(template: DocumentTemplate, context: TemplateContext): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check template-level variables
    if (template.variables) {
      for (const variable of template.variables) {
        if (variable.required && !this.hasValue(context, variable.name)) {
          errors.push(`Required variable '${variable.name}' is missing`);
        }
      }
    }
    
    // Check section-level variables
    for (const section of template.sections) {
      if (section.variables) {
        for (const variable of section.variables) {
          if (variable.required && !this.hasValue(context, variable.name)) {
            errors.push(`Required variable '${variable.name}' is missing for section '${section.title}'`);
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Check if context has a value for the given variable path
   */
  private hasValue(context: TemplateContext, path: string): boolean {
    const value = this.getNestedValue(context, path);
    return value !== undefined && value !== null && value !== '';
  }
}

// Export singleton instance
export const templateEngine = new TemplateEngine();
