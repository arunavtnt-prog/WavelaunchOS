'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  MessageSquare,
  Plus,
  Loader2,
  Inbox,
  Send,
  Clock,
} from 'lucide-react'
import { MessageThread } from '@/components/portal/message-thread'
import { cn } from '@/lib/utils'

interface Thread {
  threadId: string
  subject: string
  latestMessage: {
    id: string
    body: string
    isFromAdmin: boolean
    createdAt: Date
  }
  unreadCount: number
  messageCount: number
}

export default function MessagesPage() {
  const { toast } = useToast()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [newMessageOpen, setNewMessageOpen] = useState(false)
  const [sending, setSending] = useState(false)

  // New message form
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')

  useEffect(() => {
    fetchThreads()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchThreads, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/portal/messages')
      const data = await response.json()

      if (data.success) {
        setThreads(data.data.threads)
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread.threadId)
    setSelectedSubject(thread.subject)
  }

  const handleSendNewMessage = async () => {
    if (!newSubject.trim() || !newBody.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    try {
      setSending(true)

      const response = await fetch('/api/portal/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject,
          body: newBody,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Message sent',
          description: 'Your message has been sent to the Wavelaunch team',
        })

        setNewMessageOpen(false)
        setNewSubject('')
        setNewBody('')

        // Refresh threads
        await fetchThreads()

        // Open the new thread
        setSelectedThread(data.data.message.threadId)
        setSelectedSubject(data.data.message.subject)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send message',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  // If viewing a thread, show thread view
  if (selectedThread) {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <MessageThread
          threadId={selectedThread}
          subject={selectedSubject}
          onBack={() => {
            setSelectedThread(null)
            setSelectedSubject('')
            fetchThreads() // Refresh to update unread counts
          }}
        />
      </div>
    )
  }

  // Otherwise, show inbox
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your Wavelaunch team
          </p>
        </div>
        <Button onClick={() => setNewMessageOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Threads List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Inbox
          </CardTitle>
          <CardDescription>
            {threads.length} conversation{threads.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : threads.length > 0 ? (
            <div className="space-y-2">
              {threads.map((thread) => (
                <button
                  key={thread.threadId}
                  onClick={() => handleSelectThread(thread)}
                  className={cn(
                    'w-full text-left rounded-lg border p-4 transition-colors hover:bg-accent',
                    thread.unreadCount > 0 && 'bg-blue-50 border-blue-200'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={cn(
                            'font-semibold truncate',
                            thread.unreadCount > 0 && 'text-primary'
                          )}
                        >
                          {thread.subject}
                        </h3>
                        {thread.unreadCount > 0 && (
                          <Badge variant="default" className="flex-shrink-0">
                            {thread.unreadCount} new
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {thread.latestMessage.isFromAdmin ? (
                          <span className="font-medium">Team: </span>
                        ) : (
                          <span className="font-medium">You: </span>
                        )}
                        {thread.latestMessage.body}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(
                            thread.latestMessage.createdAt
                          ).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                        <span>•</span>
                        <span>
                          {thread.messageCount}{' '}
                          {thread.messageCount === 1 ? 'message' : 'messages'}
                        </span>
                      </div>
                    </div>

                    <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start a conversation with your Wavelaunch team
              </p>
              <Button onClick={() => setNewMessageOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Send First Message
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Message Dialog */}
      <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Send a message to your Wavelaunch team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="What's this about?"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                disabled={sending}
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewMessageOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button onClick={handleSendNewMessage} disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
