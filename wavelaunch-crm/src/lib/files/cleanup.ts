import * as fs from 'fs/promises'
import * as path from 'path'
import type { JobResult } from '@/types'

/**
 * Clean up temporary files older than 24 hours
 */
export async function cleanupTempFiles(): Promise<JobResult> {
  try {
    const tempDir = path.join(process.cwd(), 'data', 'temp')

    // Ensure temp directory exists
    try {
      await fs.access(tempDir)
    } catch (error) {
      // Directory doesn't exist, nothing to clean
      return {
        success: true,
        filesDeleted: 0,
        message: 'Temp directory does not exist',
      }
    }

    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    let filesDeleted = 0
    let errors = 0

    // Read all files in temp directory
    const files = await fs.readdir(tempDir)

    for (const file of files) {
      const filePath = path.join(tempDir, file)

      try {
        const stats = await fs.stat(filePath)

        // Check if file is older than 24 hours
        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath)
          filesDeleted++
          console.log(`Deleted temp file: ${file}`)
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error)
        errors++
      }
    }

    return {
      success: true,
      filesDeleted,
      errors,
      message: `Cleaned up ${filesDeleted} temp file(s)`,
    }
  } catch (error: any) {
    console.error('Error cleaning up temp files:', error)
    return {
      success: false,
      error: error.message || 'Failed to cleanup temp files',
    }
  }
}

/**
 * Get temp directory size
 */
export async function getTempDirSize(): Promise<number> {
  try {
    const tempDir = path.join(process.cwd(), 'data', 'temp')
    const files = await fs.readdir(tempDir)

    let totalSize = 0
    for (const file of files) {
      const filePath = path.join(tempDir, file)
      try {
        const stats = await fs.stat(filePath)
        if (stats.isFile()) {
          totalSize += stats.size
        }
      } catch (error) {
        // Skip files that can't be accessed
        continue
      }
    }

    return totalSize
  } catch (error) {
    return 0
  }
}
