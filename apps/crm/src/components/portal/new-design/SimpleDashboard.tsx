'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, ChevronRight, FileText, MessageSquare, User, Target, Edit, TrendingUp } from 'lucide-react'

const monthStatuses = [
  { month: 'M1', title: 'Onboarding & Setup', status: 'complete' as const },
  { month: 'M2', title: 'Brand Foundation', status: 'complete' as const },
  { month: 'M3', title: 'Content Strategy', status: 'complete' as const },
  { month: 'M4', title: 'Launch Planning', status: 'complete' as const },
  { month: 'M5', title: 'Product Launch', status: 'in-progress' as const },
  { month: 'M6', title: 'Growth Phase 1', status: 'not-started' as const },
  { month: 'M7', title: 'Growth Phase 2', status: 'not-started' as const },
  { month: 'M8', title: 'Completion & Scale', status: 'not-started' as const },
]

export default function PortalDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white md:col-span-2">
            <h2 className="text-2xl font-bold">Creator Profile</h2>
            <p className="text-white/70">Welcome back!</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold">Campaign Engagement</h3>
            <p className="text-gray-500">Detailed report</p>
          </div>

          <div className="bg-blue-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold">Recommendations</h3>
            <p className="text-white/80">AI-powered insights</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Your 8-Month Journey</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {monthStatuses.map((item) => (
                <div key={item.month} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">{item.month}</p>
                  <p className="text-xs text-gray-500">{item.title}</p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-2 bg-gray-200 text-gray-700">
                    {item.status === 'complete' ? 'Complete' : item.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Link href="/portal/documents" className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-600">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">View Documents</p>
                </div>
              </Link>

              <Link href="/portal/messages" className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-600">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Send Message</p>
                </div>
              </Link>

              <Link href="/portal/progress" className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-600">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">View Progress</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
