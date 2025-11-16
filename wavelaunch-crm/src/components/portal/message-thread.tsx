'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import {
  Send,
  Loader2,
  Paperclip,
  Download,
  User,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  subject: string
  body: string
  isFromAdmin: boolean
  isRead: boolean
  attachmentUrl: string | null
  attachmentName: string | null
  createdAt: Date
}

interface MessageThreadProps {
  threadId: string
  subject: string
  onBack?: () => void
}

export function MessageThread({ threadId, subject, onBack }: MessageThreadProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageBody, setMessageBody] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [threadId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/portal/messages?threadId=${threadId}`)
      const data = await response.json()

      if (data.success) {
        setMessages(data.data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!messageBody.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
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
          threadId,
          subject,
          body: messageBody,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessageBody('')
        await fetchMessages()
        toast({
          title: 'Message sent',
          description: 'Your message has been sent to the team',
        })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
            )}
            <div>
              <h2 className="text-lg font-semibold">{subject}</h2>
              <p className="text-sm text-muted-foreground">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.isFromAdmin ? 'justify-start' : 'justify-end'
            )}
          >
            {message.isFromAdmin && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-white text-xs">
                  W
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                'max-w-[70%] rounded-lg p-3',
                message.isFromAdmin
                  ? 'bg-muted'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium">
                  {message.isFromAdmin ? 'Wavelaunch Team' : 'You'}
                </span>
                <span className="text-xs opacity-70">
                  {new Date(message.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-sm whitespace-pre-wrap">{message.body}</p>

              {message.attachmentUrl && (
                <div className="mt-2 flex items-center gap-2 rounded bg-background/10 p-2">
                  <Paperclip className="h-4 w-4" />
                  <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline flex-1 truncate"
                  >
                    {message.attachmentName || 'Attachment'}
                  </a>
                  <Download className="h-4 w-4" />
                </div>
              )}
            </div>

            {!message.isFromAdmin && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            rows={3}
            disabled={sending}
            className="resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !messageBody.trim()}
            size="icon"
            className="flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
