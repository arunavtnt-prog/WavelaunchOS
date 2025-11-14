'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <Loader2
      className={cn('animate-spin text-gray-500', sizeClasses[size], className)}
    />
  )
}

interface LoadingOverlayProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingOverlay({
  message = 'Loading...',
  fullScreen = false,
}: LoadingOverlayProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="xl" />
          <p className="text-sm font-medium text-gray-700">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-gray-600">{message}</p>
      </div>
    </div>
  )
}

interface LoadingStateProps {
  loading: boolean
  error?: string | null
  children: React.ReactNode
  loadingMessage?: string
  fullScreen?: boolean
}

/**
 * Wrapper component that handles loading and error states
 */
export function LoadingState({
  loading,
  error,
  children,
  loadingMessage,
  fullScreen,
}: LoadingStateProps) {
  if (loading) {
    return <LoadingOverlay message={loadingMessage} fullScreen={fullScreen} />
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-800">Error: {error}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Page skeleton loader for better perceived performance
 */
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="h-10 w-32 rounded bg-gray-200" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="h-4 w-4/6 rounded bg-gray-200" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
            <div className="h-8 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Card skeleton for list items
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-gray-200" />
              <div className="h-3 w-64 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Inline loading button state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export function LoadingButton({
  loading,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        loading && 'cursor-not-allowed opacity-70',
        className
      )}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}
