'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import rehypeRaw from 'rehype-raw'

type BusinessPlan = {
  id: string
  version: number
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'DELIVERED' | 'REJECTED'
  contentMarkdown: string
  createdAt: string
  updatedAt: string
  generatedByUser: {
    id: string
    name: string
    email: string
  }
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-500' },
  PENDING_REVIEW: { label: 'Pending Review', color: 'bg-yellow-500' },
  APPROVED: { label: 'Approved', color: 'bg-green-500' },
  DELIVERED: { label: 'Delivered', color: 'bg-blue-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500' },
}

export default function BusinessPlanComparePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = params.id as string
  const leftId = searchParams.get('left')
  const rightId = searchParams.get('right')

  const [leftPlan, setLeftPlan] = useState<BusinessPlan | null>(null)
  const [rightPlan, setRightPlan] = useState<BusinessPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (leftId && rightId) {
      fetchPlans()
    } else {
      setError('Please select two versions to compare')
      setLoading(false)
    }
  }, [leftId, rightId])

  const fetchPlans = async () => {
    try {
      setLoading(true)

      const [leftRes, rightRes] = await Promise.all([
        fetch(`/api/business-plans/${leftId}`),
        fetch(`/api/business-plans/${rightId}`),
      ])

      const [leftData, rightData] = await Promise.all([leftRes.json(), rightRes.json()])

      if (leftData.success && rightData.success) {
        setLeftPlan(leftData.data)
        setRightPlan(rightData.data)
      } else {
        setError('Failed to load business plans')
      }
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError('Failed to load business plans')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !leftPlan || !rightPlan) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/clients/${clientId}/business-plan`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Business Plans
        </Button>
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error || 'Failed to load business plans'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const leftStatus = statusConfig[leftPlan.status]
  const rightStatus = statusConfig[rightPlan.status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/clients/${clientId}/business-plan`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Business Plans
        </Button>

        <h1 className="text-3xl font-bold">Compare Versions</h1>
        <p className="text-muted-foreground mt-1">Side-by-side comparison of business plan versions</p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Plan */}
        <Card>
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Version {leftPlan.version}</CardTitle>
                <CardDescription className="mt-2">
                  Created: {format(new Date(leftPlan.createdAt), 'MMM dd, yyyy')}
                </CardDescription>
              </div>
              <Badge className={leftStatus.color}>{leftStatus.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {leftPlan.contentMarkdown}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Right Plan */}
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Version {rightPlan.version}</CardTitle>
                <CardDescription className="mt-2">
                  Created: {format(new Date(rightPlan.createdAt), 'MMM dd, yyyy')}
                </CardDescription>
              </div>
              <Badge className={rightStatus.color}>{rightStatus.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {rightPlan.contentMarkdown}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Version Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                Version {leftPlan.version}
              </h3>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Generated by:</span>{' '}
                  {leftPlan.generatedByUser.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Content length:</span>{' '}
                  {leftPlan.contentMarkdown.length.toLocaleString()} characters
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span> {leftStatus.label}
                </p>
                <p>
                  <span className="text-muted-foreground">Last updated:</span>{' '}
                  {format(new Date(leftPlan.updatedAt), 'MMM dd, yyyy h:mm a')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-green-600 dark:text-green-400">
                Version {rightPlan.version}
              </h3>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Generated by:</span>{' '}
                  {rightPlan.generatedByUser.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Content length:</span>{' '}
                  {rightPlan.contentMarkdown.length.toLocaleString()} characters
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span> {rightStatus.label}
                </p>
                <p>
                  <span className="text-muted-foreground">Last updated:</span>{' '}
                  {format(new Date(rightPlan.updatedAt), 'MMM dd, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
