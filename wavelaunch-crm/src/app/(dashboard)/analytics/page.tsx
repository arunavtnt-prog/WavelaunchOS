'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, FileText, CheckCircle, TrendingUp, Calendar } from 'lucide-react'

interface AnalyticsData {
  clientGrowth: { month: string; count: number }[]
  deliverableStatus: { name: string; value: number }[]
  filesByCategory: { name: string; count: number }[]
  monthlyActivity: { month: string; activities: number }[]
  stats: {
    totalClients: number
    activeClients: number
    totalDeliverables: number
    completedDeliverables: number
    totalFiles: number
    totalStorage: number
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics')
      const result = await res.json()

      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>
  }

  if (!data) {
    return <div className="text-center py-12">Failed to load analytics</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Business insights and performance metrics
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">
              Total Clients
            </span>
          </div>
          <p className="text-3xl font-bold">{data.stats.totalClients}</p>
          <p className="text-xs text-green-600 mt-1">
            {data.stats.activeClients} active
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-muted-foreground">
              Deliverables
            </span>
          </div>
          <p className="text-3xl font-bold">{data.stats.totalDeliverables}</p>
          <p className="text-xs text-green-600 mt-1">
            {data.stats.completedDeliverables} completed
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </span>
          </div>
          <p className="text-3xl font-bold">
            {data.stats.totalDeliverables > 0
              ? Math.round((data.stats.completedDeliverables / data.stats.totalDeliverables) * 100)
              : 0}
            %
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-muted-foreground">
              Storage Used
            </span>
          </div>
          <p className="text-3xl font-bold">
            {formatFileSize(data.stats.totalStorage)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.stats.totalFiles} files
          </p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Growth */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Client Growth (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.clientGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Clients"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Deliverable Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Deliverable Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.deliverableStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.deliverableStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Files by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Files by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.filesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10b981" name="File Count" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="activities"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Activities"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Deliverables Progress by Month */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">8-Month Program Progress</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((month) => {
            const monthDeliverables = data.deliverableStatus.find(
              (d) => d.name === `M${month}`
            ) || { value: 0 }
            const total = data.stats.totalClients
            const percentage = total > 0 ? (monthDeliverables.value / total) * 100 : 0

            return (
              <div key={month}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Month {month}</span>
                  <span className="text-sm text-muted-foreground">
                    {monthDeliverables.value}/{total} ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
