/**
 * API Client Utilities
 *
 * Centralized fetch wrapper with CSRF protection, error handling, and retry logic.
 */

/**
 * Get CSRF token from cookie
 */
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  const csrfCookie = cookies.find((c) => c.trim().startsWith('csrf-token='))

  if (!csrfCookie) return null

  return csrfCookie.split('=')[1]
}

export interface FetchOptions extends RequestInit {
  retry?: number
  timeout?: number
}

/**
 * Enhanced fetch with CSRF protection, error handling, and retry logic
 */
export async function apiClient(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retry = 0, timeout = 30000, ...fetchOptions } = options

  // Add CSRF token to all state-changing requests
  const method = fetchOptions.method?.toUpperCase() || 'GET'
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'x-csrf-token': csrfToken,
      }
    }
  }

  // Add content-type for JSON requests
  if (fetchOptions.body && typeof fetchOptions.body === 'string') {
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    }
  }

  // Timeout wrapper
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  fetchOptions.signal = controller.signal

  try {
    const response = await fetch(url, fetchOptions)
    clearTimeout(timeoutId)

    // Handle CSRF errors
    if (response.status === 403) {
      const data = await response.json().catch(() => ({}))
      if (data.error?.includes('CSRF')) {
        console.error('CSRF token invalid or missing. Refreshing page...')
        // Could trigger a page refresh or re-fetch CSRF token
      }
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    // Retry logic for network errors
    if (retry > 0 && error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }

      // Retry with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, 3 - retry) * 1000)
      )
      return apiClient(url, { ...options, retry: retry - 1 })
    }

    throw error
  }
}

/**
 * Typed API client methods
 */
export const api = {
  async get<T>(url: string, options?: FetchOptions): Promise<T> {
    const response = await apiClient(url, { ...options, method: 'GET' })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  },

  async post<T>(url: string, data?: any, options?: FetchOptions): Promise<T> {
    const response = await apiClient(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: response.statusText,
      }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    return response.json()
  },

  async put<T>(url: string, data?: any, options?: FetchOptions): Promise<T> {
    const response = await apiClient(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: response.statusText,
      }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    return response.json()
  },

  async patch<T>(url: string, data?: any, options?: FetchOptions): Promise<T> {
    const response = await apiClient(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: response.statusText,
      }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    return response.json()
  },

  async delete<T>(url: string, options?: FetchOptions): Promise<T> {
    const response = await apiClient(url, { ...options, method: 'DELETE' })
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: response.statusText,
      }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    return response.json()
  },
}
