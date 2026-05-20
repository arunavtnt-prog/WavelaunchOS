/**
 * Markdown Normalizer for PDF Generation
 *
 * Standardizes markdown formatting to ensure consistent PDF output.
 * Handles common inconsistencies from AI-generated content or manual editing.
 */

export interface MarkdownNormalizationOptions {
  /**
   * Maximum heading level to preserve (deeper levels get flattened)
   * @default 3
   */
  maxHeadingLevel?: number

  /**
   * Whether to normalize tables (fix spacing, alignment)
   * @default true
   */
  normalizeTables?: boolean

  /**
   * Whether to add spacing between list items for better PDF rendering
   * @default true
   */
  addListSpacing?: boolean

  /**
   * Whether to remove empty sections (headings with no content)
   * @default true
   */
  removeEmptySections?: boolean

  /**
   * Whether to escape special characters that might break rendering
   * @default true
   */
  escapeSpecialChars?: boolean

  /**
   * Whether to convert numbered sections (e.g., "1.1 Title") to headings
   * @default true
   */
  convertNumberedSections?: boolean

  /**
   * Whether to remove "Part X:" prefixes from headings
   * @default true
   */
  removePartPrefixes?: boolean
}

/**
 * Normalize markdown content for consistent PDF generation
 */
export function normalizeMarkdown(
  content: string,
  options: MarkdownNormalizationOptions = {}
): string {
  const {
    maxHeadingLevel = 3,
    normalizeTables = true,
    addListSpacing = true,
    removeEmptySections = true,
    escapeSpecialChars = true,
    convertNumberedSections = true,
    removePartPrefixes = true,
  } = options

  let normalized = content

  // 1. Normalize line endings (CRLF -> LF)
  normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // 2. Remove "Part X:" prefixes from headings
  if (removePartPrefixes) {
    normalized = removePartPrefixesFromHeadings(normalized)
  }

  // 3. Convert numbered sections to headings (before other heading normalization)
  if (convertNumberedSections) {
    normalized = convertNumberedSectionsToHeadings(normalized)
  }

  // 4. Normalize heading styles
  normalized = normalizeHeadings(normalized, maxHeadingLevel)

  // 3. Ensure proper spacing around headings
  normalized = ensureHeadingSpacing(normalized)

  // 4. Normalize lists
  normalized = normalizeLists(normalized, addListSpacing)

  // 5. Normalize code blocks
  normalized = normalizeCodeBlocks(normalized)

  // 6. Normalize blockquotes
  normalized = normalizeBlockquotes(normalized)

  // 7. Normalize tables
  if (normalizeTables) {
    normalized = normalizeTablesFormat(normalized)
  }

  // 8. Normalize horizontal rules
  normalized = normalizeHorizontalRules(normalized)

  // 9. Ensure proper spacing between paragraphs
  normalized = normalizeParagraphs(normalized)

  // 11. Remove empty sections
  if (removeEmptySections) {
    normalized = removeEmptySectionContent(normalized)
  }

  // 12. Clean up excessive blank lines
  normalized = cleanupBlankLines(normalized)

  // 13. Escape problematic characters in certain contexts
  if (escapeSpecialChars) {
    normalized = escapeSpecialCharacters(normalized)
  }

  // 14. Ensure file ends with single newline
  normalized = normalized.trimEnd() + '\n'

  return normalized
}

/**
 * Convert numbered sections to H2 headings
 *
 * Handles ANY numbered section pattern where a line starts with "X.Y" or "X.Y.Z" format:
 * - "1.1 Introduction to Phoenix's Vision"
 * - "1.2 Executive Summary"
 * - "2.1 Market Analysis"
 * - "2.3 Financial Projections"
 * - "3.1.1 Deep Dive" (three-level)
 * - "4.16 Appendix: Partnership Structure Summary"
 * - "10.5 Title" (double-digit numbers)
 *
 * These are converted to markdown H2 headings with preserved numbering.
 *
 * IMPORTANT: This should NOT match ordered lists like "1. Title" or "2. Title"
 * because those are actual list items, not section headings.
 */

/**
 * Remove "Part X:" prefixes from headings
 *
 * AI-generated content sometimes includes redundant "Part" prefixes in headings:
 * - "1.3 Part 2: Product Strategy" -> "1.3 Product Strategy"
 * - "## Part 1: Executive Summary" -> "## Executive Summary"
 * - "## Part 3: Market Analysis" -> "## Market Analysis"
 *
 * This removes the redundant "Part X:" prefix since the section number already indicates structure.
 */
