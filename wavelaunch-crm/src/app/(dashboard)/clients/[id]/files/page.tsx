'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  FileText,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  Upload as UploadIcon,
  Filter,
  HardDrive,
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
import { FileUpload } from '@/components/files/file-upload'
import { STORAGE_LIMIT_BYTES } from '@/lib/utils/constants'

type File = {
  id: string
  filename: string
  filepath: string
  fileType: string
  fileSize: number
  category: 'BUSINESS_PLAN' | 'DELIVERABLE' | 'UPLOAD' | 'MISC'
  createdAt: string
  client: {
    id: string
    creatorName: string
    brandName: string | null
  }
  uploadedByUser: {
    id: string
    name: string
    email: string
  }
}

type Client = {
  id: string
  creatorName: string
  brandName: string | null
  email: string
}

type StorageStats = {
  usedBytes: number
  limitBytes: number
  usedPercentage: number
  warningThresholdBytes: number
  isWarning: boolean
  isOverLimit: boolean
  totalFiles: number
  availableBytes: number
}

const categoryConfig = {
  BUSINESS_PLAN: { label: 'Business Plan', color: 'bg-blue-500' },
  DELIVERABLE: { label: 'Deliverable', color: 'bg-purple-500' },
  UPLOAD: { label: 'Upload', color: 'bg-green-500' },
  MISC: { label: 'Misc', color: 'bg-gray-500' },
}

export default function FilesPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [filteredFiles, setFilteredFiles] = useState<File[]>([])
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [clientId])

  useEffect(() => {
    // Filter files by category
    if (selectedCategory) {
      setFilteredFiles(files.filter((f) => f.category === selectedCategory))
    } else {
      setFilteredFiles(files)
    }
  }, [files, selectedCategory])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch client
      const clientRes = await fetch(`/api/clients/${clientId}`)
      const clientData = await clientRes.json()
      if (clientData.success) {
        setClient(clientData.data)
      }

      // Fetch files
      const filesRes = await fetch(`/api/files?clientId=${clientId}`)
      const filesData = await filesRes.json()
      if (filesData.success) {
        setFiles(filesData.data)
      }

      // Fetch storage stats
      const storageRes = await fetch('/api/storage/stats')
      const storageData = await storageRes.json()
      if (storageData.success) {
        setStorageStats(storageData.data)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      setDeleting(true)
      const res = await fetch(`/api/files/${fileId}/delete`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        setDeleteConfirm(null)
        await fetchData() // Refresh
      } else {
        setError(data.error || 'Failed to delete file')
      }
    } catch (err) {
      console.error('Error deleting file:', err)
      setError('Failed to delete file')
    } finally {
      setDeleting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/clients" className="hover:text-foreground">
            Clients
          </Link>
          <span>/</span>
          <Link href={`/clients/${clientId}`} className="hover:text-foreground">
            {client?.creatorName}
          </Link>
          <span>/</span>
          <span className="text-foreground">Files</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Files</h1>
            <p className="text-muted-foreground mt-1">
              {client?.brandName || client?.creatorName}
            </p>
          </div>
          <Button onClick={() => setShowUploadDialog(true)}>
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
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

      {/* Storage Stats */}
      {storageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>
              {formatFileSize(storageStats.usedBytes)} of{' '}
              {formatFileSize(storageStats.limitBytes)} used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    storageStats.isOverLimit
                      ? 'bg-red-600'
                      : storageStats.isWarning
                      ? 'bg-yellow-500'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(storageStats.usedPercentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {storageStats.totalFiles} file{storageStats.totalFiles !== 1 ? 's' : ''}
                </span>
                <span
                  className={
                    storageStats.isOverLimit
                      ? 'text-red-600 font-medium'
                      : storageStats.isWarning
                      ? 'text-yellow-600 font-medium'
                      : 'text-muted-foreground'
                  }
                >
                  {storageStats.usedPercentage.toFixed(1)}% used
                </span>
              </div>
              {storageStats.isOverLimit && (
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Storage limit exceeded! Please delete some files.
                </p>
              )}
              {storageStats.isWarning && !storageStats.isOverLimit && (
                <p className="text-sm text-yellow-600 font-medium">
                  ⚠️ Approaching storage limit (80%)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All ({files.length})
            </Button>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const count = files.filter((f) => f.category === key).length
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                >
                  {config.label} ({count})
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No files yet</h3>
              <p className="text-muted-foreground mt-2">
                {selectedCategory
                  ? `No files in ${categoryConfig[selectedCategory as keyof typeof categoryConfig].label} category`
                  : 'Upload your first file to get started.'}
              </p>
              <Button onClick={() => setShowUploadDialog(true)} className="mt-4">
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFiles.map((file) => {
            const categoryInfo = categoryConfig[file.category]

            return (
              <Card key={file.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-8 w-8 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{file.filename}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span>•</span>
                          <span>{file.fileType}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/api/files/${file.id}/download`, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm(file.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Uploaded by {file.uploadedByUser.name} on{' '}
                      {format(new Date(file.createdAt), 'MMM dd, yyyy h:mm a')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Drag and drop files or click to browse. Maximum file size:{' '}
              {10}MB
            </DialogDescription>
          </DialogHeader>

          <FileUpload
            clientId={clientId}
            category="UPLOAD"
            onUploadComplete={() => {
              fetchData()
            }}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
