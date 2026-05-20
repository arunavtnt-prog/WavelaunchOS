'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Send, Edit2, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

type Message = {
  id: string
  direction: 'INBOUND' | 'OUTBOUND'
  fromEmail: string | null
  toEmail: string | null
  subject: string | null
  bodyText: string
  bodyHtml: string | null
  receivedAt: string
  isUnread: boolean
}

type Draft = {
  id: string
  subject: string
  body: string
  status: 'PENDING_REVIEW' | 'APPROVED' | 'SENT' | 'MODIFIED'
  confidence: number | null
  category: string | null
  autoSent: boolean
}

type Conversation = {
  id: string
  leadEmail: string
  leadName: string | null
  campaignName: string | null
  leadType: string
  intent: string | null
  needsReply: boolean
  conversationStage?: string | null
  stageUpdatedAt?: string | null
  messages: Message[]
  drafts: Draft[]
}

type ConversationDrawerProps = {
  conversation: Conversation
  onClose: () => void
}

export default function ConversationDrawer({ conversation, onClose }: ConversationDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [editingSubject, setEditingSubject] = useState('')
  const [editingBody, setEditingBody] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [showFullDraft, setShowFullDraft] = useState(true)

  useEffect(() => {
    loadMessages()
    // Load existing draft
    if (conversation.drafts.length > 0) {
      const latestDraft = conversation.drafts[0]
      setDraft(latestDraft)
      setEditingSubject(latestDraft.subject)
      setEditingBody(latestDraft.body)
    }
  }, [conversation.id])

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/replies/conversations/${conversation.id}`)
      const data = await res.json()
      if (data.success && data.data) {
        setMessages(data.data.messages || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const generateDraft = async () => {
    try {
      setGenerating(true)
      const res = await fetch('/api/admin/instantly/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', conversationId: conversation.id }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setDraft(data.data)
        setEditingSubject(data.data.subject)
        setEditingBody(data.data.body)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error generating draft:', error)
    } finally {
      setGenerating(false)
    }
  }

  const approveDraft = async () => {
    if (!draft) return
    try {
      const res = await fetch('/api/admin/instantly/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', draftId: draft.id }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setDraft(data.data)
      }
    } catch (error) {
      console.error('Error approving draft:', error)
    }
  }

  const sendDraft = async () => {
    if (!draft) return
    try {
      setSending(true)
      const res = await fetch('/api/admin/instantly/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', draftId: draft.id }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setDraft(data.data)
        onClose()
      }
    } catch (error) {
      console.error('Error sending draft:', error)
    } finally {
      setSending(false)
    }
  }

  const approveAndSend = async () => {
    if (!draft) return
    try {
      setSending(true)
      const res = await fetch('/api/admin/instantly/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve-and-send', draftId: draft.id }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setDraft(data.data)
        onClose()
      }
    } catch (error) {
      console.error('Error approving and sending:', error)
    } finally {
      setSending(false)
    }
  }

  const saveEdits = async () => {
    if (!draft) return
    try {
      const res = await fetch('/api/admin/instantly/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: draft.id, subject: editingSubject, body: editingBody }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setDraft(data.data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Badge variant="secondary">Pending Review</Badge>
      case 'APPROVED':
        return <Badge variant="default">Approved</Badge>
      case 'SENT':
        return <Badge variant="outline">Sent</Badge>
      case 'MODIFIED':
        return <Badge variant="secondary">Modified</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getIntentBadge = (intent: string | null) => {
    if (!intent) return null

    // Handle objection intents with different styling
    const objectionIntents = [
      'PRICE_NEGOTIATION',
      'TIMELINE_CONCERNS',
      'SKEPTICISM_CONCERNS',
      'COMPETITION_QUESTIONS',
      'REVENUE_SHARING_OBJS',
      'CONTRACT_QUESTIONS',
      'PAYMENT_QUESTIONS',
      'LONGTERM_QUESTIONS',
      'VISION_VAGUE',
      'VISION_INCOMPLETE',
      'ROADMAP_CHANGES_REQUESTED',
    ]

    const isObjection = objectionIntents.some(obj => intent.startsWith(obj))

    return (
      <Badge variant={isObjection ? 'default' : 'outline'} className="ml-2">
        {intent.replace(/_/g, ' ')}
      </Badge>
    )
  }

  const getStageBadge = (stage: string | null | undefined) => {
    if (!stage) return null

    const stageMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      INITIAL_CONTACT: { label: 'Initial', variant: 'default' },
      VISION_FORM_SENT: { label: 'Vision Form', variant: 'secondary' },
      VISION_FORM_COMPLETE: { label: 'Form Complete', variant: 'secondary' },
      ROADMAP_DELIVERED: { label: 'Roadmap', variant: 'outline' },
      VC_SUBMITTED: { label: 'VC Review', variant: 'default' },
      VC_APPROVED: { label: 'Approved', variant: 'default' },
      ONBOARDING_STARTED: { label: 'Onboarding', variant: 'outline' },
      ONBOARDING_COMPLETE: { label: 'Active', variant: 'default' },
    }

    const stageInfo = stageMap[stage] || { label: stage.replace(/_/g, ' '), variant: 'outline' as const }

    return (
      <Badge variant={stageInfo.variant}>
        {stageInfo.label}
      </Badge>
    )
  }

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] bg-background border-l shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{conversation.leadName || conversation.leadEmail}</h2>
            <p className="text-sm text-muted-foreground">{conversation.leadEmail}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {getStageBadge(conversation.conversationStage)}
          {conversation.intent && getIntentBadge(conversation.intent)}
          <Badge variant="outline">{conversation.leadType}</Badge>
          {conversation.campaignName && (
            <Badge variant="secondary">{conversation.campaignName}</Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === 'INBOUND' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.direction === 'INBOUND'
                    ? 'bg-muted'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">
                    {message.direction === 'INBOUND'
                      ? conversation.leadName || conversation.leadEmail
                      : 'You'}
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(message.receivedAt).toLocaleString()}
                  </span>
                </div>
                {message.subject && message.direction === 'OUTBOUND' && (
                  <div className="mb-2 text-sm font-medium">{message.subject}</div>
                )}
                <div className="text-sm whitespace-pre-wrap">{message.bodyText}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Draft Section */}
      {!draft ? (
        <div className="border-t">
          <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">No draft generated yet</div>
            <Button onClick={generateDraft} disabled={generating} variant="default" size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              {generating ? 'Generating...' : 'Generate Draft'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t">
          <div className="px-6 py-3 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge(draft.status)}
              {draft.autoSent && (
                <Badge variant="secondary" className="text-xs">Auto-sent</Badge>
              )}
              {draft.confidence !== null && (
                <span className="text-xs text-muted-foreground">
                  Confidence: {Math.round(draft.confidence * 100)}%
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullDraft(!showFullDraft)}
            >
              {showFullDraft ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          {showFullDraft && (
            <div className="p-6 space-y-4">
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editingSubject}
                    onChange={(e) => setEditingSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Subject"
                  />
                  <textarea
                    value={editingBody}
                    onChange={(e) => setEditingBody(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm min-h-[200px] resize-y mt-2"
                    placeholder="Email body..."
                  />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={saveEdits} variant="default" size="sm">
                      <Check className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div>
                    <div className="text-sm font-medium mb-2">Subject</div>
                    <div className="px-3 py-2 bg-muted rounded text-sm">{draft.subject}</div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Body</div>
                    <div className="px-3 py-2 bg-muted rounded text-sm whitespace-pre-wrap max-h-[300px] overflow-auto">
                      {draft.body}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {draft.status === 'SENT' ? (
                      <Button disabled variant="outline" size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Sent
                      </Button>
                    ) : draft.status === 'APPROVED' ? (
                      <>
                        <Button onClick={sendDraft} disabled={sending} variant="default" size="sm">
                          <Send className="mr-2 h-4 w-4" />
                          {sending ? 'Sending...' : 'Send'}
                        </Button>
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={approveDraft} variant="outline" size="sm">
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button onClick={approveAndSend} disabled={sending} variant="default" size="sm">
                          <Send className="mr-2 h-4 w-4" />
                          {sending ? 'Sending...' : 'Approve & Send'}
                        </Button>
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </>
                    )}
                    <div className="ml-auto">
                      <Button onClick={generateDraft} disabled={generating} variant="ghost" size="sm">
                        <Sparkles className="mr-2 h-4 w-4" />
                        {generating ? 'Generating...' : 'Regenerate'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
