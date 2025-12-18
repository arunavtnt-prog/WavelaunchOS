/**
 * Template Registry
 * 
 * Central registration and initialization of all templates.
 * Import this file to ensure all templates are registered.
 */

import { registerBusinessPlanTemplates } from './business-plan-templates'
import { registerDeliverableTemplates } from './deliverable-templates'

/**
 * Initialize and register all templates
 */
export function initializeTemplates(): void {
  // Register business plan templates
  registerBusinessPlanTemplates()
  
  // Register deliverable templates
  registerDeliverableTemplates()
  
  console.log('All templates registered successfully')
}

// Auto-initialize templates when this module is imported
initializeTemplates()
