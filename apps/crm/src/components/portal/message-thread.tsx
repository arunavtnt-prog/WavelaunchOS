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
  FileDown,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { exportConversationToHTML, exportMessagesToText, exportToJSON } from '@/lib/utils/export'

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleExport = (format: 'html' | 'text' | 'json') => {
    const filename = `conversation_${threadId}_${Date.now()}`

    switch (format) {
      case 'html':
        exportConversationToHTML({
          subject,
          messages,
        }, `${filename}.html`)
        break
      case 'text':
        exportMessagesToText(messages, `${filename}.txt`)
        break
      case 'json':
        exportToJSON({ subject, threadId, messages }, `${filename}.json`)
        break
    }

    toast({
      title: 'Exported successfully',
      description: `Conversation exported as ${format.toUpperCase()}`,
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 10MB',
          variant: 'destructive',
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async (file: File): Promise<{ url: string; filename: string } | null> => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/portal/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        return {
          url: data.data.url,
          filename: data.data.filename,
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to upload file',
          variant: 'destructive',
        })
        return null
      }
    } catch (error) {
      console.error('File upload error:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      })
      return null
    } finally {
      setUploading(false)
    }
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

      let attachmentUrl: string | undefined
      let attachmentName: string | undefined

      // Upload file if selected
      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile)
        if (uploadResult) {
          attachmentUrl = uploadResult.url
          attachmentName = uploadResult.filename
        } else {
          // Upload failed, stop sending
          return
        }
      }

      const response = await fetch('/api/portal/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          subject,
          body: messageBody,
          attachmentUrl,
          attachmentName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessageBody('')
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('html')}>
                Export as HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('text')}>
                Export as Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <div className="space-y-2">
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFileRemove}
                disabled={sending || uploading}
              >
                ×
              </Button>
            </div>
          )}

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
              disabled={sending || uploading}
              className="resize-none"
            />
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || uploading}
                className="flex-shrink-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || uploading || !messageBody.trim()}
                size="icon"
                className="flex-shrink-0"
              >
                {sending || uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          />

          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line. Max file size: 10MB
          </p>
        </div>
      </div>
    </div>
  )
}
