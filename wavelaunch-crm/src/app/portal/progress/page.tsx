'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, TrendingUp, Clock, Target } from 'lucide-react'
import { ProgressTimeline } from '@/components/portal/progress-timeline'
import { useToast } from '@/hooks/use-toast'

interface Milestone {
  month: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'APPROVED'
  deliveredAt: Date | null
  createdAt: Date | null
}

interface Stats {
  totalMonths: number
  completedCount: number
  inProgressCount: number
  pendingCount: number
  progressPercentage: number
}

interface Timeline {
  startDate: Date
  firstCompletedDate: Date | null
  lastCompletedDate: Date | null
  daysSinceStart: number
  estimatedCompletionDate: Date
}

export default function ProgressPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [timeline, setTimeline] = useState<Timeline | null>(null)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/portal/progress')
      const data = await response.json()

      if (data.success) {
        setMilestones(data.data.milestones)
        setStats(data.data.stats)
        setTimeline(data.data.timeline)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load progress data',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to load progress data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your journey through the Wavelaunch 8-month program
        </p>
      </div>

      {/* Timeline Overview */}
      {timeline && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {new Date(timeline.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {timeline.daysSinceStart} days ago
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-primary">
                {stats?.progressPercentage}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.completedCount} of {stats?.totalMonths} months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-blue-600">
                {stats?.inProgressCount}
              </div>
              <p className="text-xs text-muted-foreground">Active milestones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Est. Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {new Date(timeline.estimatedCompletionDate).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    year: 'numeric',
                  }
                )}
              </div>
              <p className="text-xs text-muted-foreground">Target date</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Timeline */}
      <ProgressTimeline
        milestones={milestones}
        currentMonth={stats?.completedCount || 1}
        totalMonths={stats?.totalMonths || 8}
      />

      {/* Motivational Message */}
      {stats && stats.progressPercentage >= 50 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">
                  You're more than halfway there!
                </h3>
                <p className="text-sm text-purple-700">
                  Keep up the great work. You're on track to complete your journey
                  and launch your thriving creator business.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && stats.progressPercentage === 100 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Congratulations! Journey Complete!
                </h3>
                <p className="text-sm text-green-700">
                  You've completed all 8 months of the Wavelaunch program. Your
                  creator business is ready to thrive!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
