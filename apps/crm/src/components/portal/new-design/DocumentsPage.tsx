'use client'

import React from 'react'
import Link from 'next/link'
import { FileText, Calendar, Download, ExternalLink, ChevronRight, CheckCircle2, Clock } from 'lucide-react'

interface BusinessPlanCardProps {
  title: string
  version: string
  status: 'approved' | 'delivered' | 'pending'
  date: string
}

const BusinessPlanCard: React.FC<BusinessPlanCardProps> = ({ title, version, status, date }) => {
  const statusConfig = {
    approved: {
      badge: 'Approved',
      badgeColor: 'bg-green-500 text-white',
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    },
    delivered: {
      badge: 'Delivered',
      badgeColor: 'bg-green-500 text-white',
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    },
    pending: {
      badge: 'In Progress',
      badgeColor: 'bg-blue-600 text-white',
      icon: <Clock className="h-4 w-4 text-[#2563EB]" />,
    },
  }

  const config = statusConfig[status]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">Version {version}</p>
        </div>
        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${config.badgeColor}`}>
          {config.badge}
        </span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <div className="flex-1">
          <p className="text-xs text-gray-500">Created {date}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-sm font-medium py-2.5 rounded-lg transition-colors">
          <FileText className="h-4 w-4" />
          View
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-sm font-medium py-2.5 rounded-lg transition-colors">
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  )
}

interface DeliverableCardProps {
  title: string
  month: string
  status: 'delivered' | 'approved' | 'in-progress' | 'pending'
}

const DeliverableCard: React.FC<DeliverableCardProps> = ({ title, month, status }) => {
  const statusConfig = {
    delivered: {
      badge: 'Delivered',
      badgeColor: 'bg-green-500 text-white',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    },
    approved: {
      badge: 'Approved',
      badgeColor: 'bg-green-500 text-white',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    },
    'in-progress': {
      badge: 'In Progress',
      badgeColor: 'bg-blue-600 text-white',
      icon: <Clock className="h-5 w-5 text-[#2563EB]" />,
    },
    pending: {
      badge: 'Not Started',
      badgeColor: 'bg-gray-200 text-gray-700',
      icon: <Clock className="h-5 w-5 text-gray-400" />,
    },
  }

  const config = statusConfig[status]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-1">{month}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{title}</p>
          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-2 ${config.badgeColor}`}>
            {config.badge}
          </span>
        </div>
        <Link
          href="#"
          className="mt-3 flex items-center gap-2 text-[#2563EB] hover:underline text-sm font-medium"
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  // Mock data for demonstration
  const businessPlans = [
    {
      title: 'Your Business Plan',
      version: '1.0',
      status: 'approved' as const,
      date: 'Jan 2024',
    },
  ]

  const deliverables = [
    {
      title: 'Onboarding & Setup',
      month: 'M1',
      status: 'delivered' as const,
    },
    {
      title: 'Brand Foundation',
      month: 'M2',
      status: 'approved' as const,
    },
    {
      title: 'Content Strategy',
      month: 'M3',
      status: 'in-progress' as const,
    },
    {
      title: 'Launch Planning',
      month: 'M4',
      status: 'pending' as const,
    },
    {
      title: 'Product Launch',
      month: 'M5',
      status: 'pending' as const,
    },
    {
      title: 'Growth Phase 1',
      month: 'M6',
      status: 'pending' as const,
    },
    {
      title: 'Growth Phase 2',
      month: 'M7',
      status: 'pending' as const,
    },
    {
      title: 'Completion & Scale',
      month: 'M8',
      status: 'pending' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6 max-w-7xl">
        {/* Business Plans Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Business Plans</h2>
              <p className="text-sm text-gray-500">Your personalized business plan documents</p>
            </div>
            <button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg transition-colors">
              Create New
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {businessPlans.map((plan) => (
              <BusinessPlanCard key={plan.version} {...plan} />
            ))}
          </div>
        </div>

        {/* Deliverables Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Deliverables</h2>
              <p className="text-sm text-gray-500">Track your monthly milestones and submissions</p>
            </div>
            <button className="bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-sm px-4 py-2 rounded-lg transition-colors">
              Filter
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {deliverables.map((del) => (
              <DeliverableCard key={del.month} {...del} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium py-3 rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            Download All
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-3 rounded-lg transition-colors">
            <ExternalLink className="h-4 w-4" />
            Request Changes
          </button>
        </div>
      </div>
    </div>
  )
}
