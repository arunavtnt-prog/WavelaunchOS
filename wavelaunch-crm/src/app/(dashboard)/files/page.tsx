'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  User,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
// Toast is available globally via window.toast
import { formatFileSize } from '@/lib/utils'

interface File {
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
    name: string
    email: string
  }
}

interface StorageStats {
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
  MISC: { label: 'Miscellaneous', color: 'bg-gray-500' },
}

export default function AllFilesPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const [filesRes, statsRes] = await Promise.all([
          fetch('/api/files'),
          fetch('/api/files/stats')
        ]);
        
        if (!filesRes.ok) throw new Error('Failed to fetch files')
        if (!statsRes.ok) throw new Error('Failed to fetch storage stats')
        
        const filesData = await filesRes.json()
        const statsData = await statsRes.json()
        
        setFiles(filesData.files)
        setStorageStats(statsData)
      } catch (error) {
        console.error('Error fetching files:', error)
        if (typeof window !== 'undefined' && window.toast) {
          window.toast({
            title: 'Error',
            description: 'Failed to load files. Please try again.',
            variant: 'destructive',
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [])

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      window.open(`/api/files/${fileId}/download`, '_blank')
    } catch (error) {
      console.error('Download error:', error)
      if (typeof window !== 'undefined' && window.toast) {
        window.toast({
          title: 'Error',
          description: 'Failed to download file. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(fileId)
      const response = await fetch(`/api/files/${fileId}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete file')

      setFiles(files.filter(file => file.id !== fileId))
      if (typeof window !== 'undefined' && window.toast) {
        window.toast({
          title: 'Success',
          description: 'File deleted successfully.',
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      if (typeof window !== 'undefined' && window.toast) {
        window.toast({
          title: 'Error',
          description: 'Failed to delete file. Please try again.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredFiles = files.filter(file => 
    file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.client.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (file.client.brandName && file.client.brandName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Files</h1>
          <p className="text-muted-foreground">
            Manage all files across all clients
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="pl-8 w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href="/files/upload">
              <UploadIcon className="mr-2 h-4 w-4" /> Upload
            </Link>
          </Button>
        </div>
      </div>

      {storageStats && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Storage Usage</CardTitle>
                <CardDescription>
                  {formatFileSize(storageStats.usedBytes)} of {formatFileSize(storageStats.limitBytes)} used
                </CardDescription>
              </div>
              <Badge variant={storageStats.isOverLimit ? 'destructive' : storageStats.isWarning ? 'secondary' : 'default'}>
                {storageStats.usedPercentage.toFixed(1)}% used
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  storageStats.isOverLimit 
                    ? 'bg-red-500' 
                    : storageStats.isWarning 
                      ? 'bg-yellow-500' 
                      : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, storageStats.usedPercentage)}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-muted-foreground flex justify-between">
              <span>{storageStats.totalFiles} files</span>
              <span>{formatFileSize(storageStats.availableBytes)} available</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Files</CardTitle>
          <CardDescription>
            Browse and manage all files across all clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <HardDrive className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No files found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'Upload your first file to get started'}
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/files/upload">
                    <UploadIcon className="mr-2 h-4 w-4" /> Upload File
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${categoryConfig[file.category].color}/10`}>
                      <FileText className={`h-5 w-5 ${categoryConfig[file.category].color}`} />
                    </div>
                    <div>
                      <div className="font-medium">
                        <Link 
                          href={`/clients/${file.client.id}/files`}
                          className="hover:underline"
                        >
                          {file.filename}
                        </Link>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center space-x-2">
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span>•</span>
                        <span>{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          {file.client.brandName || file.client.creatorName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {categoryConfig[file.category].label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file.id, file.filename)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.id)}
                      disabled={isDeleting === file.id}
                    >
                      {isDeleting === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
