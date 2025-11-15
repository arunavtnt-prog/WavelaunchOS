import { db } from '@/lib/db'

// Define business plan sections
export const BUSINESS_PLAN_SECTIONS = [
  { name: 'executive_summary', order: 1, title: 'Executive Summary', priority: 1 },
  { name: 'market_analysis', order: 2, title: 'Market Analysis', priority: 2 },
  { name: 'competitive_landscape', order: 3, title: 'Competitive Landscape', priority: 2 },
  { name: 'product_services', order: 4, title: 'Products & Services', priority: 3 },
  { name: 'marketing_strategy', order: 5, title: 'Marketing Strategy', priority: 3 },
  { name: 'financial_projections', order: 6, title: 'Financial Projections', priority: 4 },
  { name: 'operations_plan', order: 7, title: 'Operations Plan', priority: 4 },
  { name: 'team_structure', order: 8, title: 'Team Structure', priority: 5 },
]

// Define deliverable sections (common structure)
export const DELIVERABLE_SECTIONS = [
  { name: 'introduction', order: 1, title: 'Introduction', priority: 1 },
  { name: 'objectives', order: 2, title: 'Objectives', priority: 1 },
  { name: 'content', order: 3, title: 'Main Content', priority: 2 },
  { name: 'action_items', order: 4, title: 'Action Items', priority: 2 },
  { name: 'next_steps', order: 5, title: 'Next Steps', priority: 3 },
]

/**
 * Map client fields to sections that they affect
 */
export const FIELD_TO_SECTION_MAPPING: Record<string, string[]> = {
  // Client basic info affects most sections
  brandName: ['executive_summary', 'introduction'],
  visionStatement: ['executive_summary', 'objectives'],

  // Audience/market fields
  targetAudience: ['market_analysis', 'marketing_strategy'],
  demographics: ['market_analysis', 'marketing_strategy'],
  targetIndustry: ['market_analysis', 'competitive_landscape'],

  // Product/service fields
  uniqueValueProps: ['executive_summary', 'product_services', 'content'],
  productsServices: ['product_services', 'content'],

  // Competition
  competitors: ['competitive_landscape'],
  competitiveAdvantages: ['competitive_landscape', 'marketing_strategy'],

  // Financial
  scalingGoals: ['financial_projections'],
  revenue: ['financial_projections'],

  // Operations
  workLifeBalance: ['operations_plan'],
  teamStructure: ['team_structure'],
}

/**
 * Parse a markdown document into sections
 * Assumes sections are separated by ## headings
 */
export function parseMarkdownSections(content: string): Array<{
  title: string
  content: string
  order: number
}> {
  const sections: Array<{ title: string; content: string; order: number }> = []
  const lines = content.split('\n')

  let currentSection: { title: string; content: string[]; order: number } | null = null
  let order = 0

  for (const line of lines) {
    // Check if this is a section heading (## Title)
    const headingMatch = line.match(/^##\s+(.+)$/)

    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join('\n').trim(),
          order: currentSection.order,
        })
      }

      // Start new section
      order++
      currentSection = {
        title: headingMatch[1],
        content: [],
        order,
      }
    } else if (currentSection) {
      // Add line to current section
      currentSection.content.push(line)
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.join('\n').trim(),
      order: currentSection.order,
    })
  }

  return sections
}

/**
 * Store document sections in database
 */
export async function storeSections(
  documentId: string,
  documentType: 'BUSINESS_PLAN' | 'DELIVERABLE',
  content: string,
  generatedBy?: string,
  tokensUsed?: number
): Promise<void> {
  try {
    const sections = parseMarkdownSections(content)

    // Delete existing sections for this document
    await db.documentSection.deleteMany({
      where: {
        documentId,
        documentType,
      },
    })

    // Create new sections
    for (const section of sections) {
      await db.documentSection.create({
        data: {
          documentId,
          documentType,
          sectionName: section.title,
          sectionOrder: section.order,
          content: section.content,
          generatedBy,
          tokensUsed: tokensUsed ? Math.floor(tokensUsed / sections.length) : undefined,
          version: 1,
        },
      })
    }
  } catch (error) {
    console.error('Store sections error:', error)
  }
}

/**
 * Get sections for a document
 */
export async function getSections(
  documentId: string,
  documentType: 'BUSINESS_PLAN' | 'DELIVERABLE'
) {
  return await db.documentSection.findMany({
    where: {
      documentId,
      documentType,
    },
    orderBy: {
      sectionOrder: 'asc',
    },
  })
}

/**
 * Combine sections back into a single markdown document
 */
export function combineSections(
  sections: Array<{ sectionName: string; content: string; sectionOrder: number }>
): string {
  const sortedSections = [...sections].sort((a, b) => a.sectionOrder - b.sectionOrder)

  return sortedSections
    .map((section) => {
      return `## ${section.sectionName}\n\n${section.content}`
    })
    .join('\n\n')
}

/**
 * Determine which sections need regeneration based on changed fields
 */
export function getAffectedSections(changedFields: string[]): Set<string> {
  const affected = new Set<string>()

  for (const field of changedFields) {
    const sections = FIELD_TO_SECTION_MAPPING[field]
    if (sections) {
      sections.forEach((s) => affected.add(s))
    }
  }

  return affected
}
