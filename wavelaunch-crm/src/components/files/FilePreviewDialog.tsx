'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FilePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId: string
  fileName: string
  fileUrl: string
  fileType?: string
  fileSize?: number
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  fileId,
  fileName,
  fileUrl,
  fileType,
  fileSize,
}: FilePreviewDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [previewContent, setPreviewContent] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadPreview()
    }
  }, [open, fileId])

  const loadPreview = async () => {
    setLoading(true)
    try {
      // For text files, fetch and display content
      if (isTextFile(fileName)) {
        const response = await fetch(fileUrl)
        const text = await response.text()
        setPreviewContent(text)
      }
    } catch (error) {
      console.error('Failed to load preview:', error)
      toast({
        title: 'Error',
        description: 'Failed to load file preview',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const isTextFile = (filename: string): boolean => {
    const textExtensions = ['.txt', '.md', '.json', '.csv', '.log', '.xml', '.yaml', '.yml']
    return textExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
  }

  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
  }

  const isPDFFile = (filename: string): boolean => {
    return filename.toLowerCase().endsWith('.pdf')
  }

  const isVideoFile = (filename: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
    return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
  }

  const isAudioFile = (filename: string): boolean => {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
    return audioExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: 'File downloaded successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      })
    }
  }

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank')
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {fileName}
          </DialogTitle>
          <DialogDescription>
            {fileType && <span className="mr-2">{fileType}</span>}
            {fileSize && <span>{formatFileSize(fileSize)}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading preview...</div>
            </div>
          ) : (
            <>
              {/* Image Preview */}
              {isImageFile(fileName) && (
                <div className="flex items-center justify-center bg-muted/10 rounded-lg p-4">
                  <img
                    src={fileUrl}
                    alt={fileName}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
              )}

              {/* PDF Preview */}
              {isPDFFile(fileName) && (
                <div className="w-full h-[60vh] rounded-lg overflow-hidden border">
                  <iframe
                    src={fileUrl}
                    className="w-full h-full"
                    title={fileName}
                  />
                </div>
              )}

              {/* Video Preview */}
              {isVideoFile(fileName) && (
                <div className="flex items-center justify-center bg-black rounded-lg">
                  <video
                    src={fileUrl}
                    controls
                    className="max-w-full max-h-[60vh] rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Audio Preview */}
              {isAudioFile(fileName) && (
                <div className="flex items-center justify-center p-8">
                  <div className="w-full max-w-md">
                    <div className="mb-4 text-center">
                      <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Audio File</p>
                    </div>
                    <audio src={fileUrl} controls className="w-full">
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                </div>
              )}

              {/* Text Preview */}
              {isTextFile(fileName) && previewContent && (
                <div className="rounded-lg border bg-muted/10">
                  <pre className="p-4 text-sm overflow-auto max-h-[60vh] whitespace-pre-wrap">
                    {previewContent}
                  </pre>
                </div>
              )}

              {/* Unsupported File Type */}
              {!isImageFile(fileName) &&
                !isPDFFile(fileName) &&
                !isVideoFile(fileName) &&
                !isAudioFile(fileName) &&
                !isTextFile(fileName) && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Preview not available
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This file type cannot be previewed in the browser.
                    </p>
                    <Button onClick={handleDownload} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download File
                    </Button>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
          <Button onClick={() => onOpenChange(false)} variant="default">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
