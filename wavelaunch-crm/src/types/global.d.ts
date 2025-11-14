import { ToastVariant } from '@/components/ui/toast-provider'

declare global {
  interface Window {
    toast: (toast: {
      title: string
      description?: string
      variant?: ToastVariant
    }) => void
  }
}

export {}
