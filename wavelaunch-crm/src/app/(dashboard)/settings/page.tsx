'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Database, Key, Mail, Bell, Activity } from 'lucide-react'

const settingsSections = [
  {
    name: 'Database Backups',
    description: 'Create, restore, and manage database backups',
    href: '/settings/backup',
    icon: Database,
  },
  {
    name: 'System Monitoring',
    description: 'Monitor system health and performance metrics',
    href: '/settings/monitoring',
    icon: Activity,
  },
  {
    name: 'API Configuration',
    description: 'Configure Claude API keys and settings',
    href: '/settings/api',
    icon: Key,
  },
  {
    name: 'Email Settings',
    description: 'Configure email notifications and SMTP',
    href: '/settings/email',
    icon: Mail,
    comingSoon: true,
  },
  {
    name: 'Notifications',
    description: 'Manage system notifications and alerts',
    href: '/settings/notifications',
    icon: Bell,
    comingSoon: true,
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your system settings and configurations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Link
            key={section.name}
            href={section.comingSoon ? '#' : section.href}
            className={
              section.comingSoon
                ? 'pointer-events-none'
                : ''
            }
          >
            <div
              className={cn(
                'rounded-lg border bg-card p-6 transition-colors',
                !section.comingSoon && 'hover:bg-accent cursor-pointer'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{section.name}</h3>
                    {section.comingSoon && (
                      <span className="text-xs rounded-full bg-muted px-2 py-1">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
