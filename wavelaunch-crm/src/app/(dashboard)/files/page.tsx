'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Search, Download, Folder, FileText, Image, Film, Music, File as FileIcon } from 'lucide-react'

interface File {
  id: string
  filename: string
  filepath: string
  filesize: number
  mimetype: string
  category: string
  uploadedAt: string
  client?: {
    id: string
    creatorName: string
    brandName?: string
  }
}

const FILE_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'BUSINESS_PLAN', label: 'Business Plans' },
  { value: 'DELIVERABLE', label: 'Deliverables' },
  { value: 'UPLOAD', label: 'Uploads' },
  { value: 'MISC', label: 'Miscellaneous' },
]

export default function FilesPage() {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [filteredFiles, setFilteredFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])

  // Stats
  const [totalSize, setTotalSize] = useState(0)
  const [fileCount, setFileCount] = useState(0)

  useEffect(() => {
    fetchClients()
    fetchFiles()
  }, [])

  useEffect(() => {
    filterFiles()
  }, [files, search, categoryFilter, clientFilter])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()

      if (data.success) {
        setClients(
          data.data.map((c: any) => ({
            id: c.id,
            name: c.brandName || c.creatorName,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files')
      const data = await res.json()

      if (data.success) {
        // Filter out deleted files (soft deletes)
        const activeFiles = data.data.filter((f: any) => !f.deletedAt)
        setFiles(activeFiles)
        calculateStats(activeFiles)
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (fileList: File[]) => {
    const total = fileList.reduce((sum, file) => sum + file.filesize, 0)
    setTotalSize(total)
    setFileCount(fileList.length)
  }

  const filterFiles = () => {
    let filtered = files

    // Search filter
    if (search) {
      filtered = filtered.filter((file) =>
        file.filename.toLowerCase().includes(search.toLowerCase()) ||
        file.client?.creatorName.toLowerCase().includes(search.toLowerCase()) ||
        file.client?.brandName?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((file) => file.category === categoryFilter)
    }

    // Client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter((file) => file.client?.id === clientFilter)
    }

    setFilteredFiles(filtered)
    calculateStats(filtered)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <Image className="h-4 w-4" />
    if (mimetype.startsWith('video/')) return <Film className="h-4 w-4" />
    if (mimetype.startsWith('audio/')) return <Music className="h-4 w-4" />
    if (mimetype.includes('pdf')) return <FileText className="h-4 w-4" />
    return <FileIcon className="h-4 w-4" />
  }

  const handleDownload = async (file: File) => {
    try {
      const res = await fetch(`/api/files/${file.id}/download`)
      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Download started',
        description: `Downloading ${file.filename}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Files</h1>
          <p className="text-muted-foreground">
            {fileCount} files • {formatFileSize(totalSize)} total
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Files</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{fileCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Size</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{formatFileSize(totalSize)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Images</span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {files.filter((f) => f.mimetype.startsWith('image/')).length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Documents</span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {files.filter((f) => f.mimetype.includes('pdf') || f.mimetype.includes('document')).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {FILE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Files List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No files found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search || categoryFilter !== 'all' || clientFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No files have been uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">File</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Uploaded</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.mimetype)}
                        <span className="font-medium">{file.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {file.client ? (
                        <Link
                          href={`/clients/${file.client.id}`}
                          className="text-primary hover:underline"
                        >
                          {file.client.brandName || file.client.creatorName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">No client</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-blue-100 text-blue-800">
                        {file.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatFileSize(file.filesize)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {file.client && (
                          <Link href={`/clients/${file.client.id}/files`}>
                            <Button variant="ghost" size="sm">
                              <Folder className="mr-2 h-4 w-4" />
                              View in Client
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
