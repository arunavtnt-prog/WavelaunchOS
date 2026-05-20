'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

interface Job {
  id: string
  type: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: number
  error: string | null
  result: any
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  retryCount: number
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  })

  useEffect(() => {
    fetchJobs()
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs')
      const data = await res.json()

      if (data.success) {
        setJobs(data.data)

        // Calculate stats
        const stats = {
          total: data.data.length,
          pending: data.data.filter((j: Job) => j.status === 'PENDING').length,
          processing: data.data.filter((j: Job) => j.status === 'PROCESSING').length,
          completed: data.data.filter((j: Job) => j.status === 'COMPLETED').length,
          failed: data.data.filter((j: Job) => j.status === 'FAILED').length,
        }
        setStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: Job['status']) => {
    const variants: Record<Job['status'], string> = {
      PENDING: 'bg-gray-100 text-gray-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    }

    return (
      <Badge className={variants[status]} variant="secondary">
        {status}
      </Badge>
    )
  }

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      GENERATE_BUSINESS_PLAN: 'Generate Business Plan',
      GENERATE_DELIVERABLE: 'Generate Deliverable',
      GENERATE_PDF: 'Generate PDF',
      CLEANUP_TEMP_FILES: 'Cleanup Temp Files',
    }
    return labels[type] || type
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getDuration = (job: Job) => {
    if (!job.startedAt) return null
    const end = job.completedAt ? new Date(job.completedAt) : new Date()
    const start = new Date(job.startedAt)
    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Queue</h1>
          <p className="text-muted-foreground">
            Monitor background jobs and task status
          </p>
        </div>
        <Button variant="outline" onClick={fetchJobs}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total Jobs</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.pending}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Processing</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.processing}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.completed}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Failed</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.failed}</p>
        </div>
      </div>

      {/* Auto-refresh notice */}
      <div className="rounded-lg border bg-blue-50 p-3 text-sm text-blue-800">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Auto-refreshing every 5 seconds</span>
        </div>
      </div>

      {/* Jobs List */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Jobs</h2>
          <p className="text-sm text-muted-foreground">
            Last 50 jobs (newest first)
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No jobs yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(job.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {getJobTypeLabel(job.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {job.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusBadge(job.status)}
                    {job.retryCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Retry {job.retryCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress bar for processing jobs */}
                {job.status === 'PROCESSING' && job.progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(job.createdAt)}</p>
                  </div>
                  {job.startedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p className="font-medium">{formatDate(job.startedAt)}</p>
                    </div>
                  )}
                  {job.completedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="font-medium">{formatDate(job.completedAt)}</p>
                    </div>
                  )}
                  {getDuration(job) && (
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">{getDuration(job)}</p>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {job.error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-xs font-medium text-red-900">Error:</p>
                    <p className="text-sm text-red-800 mt-1">{job.error}</p>
                  </div>
                )}

                {/* Result (for completed jobs) */}
                {job.status === 'COMPLETED' && job.result && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                    <p className="text-xs font-medium text-green-900">Result:</p>
                    <pre className="text-xs text-green-800 mt-1 overflow-x-auto">
                      {JSON.stringify(job.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
