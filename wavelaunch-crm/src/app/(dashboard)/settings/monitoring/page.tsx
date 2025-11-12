'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  Database,
  Folder,
  HardDrive,
  Activity,
  AlertCircle,
  CheckCircle,
  Server,
  Users,
  FileText,
  StickyNote,
} from 'lucide-react'

interface SystemStats {
  storage: {
    database: { bytes: number; readable: string }
    files: { bytes: number; count: number; readable: string }
    backups: { bytes: number; count: number; readable: string }
    total: { bytes: number; readable: string }
  }
  jobs: {
    byStatus: {
      PENDING: number
      PROCESSING: number
      COMPLETED: number
      FAILED: number
    }
    total: number
    recentFailures: Array<{
      id: string
      type: string
      error: string
      createdAt: string
    }>
  }
  records: {
    clients: number
    businessPlans: number
    deliverables: number
    notes: number
    activities: number
  }
  system: {
    uptimeSeconds: number
    uptimeReadable: string
    memory: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
      rssReadable: string
      heapUsedReadable: string
    }
    nodeVersion: string
    platform: string
  }
}

export default function MonitoringPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/system/stats')
      const data = await res.json()

      if (data.success) {
        setStats(data.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return <div>Loading...</div>
  }

  const jobHealthPercentage = stats.jobs.total > 0
    ? Math.round(((stats.jobs.byStatus.COMPLETED + stats.jobs.byStatus.PROCESSING) / stats.jobs.total) * 100)
    : 100

  const hasFailures = stats.jobs.byStatus.FAILED > 0 || stats.jobs.recentFailures.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor system health and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" onClick={fetchStats}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Job Queue Health */}
          <div className="flex items-center gap-4">
            <div className={`rounded-full p-3 ${hasFailures ? 'bg-yellow-100' : 'bg-green-100'}`}>
              {hasFailures ? (
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Job Queue</p>
              <p className="text-lg font-semibold">
                {hasFailures ? 'Has Failures' : 'Healthy'}
              </p>
              <p className="text-xs text-muted-foreground">
                {jobHealthPercentage}% success rate
              </p>
            </div>
          </div>

          {/* Storage Health */}
          <div className="flex items-center gap-4">
            <div className="rounded-full p-3 bg-blue-100">
              <HardDrive className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storage</p>
              <p className="text-lg font-semibold">{stats.storage.total.readable}</p>
              <p className="text-xs text-muted-foreground">
                Total disk usage
              </p>
            </div>
          </div>

          {/* System Uptime */}
          <div className="flex items-center gap-4">
            <div className="rounded-full p-3 bg-purple-100">
              <Server className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-lg font-semibold">{stats.system.uptimeReadable}</p>
              <p className="text-xs text-muted-foreground">
                Since last restart
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Statistics */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Storage Statistics</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <p className="text-2xl font-bold">{stats.storage.database.readable}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Files</span>
            </div>
            <p className="text-2xl font-bold">{stats.storage.files.readable}</p>
            <p className="text-xs text-muted-foreground">
              {stats.storage.files.count} files
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Backups</span>
            </div>
            <p className="text-2xl font-bold">{stats.storage.backups.readable}</p>
            <p className="text-xs text-muted-foreground">
              {stats.storage.backups.count} backups
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.storage.total.readable}</p>
          </div>
        </div>
      </div>

      {/* Job Queue Statistics */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Job Queue Statistics</h2>
        <div className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <span className="text-sm font-medium">Total Jobs</span>
            <p className="text-2xl font-bold">{stats.jobs.total}</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">Pending</span>
            <p className="text-2xl font-bold">{stats.jobs.byStatus.PENDING}</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-blue-600">Processing</span>
            <p className="text-2xl font-bold">{stats.jobs.byStatus.PROCESSING}</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-green-600">Completed</span>
            <p className="text-2xl font-bold">{stats.jobs.byStatus.COMPLETED}</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-red-600">Failed</span>
            <p className="text-2xl font-bold">{stats.jobs.byStatus.FAILED}</p>
          </div>
        </div>

        {/* Recent Failures */}
        {stats.jobs.recentFailures.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-red-900">Recent Failures</h3>
            <div className="space-y-2">
              {stats.jobs.recentFailures.map((job) => (
                <div key={job.id} className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">{job.type}</p>
                      <p className="text-xs text-red-700 mt-1">{job.error}</p>
                      <p className="text-xs text-red-600 mt-1">
                        {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Database Records */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Database Records</h2>
        <div className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Clients</span>
            </div>
            <p className="text-2xl font-bold">{stats.records.clients}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Business Plans</span>
            </div>
            <p className="text-2xl font-bold">{stats.records.businessPlans}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Deliverables</span>
            </div>
            <p className="text-2xl font-bold">{stats.records.deliverables}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Notes</span>
            </div>
            <p className="text-2xl font-bold">{stats.records.notes}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Activities</span>
            </div>
            <p className="text-2xl font-bold">{stats.records.activities}</p>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">System Information</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Memory */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Memory Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Resident Set Size</span>
                <span className="font-medium">{stats.system.memory.rssReadable}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Heap Used</span>
                <span className="font-medium">{stats.system.memory.heapUsedReadable}</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Platform</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Node Version</span>
                <span className="font-medium">{stats.system.nodeVersion}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform</span>
                <span className="font-medium">{stats.system.platform}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-refresh notice */}
      <div className="rounded-lg border bg-blue-50 p-3 text-sm text-blue-800">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Auto-refreshing every 30 seconds</span>
        </div>
      </div>
    </div>
  )
}
