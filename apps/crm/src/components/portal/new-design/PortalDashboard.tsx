'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, ChevronRight, FileText, MessageSquare, User, Target, Edit } from 'lucide-react'

export default function PortalDashboard() {
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

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6 max-w-7xl">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-2xl p-6 text-white md:col-span-2 shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    <User className="h-10 w-10 text-white/60" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">Verified</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">Creator Name</h2>

                <p className="text-white/70 text-sm mb-3">@username</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">Lifestyle</span>
                  <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">Content Creator</span>
                </div>

                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <Clock className="h-3 w-3 text-white" />
                  <span className="text-xs font-semibold text-white">62% Complete</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-5">
                  <div className="w-12 h-0.5 bg-white/20 rounded-full mb-4"></div>
                  <h3 className="text-lg font-semibold text-white mb-2">Your Brand</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-2">Building a community of engaged followers and creating authentic content.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/70 mb-1">Followers</p>
                    <p className="text-xl font-bold text-white">45.2K</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/70 mb-1">Active Platforms</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 bg-white/30 rounded-full"></div>
                      <div className="w-6 h-6 bg-white/30 rounded-full"></div>
                      <div className="w-6 h-6 bg-white/30 rounded-full opacity-70"></div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/70 mb-1">Days in Program</p>
                    <p className="text-xl font-bold text-white">42</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/70 mb-1">Current Level</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Target className="h-4 w-4 text-white" />
                      <span className="text-sm text-white/90">Product Launch</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-4 pt-4 border-t border-white/20">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm text-white/70">Profile Completion</span>
                      <span className="text-2xl font-bold text-white">62%</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full w-full max-w-xs">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: '62%' }}></div>
                    </div>
                    <p className="text-xs text-white/70 mt-1">5 of 8 milestones completed</p>
                  </div>

                  <button className="bg-white text-[#2563EB] hover:bg-white/30 font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Campaign Engagement</h3>
                <p className="text-sm text-gray-500">Detailed report</p>
              </div>
              <button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg transition-colors">Change</button>
            </div>
            <div className="flex items-end gap-4 mb-4">
              <div className="text-4xl font-bold text-gray-900">47%</div>
              <Clock className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mb-4">Engagement rate this month</p>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2563EB]"></div>
              <div className="w-3 h-3 rounded-full bg-[#2563EB]"></div>
              <div className="w-3 h-3 rounded-full bg-[#2563EB]"></div>
              <div className="w-3 h-3 rounded-full bg-[#2563EB]"></div>
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold">Recommendations</h3>
                <p className="text-sm opacity-80">AI-powered insights</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Optimize content strategy</p>
                  <p className="text-xs opacity-70">Increase engagement by 23%</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Expand audience reach</p>
                  <p className="text-xs opacity-70">Target new demographics</p>
                </div>
              </div>
            </div>
            <button className="w-full bg-white hover:bg-gray-50 text-[#1D4ED8] font-medium py-3 rounded-lg transition-colors">Analyze</button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your 8-Month Journey</h2>
                <p className="text-sm text-gray-500 mt-1">Track your progress through Wavelaunch program</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {monthStatuses.map((item) => (
                <div key={item.month} className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:border-[#2563EB] hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      {item.status === 'complete' && <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-white" /></div>}
                      {item.status === 'in-progress' && <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center"><Clock className="h-4 w-4 text-white" /></div>}
                      {item.status === 'not-started' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><Clock className="h-4 w-4 text-gray-400" /></div>}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{item.month}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{item.title}</p>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-2 ${item.status === 'complete' ? 'bg-green-500 text-white' : item.status === 'in-progress' ? 'bg-[#2563EB] text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {item.status === 'complete' ? 'Complete' : item.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-500 mt-1">Access frequently used features</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Link href="/portal/documents" className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#2563EB] hover:bg-gray-50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <div className="text-[#2563EB]"><FileText className="h-5 w-5" /></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">View Documents</p>
                  <p className="text-xs text-gray-500">Access your business plan and deliverables</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </Link>
              <Link href="/portal/messages" className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#2563EB] hover:bg-gray-50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <div className="text-[#2563EB]"><MessageSquare className="h-5 w-5" /></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Send Message</p>
                  <p className="text-xs text-gray-500">Contact your Wavelaunch team</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </Link>
              <Link href="/portal/progress" className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#2563EB] hover:bg-gray-50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <div className="text-[#2563EB]"><Target className="h-5 w-5" /></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">View Progress</p>
                  <p className="text-xs text-gray-500">Track your journey milestones</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
