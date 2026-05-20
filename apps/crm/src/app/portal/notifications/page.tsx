'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Bell,
  CheckCheck,
  Loader2,
  FileText,
  MessageSquare,
  TrendingUp,
  Settings as SettingsIcon,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  actionUrl: string | null
  isRead: boolean
  createdAt: Date
}

const notificationIcons: Record<string, any> = {
  NEW_DELIVERABLE: FileText,
  NEW_MESSAGE: MessageSquare,
  MILESTONE_REMINDER: TrendingUp,
  ACCOUNT_UPDATE: SettingsIcon,
}

const notificationColors: Record<string, string> = {
  NEW_DELIVERABLE: 'text-blue-600 bg-blue-100',
  NEW_MESSAGE: 'text-green-600 bg-green-100',
  MILESTONE_REMINDER: 'text-purple-600 bg-purple-100',
  ACCOUNT_UPDATE: 'text-orange-600 bg-orange-100',
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [showUnreadOnly])

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams()
      if (showUnreadOnly) params.append('unreadOnly', 'true')

      const response = await fetch(`/api/portal/notifications?${params}`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/portal/notifications/${notificationId}/read`,
        { method: 'POST' }
      )

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true)
      const response = await fetch('/api/portal/notifications/read-all', {
        method: 'POST',
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast({
          title: 'All marked as read',
          description: 'All notifications have been marked as read',
        })
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive',
      })
    } finally {
      setMarkingAllRead(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const getIcon = (type: string) => {
    const Icon = notificationIcons[type] || Bell
    return Icon
  }

  const getColorClasses = (type: string) => {
    return notificationColors[type] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showUnreadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
            >
              {markingAllRead ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark All Read
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
          </CardTitle>
          <CardDescription>
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type)
                const colorClasses = getColorClasses(notification.type)

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'w-full text-left rounded-lg border p-4 transition-colors hover:bg-accent',
                      !notification.isRead && 'bg-blue-50 border-blue-200'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0',
                          colorClasses
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={cn(
                              'font-semibold',
                              !notification.isRead && 'text-primary'
                            )}
                          >
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {new Date(notification.createdAt).toLocaleString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                          {notification.actionUrl && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                View details
                                <ExternalLink className="h-3 w-3" />
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {showUnreadOnly
                  ? 'All your notifications have been read'
                  : 'When you receive notifications, they will appear here'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
