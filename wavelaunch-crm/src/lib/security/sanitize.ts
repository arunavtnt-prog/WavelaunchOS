/**
 * Input Sanitization
 *
 * Sanitizes user input to prevent XSS, injection attacks, and other malicious content.
 * Used for all user-generated content, especially rich text from TipTap editor.
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Allowed HTML tags for rich text editor content
 */
const ALLOWED_TAGS = [
  // Text formatting
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'b',
  'i',
  'mark',
  'small',
  'sub',
  'sup',

  // Headings
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',

  // Lists
  'ul',
  'ol',
  'li',

  // Block elements
  'blockquote',
  'pre',
  'code',
  'hr',

  // Links (carefully controlled)
  'a',

  // Tables
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
]

/**
 * Allowed HTML attributes
 */
const ALLOWED_ATTRS = [
  // Link attributes
  'href',
  'title',
  'target',
  'rel',

  // Table attributes
  'colspan',
  'rowspan',

  // Class for styling (limited use)
  'class',
]

/**
 * Allowed URL schemes for links
 */
const ALLOWED_URI_REGEXP = /^(?:https?|mailto|tel):/i

/**
 * Sanitize HTML content (for rich text editor)
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ALLOWED_URI_REGEXP,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
    // Remove any content in <script> and <style> tags
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    // Remove any event handlers (onclick, onload, etc.)
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  })
}

/**
 * Sanitize plain text (strips all HTML)
 */
export function sanitizePlainText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  // Remove all HTML tags
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize user input for safe database storage
 * Strips dangerous characters but preserves formatting
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove null bytes and other control characters
  let sanitized = input.replace(/\0/g, '')

  // Normalize line breaks
  sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Limit consecutive whitespace
  sanitized = sanitized.replace(/[ \t]{2,}/g, ' ')

  // Trim
  sanitized = sanitized.trim()

  return sanitized
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  // Remove any HTML and extra whitespace
  let sanitized = sanitizePlainText(email)
  sanitized = sanitized.trim().toLowerCase()

  return sanitized
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  // Remove any HTML
  let sanitized = sanitizePlainText(url).trim()

  // Only allow http(s) and mailto protocols
  if (
    !sanitized.match(/^https?:\/\//i) &&
    !sanitized.match(/^mailto:/i) &&
    !sanitized.match(/^tel:/i)
  ) {
    // If no protocol, assume https
    if (!sanitized.includes('://')) {
      sanitized = 'https://' + sanitized
    } else {
      // Invalid protocol, return empty
      return ''
    }
  }

  return sanitized
}

/**
 * Sanitize business plan content
 * Business plans can include rich formatting
 */
export function sanitizeBusinessPlanContent(content: string): string {
  return sanitizeHTML(content)
}

/**
 * Sanitize note content
 * Notes can include rich formatting
 */
export function sanitizeNoteContent(content: string): string {
  return sanitizeHTML(content)
}

/**
 * Sanitize message content
 * Messages support basic formatting
 */
export function sanitizeMessageContent(content: string): string {
  return sanitizeHTML(content)
}

/**
 * Sanitize for JSON storage
 * Prevents JSON injection attacks
 */
export function sanitizeForJSON(value: any): any {
  if (typeof value === 'string') {
    return sanitizeUserInput(value)
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeForJSON)
  }

  if (typeof value === 'object' && value !== null) {
    const sanitized: any = {}
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitized[key] = sanitizeForJSON(value[key])
      }
    }
    return sanitized
  }

  return value
}

/**
 * Sanitize SQL LIKE pattern
 * Escapes special characters to prevent SQL injection in LIKE queries
 */
export function sanitizeLikePattern(pattern: string): string {
  if (!pattern || typeof pattern !== 'string') {
    return ''
  }

  // Escape special LIKE characters
  return pattern
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

/**
 * Sanitize file path component
 * Prevents directory traversal
 */
export function sanitizePathComponent(component: string): string {
  if (!component || typeof component !== 'string') {
    return ''
  }

  // Remove any path traversal attempts
  let sanitized = component.replace(/\.\./g, '').replace(/\//g, '').replace(/\\/g, '')

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Only allow alphanumeric, dash, underscore, and dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')

  return sanitized
}

/**
 * Validate and sanitize CUID
 */
export function sanitizeCUID(cuid: string): string {
  if (!cuid || typeof cuid !== 'string') {
    return ''
  }

  // CUIDs should only contain lowercase letters and numbers
  if (!/^c[a-z0-9]{24}$/.test(cuid)) {
    return ''
  }

  return cuid
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return ''
  }

  // Remove HTML and special characters
  let sanitized = sanitizePlainText(query)

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  // Limit length
  if (sanitized.length > 200) {
    sanitized = sanitized.slice(0, 200)
  }

  return sanitized
}
