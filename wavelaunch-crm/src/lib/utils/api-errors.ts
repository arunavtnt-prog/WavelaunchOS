/**
 * API Error Handling Utilities
 * Provides consistent error handling across all API routes and client-side API calls
 */

import { NextResponse } from 'next/server'

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  details?: any
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: any,
  fallbackMessage: string = 'An unexpected error occurred'
): NextResponse<ErrorResponse> {
  console.error('API Error:', error)

  // Handle APIError instances
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.name,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }

  // Handle Prisma errors
  if (error.code && error.code.startsWith('P')) {
    const message = getPrismaErrorMessage(error.code)
    return NextResponse.json(
      {
        error: 'DatabaseError',
        message,
        statusCode: 500,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    return NextResponse.json(
      {
        error: 'ValidationError',
        message: 'Invalid request data',
        statusCode: 400,
        details: error.errors,
      },
      { status: 400 }
    )
  }

  // Handle generic errors
  const statusCode = error.statusCode || error.status || 500
  const message = error.message || fallbackMessage

  return NextResponse.json(
    {
      error: error.name || 'Error',
      message,
      statusCode,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    { status: statusCode }
  )
}

/**
 * Get user-friendly error message for Prisma error codes
 */
function getPrismaErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    P2000: 'The value provided is too long for the database field',
    P2001: 'Record not found',
    P2002: 'A record with this value already exists',
    P2003: 'Foreign key constraint failed',
    P2004: 'Database constraint failed',
    P2005: 'Invalid value for database field type',
    P2006: 'The provided value is not valid',
    P2007: 'Data validation error',
    P2008: 'Failed to parse query',
    P2009: 'Failed to validate query',
    P2010: 'Raw query failed',
    P2011: 'Null constraint violation',
    P2012: 'Missing required value',
    P2013: 'Missing required argument',
    P2014: 'Relation violation',
    P2015: 'Related record not found',
    P2016: 'Query interpretation error',
    P2017: 'Records not connected',
    P2018: 'Required connected records not found',
    P2019: 'Input error',
    P2020: 'Value out of range',
    P2021: 'Table does not exist',
    P2022: 'Column does not exist',
    P2023: 'Inconsistent column data',
    P2024: 'Connection pool timeout',
    P2025: 'Record to delete does not exist',
  }

  return errorMessages[code] || 'Database operation failed'
}

/**
 * Create success response with standardized format
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<{ success: true; data: T; message?: string }> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status: statusCode }
  )
}

/**
 * Wrap async API route handlers with error handling
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse<R | ErrorResponse>> => {
    try {
      return await handler(...args)
    } catch (error: any) {
      return createErrorResponse(error)
    }
  }
}

/**
 * Client-side API call wrapper with error handling
 */
export async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(
        response.status,
        data.message || 'Request failed',
        data.details
      )
    }

    return data.data || data
  } catch (error: any) {
    if (error instanceof APIError) {
      throw error
    }

    // Network error or other fetch error
    throw new APIError(
      500,
      error.message || 'Network error occurred'
    )
  }
}

/**
 * Common HTTP status codes for easy reference
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to perform this action',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_FAILED: 'Validation failed. Please check your input',
  SERVER_ERROR: 'An internal server error occurred',
  NETWORK_ERROR: 'Network error. Please check your connection',
} as const
