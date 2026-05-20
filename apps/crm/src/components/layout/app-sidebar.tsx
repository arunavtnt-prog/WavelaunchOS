'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  Folders,
  FileCode,
  BarChart3,
  Settings,
  HelpCircle,
  AlertCircle,
  PlusCircle,
  Inbox,
  Calendar,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

const mainNavigation = [
  { name: 'Quick Create', href: '/clients/new', icon: PlusCircle },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'View Submissions', href: '/submissions', icon: Inbox },
  { name: 'View Clients', href: '/clients', icon: Calendar },
]

const documentsNavigation = [
  { name: 'Business Plans', href: '/business-plans', icon: FileText },
  { name: 'Client Files', href: '/files', icon: Folders },
  { name: 'Deliverables Hub', href: '/deliverables', icon: Calendar },
  { name: 'Prompt Templates', href: '/prompts', icon: FileCode },
  // { name: 'Campaign Analytics', href: '/analytics', icon: BarChart3 },
]

const systemNavigation = [
  { name: 'System Settings', href: '/settings', icon: Settings },
  { name: 'Help Center', href: '/help', icon: HelpCircle },
  { name: 'Raise Ticket', href: '/tickets', icon: AlertCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [documentsOpen, setDocumentsOpen] = useState(true)

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-sidebar-background">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-sidebar-primary"
        >
          <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
          <circle cx="12" cy="12" r="6" fill="currentColor" />
        </svg>
        <h1 className="text-sm font-semibold text-sidebar-foreground">
          Wavelaunch Studio
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {/* Main Navigation */}
        <div className="space-y-0.5">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Documents Section */}
        <div className="px-6 pt-4">
          <button
            onClick={() => setDocumentsOpen(!documentsOpen)}
            className="flex w-full items-center justify-between -mx-3 px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <span>Documents</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                documentsOpen && 'rotate-180'
              )}
            />
          </button>
          {documentsOpen && (
            <div className="space-y-0.5 pt-1">
              {documentsNavigation.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors -mx-3',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground -mx-3">
                <span className="text-xs">···</span>
                <span>More</span>
              </button>
            </div>
          )}
        </div>

        {/* System Navigation */}
        <div className="px-6 space-y-0.5 pt-4">
          {systemNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors -mx-3',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-3">
        <Link href="/profile">
          <div className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-sidebar-accent/50 cursor-pointer">
            <span className="text-xs font-medium text-sidebar-foreground">
              Go to Profile
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-sidebar-foreground/70"
            >
              <path
                d="M8 3L12 8L8 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 8H12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  )
}