function removePartPrefixesFromHeadings(content: string): string {
  // Remove "Part X:" from markdown headings (with # prefix)
  content = content.replace(/^(#{1,6}\s+)Part\s+\d+:\s*/gmi, '$1')

  // Remove "Part X:" from lines that will become numbered headings
  // This handles cases like "1.3 Part 2: Product Strategy" -> "1.3 Product Strategy"
  content = content.replace(/^(\d+\.\d+(?:\.\d+)?.?)\s+Part\s+\d+:\s*/gmi, '$1 ')

  // Also handle variations like "Part X -", "Part X —", "Part X |"
  content = content.replace(/^(#{1,6}\s+)Part\s+\d+\s+[-—|]\s*/gmi, '$1')
  content = content.replace(/^(\d+\.\d+(?:\.\d+)?.?)\s+Part\s+\d+\s+[-—|]\s*/gmi, '$1 ')

  return content
}

function convertNumberedSectionsToHeadings(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip if already a markdown heading
    if (trimmed.match(/^#{1,6}\s/)) {
      result.push(line)
      continue
    }

    // Skip empty lines, code blocks, blockquotes, lists, etc.
    if (trimmed === '' ||
        trimmed.startsWith('```') ||
        trimmed.startsWith('>') ||
        trimmed.startsWith('-') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('+') ||
        trimmed.match(/^\d+\.\s/) ||  // Ordered list: "1. " (single digit with dot and space)
        trimmed.match(/^[\s\t]*\|/)) {
      result.push(line)
      continue
    }

    // Check for numbered section patterns at start of line:
    // Matches ANY of these patterns (X, Y, Z can be any positive integer):
    // - "X.Y Title"       -> e.g., "1.1 Introduction", "2.3 Market", "10.5 Appendix"
    // - "X.Y.Z Title"     -> e.g., "1.1.1 Deep Dive", "2.3.4 Details"
    // - "X.Y. Title"      -> e.g., "1.1. Introduction" (with trailing dot)
    //
    // Key requirements:
    // - Must start with digit(s)
    // - Must have dot separator(s)
    // - After the number pattern, must have space + text
    // - Must NOT be ordered list (which is just "X. Title")
    const numberedSectionMatch = trimmed.match(/^(\d+\.\d+(?:\.\d+)?.?)\s+(.+)$/)

    if (numberedSectionMatch) {
      const sectionNumber = numberedSectionMatch[1]  // e.g., "1.1", "2.3", "4.16"
      const sectionTitle = numberedSectionMatch[2]   // e.g., "Introduction to Phoenix's Vision"

      // Convert to H2 heading with preserved numbering
      result.push(`## ${sectionNumber} ${sectionTitle}`)
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}

/**
 * Normalize heading styles to consistent #-based format
 */
function normalizeHeadings(content: string, maxLevel: number): string {
  // Handle underline-style headings (setext) - convert to ATX style
  // H1 underline: ===, H2 underline: ---
  content = content.replace(/^(.+)\n[=-]{3,}\s*$/gm, (match, title) => {
    const level = match.includes('=') ? 1 : 2
    return `${'#'.repeat(level)} ${title.trim()}`
  })

  // Fix heading spacing: ensure space between # and text
  content = content.replace(/^(#{1,6})([^#\s])/gm, '$1 $2')

  // Remove extra # characters and limit depth
  content = content.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
    let level = Math.min(hashes.length, maxLevel)
    return `${'#'.repeat(level)} ${title.trim()}`
  })

  // Remove trailing # characters from headings
  content = content.replace(/^(#{1,6}\s+.+?)\s*#+\s*$/gm, '$1')

  return content
}

/**
 * Ensure proper spacing around headings (blank line before and after)
 */
function ensureHeadingSpacing(content: string): string {
  // Ensure blank line before headings (except at start of document)
  content = content.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')

  // Ensure blank line after headings (except if followed by another heading or horizontal rule)
  content = content.replace(/(#{1,6}\s.+)\n(?!(#{1,6}\s|---|\*\*\*|___))/g, '$1\n\n')

  return content
}

/**
 * Normalize list formatting
 */
function normalizeLists(content: string, addSpacing: boolean): string {
  const lines = content.split('\n')
  const result: string[] = []
  let inList = false
  let listIndent = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Detect list item
    const isUnordered = /^[-*+]\s/.test(trimmed)
    const isOrdered = /^\d+\.\s/.test(trimmed)
    const isListItem = isUnordered || isOrdered

    if (isListItem) {
      // Calculate indent level
      const spaces = line.match(/^\s*/)?.[0].length || 0
      const newIndent = Math.floor(spaces / 2) * 2

      if (!inList) {
        inList = true
        listIndent = newIndent
      }

      // Normalize bullet style to -
      let normalizedLine = line
      if (isUnordered) {
        normalizedLine = line.replace(/^(\s*)[-*+]\s/, '$1- ')
      }

      // Ensure proper spacing for nested lists
      if (addSpacing && newIndent > listIndent && result.length > 0) {
        const prevLine = result[result.length - 1]
        const prevIsListItem = /^(\s*)[-*+]|\d+\./.test(prevLine.trim())
        if (prevIsListItem && !prevLine.endsWith('\n')) {
          // Add spacing for nested lists
        }
      }

      result.push(normalizedLine)
    } else if (trimmed === '' && inList) {
      // Preserve blank lines within lists
      result.push(line)
    } else {
      if (inList && trimmed !== '') {
        inList = false
        // Ensure blank line after list
        if (result.length > 0 && result[result.length - 1].trim() !== '') {
          result.push('')
        }
      }
      result.push(line)
    }
  }

  return result.join('\n')
}

/**
 * Normalize code blocks to use consistent fencing
 */
function normalizeCodeBlocks(content: string): string {
  // Convert indented code blocks to fenced
  const lines = content.split('\n')
  const result: string[] = []
  let inIndentedCode = false
  let codeLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if line is indented code (4+ spaces or tab)
    const isIndentedCode = /^(?: {4}|\t).+/.test(line)

    if (isIndentedCode) {
      if (!inIndentedCode) {
        inIndentedCode = true
        codeLines = []
      }
      codeLines.push(line.replace(/^(?: {4}|\t)/, ''))
    } else {
      if (inIndentedCode) {
        result.push('```')
        result.push(...codeLines)
        result.push('```')
        result.push('')
        inIndentedCode = false
        codeLines = []
      }
      result.push(line)
    }
  }

  // Handle unclosed code block at end
  if (inIndentedCode) {
    result.push('```')
    result.push(...codeLines)
    result.push('```')
  }

  return result.join('\n')
}

/**
 * Normalize blockquote formatting
 */
function normalizeBlockquotes(content: string): string {
  // Ensure consistent > prefix with space after
  content = content.replace(/^>(?!\s)/gm, '> ')

  // Handle nested blockquotes
  content = content.replace(/^>\s*>\s*/g, '>> ')

  // Ensure proper spacing around blockquotes
  content = content.replace(/([^\n])\n(>)/g, '$1\n\n$2')

  return content
}

/**
 * Normalize table formatting
 */
function normalizeTablesFormat(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect table row (contains |)
    if (line.includes('|')) {
      const trimmed = line.trim()

      // Check if this is a separator row (contains only |, -, :, spaces)
      const isSeparator = /^[\s|:-]+$/.test(trimmed)

      if (isSeparator) {
        // Normalize separator
        const cols = trimmed.split('|').filter(c => c.trim() !== '')
        const normalizedSep = '|' + cols.map(() => '---').join('|') + '|'
        result.push(normalizedSep)
      } else {
        // Normalize table row - ensure leading/trailing |
        let normalized = trimmed
        if (!normalized.startsWith('|')) {
          normalized = '|' + normalized
        }
        if (!normalized.endsWith('|')) {
          normalized = normalized + '|'
        }
        // Clean up spaces around pipe characters
        normalized = normalized.replace(/\s*\|\s*/g, '| ').replace(/^\||\|$/g, m => m)
        result.push(normalized)
      }
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}

/**
 * Normalize horizontal rules to consistent ---
 */
function normalizeHorizontalRules(content: string): string {
  // Replace all hr styles with ---
  content = content.replace(/^[ \t]*([-*_]{3,})[ \t]*$/gm, '---')

  // Ensure spacing around hr
  content = content.replace(/([^\n])\n---/g, '$1\n\n---')
  content = content.replace(/---\n([^\n])/g, '---\n\n$1')

  return content
}

/**
 * Normalize paragraph spacing
 */
function normalizeParagraphs(content: string): string {
  // Ensure blank line between paragraphs
  // A paragraph is a non-empty line that's not a heading, list, code block, etc.
  const lines = content.split('\n')
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    const isHeading = /^#{1,6}\s/.test(trimmed)
    const isList = /^[-*+]\s|\d+\.\s/.test(trimmed)
    const isCodeFence = /^```/.test(trimmed)
    const isBlockquote = /^>\s/.test(trimmed)
    const isHorizontalRule = /^---$/.test(trimmed)
    const isTable = trimmed.includes('|') && trimmed.includes('|')
    const isSpecial = isHeading || isList || isCodeFence || isBlockquote || isHorizontalRule || isTable

    if (trimmed === '' || isSpecial) {
      result.push(line)
    } else {
      // This is a regular paragraph line
      if (result.length > 0) {
        const prevLine = result[result.length - 1].trim()
        if (prevLine !== '' && !prevLine.startsWith('```')) {
          // Check if previous line was also a paragraph (continuation)
          const prevIsSpecial =
            /^#{1,6}\s/.test(prevLine) ||
            /^[-*+]\s|\d+\.\s/.test(prevLine) ||
            /^>\s/.test(prevLine) ||
            /^---$/.test(prevLine) ||
            (prevLine.includes('|') && !prevLine.startsWith('>'))

          if (!prevIsSpecial) {
            // Previous was also paragraph, keep as is (continuation)
            result.push(line)
          } else {
            // Previous was special element, add blank line
            if (result[result.length - 1] !== '') {
              result.push('')
            }
            result.push(line)
          }
        } else {
          result.push(line)
        }
      }
    }
  }

  return result.join('\n')
}

/**
 * Remove empty sections (headings with no content until next heading)
 */
function removeEmptySectionContent(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let headingStart = -1
  let hasContent = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    const isHeading = /^#{1,6}\s/.test(trimmed)
    const isNonEmpty = trimmed !== ''

    if (isHeading) {
      // Process previous heading section
      if (headingStart >= 0 && !hasContent) {
        // Remove empty section
        while (result.length > headingStart) {
          result.pop()
        }
      }
      headingStart = result.length
      hasContent = false
      result.push(line)
    } else if (isNonEmpty) {
      hasContent = true
      result.push(line)
    } else {
      result.push(line)
    }
  }

  // Handle last section
  if (headingStart >= 0 && !hasContent) {
    while (result.length > headingStart) {
      result.pop()
    }
  }

  return result.join('\n')
}

/**
 * Clean up excessive blank lines (more than 2 consecutive)
 */
function cleanupBlankLines(content: string): string {
  return content.replace(/\n{3,}/g, '\n\n')
}

/**
 * Escape special characters that might break rendering
 */
function escapeSpecialCharacters(content: string): string {
  // Don't escape inside code blocks
  const lines = content.split('\n')
  const result: string[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      result.push(line)
    } else if (inCodeBlock) {
      result.push(line)
    } else {
      // Escape problematic characters in regular text
      let escaped = line
      // Escape unescaped angle brackets that aren't part of valid HTML
      escaped = escaped.replace(/<(?!\/?[a-z][a-z0-9]*\b[^>]*>)/gi, '\\<')
      result.push(escaped)
    }
  }

  return result.join('\n')
}

/**
 * Validate markdown structure and return issues found
 */
export interface MarkdownValidationIssue {
  line: number
  type: 'error' | 'warning' | 'info'
  message: string
  context?: string
}

export function validateMarkdown(content: string): MarkdownValidationIssue[] {
  const issues: MarkdownValidationIssue[] = []
  const lines = content.split('\n')

  let headingCount = 0
  let hasH1 = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    const lineNum = i + 1

    // Check for H1
    if (/^#\s/.test(trimmed)) {
      headingCount++
      hasH1 = true
      if (headingCount > 1) {
        issues.push({
          line: lineNum,
          type: 'warning',
          message: 'Multiple H1 headings found. Consider using H2 for subsections.',
          context: trimmed,
        })
      }
    }

    // Check for unclosed code fence
    if (trimmed.startsWith('```')) {
      let fenceCount = 1
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim().startsWith('```')) {
          fenceCount++
          break
        }
      }
      if (fenceCount === 1) {
        issues.push({
          line: lineNum,
          type: 'error',
          message: 'Unclosed code fence detected',
          context: trimmed,
        })
      }
    }

    // Check for malformed tables
    if (trimmed.includes('|') && !trimmed.startsWith('>')) {
      const pipeCount = (trimmed.match(/\|/g) || []).length
      if (pipeCount < 2) {
        issues.push({
          line: lineNum,
          type: 'warning',
          message: 'Table row may be malformed (insufficient pipe separators)',
          context: trimmed,
        })
      }
    }
  }

  // Check if document has any H1
  if (!hasH1 && lines.some(l => /^#{1,6}\s/.test(l.trim()))) {
    issues.push({
      line: 1,
      type: 'info',
      message: 'Document has no H1 heading. Consider adding a title.',
    })
  }

  return issues
}
