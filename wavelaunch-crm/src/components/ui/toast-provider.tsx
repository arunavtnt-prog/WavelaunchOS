'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'default' | 'destructive' | 'warning'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

const Toast = ({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const variantClasses = {
    default: 'bg-white border-gray-200',
    destructive: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }

  const textClasses = {
    default: 'text-gray-800',
    destructive: 'text-red-800',
    warning: 'text-yellow-800',
  }

  return (
    <div
      className={cn(
        'relative mb-2 flex w-full max-w-sm items-start rounded-lg border p-4 shadow-lg',
        variantClasses[toast.variant || 'default']
      )}
    >
      <div className="flex-1">
        <h3 className={cn('font-medium', textClasses[toast.variant || 'default'])}>
          {toast.title}
        </h3>
        {toast.description && (
          <p className={cn('mt-1 text-sm', textClasses[toast.variant || 'default'])}>
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export const ToastProvider = ({
  children,
  container,
}: {
  children: React.ReactNode
  container?: HTMLElement
}) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Add the toast function to window for global access
  useEffect(() => {
    // @ts-ignore
    window.toast = addToast
    return () => {
      // @ts-ignore
      delete window.toast
    }
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onDismiss={removeToast}
            />
          ))}
        </div>,
        container || document.body
      )}
    </>
  )
}
