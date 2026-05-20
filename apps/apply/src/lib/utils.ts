import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function validateZipFile(file: File): { valid: boolean; error?: string } {
  const maxSize = (parseInt(process.env.MAX_FILE_SIZE_MB || '25')) * 1024 * 1024

  if (!file.name.endsWith('.zip')) {
    return { valid: false, error: 'File must be a ZIP file' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${formatFileSize(maxSize)}` }
  }

  return { valid: true }
}
