'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Mail, CheckCircle, Clock, Send, ChevronRight } from 'lucide-react'
import ConversationDrawer from './components/ConversationDrawer'

type Conversation = {
  id: string
  leadEmail: string
  leadName: string | null
  campaignName: string | null
  leadType: 'COLD' | 'FOLLOWUP' | 'PIPELINE' | 'CLIENT' | 'CLOSED'
  intent: string | null
  needsReply: boolean
  conversationStage?: string | null
  lastMessageAt: string
  lastInboundAt: string | null
  messages: Array<{
    direction: 'INBOUND' | 'OUTBOUND'
    isUnread: boolean
    receivedAt: string
  }>
  drafts: Array<{
    id: string
    status: 'PENDING_REVIEW' | 'APPROVED' | 'SENT' | 'MODIFIED'
    confidence: number | null
    category: string | null
  }>
}

type Stats = {
  totalReplies: number
  pendingDrafts: number
  sentToday: number
  autoSent: number
}

export default function InstantlyRepliesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [stats, setStats] = useState<Stats>({ totalReplies: 0, pendingDrafts: 0, sentToday: 0, autoSent: 0 })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [filterStatus, setFilterStatus] = useState<'All' | 'Unread' | 'NeedsReply'>('All')
  const [filterIntent, setFilterIntent] = useState<string>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(20)

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('limit', String(pageSize))
      params.set('offset', String((page - 1) * pageSize))
      if (filterStatus !== 'All') params.set('status', filterStatus)
      if (filterIntent) params.set('intent', filterIntent)

      const res = await fetch(`/api/admin/instantly/conversations?${params}`)
      const data = await res.json()

      if (data.success) {
        setConversations(data.data)
        calculateStats(data.data)
        if (data.pagination) {
          setTotal(data.pagination.total)
          setTotalPages(data.pagination.totalPages)
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (convs: Conversation[]) => {
    const today = new Date().toDateString()
    setStats({
      totalReplies: convs.length,
      pendingDrafts: convs.filter((c) => c.drafts.some((d) => d.status === 'PENDING_REVIEW')).length,
      sentToday: convs.filter((c) =>
        c.drafts.some((d) => d.status === 'SENT' && new Date(c.lastMessageAt).toDateString() === today)
      ).length,
      autoSent: convs.filter((c) => c.messages.some((m) => m.direction === 'OUTBOUND')).length, // Approximate
    })
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const res = await fetch('/api/admin/instantly/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'instantly',
          campaignId: '9576ec1a-d37c-4168-b341-81dab772e715',
          limit: 50,
          syncAll: true,
        }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchConversations()
      }
    } catch (error) {
      console.error('Error syncing:', error)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchConversations()
  }, [filterStatus, filterIntent])

  useEffect(() => {
    fetchConversations()
  }, [page])

  const filteredConversations = conversations.filter((c) => {
    if (filterStatus === 'Unread') {
      return c.messages.some((m) => m.isUnread && m.direction === 'INBOUND')
    }
    if (filterStatus === 'NeedsReply') {
      return c.needsReply
    }
    return true
  })

  const getIntentBadgeVariant = (intent: string | null) => {
    switch (intent) {
      case 'INTERESTED': return 'default'
      case 'NOT_INTERESTED': return 'secondary'
      case 'PRICING': return 'outline'
      case 'SCHEDULING': return 'outline'
      case 'QUESTIONS': return 'secondary'
      case 'UNSUBSCRIBE': return 'destructive'
      default: return 'secondary'
    }
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

  const getDraftStatusBadge = (drafts: Conversation['drafts']) => {
    const latestDraft = drafts[0]
    if (!latestDraft) return null

    switch (latestDraft.status) {
      case 'PENDING_REVIEW':
        return <Badge variant="secondary">Draft Ready</Badge>
      case 'APPROVED':
        return <Badge variant="default">Approved</Badge>
      case 'SENT':
        return <Badge variant="outline">Sent</Badge>
      case 'MODIFIED':
        return <Badge variant="secondary">Modified</Badge>
      default:
        return null
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-lg font-semibold">Instantly Replies</h1>
              <p className="text-sm text-muted-foreground">Manage email replies from cold email campaigns</p>
            </div>
            <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync from Instantly'}
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="border-b bg-muted/30 p-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Replies</span>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{stats.totalReplies}</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Pending Drafts</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{stats.pendingDrafts}</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Sent Today</span>
                <Send className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{stats.sentToday}</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Auto-Sent</span>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{stats.autoSent}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter:</span>
            <div className="flex gap-2">
              {(['All', 'Unread', 'NeedsReply'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-sm text-muted-foreground">Loading conversations...</div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Mail className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">No conversations found</p>
              <Button onClick={handleSync} variant="outline" size="sm" className="mt-4">
                Sync from Instantly
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className="flex w-full items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">
                        {conversation.leadName || conversation.leadEmail}
                      </span>
                      {conversation.messages.some((m) => m.isUnread && m.direction === 'INBOUND') && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                      {getStageBadge(conversation.conversationStage)}
                      {conversation.intent && (
                        <Badge variant={getIntentBadgeVariant(conversation.intent)} className="text-xs">
                          {conversation.intent.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="truncate">{conversation.leadEmail}</span>
                      {conversation.campaignName && (
                        <>
                          <span>•</span>
                          <span className="truncate">{conversation.campaignName}</span>
                        </>
                      )}
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {conversation.leadType}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getDraftStatusBadge(conversation.drafts)}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(conversation.lastMessageAt).toLocaleDateString()}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({total} total)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(1)}
              >
                First
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(totalPages)}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      {/* Conversation Drawer */}
        </div>
      </div>

      {/* Conversation Drawer */}
      {selectedConversation && (
        <ConversationDrawer
          conversation={selectedConversation}
          onClose={() => {
            setSelectedConversation(null)
            fetchConversations()
          }}
        />
      )}
    </div>
  )
}
