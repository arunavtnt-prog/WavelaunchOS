'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  Inbox,
  Mail,
  MailOpen,
  Send,
  ExternalLink,
  MessageSquare,
  CheckCheck,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  subject: string
  body: string
  isFromAdmin: boolean
  isRead: boolean
  createdAt: string
  attachmentUrl: string | null
  attachmentName: string | null
}

interface MessageThread {
  threadId: string
  clientId: string
  client: {
    id: string
    creatorName: string
    brandName: string | null
    email: string
  }
  subject: string
  latestMessage: Message
  unreadCount: number
  messageCount: number
}

export default function MessagesPage() {
  const { toast } = useToast()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [filteredThreads, setFilteredThreads] = useState<MessageThread[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [threadMessages, setThreadMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchThreads()
  }, [])

  useEffect(() => {
    filterThreads()
  }, [threads, search, filterStatus])

  const fetchThreads = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/messages')
      const data = await res.json()

      if (data.success) {
        setThreads(data.data.threads)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch message threads',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch message threads',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterThreads = () => {
    let filtered = [...threads]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (thread) =>
          thread.subject.toLowerCase().includes(searchLower) ||
          thread.client.creatorName.toLowerCase().includes(searchLower) ||
          thread.client.brandName?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filterStatus === 'unread') {
      filtered = filtered.filter((thread) => thread.unreadCount > 0)
    } else if (filterStatus === 'read') {
      filtered = filtered.filter((thread) => thread.unreadCount === 0)
    }

    setFilteredThreads(filtered)
  }

  const openThread = async (thread: MessageThread) => {
    setSelectedThread(thread)
    setDialogOpen(true)
    setLoadingMessages(true)

    try {
      const res = await fetch(
        `/api/admin/messages?clientId=${thread.clientId}&threadId=${thread.threadId}`
      )
      const data = await res.json()

      if (data.success) {
        setThreadMessages(data.data.messages)

        // Mark as read if there are unread messages
        if (thread.unreadCount > 0) {
          await markThreadAsRead(thread.threadId)
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch messages',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      })
    } finally {
      setLoadingMessages(false)
    }
  }

  const markThreadAsRead = async (threadId: string) => {
    try {
      await fetch(`/api/admin/messages/${threadId}/read`, {
        method: 'POST',
      })
      // Refresh threads to update unread counts
      await fetchThreads()
    } catch (error) {
      console.error('Failed to mark thread as read:', error)
    }
  }

  const sendReply = async () => {
    if (!selectedThread || !replyText.trim()) return

    try {
      setSendingReply(true)
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedThread.clientId,
          threadId: selectedThread.threadId,
          subject: selectedThread.subject,
          body: replyText,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Reply sent successfully',
        })
        setReplyText('')
        // Refresh the thread messages
        await openThread(selectedThread)
        await fetchThreads()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send reply',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      })
    } finally {
      setSendingReply(false)
    }
  }

  const getStats = () => {
    const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadCount, 0)
    const unreadThreads = threads.filter((thread) => thread.unreadCount > 0).length
    return {
      totalThreads: threads.length,
      unreadThreads,
      totalUnread,
      readThreads: threads.length - unreadThreads,
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Manage client messages across all portal users
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Threads</p>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.totalThreads}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Unread Threads</p>
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600">{stats.unreadThreads}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
            <Inbox className="h-4 w-4 text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-orange-600">{stats.totalUnread}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Read Threads</p>
            <MailOpen className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">{stats.readThreads}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by subject or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="read">Read Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Threads List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No messages found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Messages from clients will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredThreads.map((thread) => (
            <div
              key={`${thread.clientId}_${thread.threadId}`}
              className={`rounded-lg border bg-card p-6 transition-all hover:shadow-md cursor-pointer ${
                thread.unreadCount > 0 ? 'border-blue-300 bg-blue-50/50' : ''
              }`}
              onClick={() => openThread(thread)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {thread.unreadCount > 0 ? (
                      <Mail className="h-5 w-5 text-blue-600" />
                    ) : (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold">{thread.subject}</h3>
                    {thread.unreadCount > 0 && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                        {thread.unreadCount} new
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/clients/${thread.client.id}`}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>
                      {thread.client.creatorName}
                      {thread.client.brandName && ` • ${thread.client.brandName}`}
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {thread.latestMessage.body}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{thread.messageCount} messages</span>
                    <span>
                      {formatDistanceToNow(new Date(thread.latestMessage.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={(e) => {
                  e.stopPropagation()
                  openThread(thread)
                }}>
                  View Thread
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thread Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedThread?.subject}</DialogTitle>
            <DialogDescription>
              Conversation with {selectedThread?.client.creatorName}
              {selectedThread?.client.brandName && ` (${selectedThread.client.brandName})`}
            </DialogDescription>
          </DialogHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {loadingMessages ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              threadMessages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg p-4 ${
                    message.isFromAdmin
                      ? 'bg-primary/10 ml-12'
                      : 'bg-muted mr-12'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {message.isFromAdmin ? 'You (Admin)' : selectedThread?.client.creatorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                  {message.attachmentUrl && (
                    <a
                      href={message.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {message.attachmentName || 'Attachment'}
                    </a>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Reply Box */}
          <DialogFooter className="flex-col gap-4 sm:flex-col">
            <Textarea
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button onClick={sendReply} disabled={sendingReply || !replyText.trim()}>
                <Send className="mr-2 h-4 w-4" />
                {sendingReply ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
