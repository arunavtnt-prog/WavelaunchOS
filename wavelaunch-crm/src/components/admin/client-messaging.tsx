'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Send,
  ArrowLeft,
  Loader2,
  Plus,
  User,
  UserCog,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ClientMessagingProps {
  clientId: string
  creatorName: string
}

interface Message {
  id: string
  threadId: string
  subject: string
  body: string
  isFromAdmin: boolean
  isRead: boolean
  createdAt: string
}

interface Thread {
  threadId: string
  subject: string
  latestMessage: Message
  unreadCount: number
  messageCount: number
}

export function ClientMessaging({ clientId, creatorName }: ClientMessagingProps) {
  const { toast } = useToast()
  const [threads, setThreads] = useState<Thread[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageBody, setMessageBody] = useState('')
  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchThreads()
  }, [clientId])

  useEffect(() => {
    if (selectedThread) {
      fetchMessages()
      markAsRead()
      const interval = setInterval(fetchMessages, 10000)
      return () => clearInterval(interval)
    }
  }, [selectedThread])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchThreads = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/messages?clientId=${clientId}`)
      const data = await response.json()

      if (data.success) {
        setThreads(data.data.threads || [])
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedThread) return

    try {
      const response = await fetch(
        `/api/admin/messages?clientId=${clientId}&threadId=${selectedThread}`
      )
      const data = await response.json()

      if (data.success) {
        setMessages(data.data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const markAsRead = async () => {
    if (!selectedThread) return

    try {
      await fetch(`/api/admin/messages/${selectedThread}/read`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleSend = async () => {
    if (!messageBody.trim() || !selectedThread) return

    try {
      setSending(true)
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          threadId: selectedThread,
          subject: selectedSubject,
          body: messageBody,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessageBody('')
        await fetchMessages()
        toast({
          title: 'Message sent',
          description: 'Your message has been sent to the client',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send message',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleNewMessage = async () => {
    if (!newSubject.trim() || !newBody.trim()) return

    try {
      setSending(true)
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          subject: newSubject,
          body: newBody,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewSubject('')
        setNewBody('')
        setNewMessageDialogOpen(false)
        await fetchThreads()
        toast({
          title: 'Message sent',
          description: 'Your message has been sent to the client',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send message',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Thread view
  if (selectedThread) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedThread(null)
                setMessages([])
                fetchThreads()
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {selectedSubject}
              </CardTitle>
              <CardDescription>Conversation with {creatorName}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="space-y-4 max-h-96 overflow-y-auto p-4 border rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.isFromAdmin ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!message.isFromAdmin && (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.isFromAdmin
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isFromAdmin
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {message.isFromAdmin && (
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <UserCog className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input */}
          <div className="space-y-2">
            <Label htmlFor="reply">Reply</Label>
            <Textarea
              id="reply"
              placeholder="Type your message..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={3}
            />
            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={sending || !messageBody.trim()}>
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
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Thread list view
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Client Messages
              </CardTitle>
              <CardDescription>
                View and respond to messages from {creatorName}
              </CardDescription>
            </div>
            <Button onClick={() => setNewMessageDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a conversation with {creatorName}
              </p>
              <Button
                className="mt-4"
                onClick={() => setNewMessageDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Send First Message
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <div
                  key={thread.threadId}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedThread(thread.threadId)
                    setSelectedSubject(thread.subject)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{thread.subject}</h4>
                        {thread.unreadCount > 0 && (
                          <Badge variant="default">{thread.unreadCount}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {thread.latestMessage.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(
                          new Date(thread.latestMessage.createdAt),
                          { addSuffix: true }
                        )} • {thread.messageCount} messages
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Message Dialog */}
      <Dialog open={newMessageDialogOpen} onOpenChange={setNewMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message to {creatorName}</DialogTitle>
            <DialogDescription>
              Send a message to your client through the portal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Message subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewMessageDialogOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNewMessage}
              disabled={sending || !newSubject.trim() || !newBody.trim()}
            >
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
    </>
  )
}
