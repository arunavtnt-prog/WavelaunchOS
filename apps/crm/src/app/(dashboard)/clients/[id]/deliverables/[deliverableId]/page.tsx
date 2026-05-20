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

type Deliverable = {
  id: string
  month: number
  title: string
  type: 'MAIN' | 'SUBDOCUMENT'
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

export default function DeliverableEditPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = params.id as string
  const deliverableId = params.deliverableId as string
  const viewMode = searchParams.get('mode') === 'view'

  const [deliverable, setDeliverable] = useState<Deliverable | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Status change dialogs
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [changingStatus, setChangingStatus] = useState(false)

  // PDF generation
  const [showPDFDialog, setShowPDFDialog] = useState(false)
  const [pdfQuality, setPDFQuality] = useState<'draft' | 'final'>('final')
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    fetchDeliverable()
  }, [deliverableId])

  const fetchDeliverable = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/deliverables/${deliverableId}`)
      const data = await res.json()

      if (data.success) {
        setDeliverable(data.data)
        setContent(data.data.contentMarkdown)
      } else {
        setError(data.error || 'Failed to load deliverable')
      }
    } catch (err) {
      console.error('Error fetching deliverable:', err)
      setError('Failed to load deliverable')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!deliverable) return

    try {
      setSaving(true)
      setError(null)

      const res = await fetch(`/api/deliverables/${deliverableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentMarkdown: content }),
      })

      const data = await res.json()

      if (data.success) {
        setDeliverable(data.data)
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

  const handleStatusChange = async (newStatus: Deliverable['status']) => {
    if (!deliverable) return

    try {
      setChangingStatus(true)
      setError(null)

      const res = await fetch(`/api/deliverables/${deliverableId}`, {
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
        setDeliverable(data.data)
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

  const handleGeneratePDF = async () => {
    if (!deliverable) return

    try {
      setGeneratingPDF(true)
      setError(null)

      const res = await fetch(`/api/deliverables/${deliverableId}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality: pdfQuality }),
      })

      const data = await res.json()

      if (data.success) {
        const jobId = data.data.jobId
        pollPDFJob(jobId)
      } else {
        setError(data.error || 'Failed to generate PDF')
        setGeneratingPDF(false)
      }
    } catch (err) {
      console.error('Error generating PDF:', err)
      setError('Failed to generate PDF')
      setGeneratingPDF(false)
    }
  }

  const pollPDFJob = async (jobId: string) => {
    const maxAttempts = 60
    let attempts = 0

    const poll = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        const data = await res.json()

        if (data.success) {
          const job = data.data

          if (job.status === 'COMPLETED') {
            setGeneratingPDF(false)
            setShowPDFDialog(false)

            const result = JSON.parse(job.result)
            const fileId = result.fileId

            window.open(`/api/files/${fileId}/download`, '_blank')
            return
          }

          if (job.status === 'FAILED') {
            setError(job.error || 'PDF generation failed')
            setGeneratingPDF(false)
            return
          }

          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000)
          } else {
            setError('PDF generation timeout')
            setGeneratingPDF(false)
          }
        }
      } catch (err) {
        console.error('Error polling PDF job:', err)
        setGeneratingPDF(false)
      }
    }

    poll()
  }

  const renderStatusActions = () => {
    if (!deliverable || viewMode) return null

    const { status } = deliverable

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

  if (error && !deliverable) {
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

  if (!deliverable) return null

  const statusInfo = statusConfig[deliverable.status]

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/clients/${clientId}/deliverables`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Deliverables
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Month {deliverable.month}</h1>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              {viewMode && <Badge variant="outline">View Only</Badge>}
            </div>
            <p className="text-lg font-medium mt-1">{deliverable.title}</p>
            <p className="text-muted-foreground mt-1">
              {deliverable.client.brandName || deliverable.client.creatorName}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span>Created: {format(new Date(deliverable.createdAt), 'MMM dd, yyyy')}</span>
              <span>Updated: {format(new Date(deliverable.updatedAt), 'MMM dd, yyyy')}</span>
              <span>By: {deliverable.generatedByUser.name}</span>
            </div>
            {deliverable.rejectionReason && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                <strong>Rejection reason:</strong> {deliverable.rejectionReason}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {renderStatusActions()}
            <Button
              variant="outline"
              onClick={() => setShowPDFDialog(true)}
              disabled={generatingPDF}
            >
              {generatingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </>
              )}
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
          <CardTitle>Deliverable Content</CardTitle>
          <CardDescription>
            {viewMode
              ? 'Viewing deliverable in read-only mode'
              : 'Edit the deliverable content. Auto-saves every 30 seconds.'}
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
            <DialogTitle>Reject Deliverable</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this deliverable.
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

      {/* PDF Generation Dialog */}
      <Dialog open={showPDFDialog} onOpenChange={setShowPDFDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to PDF</DialogTitle>
            <DialogDescription>
              Choose the quality for your PDF export.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  pdfQuality === 'draft'
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPDFQuality('draft')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Draft Quality (150 DPI)</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Faster generation, smaller file size.
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="quality"
                    value="draft"
                    checked={pdfQuality === 'draft'}
                    onChange={() => setPDFQuality('draft')}
                    className="h-4 w-4"
                  />
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  pdfQuality === 'final'
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPDFQuality('final')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Final Quality (300 DPI)</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      High-resolution output for client delivery.
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="quality"
                    value="final"
                    checked={pdfQuality === 'final'}
                    onChange={() => setPDFQuality('final')}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPDFDialog(false)}
              disabled={generatingPDF}
            >
              Cancel
            </Button>
            <Button onClick={handleGeneratePDF} disabled={generatingPDF}>
              {generatingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
