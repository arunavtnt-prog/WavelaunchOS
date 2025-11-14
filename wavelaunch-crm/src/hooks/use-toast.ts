'use client'

import { useCallback, useState } from 'react'

type ToastVariant = 'default' | 'destructive' | 'warning'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface UseToastReturn {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prevToasts) => [...prevToasts, { id, title, description, variant }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return { toasts, toast, dismissToast }
}
