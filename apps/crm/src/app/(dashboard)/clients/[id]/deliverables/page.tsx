'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  CheckCircle,
  Circle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
  Edit,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DELIVERABLE_MONTHS } from '@/lib/utils/constants'

type Deliverable = {
  id: string
  month: number
  title: string
  type: 'MAIN' | 'SUBDOCUMENT'
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'DELIVERED' | 'REJECTED'
  contentMarkdown: string
  rejectionReason?: string | null
  createdAt: string
  updatedAt: string
  generatedByUser: {
    id: string
    name: string
    email: string
  }
}

type Client = {
  id: string
  creatorName: string
  brandName: string | null
  email: string
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-500', icon: Circle },
  PENDING_REVIEW: { label: 'Pending Review', color: 'bg-yellow-500', icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
  DELIVERED: { label: 'Delivered', color: 'bg-blue-500', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
}

export default function DeliverablesPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatingMonth, setGeneratingMonth] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [clientId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch client
      const clientRes = await fetch(`/api/clients/${clientId}`)
      const clientData = await clientRes.json()
      if (clientData.success) {
        setClient(clientData.data)
      }

      // Fetch deliverables
      const deliverablesRes = await fetch(`/api/deliverables?clientId=${clientId}`)
      const deliverablesData = await deliverablesRes.json()
      if (deliverablesData.success) {
        setDeliverables(deliverablesData.data)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load deliverables')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (month: number) => {
    try {
      setGenerating(true)
      setGeneratingMonth(month)
      setError(null)

      const res = await fetch('/api/deliverables/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, month }),
      })

      const data = await res.json()

      if (data.success) {
        // Poll job status
        const jobId = data.data.jobId
        pollJobStatus(jobId)
      } else {
        setError(data.error || 'Failed to generate deliverable')
        setGenerating(false)
        setGeneratingMonth(null)
      }
    } catch (err) {
      console.error('Error generating deliverable:', err)
      setError('Failed to generate deliverable')
      setGenerating(false)
      setGeneratingMonth(null)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 60 // Poll for up to 5 minutes
    let attempts = 0

    const poll = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        const data = await res.json()

        if (data.success) {
          const job = data.data

          if (job.status === 'COMPLETED') {
            setGenerating(false)
            setGeneratingMonth(null)
            await fetchData() // Refresh the list
            return
          }

          if (job.status === 'FAILED') {
            setError(job.error || 'Failed to generate deliverable')
            setGenerating(false)
            setGeneratingMonth(null)
            return
          }

          // Still processing
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000) // Poll every 5 seconds
          } else {
            setError('Generation timeout. Please check job status.')
            setGenerating(false)
            setGeneratingMonth(null)
          }
        }
      } catch (err) {
        console.error('Error polling job:', err)
        setGenerating(false)
        setGeneratingMonth(null)
      }
    }

    poll()
  }

  const getDeliverableForMonth = (month: number) => {
    return deliverables.find((d) => d.month === month && d.type === 'MAIN')
  }

  const getNextMonthToGenerate = () => {
    for (let i = 1; i <= 8; i++) {
      if (!getDeliverableForMonth(i)) {
        return i
      }
    }
    return null
  }

  const calculateProgress = () => {
    const completed = deliverables.filter((d) => d.type === 'MAIN').length
    return { completed, total: 8, percentage: Math.round((completed / 8) * 100) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const progress = calculateProgress()
  const nextMonth = getNextMonthToGenerate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/clients" className="hover:text-foreground">
            Clients
          </Link>
          <span>/</span>
          <Link href={`/clients/${clientId}`} className="hover:text-foreground">
            {client?.creatorName}
          </Link>
          <span>/</span>
          <span className="text-foreground">Deliverables</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">8-Month Deliverables</h1>
            <p className="text-muted-foreground mt-1">
              {client?.brandName || client?.creatorName}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-muted-foreground">
                Progress: {progress.completed}/8 ({progress.percentage}%)
              </span>
            </div>
          </div>
          {nextMonth && (
            <Button
              onClick={() => handleGenerate(nextMonth)}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Month {generatingMonth}...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Month {nextMonth}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Progress</CardTitle>
          <CardDescription>
            Track the completion of your 8-month engagement deliverables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div
              className="bg-primary h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {progress.completed === 8
              ? '🎉 All deliverables completed!'
              : `${8 - progress.completed} month${8 - progress.completed !== 1 ? 's' : ''} remaining`}
          </p>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {DELIVERABLE_MONTHS.map((month) => {
          const deliverable = getDeliverableForMonth(month.number)
          const isGenerating = generating && generatingMonth === month.number

          if (!deliverable) {
            // Not yet generated
            return (
              <Card
                key={month.number}
                className="border-dashed hover:bg-accent transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Circle className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Month {month.number}</CardTitle>
                        <CardDescription>{month.title}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-gray-500">
                      Not Started
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleGenerate(month.number)}
                    disabled={generating || (nextMonth !== null && nextMonth !== month.number)}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : nextMonth === month.number ? (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Generate This Month
                      </>
                    ) : (
                      'Complete previous months first'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          }

          // Generated
          const statusInfo = statusConfig[deliverable.status]
          const StatusIcon = statusInfo.icon

          return (
            <Card key={month.number} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <StatusIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Month {month.number}</CardTitle>
                      <CardDescription>{month.title}</CardDescription>
                    </div>
                  </div>
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>Generated: {format(new Date(deliverable.createdAt), 'MMM dd, yyyy')}</p>
                    <p>Updated: {format(new Date(deliverable.updatedAt), 'MMM dd, yyyy')}</p>
                  </div>
                  {deliverable.rejectionReason && (
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                      <strong>Rejection:</strong> {deliverable.rejectionReason}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/clients/${clientId}/deliverables/${deliverable.id}?mode=view`
                        )
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        router.push(`/clients/${clientId}/deliverables/${deliverable.id}`)
                      }
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
