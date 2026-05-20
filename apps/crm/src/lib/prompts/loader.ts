import fs from 'fs/promises'
import path from 'path'
import yaml from 'yaml'
import Mustache from 'mustache'
import { prisma } from '@/lib/db'
import { PromptTemplateType } from '@prisma/client'

export type PromptTemplate = {
  name: string
  version: string
  description?: string
  systemPrompt?: string
  userPrompt: string
  variables: string[]
}

export class PromptLoader {
  private cache = new Map<string, PromptTemplate>()

  async loadTemplate(type: PromptTemplateType): Promise<PromptTemplate> {
    // Check cache first
    if (this.cache.has(type)) {
      return this.cache.get(type)!
    }

    // Get active template from database
    const template = await prisma.promptTemplate.findFirst({
      where: { type, isActive: true },
    })

    if (!template) {
      throw new Error(`No active template found for type: ${type}`)
    }

    // Load YAML file
    if (!template.yamlPath) {
      throw new Error(`Template yamlPath is null for type: ${type}`)
    }
    const yamlPath = path.join(process.cwd(), template.yamlPath)

    try {
      const content = await fs.readFile(yamlPath, 'utf-8')
      const parsed = yaml.parse(content) as PromptTemplate

      // Cache the template
      this.cache.set(type, parsed)

      return parsed
    } catch (error) {
      throw new Error(`Failed to load template from ${yamlPath}: ${error}`)
    }
  }

  renderPrompt(template: PromptTemplate, variables: Record<string, any>): string {
    // Validate required variables
    const missing = template.variables.filter((v) => !(v in variables))
    if (missing.length > 0) {
      throw new Error(`Missing required variables: ${missing.join(', ')}`)
    }

    // Render with Mustache
    return Mustache.render(template.userPrompt, variables)
  }

  clearCache() {
    this.cache.clear()
  }
}

// Singleton instance
export const promptLoader = new PromptLoader()
