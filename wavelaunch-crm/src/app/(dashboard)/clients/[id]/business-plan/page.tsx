'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  GitCompare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type BusinessPlan = {
  id: string
  version: number
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
  fullName: string
  email: string
}

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    color: 'bg-gray-500',
    icon: Edit,
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    color: 'bg-yellow-500',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-500',
    icon: CheckCircle,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-blue-500',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-500',
    icon: XCircle,
  },
}

export default function BusinessPlanListPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])

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

      // Fetch business plans
      const plansRes = await fetch(`/api/business-plans?clientId=${clientId}`)
      const plansData = await plansRes.json()
      if (plansData.success) {
        setBusinessPlans(plansData.data)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load business plans')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      setError(null)

      const res = await fetch('/api/admin/business-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })

      const data = await res.json()

      if (data.success) {
        // Poll job status
        const jobId = data.data.jobId
        pollJobStatus(jobId)
      } else {
        setError(data.error || 'Failed to generate business plan')
        setGenerating(false)
      }
    } catch (err) {
      console.error('Error generating business plan:', err)
      setError('Failed to generate business plan')
      setGenerating(false)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 60 // Poll for up to 5 minutes (5s intervals)
    let attempts = 0

    const poll = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        const data = await res.json()

        if (data.success) {
          const job = data.data

          if (job.status === 'COMPLETED') {
            setGenerating(false)
            await fetchData() // Refresh the list
            return
          }

          if (job.status === 'FAILED') {
            setError(job.error || 'Failed to generate business plan')
            setGenerating(false)
            return
          }

          // Still processing, continue polling
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000) // Poll every 5 seconds
          } else {
            setError('Generation timeout. Please check job status.')
            setGenerating(false)
          }
        }
      } catch (err) {
        console.error('Error polling job:', err)
        setGenerating(false)
      }
    }

    poll()
  }

  const handleCompareSelect = (planId: string) => {
    if (selectedForCompare.includes(planId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== planId))
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, planId])
    }
  }

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      router.push(
        `/clients/${clientId}/business-plan/compare?left=${selectedForCompare[0]}&right=${selectedForCompare[1]}`
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
            {client?.fullName}
          </Link>
          <span>/</span>
          <span className="text-foreground">Business Plans</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Business Plans</h1>
            <p className="text-muted-foreground mt-1">
              {client?.fullName}
            </p>
          </div>
          <div className="flex gap-2">
            {businessPlans.length >= 2 && !compareMode && (
              <Button variant="outline" onClick={() => setCompareMode(true)}>
                <GitCompare className="mr-2 h-4 w-4" />
                Compare Versions
              </Button>
            )}
            {compareMode && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompareMode(false)
                    setSelectedForCompare([])
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompare}
                  disabled={selectedForCompare.length !== 2}
                >
                  <GitCompare className="mr-2 h-4 w-4" />
                  Compare Selected ({selectedForCompare.length}/2)
                </Button>
              </>
            )}
            {!compareMode && (
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate New Version
                  </>
                )}
              </Button>
            )}
          </div>
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

      {/* Business Plans List */}
      {businessPlans.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No business plans yet</h3>
              <p className="text-muted-foreground mt-2">
                Generate your first business plan to get started.
              </p>
              <Button onClick={handleGenerate} className="mt-4" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Business Plan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {businessPlans.map((plan) => {
            const statusInfo = statusConfig[plan.status]
            const StatusIcon = statusInfo.icon
            const isSelected = selectedForCompare.includes(plan.id)

            return (
              <Card
                key={plan.id}
                className={`hover:shadow-lg transition-shadow ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${compareMode ? 'cursor-pointer' : ''}`}
                onClick={() => compareMode && handleCompareSelect(plan.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">
                          Version {plan.version}
                        </CardTitle>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">
                        Generated by {plan.generatedByUser.name} on{' '}
                        {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
                      </CardDescription>
                      {plan.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                          <strong>Rejection reason:</strong> {plan.rejectionReason}
                        </div>
                      )}
                    </div>
                    {!compareMode && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/clients/${clientId}/business-plan/${plan.id}?mode=view`
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
                            router.push(`/clients/${clientId}/business-plan/${plan.id}`)
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    )}
                    {compareMode && isSelected && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div>
                      Created: {format(new Date(plan.createdAt), 'MMM dd, yyyy h:mm a')}
                    </div>
                    <div>
                      Updated: {format(new Date(plan.updatedAt), 'MMM dd, yyyy h:mm a')}
                    </div>
                    <div>{plan.contentMarkdown.length.toLocaleString()} characters</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
