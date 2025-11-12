'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Send,
  FileDown,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownEditor } from '@/components/editor/markdown-editor'

type BusinessPlan = {
  id: string
  version: number
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'DELIVERED' | 'REJECTED'
  contentMarkdown: string
  rejectionReason?: string | null
  createdAt: string
  updatedAt: string
  client: {
    id: string
    creatorName: string
    brandName: string | null
    email: string
  }
  generatedByUser: {
    id: string
    name: string
    email: string
  }
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-500' },
  PENDING_REVIEW: { label: 'Pending Review', color: 'bg-yellow-500' },
  APPROVED: { label: 'Approved', color: 'bg-green-500' },
  DELIVERED: { label: 'Delivered', color: 'bg-blue-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500' },
}

export default function BusinessPlanEditPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = params.id as string
  const planId = params.planId as string
  const viewMode = searchParams.get('mode') === 'view'

  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Status change dialogs
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [changingStatus, setChangingStatus] = useState(false)

  useEffect(() => {
    fetchBusinessPlan()
  }, [planId])

  const fetchBusinessPlan = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/business-plans/${planId}`)
      const data = await res.json()

      if (data.success) {
        setBusinessPlan(data.data)
        setContent(data.data.contentMarkdown)
      } else {
        setError(data.error || 'Failed to load business plan')
      }
    } catch (err) {
      console.error('Error fetching business plan:', err)
      setError('Failed to load business plan')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!businessPlan) return

    try {
      setSaving(true)
      setError(null)

      const res = await fetch(`/api/business-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentMarkdown: content }),
      })

      const data = await res.json()

      if (data.success) {
        setBusinessPlan(data.data)
      } else {
        setError(data.error || 'Failed to save')
      }
    } catch (err) {
      console.error('Error saving:', err)
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: BusinessPlan['status']) => {
    if (!businessPlan) return

    try {
      setChangingStatus(true)
      setError(null)

      const res = await fetch(`/api/business-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentMarkdown: content,
          status: newStatus,
          rejectionReason: newStatus === 'REJECTED' ? rejectionReason : undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setBusinessPlan(data.data)
        setShowRejectDialog(false)
        setRejectionReason('')
      } else {
        setError(data.error || 'Failed to change status')
      }
    } catch (err) {
      console.error('Error changing status:', err)
      setError('Failed to change status')
    } finally {
      setChangingStatus(false)
    }
  }

  const renderStatusActions = () => {
    if (!businessPlan || viewMode) return null

    const { status } = businessPlan

    return (
      <div className="flex gap-2">
        {status === 'DRAFT' && (
          <Button onClick={() => handleStatusChange('PENDING_REVIEW')} disabled={changingStatus}>
            <Send className="h-4 w-4 mr-2" />
            Submit for Review
          </Button>
        )}

        {status === 'PENDING_REVIEW' && (
          <>
            <Button
              variant="default"
              onClick={() => handleStatusChange('APPROVED')}
              disabled={changingStatus}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              disabled={changingStatus}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </>
        )}

        {status === 'APPROVED' && (
          <Button onClick={() => handleStatusChange('DELIVERED')} disabled={changingStatus}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Delivered
          </Button>
        )}

        {status === 'REJECTED' && (
          <Button onClick={() => handleStatusChange('DRAFT')} disabled={changingStatus}>
            Back to Draft
          </Button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !businessPlan) {
    return (
      <div className="space-y-6">
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!businessPlan) return null

  const statusInfo = statusConfig[businessPlan.status]

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/clients/${clientId}/business-plan`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Business Plans
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Version {businessPlan.version}</h1>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              {viewMode && <Badge variant="outline">View Only</Badge>}
            </div>
            <p className="text-muted-foreground mt-1">
              {businessPlan.client.brandName || businessPlan.client.creatorName}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span>Created: {format(new Date(businessPlan.createdAt), 'MMM dd, yyyy')}</span>
              <span>Updated: {format(new Date(businessPlan.updatedAt), 'MMM dd, yyyy')}</span>
              <span>By: {businessPlan.generatedByUser.name}</span>
            </div>
            {businessPlan.rejectionReason && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                <strong>Rejection reason:</strong> {businessPlan.rejectionReason}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {renderStatusActions()}
            <Button variant="outline" disabled>
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Business Plan Content</CardTitle>
          <CardDescription>
            {viewMode
              ? 'Viewing business plan in read-only mode'
              : 'Edit the business plan content. Auto-saves every 30 seconds.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <MarkdownEditor
            value={content}
            onChange={setContent}
            onSave={handleSave}
            autoSave={!viewMode}
            autoSaveInterval={30000}
            readOnly={viewMode}
            className="h-full"
          />
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Business Plan</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this business plan. This will help the team
              understand what needs to be improved.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusChange('REJECTED')}
              disabled={!rejectionReason.trim() || changingStatus}
            >
              {changingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
