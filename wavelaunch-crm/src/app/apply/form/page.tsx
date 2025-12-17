'use client'

import dynamic from 'next/dynamic'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const ApplicationFormRoot = dynamic(() => import('@/modules/application-form').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
})

export default function ApplyFormPage() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="wavelaunch-theme">
      <ApplicationFormRoot />
      <Toaster />
    </ThemeProvider>
  )
}
