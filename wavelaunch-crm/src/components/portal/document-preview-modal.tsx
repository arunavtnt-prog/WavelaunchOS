'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, X, Calendar, FileText } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  document: {
    id: string
    type: 'business-plan' | 'deliverable'
    title: string
    version?: number
    month?: string
    status: string
    pdfUrl?: string | null
    createdAt: Date
    updatedAt: Date
  } | null
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
}: DocumentPreviewModalProps) {
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)

  if (!document) return null

  const handleDownload = async () => {
    if (!document.pdfUrl) {
      toast({
        title: 'Not available',
        description: 'This document is not yet available for download',
        variant: 'destructive',
      })
      return
    }

    try {
      setDownloading(true)

      // Call download API
      const endpoint =
        document.type === 'business-plan'
          ? `/api/portal/documents/business-plans/${document.id}/download`
          : `/api/portal/documents/deliverables/${document.id}/download`

      const response = await fetch(endpoint)
      const data = await response.json()

      if (data.success) {
        // Open download URL in new tab
        window.open(data.data.downloadUrl, '_blank')

        toast({
          title: 'Download started',
          description: 'Your document is being downloaded',
        })
      } else {
        toast({
          title: 'Download failed',
          description: data.error || 'Failed to download document',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while downloading',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">{document.title}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>
                  {document.type === 'business-plan'
                    ? `Version ${document.version}`
                    : document.month}
                </span>
                <span>•</span>
                <Badge
                  variant={
                    document.status === 'DELIVERED' ||
                    document.status === 'APPROVED'
                      ? 'default'
                      : document.status === 'IN_PROGRESS'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {document.status}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {new Date(document.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {new Date(document.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* PDF Preview */}
          {document.pdfUrl ? (
            <div className="rounded-lg border bg-muted/50 p-8 text-center">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                PDF preview will be available soon. Click download to view the document.
              </p>
              <Button onClick={handleDownload} disabled={downloading}>
                {downloading ? (
                  'Downloading...'
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/50 p-8 text-center">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                This document is being prepared and will be available soon.
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="rounded-lg border bg-card p-4">
            <h4 className="font-medium mb-2">About this document</h4>
            <p className="text-sm text-muted-foreground">
              {document.type === 'business-plan'
                ? 'This is your comprehensive business plan document covering your 8-month journey with Wavelaunch. It includes your brand strategy, target market analysis, monetization framework, and detailed roadmap.'
                : `This deliverable contains your ${document.month} content strategy, implementation guides, and actionable tasks to progress your business.`}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
