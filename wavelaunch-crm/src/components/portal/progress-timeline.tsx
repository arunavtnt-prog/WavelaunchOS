'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Clock,
  Circle,
  TrendingUp,
  Calendar,
  Target,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Milestone {
  month: string
  title: string
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'APPROVED'
  deliveredAt: Date | null
  description?: string
}

interface ProgressTimelineProps {
  milestones: Milestone[]
  currentMonth?: number
  totalMonths?: number
}

const monthNumbers: Record<string, number> = {
  M1: 1,
  M2: 2,
  M3: 3,
  M4: 4,
  M5: 5,
  M6: 6,
  M7: 7,
  M8: 8,
}

export function ProgressTimeline({
  milestones,
  currentMonth = 1,
  totalMonths = 8,
}: ProgressTimelineProps) {
  const completedCount = milestones.filter(
    (m) => m.status === 'DELIVERED' || m.status === 'APPROVED'
  ).length
  const progressPercentage = Math.round((completedCount / totalMonths) * 100)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'DELIVERED':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
      default:
        return <Circle className="h-5 w-5 text-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'DELIVERED':
        return 'bg-green-100 border-green-500'
      case 'IN_PROGRESS':
        return 'bg-blue-100 border-blue-500'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getNextMilestone = () => {
    return milestones.find(
      (m) => m.status === 'IN_PROGRESS' || m.status === 'PENDING'
    )
  }

  const nextMilestone = getNextMilestone()

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your Journey Progress</CardTitle>
              <CardDescription>
                {completedCount} of {totalMonths} months completed
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">
                {progressPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />

          {nextMilestone && (
            <div className="mt-6 flex items-start gap-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <Target className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Next Milestone</p>
                <p className="text-sm text-blue-700">
                  {nextMilestone.month}: {nextMilestone.title}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>8-Month Roadmap</CardTitle>
          <CardDescription>
            Your step-by-step journey to building a thriving creator business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical Timeline */}
            <div className="space-y-6">
              {milestones.map((milestone, index) => {
                const isCompleted =
                  milestone.status === 'DELIVERED' ||
                  milestone.status === 'APPROVED'
                const isInProgress = milestone.status === 'IN_PROGRESS'
                const isPending = milestone.status === 'PENDING'

                return (
                  <div key={milestone.month} className="relative flex gap-4">
                    {/* Timeline Line */}
                    {index < milestones.length - 1 && (
                      <div className="absolute left-[20px] top-[28px] h-full w-0.5 bg-gray-200" />
                    )}

                    {/* Icon */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border-2',
                          isCompleted
                            ? 'border-green-500 bg-green-50'
                            : isInProgress
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-white'
                        )}
                      >
                        {getStatusIcon(milestone.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div
                        className={cn(
                          'rounded-lg border-2 p-4 transition-all',
                          getStatusColor(milestone.status),
                          isInProgress && 'shadow-md'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-primary">
                                {milestone.month}
                              </span>
                              <Badge
                                variant={
                                  isCompleted
                                    ? 'default'
                                    : isInProgress
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className="text-xs"
                              >
                                {milestone.status === 'APPROVED'
                                  ? 'Completed'
                                  : milestone.status === 'DELIVERED'
                                  ? 'Delivered'
                                  : milestone.status === 'IN_PROGRESS'
                                  ? 'In Progress'
                                  : 'Upcoming'}
                              </Badge>
                            </div>
                            <h4 className="font-semibold mb-1">
                              {milestone.title}
                            </h4>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground">
                                {milestone.description}
                              </p>
                            )}
                            {milestone.deliveredAt && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Delivered{' '}
                                  {new Date(
                                    milestone.deliveredAt
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          {isCompleted && (
                            <Award className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {milestones.filter((m) => m.status === 'IN_PROGRESS').length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Circle className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalMonths - completedCount}
                </p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
