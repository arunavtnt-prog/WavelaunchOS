'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, FileText, ChevronRight, ArrowUpRight, MoreHorizontal, Settings } from 'lucide-react'

interface MilestoneData {
  month: string
  title: string
  status: 'complete' | 'in-progress' | 'not-started'
  icon: React.ReactNode
  description: string
}

const MilestoneCard: React.FC<MilestoneData> = ({ month, title, status, icon, description }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your 8-Month Journey</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track your progress through Wavelaunch program
          </p>
        </div>
        <Link
          href="/portal/documents"
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          View All
          <ArrowUpRight className="h-4 w-4 ml-2" />
        </Link>
      </div>

      <div className="space-y-4">
        {/* Progress Overview */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-2">Progress</p>
            <p className="text-5xl font-bold text-gray-900 tracking-tight">62%</p>
            <p className="text-sm text-gray-500">5 of 8 milestones</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-2">Est. Completion</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">Oct 2026</p>
            <p className="text-sm text-gray-500">In 6 months</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {[
            {
              month: 'M1',
              title: 'Onboarding & Setup',
              status: 'complete' as const,
              icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
              description: 'Complete onboarding questionnaire and initial setup',
            },
            {
              month: 'M2',
              title: 'Brand Foundation',
              status: 'complete' as const,
              icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
              description: 'Establish brand identity and core messaging',
            },
            {
              month: 'M3',
              title: 'Content Strategy',
              status: 'in-progress' as const,
              icon: <Clock className="h-5 w-5 text-[#2563EB]" />,
              description: 'Develop comprehensive content calendar and guidelines',
            },
            {
              month: 'M4',
              title: 'Launch Planning',
              status: 'not-started' as const,
              icon: <Clock className="h-5 w-5 text-gray-400" />,
              description: 'Prepare for major product or service launch',
            },
            {
              month: 'M5',
              title: 'Product Launch',
              status: 'not-started' as const,
              icon: <Clock className="h-5 w-5 text-gray-400" />,
              description: 'Execute go-to-market strategy',
            },
            {
              month: 'M6',
              title: 'Growth Phase 1',
              status: 'not-started' as const,
              icon: <Clock className="h-5 w-5 text-gray-400" />,
              description: 'Scale audience and optimize conversions',
            },
            {
              month: 'M7',
              title: 'Growth Phase 2',
              status: 'not-started' as const,
              icon: <Clock className="h-5 w-5 text-gray-400" />,
              description: 'Expand to new platforms and markets',
            },
            {
              month: 'M8',
              title: 'Completion & Scale',
              status: 'not-started' as const,
              icon: <Clock className="h-5 w-5 text-gray-400" />,
              description: 'Final deliverables and long-term growth plan',
            },
          ].map((item) => (
            <div
              key={item.month}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#2563EB] hover:bg-gray-50 transition-all cursor-pointer"
            >
              <div className="mt-0.5 flex-shrink-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  {icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-1">{item.month}</p>
                <p className="text-xs text-gray-500 line-clamp-1">{item.title}</p>
                <span
                  className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-2 ${
                    item.status === 'complete'
                      ? 'bg-green-500 text-white'
                      : item.status === 'in-progress'
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {item.status === 'complete'
                    ? 'Complete'
                    : item.status === 'in-progress'
                    ? 'In Progress'
                    : 'Not Started'}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText className="h-4 w-4" />
          <p>
            View detailed business plan and all deliverables in the{' '}
            <Link href="/portal/documents" className="text-[#2563EB] hover:underline font-medium">
              Documents section
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Progress</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6 max-w-7xl">
        <MilestoneCard
          month="Current"
          title="8-Month Program Journey"
          status="in-progress"
          icon={<Clock className="h-5 w-5 text-[#2563EB]" />}
          description="You're on track to complete your creator journey"
        />
      </div>
    </div>
  )
}
