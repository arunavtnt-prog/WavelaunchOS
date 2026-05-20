import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply - Wavelaunch Studio',
  description: 'Apply to work with Wavelaunch Studio - Creator Partnership Application',
}

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
