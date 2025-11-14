import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WavelaunchOS CRM',
  description: 'AI-powered CRM for Wavelaunch Studio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  )
}
