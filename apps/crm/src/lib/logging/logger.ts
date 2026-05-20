/**
 * Structured Logging System
 *
 * Provides structured logging with different levels and automatic redaction
 * of sensitive information.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  requestId?: string
  userId?: string
  ip?: string
  method?: string
  path?: string
  statusCode?: number
  duration?: number
  [key: string]: any
}

/**
 * Sensitive fields to redact from logs
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
  'session',
]

/**
 * Redact sensitive information from objects
 */
function redactSensitive(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitive)
  }

  const redacted: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()
    const isSensitive = SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))

    if (isSensitive) {
      redacted[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value)
    } else {
      redacted[key] = value
    }
  }

  return redacted
}

/**
 * Format log entry
 */
function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString()
  const redactedContext = context ? redactSensitive(context) : {}

  const logEntry = {
    timestamp,
    level,
    message,
    ...redactedContext,
  }

  // In production, send to log aggregation service
  // For now, output to console
  return JSON.stringify(logEntry)
}

/**
 * Check if log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  const currentLevel = process.env.LOG_LEVEL || 'info'

  const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  return levels[level] >= levels[currentLevel as keyof typeof levels]
}

/**
 * Log debug message
 */
export function logDebug(message: string, context?: LogContext): void {
  if (shouldLog(LogLevel.DEBUG)) {
    console.log(formatLog(LogLevel.DEBUG, message, context))
  }
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: LogContext): void {
  if (shouldLog(LogLevel.INFO)) {
    console.log(formatLog(LogLevel.INFO, message, context))
  }
}

/**
 * Log warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  if (shouldLog(LogLevel.WARN)) {
    console.warn(formatLog(LogLevel.WARN, message, context))
  }
}

/**
 * Log error message
 */
export function logError(message: string, error?: Error, context?: LogContext): void {
  if (shouldLog(LogLevel.ERROR)) {
    const errorContext = error
      ? {
          ...context,
          error: {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            name: error.name,
          },
        }
      : context

    console.error(formatLog(LogLevel.ERROR, message, errorContext))
  }
}

/**
 * Log API request
 */
export function logRequest(context: LogContext): void {
  logInfo('API Request', context)
}

/**
 * Log API response
 */
export function logResponse(context: LogContext): void {
  const level = context.statusCode && context.statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO
  const message = `API Response - ${context.statusCode}`

  if (level === LogLevel.WARN) {
    logWarn(message, context)
  } else {
    logInfo(message, context)
  }
}

/**
 * Log authentication event
 */
export function logAuth(
  event: 'login_success' | 'login_failed' | 'logout' | 'session_expired',
  context: LogContext
): void {
  logInfo(`Auth Event: ${event}`, context)
}

/**
 * Log security event
 */
export function logSecurity(event: string, context: LogContext): void {
  logWarn(`Security Event: ${event}`, context)
}

/**
 * Generate request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
