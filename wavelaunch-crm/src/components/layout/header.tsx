'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Settings, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

const getPageTitle = (pathname: string): string => {
  if (pathname.includes('/clients')) return 'Clients'
  if (pathname.includes('/dashboard')) return 'Dashboard'
  if (pathname.includes('/portal-users')) return 'Portal Users'
  if (pathname.includes('/messages')) return 'Messages'
  if (pathname.includes('/business-plans')) return 'Business Plans'
  if (pathname.includes('/deliverables')) return 'Deliverables'
  if (pathname.includes('/files')) return 'Files'
  if (pathname.includes('/prompts')) return 'Prompt Templates'
  if (pathname.includes('/jobs')) return 'Jobs'
  if (pathname.includes('/submissions')) return 'Submissions'
  if (pathname.includes('/tickets')) return 'Support Tickets'
  if (pathname.includes('/analytics')) return 'Analytics'
  if (pathname.includes('/help')) return 'Help Center'
  if (pathname.includes('/settings')) return 'Settings'
  return 'Documents'
}

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const pageTitle = getPageTitle(pathname)

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="h-4 w-4" />
    if (theme === 'dark') return <Moon className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-foreground">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
          {getThemeIcon()}
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
