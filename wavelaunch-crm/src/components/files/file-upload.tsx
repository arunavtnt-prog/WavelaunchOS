'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MAX_FILE_SIZE_BYTES } from '@/lib/utils/constants'

interface FileUploadProps {
  clientId: string
  category?: 'BUSINESS_PLAN' | 'DELIVERABLE' | 'UPLOAD' | 'MISC'
  onUploadComplete?: () => void
}

type UploadingFile = {
  file: File
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function FileUpload({ clientId, category = 'UPLOAD', onUploadComplete }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Initialize upload status for all files
      const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        status: 'uploading' as const,
      }))
      setUploadingFiles((prev) => [...prev, ...newFiles])

      // Upload files
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('clientId', clientId)
          formData.append('category', category)

          const res = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData,
          })

          const data = await res.json()

          if (data.success) {
            // Mark as success
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.file === file ? { ...f, status: 'success' as const } : f
              )
            )
          } else {
            // Mark as error
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.file === file
                  ? { ...f, status: 'error' as const, error: data.error }
                  : f
              )
            )
          }
        } catch (error) {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? { ...f, status: 'error' as const, error: 'Upload failed' }
                : f
            )
          )
        }
      }

      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete()
      }
    },
    [clientId, category, onUploadComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE_BYTES,
  })

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum file size: {MAX_FILE_SIZE_BYTES / 1024 / 1024}MB
            </p>
          </>
        )}
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Uploading {uploadingFiles.length} file{uploadingFiles.length !== 1 ? 's' : ''}
          </h3>
          {uploadingFiles.map((uploadFile, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-3">
                <FileIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                  {uploadFile.status === 'error' && uploadFile.error && (
                    <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                {uploadFile.status !== 'uploading' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(uploadFile.file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
