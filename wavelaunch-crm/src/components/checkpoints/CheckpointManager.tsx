'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Play, Trash2, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Checkpoint {
  id: string
  jobId: string
  jobType: string
  status: string
  totalSections: number
  completedSections: number
  currentSection: number
  createdAt: string
  updatedAt: string
  errorMessage?: string
  client: {
    id: string
    creatorName: string
    brandName?: string
  }
}

export function CheckpointManager() {
  const { toast } = useToast()
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [resumingId, setResumingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCheckpoints()
  }, [])

  const fetchCheckpoints = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkpoints')
      const data = await res.json()

      if (data.success) {
        setCheckpoints(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch checkpoints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResume = async (jobId: string) => {
    setResumingId(jobId)
    try {
      const res = await fetch('/api/checkpoints/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Generation resumed successfully',
        })
        fetchCheckpoints()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to resume generation',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resume generation',
        variant: 'destructive',
      })
    } finally {
      setResumingId(null)
    }
  }

  const handleDelete = async (jobId: string) => {
    try {
      const res = await fetch(`/api/checkpoints?jobId=${jobId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Checkpoint deleted successfully',
        })
        fetchCheckpoints()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete checkpoint',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete checkpoint',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'text-blue-600'
      case 'FAILED':
        return 'text-red-600'
      case 'COMPLETED':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const calculateProgress = (checkpoint: Checkpoint) => {
    if (checkpoint.totalSections === 0) return 0
    return Math.round(
      (checkpoint.completedSections / checkpoint.totalSections) * 100
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(hours / 24)
      return `${days} day${days !== 1 ? 's' : ''} ago`
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading checkpoints...</p>
      </div>
    )
  }

  if (checkpoints.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Interrupted Jobs</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            When AI generation is interrupted, you'll see resumable checkpoints here to
            continue where you left off.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Resumable Checkpoints</h2>
        <p className="text-muted-foreground">
          Resume interrupted AI generation jobs to save time and tokens
        </p>
      </div>

      <div className="grid gap-4">
        {checkpoints.map((checkpoint) => {
          const progress = calculateProgress(checkpoint)
          const isResuming = resumingId === checkpoint.jobId

          return (
            <Card key={checkpoint.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {checkpoint.jobType === 'BUSINESS_PLAN'
                        ? 'Business Plan'
                        : 'Deliverable'}
                    </CardTitle>
                    <CardDescription>
                      <Link
                        href={`/clients/${checkpoint.client.id}`}
                        className="text-primary hover:underline"
                      >
                        {checkpoint.client.brandName ||
                          checkpoint.client.creatorName}
                      </Link>
                      {' • '}
                      <span className={getStatusColor(checkpoint.status)}>
                        {checkpoint.status.replace(/_/g, ' ')}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {formatDate(checkpoint.updatedAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span>
                      {checkpoint.completedSections} of {checkpoint.totalSections}{' '}
                      sections completed
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Error message if failed */}
                {checkpoint.status === 'FAILED' && checkpoint.errorMessage && (
                  <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Generation failed</p>
                      <p className="text-xs mt-1">{checkpoint.errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleResume(checkpoint.jobId)}
                    disabled={isResuming}
                    className="flex-1"
                  >
                    {isResuming ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Resuming...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume Generation
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(checkpoint.jobId)}
                    disabled={isResuming}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Token savings info */}
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                  Resuming will save ~{progress}% of tokens by reusing completed
                  sections
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
