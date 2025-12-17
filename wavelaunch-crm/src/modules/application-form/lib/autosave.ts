import { ApplicationFormData } from '@/schemas/application'

const STORAGE_KEY = 'wavelaunch-application-draft'
const AUTOSAVE_DEBOUNCE = 1000 // 1 second

export function saveFormData(data: Partial<ApplicationFormData>) {
  try {
    const existing = loadFormData()
    const merged = { ...existing, ...data }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    localStorage.setItem(`${STORAGE_KEY}-timestamp`, new Date().toISOString())
  } catch (error) {
    console.error('Failed to save form data:', error)
  }
}

export function loadFormData(): Partial<ApplicationFormData> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Failed to load form data:', error)
    return {}
  }
}

export function clearFormData() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(`${STORAGE_KEY}-timestamp`)
  } catch (error) {
    console.error('Failed to clear form data:', error)
  }
}

export function getLastSaveTime(): Date | null {
  try {
    const timestamp = localStorage.getItem(`${STORAGE_KEY}-timestamp`)
    return timestamp ? new Date(timestamp) : null
  } catch (error) {
    return null
  }
}

export function hasSavedData(): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return !!data && Object.keys(JSON.parse(data)).length > 0
  } catch (error) {
    return false
  }
}
