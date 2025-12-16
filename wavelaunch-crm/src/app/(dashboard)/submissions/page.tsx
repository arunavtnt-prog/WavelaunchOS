'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SubmissionsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/applications')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to Applications...</p>
      </div>
    </div>
  )
}
