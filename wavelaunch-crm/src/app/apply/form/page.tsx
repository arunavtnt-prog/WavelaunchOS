'use client'

import dynamic from 'next/dynamic'

const ApplicationFormRoot = dynamic(() => import('@/modules/application-form').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
})

export default function ApplyFormPage() {
  return <ApplicationFormRoot />
}
