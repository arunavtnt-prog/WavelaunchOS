'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users, FileText, Target, AlertCircle, TrendingUp, Clock, CheckCircle,
  Plus, Rocket, Zap, Bell, Activity, Calendar, DollarSign, HardDrive
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DashboardData {
  overview: {
    totalClients: number
    activeClients: number
    totalBusinessPlans: number
    totalDeliverables: number
    completionRate: number
  }
  deliverableMetrics: {
    completedThisMonth: number
    overdueCount: number
    averageCompletionTime: number
  }
  systemHealth: {
    totalJobs: number
    queuedJobs: number
    failedJobs: number
    successRate: number
    storageUsed: number
    storageLimit: number
  }
  activity: {
    recentActivities: Array<{
      type: string
      count: number
      lastOccurred: string
    }>
    activeUsersToday: number
    actionsToday: number
  }
}

interface RecentClient {
  id: string
  creatorName: string
  status: string
  createdAt: string
}

interface UpcomingDeliverable {
  id: string
  month: number
  status: string
  client: {
    creatorName: string
  }
  dueDate?: string
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [recentClients, setRecentClients] = useState<RecentClient[]>([])
  const [upcomingDeliverables, setUpcomingDeliverables] = useState<UpcomingDeliverable[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, clientsRes, deliverablesRes] = await Promise.all([
        fetch('/api/analytics/dashboard'),
        fetch('/api/clients?limit=5&sort=createdAt:desc'),
        fetch('/api/deliverables?status=PENDING&limit=5')
      ])

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setData(analyticsData)
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setRecentClients(clientsData.clients || [])
      }

      if (deliverablesRes.ok) {
        const deliverablesData = await deliverablesRes.json()
        setUpcomingDeliverables(deliverablesData.deliverables || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-500',
      PENDING: 'bg-yellow-500',
      ARCHIVED: 'bg-gray-500',
      DRAFT: 'bg-blue-500',
      IN_PROGRESS: 'bg-purple-500',
      APPROVED: 'bg-green-500',
      DELIVERED: 'bg-teal-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold">Failed to load dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your CRM today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchDashboardData()}>
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts Panel */}
      {(data.deliverableMetrics.overdueCount > 0 || data.systemHealth.failedJobs > 0) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-destructive" />
              <CardTitle className="text-base">Alerts & Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.deliverableMetrics.overdueCount > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-destructive/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="text-sm font-medium">
                      {data.deliverableMetrics.overdueCount} Overdue Deliverables
                    </p>
                    <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                  </div>
                </div>
                <Link href="/deliverables">
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            )}
            {data.systemHealth.failedJobs > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-destructive/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="text-sm font-medium">
                      {data.systemHealth.failedJobs} Failed Jobs
                    </p>
                    <p className="text-xs text-muted-foreground">Check job queue for errors</p>
                  </div>
                </div>
                <Link href="/jobs">
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.overview.activeClients} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Deliverables</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalDeliverables}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.deliverableMetrics.completedThisMonth} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(data.systemHealth.storageUsed)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {formatBytes(data.systemHealth.storageLimit)} ({
                ((data.systemHealth.storageUsed / data.systemHealth.storageLimit) * 100).toFixed(1)
              }%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-accent"
              onClick={() => router.push('/clients/new')}
            >
              <Plus className="h-5 w-5 mb-2" />
              <span className="font-semibold">New Client</span>
              <span className="text-xs text-muted-foreground mt-1">Onboard a creator</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-accent"
              onClick={() => router.push('/deliverables')}
            >
              <Rocket className="h-5 w-5 mb-2" />
              <span className="font-semibold">Generate Deliverable</span>
              <span className="text-xs text-muted-foreground mt-1">AI-powered docs</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-accent"
              onClick={() => router.push('/reports')}
            >
              <FileText className="h-5 w-5 mb-2" />
              <span className="font-semibold">Export Report</span>
              <span className="text-xs text-muted-foreground mt-1">Generate insights</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-accent"
              onClick={() => router.push('/analytics')}
            >
              <TrendingUp className="h-5 w-5 mb-2" />
              <span className="font-semibold">View Analytics</span>
              <span className="text-xs text-muted-foreground mt-1">Deep insights</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activity.recentActivities.slice(0, 8).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.lastOccurred).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{activity.count}</Badge>
                </div>
              ))}
            </div>
            {data.activity.recentActivities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Queue and performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Success Rate</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {data.systemHealth.successRate.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Queued Jobs</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {data.systemHealth.queuedJobs}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm">Failed Jobs</span>
              </div>
              <span className="text-lg font-bold text-destructive">
                {data.systemHealth.failedJobs}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Processed</span>
              </div>
              <span className="text-lg font-bold">
                {data.systemHealth.totalJobs}
              </span>
            </div>

            <div className="pt-3 border-t">
              <Link href="/jobs">
                <Button variant="outline" className="w-full">
                  View Job Queue
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Clients</CardTitle>
                <CardDescription>Latest onboarded creators</CardDescription>
              </div>
              <Link href="/clients">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium">{client.creatorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(client.status)}`} />
                    <span className="text-xs text-muted-foreground">{client.status}</span>
                  </div>
                </div>
              ))}
            </div>
            {recentClients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No recent clients
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deliverables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Deliverables</CardTitle>
                <CardDescription>Pending work items</CardDescription>
              </div>
              <Link href="/deliverables">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/deliverables`)}
                >
                  <div>
                    <p className="text-sm font-medium">
                      Month {deliverable.month} - {deliverable.client.creatorName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {deliverable.dueDate
                        ? `Due ${new Date(deliverable.dueDate).toLocaleDateString()}`
                        : 'No due date'}
                    </p>
                  </div>
                  <Badge variant="secondary">{deliverable.status}</Badge>
                </div>
              ))}
            </div>
            {upcomingDeliverables.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No pending deliverables
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Activity</CardTitle>
          <CardDescription>Real-time activity metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.activity.activeUsersToday}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.activity.actionsToday}</p>
                <p className="text-xs text-muted-foreground">Actions Performed</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
