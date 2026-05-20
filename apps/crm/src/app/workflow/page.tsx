'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Loader2, CheckCircle, AlertCircle, Clock, FileText, Mail, Users, RefreshCw, History, Eye } from 'lucide-react'

interface WorkflowStats {
  total: number
  pendingReview: number
  awaitingResponse: number
  converted: number
  rejected: number
}

interface ExecutionStatus {
  isRunning: boolean
  progress: number
  total: number
  current: number
  message: string
}

interface ExecutionLog {
  id: string
  startedAt: string
  completedAt?: string
  status: 'running' | 'completed' | 'failed'
  applicationsProcessed: number
  errors: number
}

export default function WorkflowDashboard() {
  const [stats, setStats] = useState<WorkflowStats>({
    total: 0,
    pendingReview: 0,
    awaitingResponse: 0,
    converted: 0,
    rejected: 0
  })
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>({
    isRunning: false,
    progress: 0,
    total: 0,
    current: 0,
    message: ''
  })
  const [recentExecutions, setRecentExecutions] = useState<ExecutionLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentExecutions()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/workflow/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Use mock data for demo
      setStats({
        total: 12,
        pendingReview: 3,
        awaitingResponse: 5,
        converted: 3,
        rejected: 1
      })
    }
  }

  const fetchRecentExecutions = async () => {
    try {
      const response = await fetch('/api/workflow/executions?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentExecutions(data)
      }
    } catch (error) {
      console.error('Failed to fetch executions:', error)
      // Use mock data for demo
      setRecentExecutions([
        {
          id: '1',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date(Date.now() - 3500000).toISOString(),
          status: 'completed',
          applicationsProcessed: 2,
          errors: 0
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleRunNow = async () => {
    if (executionStatus.isRunning) return

    setExecutionStatus({
      isRunning: true,
      progress: 0,
      total: 0,
      current: 0,
      message: 'Initializing workflow...'
    })

    try {
      const response = await fetch('/api/workflow/execute', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Execution failed')
      }

      const result = await response.json()
      
      setExecutionStatus({
        isRunning: false,
        progress: 100,
        total: result.processed || 0,
        current: result.processed || 0,
        message: `Completed! Processed ${result.processed} applications.`
      })

      // Refresh stats
      fetchStats()
      fetchRecentExecutions()
    } catch (error) {
      setExecutionStatus({
        isRunning: false,
        progress: 0,
        total: 0,
        current: 0,
        message: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
      case 'running':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Running</Badge>
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Workflow Automation</h1>
            <p className="text-slate-400 mt-1">Manage application processing pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-slate-400">System Ready</span>
          </div>
        </div>

        {/* Run Now Section */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
                <Play className="w-10 h-10 text-blue-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Run Workflow Now</h2>
                <p className="text-slate-400 max-w-md">
                  Execute the workflow manually to process pending applications, generate blueprints, 
                  and create email drafts.
                </p>
              </div>

              {executionStatus.isRunning ? (
                <div className="w-full max-w-md space-y-4">
                  <div className="flex items-center justify-center gap-2 text-blue-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{executionStatus.message}</span>
                  </div>
                  <Progress value={executionStatus.progress} className="h-2" />
                  <p className="text-sm text-slate-500">
                    Processing {executionStatus.current} of {executionStatus.total} applications
                  </p>
                </div>
              ) : executionStatus.message ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>{executionStatus.message}</span>
                </div>
              ) : null}

              <Button
                size="lg"
                onClick={handleRunNow}
                disabled={executionStatus.isRunning}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
              >
                {executionStatus.isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Run Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Applications</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pendingReview}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Awaiting Response</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">{stats.awaitingResponse}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Converted</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{stats.converted}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/50 border-slate-700/50 hover:border-blue-500/30 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Review Queue</h3>
                  <p className="text-sm text-slate-400">Review pending applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 hover:border-blue-500/30 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <Mail className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email Drafts</h3>
                  <p className="text-sm text-slate-400">View pending email drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 hover:border-blue-500/30 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                  <History className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Execution History</h3>
                  <p className="text-sm text-slate-400">View past workflow runs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Executions */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Executions</CardTitle>
                <CardDescription className="text-slate-400">
                  History of workflow runs
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRecentExecutions}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : recentExecutions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No executions yet</p>
                <p className="text-sm">Click "Run Now" to start processing</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-4">
                      {execution.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : execution.status === 'running' ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">
                          Execution #{execution.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-slate-400">
                          Started: {formatDate(execution.startedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">
                          {execution.applicationsProcessed} applications
                        </p>
                        {execution.errors > 0 && (
                          <p className="text-sm text-red-400">
                            {execution.errors} errors
                          </p>
                        )}
                      </div>
                      {getStatusBadge(execution.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
