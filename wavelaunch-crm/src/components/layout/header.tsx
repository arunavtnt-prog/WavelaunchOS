'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Settings, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

const getPageTitle = (pathname: string): string => {
  if (pathname.includes('/clients')) return 'Clients'
  if (pathname.includes('/dashboard')) return 'Dashboard'
  if (pathname.includes('/files')) return 'Files'
  if (pathname.includes('/prompts')) return 'Prompt Templates'
  if (pathname.includes('/jobs')) return 'Jobs'
  if (pathname.includes('/analytics')) return 'Analytics'
  if (pathname.includes('/settings')) return 'Settings'
  if (pathname.includes('/business-plans')) return 'Business Plans'
  if (pathname.includes('/deliverables')) return 'Deliverables'
  return 'Documents'
}

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-foreground">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border/50 text-sm"
            >
              <span className="text-muted-foreground">Select a theme:</span>
              <span className="font-medium">Blue</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
