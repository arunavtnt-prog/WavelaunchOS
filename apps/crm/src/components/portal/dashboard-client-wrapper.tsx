'use client'

import { ReactNode } from 'react'
import { FirstTimeWelcome } from './first-time-welcome'

interface DashboardClientWrapperProps {
  children: ReactNode
  clientName: string
  brandName?: string | null
  showWelcome: boolean
}

export function DashboardClientWrapper({
  children,
  clientName,
  brandName,
  showWelcome,
}: DashboardClientWrapperProps) {
  return (
    <>
      {showWelcome && (
        <FirstTimeWelcome
          clientName={clientName}
          brandName={brandName || undefined}
        />
      )}
      {children}
    </>
  )
}
