'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Database,
  Download,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'

interface BackupInfo {
  filename: string
  filepath: string
  timestamp: string
  sizeBytes: number
  isValid: boolean
}

interface BackupStats {
  totalBackups: number
  totalSizeBytes: number
  oldestBackup: string | null
  newestBackup: string | null
  validBackups: number
  invalidBackups: number
}

export default function BackupSettingsPage() {
  const { toast } = useToast()
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  // Create backup dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [backupLabel, setBackupLabel] = useState('')

  // Restore dialog
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [backupToRestore, setBackupToRestore] = useState<BackupInfo | null>(null)
  const [restoring, setRestoring] = useState(false)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [backupToDelete, setBackupToDelete] = useState<BackupInfo | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backups')
      const data = await res.json()

      if (data.success) {
        setBackups(data.data.backups)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: backupLabel || undefined }),
      })

      const data = await res.json()
      if (data.success) {
        await fetchBackups()
        setCreateDialogOpen(false)
        setBackupLabel('')
        toast({
          title: 'Success',
          description: 'Backup created successfully!',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create backup',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create backup:', error)
      toast({
        title: 'Error',
        description: 'Failed to create backup',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleRestoreBackup = async () => {
    if (!backupToRestore) return

    setRestoring(true)
    try {
      const res = await fetch(
        `/api/backups/${backupToRestore.filename}/restore`,
        {
          method: 'POST',
        }
      )

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Backup Restored',
          description: `Safety backup created: ${data.data.safetyBackup}. The page will reload to reflect the restored data.`,
        })
        // Reload page to reflect restored data
        setTimeout(() => window.location.reload(), 2000)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to restore backup',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to restore backup:', error)
      toast({
        title: 'Error',
        description: 'Failed to restore backup',
        variant: 'destructive',
      })
    } finally {
      setRestoring(false)
      setRestoreDialogOpen(false)
    }
  }

  const handleDeleteBackup = async () => {
    if (!backupToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/backups/${backupToDelete.filename}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.success) {
        await fetchBackups()
        setDeleteDialogOpen(false)
        setBackupToDelete(null)
        toast({
          title: 'Success',
          description: 'Backup deleted successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete backup',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete backup:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete backup',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDownloadBackup = async (backup: BackupInfo) => {
    try {
      const res = await fetch(`/api/backups/${backup.filename}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = backup.filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast({
          title: 'Success',
          description: 'Backup downloaded successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to download backup',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to download backup:', error)
      toast({
        title: 'Error',
        description: 'Failed to download backup',
        variant: 'destructive',
      })
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Backups</h1>
          <p className="text-muted-foreground">
            Manage your database backups and restore points
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBackups}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Database className="mr-2 h-4 w-4" />
            Create Backup
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Backups</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.totalBackups}</p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Valid Backups</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.validBackups}</p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Invalid Backups</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.invalidBackups}</p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Size</span>
            </div>
            <p className="mt-2 text-2xl font-bold">
              {formatBytes(stats.totalSizeBytes)}
            </p>
          </div>
        </div>
      )}

      {/* Backup Info */}
      <div className="rounded-lg border bg-blue-50 p-4 text-sm">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Backup Information</p>
            <ul className="mt-2 space-y-1 text-blue-800">
              <li>• Backups are stored locally in the data/backups directory</li>
              <li>• Restoring a backup creates a safety backup first</li>
              <li>• Old backups are automatically cleaned up after 30 days</li>
              <li>• You can download backups for external storage</li>
              <li>
                • <strong>Warning:</strong> Restoring will replace all current data
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Available Backups</h2>
          <p className="text-sm text-muted-foreground">
            {backups.length} backup{backups.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {backups.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No backups yet. Create your first backup to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {backups.map((backup) => (
              <div
                key={backup.filename}
                className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {backup.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{backup.filename}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(backup.timestamp)}
                    </span>
                    <span>{formatBytes(backup.sizeBytes)}</span>
                    {backup.isValid ? (
                      <Badge variant="default" className="text-xs">
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Invalid
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadBackup(backup)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {backup.isValid && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBackupToRestore(backup)
                        setRestoreDialogOpen(true)
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBackupToDelete(backup)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Backup Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Backup</DialogTitle>
            <DialogDescription>
              Create a backup of your database. You can optionally add a label
              to identify this backup.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label (optional)</Label>
              <Input
                id="label"
                value={backupLabel}
                onChange={(e) => setBackupLabel(e.target.value)}
                placeholder="e.g., before-migration, monthly-backup"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateBackup} disabled={creating}>
              {creating ? 'Creating...' : 'Create Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Backup</DialogTitle>
            <DialogDescription>
              This will restore your database to the selected backup point.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Warning: This action is critical!</p>
                  <ul className="mt-2 space-y-1">
                    <li>• All current data will be replaced</li>
                    <li>• A safety backup will be created first</li>
                    <li>• The application will reload after restore</li>
                  </ul>
                </div>
              </div>
            </div>

            {backupToRestore && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Backup to restore:</p>
                <p className="text-sm text-muted-foreground">
                  {backupToRestore.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created: {formatDate(backupToRestore.timestamp)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRestoreBackup}
              disabled={restoring}
            >
              {restoring ? 'Restoring...' : 'Restore Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Backup Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Backup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this backup? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {backupToDelete && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {backupToDelete.filename}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBackup}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
