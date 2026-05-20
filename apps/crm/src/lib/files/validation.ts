/**
 * File Upload Security Validation
 *
 * Validates uploaded files beyond MIME type checking.
 * Prevents malicious file uploads, path traversal, and other attacks.
 */

import path from 'path'
import { readFile } from 'fs/promises'

/**
 * Allowed file types and their magic numbers (file signatures)
 */
const FILE_SIGNATURES: Record<string, string[]> = {
  // Images
  'image/jpeg': ['FFD8FF'],
  'image/png': ['89504E47'],
  'image/gif': ['474946383761', '474946383961'], // GIF87a, GIF89a
  'image/webp': ['52494646'],

  // Documents
  'application/pdf': ['25504446'],
  'application/zip': ['504B0304', '504B0506', '504B0708'],

  // Microsoft Office
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '504B0304',
  ], // DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
    '504B0304',
  ], // XLSX
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': [
    '504B0304',
  ], // PPTX

  // Text
  'text/plain': [], // No signature check for text files
  'text/csv': [],
  'application/json': [],
}

/**
 * Maximum file sizes by type (in bytes)
 */
export const MAX_FILE_SIZES: Record<string, number> = {
  'image/jpeg': 10 * 1024 * 1024, // 10MB
  'image/png': 10 * 1024 * 1024, // 10MB
  'image/gif': 5 * 1024 * 1024, // 5MB
  'image/webp': 10 * 1024 * 1024, // 10MB
  'application/pdf': 50 * 1024 * 1024, // 50MB
  'application/zip': 25 * 1024 * 1024, // 25MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    25 * 1024 * 1024, // 25MB
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    25 * 1024 * 1024, // 25MB
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    50 * 1024 * 1024, // 50MB
  'text/plain': 5 * 1024 * 1024, // 5MB
  'text/csv': 10 * 1024 * 1024, // 10MB
  'application/json': 5 * 1024 * 1024, // 5MB
  default: 25 * 1024 * 1024, // 25MB default
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path components
  let sanitized = path.basename(filename)

  // Remove any non-alphanumeric characters except dots, dashes, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')

  // Prevent double extensions and hidden files
  sanitized = sanitized.replace(/\.{2,}/g, '.')

  // Ensure filename doesn't start with a dot
  if (sanitized.startsWith('.')) {
    sanitized = '_' + sanitized
  }

  // Limit filename length
  const maxLength = 255
  const ext = path.extname(sanitized)
  const nameWithoutExt = path.basename(sanitized, ext)

  if (sanitized.length > maxLength) {
    const truncatedName = nameWithoutExt.slice(0, maxLength - ext.length - 3) + '...'
    sanitized = truncatedName + ext
  }

  return sanitized
}

/**
 * Validate file MIME type against allowed types
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return Object.keys(FILE_SIGNATURES).includes(mimeType)
}

/**
 * Get file magic number (first few bytes) as hex string
 */
export async function getFileMagicNumber(
  filePath: string,
  bytesToRead: number = 8
): Promise<string> {
  try {
    const buffer = await readFile(filePath)
    const bytes = buffer.slice(0, bytesToRead)
    return bytes.toString('hex').toUpperCase()
  } catch (error) {
    throw new Error('Failed to read file magic number')
  }
}

/**
 * Verify file content matches declared MIME type using magic numbers
 */
export async function verifyFileContent(
  filePath: string,
  declaredMimeType: string
): Promise<boolean> {
  // Skip verification for types without signatures
  const signatures = FILE_SIGNATURES[declaredMimeType]
  if (!signatures || signatures.length === 0) {
    return true // Allow files without signature checks
  }

  try {
    const magicNumber = await getFileMagicNumber(filePath)

    // Check if magic number matches any of the allowed signatures
    return signatures.some((sig) => magicNumber.startsWith(sig))
  } catch (error) {
    console.error('File content verification failed:', error)
    return false
  }
}

/**
 * Validate file size against limits
 */
export function validateFileSize(fileSize: number, mimeType: string): boolean {
  const maxSize = MAX_FILE_SIZES[mimeType] || MAX_FILE_SIZES.default
  return fileSize <= maxSize
}

/**
 * Check for dangerous file extensions
 */
export function hasDangerousExtension(filename: string): boolean {
  const dangerousExtensions = [
    '.exe',
    '.bat',
    '.cmd',
    '.sh',
    '.ps1',
    '.msi',
    '.dll',
    '.scr',
    '.vbs',
    '.jar',
    '.app',
    '.deb',
    '.rpm',
    '.dmg',
  ]

  const ext = path.extname(filename).toLowerCase()
  return dangerousExtensions.includes(ext)
}

/**
 * Comprehensive file validation
 */
export interface FileValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  sanitizedFilename: string
}

export async function validateUploadedFile(
  file: {
    filename: string
    mimeType: string
    size: number
    path: string
  }
): Promise<FileValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.filename)

  // Check for dangerous extensions
  if (hasDangerousExtension(file.filename)) {
    errors.push('Executable files are not allowed')
  }

  // Validate MIME type
  if (!isAllowedMimeType(file.mimeType)) {
    errors.push(`File type '${file.mimeType}' is not allowed`)
  }

  // Validate file size
  if (!validateFileSize(file.size, file.mimeType)) {
    const maxSize = MAX_FILE_SIZES[file.mimeType] || MAX_FILE_SIZES.default
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
    errors.push(`File size exceeds maximum allowed size of ${maxSizeMB}MB`)
  }

  // Verify file content matches declared type
  if (errors.length === 0) {
    const contentValid = await verifyFileContent(file.path, file.mimeType)
    if (!contentValid) {
      errors.push('File content does not match declared file type')
    }
  }

  // Warn if filename was changed
  if (sanitizedFilename !== file.filename) {
    warnings.push('Filename was sanitized for security reasons')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedFilename,
  }
}

/**
 * Generate safe upload path
 */
export function generateSafeUploadPath(
  baseDir: string,
  clientId: string,
  sanitizedFilename: string
): string {
  // Use client ID as subdirectory
  const clientDir = path.join(baseDir, clientId)

  // Add timestamp to prevent filename collisions
  const timestamp = Date.now()
  const ext = path.extname(sanitizedFilename)
  const nameWithoutExt = path.basename(sanitizedFilename, ext)
  const uniqueFilename = `${nameWithoutExt}_${timestamp}${ext}`

  return path.join(clientDir, uniqueFilename)
}
