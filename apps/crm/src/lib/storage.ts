import { promises as fs } from 'fs'
import path from 'path'

const STORAGE_PATH = process.env.STORAGE_PATH || './data/applications'

export async function ensureStorageDirectory() {
  try {
    await fs.mkdir(STORAGE_PATH, { recursive: true })
  } catch (error) {
    console.error('Failed to create storage directory:', error)
  }
}

export async function saveZipFile(
  file: File,
  applicationId: string
): Promise<{ filepath: string; filename: string; filesize: number }> {
  await ensureStorageDirectory()

  const timestamp = Date.now()
  const filename = `${timestamp}-${file.name}`
  const filepath = path.join(STORAGE_PATH, applicationId, filename)

  // Create application directory
  await fs.mkdir(path.join(STORAGE_PATH, applicationId), { recursive: true })

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Save file
  await fs.writeFile(filepath, buffer)

  return {
    filepath,
    filename: file.name,
    filesize: file.size,
  }
}

export async function deleteZipFile(filepath: string): Promise<void> {
  try {
    await fs.unlink(filepath)
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}
