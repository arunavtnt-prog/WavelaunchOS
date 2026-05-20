import { useState } from "react"

export type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (options: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...options, id }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return {
    toast,
    toasts,
    dismiss: (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }
  }
}
