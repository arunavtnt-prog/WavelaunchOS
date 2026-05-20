/**
 * Standardized API Response Helpers
 *
 * Provides consistent response format across all API endpoints.
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    timestamp: string
    requestId?: string
  }
}

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status: 200 }
  )
}

/**
 * Created response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 201 }
  )
}

/**
 * No content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * Bad request response (400)
 */
export function badRequestResponse(
  message: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 400 }
  )
}

/**
 * Unauthorized response (401)
 */
export function unauthorizedResponse(
  message: string = 'Authentication required'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 401 }
  )
}

/**
 * Forbidden response (403)
 */
export function forbiddenResponse(
  message: string = 'Access forbidden'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 403 }
  )
}

/**
 * Not found response (404)
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `${resource} not found`,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 404 }
  )
}

/**
 * Conflict response (409)
 */
export function conflictResponse(
  message: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'CONFLICT',
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 409 }
  )
}

/**
 * Validation error response (422)
 */
export function validationErrorResponse(
  message: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 422 }
  )
}

/**
 * Rate limit response (429)
 */
export function rateLimitResponse(
  retryAfter?: number
): NextResponse<ApiResponse> {
  const headers: Record<string, string> = {}
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString()
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 429, headers }
  )
}

/**
 * Internal server error response (500)
 */
export function serverErrorResponse(
  message: string = 'Internal server error',
  details?: any
): NextResponse<ApiResponse> {
  // Don't expose internal error details in production
  const isDev = process.env.NODE_ENV === 'development'

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
        details: isDev ? details : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  )
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError): NextResponse<ApiResponse> {
  const details = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }))

  return validationErrorResponse('Validation failed', details)
}

/**
 * Generic error handler
 */
export function handleError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  // Zod validation error
  if (error instanceof ZodError) {
    return handleZodError(error)
  }

  // Custom error types
  if (error instanceof Error) {
    if (error.name === 'UnauthorizedError') {
      return unauthorizedResponse(error.message)
    }
    if (error.name === 'ForbiddenError') {
      return forbiddenResponse(error.message)
    }
    if (error.name === 'NotFoundError') {
      return notFoundResponse(error.message)
    }
    if (error.name === 'ValidationError') {
      return validationErrorResponse(error.message)
    }
  }

  // Default server error
  return serverErrorResponse(
    'An unexpected error occurred',
    error instanceof Error ? error.message : undefined
  )
}

/**
 * Wrapper for API routes with error handling
 */
export function withErrorHandling(
  handler: (...args: any[]) => Promise<NextResponse>
) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleError(error)
    }
  }
}
