import { Toast } from "@/components/ui/toast"

export function useToast() {
  return {
    toast: (options: any) => {
      console.log('Toast:', options)
      // In a real implementation, this would show a toast notification
      // For now, we'll just log it
    }
  }
}
