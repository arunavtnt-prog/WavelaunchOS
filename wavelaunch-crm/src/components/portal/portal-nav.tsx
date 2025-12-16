'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  User,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { name: 'Progress', href: '/portal/progress', icon: TrendingUp },
  { name: 'Documents', href: '/portal/documents', icon: FileText },
  { name: 'Messages', href: '/portal/messages', icon: MessageSquare },
  { name: 'Notifications', href: '/portal/notifications', icon: Bell },
  { name: 'Settings', href: '/portal/settings', icon: Settings },
]

interface PortalNavProps {
  user?: {
    email: string
    client?: {
      fullName: string
      brandName?: string | null
    }
  }
}

export function PortalNav({ user }: PortalNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    fetchUnreadCounts()
    const interval = setInterval(fetchUnreadCounts, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCounts = async () => {
    try {
      // Fetch unread messages count
      const messagesResponse = await fetch('/api/portal/messages/unread')
      const messagesData = await messagesResponse.json()
      if (messagesData.success) {
        setUnreadMessages(messagesData.data.unreadCount)
      }

      // Fetch unread notifications count
      const notificationsResponse = await fetch('/api/portal/notifications?unreadOnly=true')
      const notificationsData = await notificationsResponse.json()
      if (notificationsData.success) {
        setUnreadNotifications(notificationsData.data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch unread counts:', error)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/portal/auth/logout', { method: 'POST' })
      router.push('/portal/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const displayName = user?.client?.fullName || user?.email || 'User'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/portal/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <span className="text-sm font-bold">W</span>
              </div>
              <span className="text-xl font-bold">Wavelaunch</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const showBadge =
                (item.name === 'Messages' && unreadMessages > 0) ||
                (item.name === 'Notifications' && unreadNotifications > 0)
              const badgeCount =
                item.name === 'Messages' ? unreadMessages : unreadNotifications

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {showBadge && (
                    <Badge variant="default" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    {user?.client?.brandName && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.client.brandName}
                      </p>
                    )}
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="border-t md:hidden">
        <div className="flex overflow-x-auto px-4 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const showBadge =
              (item.name === 'Messages' && unreadMessages > 0) ||
              (item.name === 'Notifications' && unreadNotifications > 0)
            const badgeCount =
              item.name === 'Messages' ? unreadMessages : unreadNotifications

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {showBadge && (
                  <Badge variant="default" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
