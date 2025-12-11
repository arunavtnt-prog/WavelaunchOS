/**
 * Performance Monitoring Middleware
 *
 * Tracks request timing, slow queries, and performance metrics.
 * Integrates with logging system for analysis.
 */

import { NextRequest, NextResponse } from 'next/server'
import { logInfo, logWarn } from '@/lib/logging/logger'

// Performance thresholds (in milliseconds)
export const PERF_THRESHOLDS = {
  FAST: 100,       // < 100ms is fast
  NORMAL: 500,     // < 500ms is acceptable
  SLOW: 1000,      // < 1s is slow
  VERY_SLOW: 3000, // > 3s is very slow
} as const

// Performance metrics storage (in-memory)
class PerformanceTracker {
  private metrics: Map<string, number[]> = new Map()
  private maxSamples = 1000 // Keep last 1000 samples per endpoint

  recordTiming(endpoint: string, duration: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, [])
    }

    const timings = this.metrics.get(endpoint)!
    timings.push(duration)

    // Keep only last N samples
    if (timings.length > this.maxSamples) {
      timings.shift()
    }
  }

  getStats(endpoint: string): {
    count: number
    avg: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
  } | null {
    const timings = this.metrics.get(endpoint)
    if (!timings || timings.length === 0) return null

    const sorted = [...timings].sort((a, b) => a - b)
    const count = sorted.length

    return {
      count,
      avg: sorted.reduce((a, b) => a + b, 0) / count,
      min: sorted[0],
      max: sorted[count - 1],
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    }
  }

  getAllStats(): Map<string, ReturnType<typeof this.getStats>> {
    const allStats = new Map()
    const keys = Array.from(this.metrics.keys())
    for (const endpoint of keys) {
      allStats.set(endpoint, this.getStats(endpoint))
    }
    return allStats
  }

  getSlowestEndpoints(limit: number = 10): Array<{
    endpoint: string
    avgTime: number
    count: number
  }> {
    const endpoints: Array<{ endpoint: string; avgTime: number; count: number }> = []

    const entries = Array.from(this.metrics.entries())
    for (const [endpoint, timings] of entries) {
      if (timings.length === 0) continue
      const avg = timings.reduce((a, b) => a + b, 0) / timings.length
      endpoints.push({ endpoint, avgTime: avg, count: timings.length })
    }

    return endpoints
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit)
  }

  clear(): void {
    this.metrics.clear()
  }
}

export const perfTracker = new PerformanceTracker()

/**
 * Performance timing middleware
 * Wraps API route handlers to track timing
 */
export function withPerformanceTracking(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    endpoint?: string
    logSlow?: boolean
    threshold?: number
  } = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now()
    const { endpoint = req.nextUrl.pathname, logSlow = true, threshold = PERF_THRESHOLDS.SLOW } = options

    try {
      // Execute handler
      const response = await handler(req, context)

      // Calculate duration
      const duration = Date.now() - startTime

      // Record timing
      perfTracker.recordTiming(endpoint, duration)

      // Add performance headers
      response.headers.set('X-Response-Time', `${duration}ms`)
      response.headers.set('X-Endpoint', endpoint)

      // Log slow requests
      if (logSlow && duration > threshold) {
        logWarn(`Slow request detected: ${endpoint}`, {
          duration,
          method: req.method,
          threshold,
        })
      }

      // Log timing (debug level)
      const level = duration < PERF_THRESHOLDS.FAST ? 'fast' : duration < PERF_THRESHOLDS.NORMAL ? 'normal' : 'slow'
      logInfo(`Request completed: ${endpoint}`, {
        duration,
        level,
        method: req.method,
        status: response.status,
      })

      return response
    } catch (error) {
      // Still record timing for failed requests
      const duration = Date.now() - startTime
      perfTracker.recordTiming(`${endpoint}:error`, duration)

      throw error
    }
  }
}

/**
 * Request timing utility
 * For manual timing within route handlers
 */
export class RequestTimer {
  private startTime: number
  private checkpoints: Map<string, number> = new Map()

  constructor() {
    this.startTime = Date.now()
  }

  /**
   * Record a checkpoint
   */
  checkpoint(name: string): void {
    this.checkpoints.set(name, Date.now() - this.startTime)
  }

  /**
   * Get elapsed time
   */
  elapsed(): number {
    return Date.now() - this.startTime
  }

  /**
   * Get all checkpoints
   */
  getCheckpoints(): Record<string, number> {
    const result: Record<string, number> = {}
    const entries = Array.from(this.checkpoints.entries())
    for (const [name, time] of entries) {
      result[name] = time
    }
    return result
  }

  /**
   * Log all checkpoints
   */
  log(endpoint: string): void {
    const total = this.elapsed()
    const checkpoints = this.getCheckpoints()

    logInfo(`Request timing breakdown: ${endpoint}`, {
      total,
      checkpoints,
    })
  }
}

/**
 * Database query profiler
 * Track slow database queries
 */
export class QueryProfiler {
  private queries: Array<{
    query: string
    duration: number
    timestamp: number
  }> = []
  private maxQueries = 100

  recordQuery(query: string, duration: number): void {
    this.queries.push({
      query,
      duration,
      timestamp: Date.now(),
    })

    // Keep only recent queries
    if (this.queries.length > this.maxQueries) {
      this.queries.shift()
    }

    // Log slow queries
    if (duration > 100) {
      logWarn('Slow database query detected', {
        query: query.substring(0, 200), // Truncate long queries
        duration,
      })
    }
  }

  getSlowestQueries(limit: number = 10): Array<{
    query: string
    duration: number
  }> {
    return [...this.queries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map(({ query, duration }) => ({ query, duration }))
  }

  clear(): void {
    this.queries = []
  }
}

export const queryProfiler = new QueryProfiler()

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * Get overall performance stats
   */
  getStats() {
    const allStats = perfTracker.getAllStats()
    const slowest = perfTracker.getSlowestEndpoints(10)

    return {
      endpoints: Object.fromEntries(allStats),
      slowest,
      totalEndpoints: allStats.size,
    }
  },

  /**
   * Get slow queries
   */
  getSlowQueries(limit: number = 10) {
    return queryProfiler.getSlowestQueries(limit)
  },

  /**
   * Clear all performance data
   */
  clear() {
    perfTracker.clear()
    queryProfiler.clear()
    logInfo('Performance metrics cleared')
  },

  /**
   * Get health summary
   */
  getHealthSummary(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    avgResponseTime: number
    slowEndpoints: number
    details: string[]
  } {
    const slowest = perfTracker.getSlowestEndpoints(100)
    const avgResponseTime =
      slowest.length > 0
        ? slowest.reduce((sum, e) => sum + e.avgTime, 0) / slowest.length
        : 0

    const slowEndpoints = slowest.filter((e) => e.avgTime > PERF_THRESHOLDS.SLOW).length

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    const details: string[] = []

    if (avgResponseTime > PERF_THRESHOLDS.VERY_SLOW) {
      status = 'unhealthy'
      details.push(`High average response time: ${Math.round(avgResponseTime)}ms`)
    } else if (avgResponseTime > PERF_THRESHOLDS.SLOW) {
      status = 'degraded'
      details.push(`Elevated average response time: ${Math.round(avgResponseTime)}ms`)
    }

    if (slowEndpoints > 5) {
      status = status === 'healthy' ? 'degraded' : 'unhealthy'
      details.push(`${slowEndpoints} slow endpoints detected`)
    }

    return {
      status,
      avgResponseTime: Math.round(avgResponseTime),
      slowEndpoints,
      details,
    }
  },
}
