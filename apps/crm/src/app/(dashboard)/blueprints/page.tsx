'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  RefreshCw,
  Eye,
  Play,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Download,
  Mail,
  Calendar,
  Clock,
  Users,
  Send,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { formatDateTime } from '@/lib/utils'

interface BlueprintItem {
  id: string
  type: 'blueprint' | 'business-plan'
  application: {
    id: string
    fullName: string
    email: string
    industryNiche: string
  }
  status: string
  progress: number
  currentBatch: number
  startedAt?: string
  completedAt?: string
  lastStageAt?: string
  markdown?: string
  pdfPath?: string
  totalTokensUsed: number
  researchStages: Array<{
    id: string
    stage: string
    status: string
    batch: number
    markdown?: string
    completedAt?: string
  }>
  emailDraft?: {
    id: string
    status: string
    createdAt: string
  }
  // Business plan specific fields
  version?: number
  generatedBy?: string
  generatedAt?: string
  approvedAt?: string
  deliveredAt?: string
}

const STAGE_LABELS: Record<string, string> = {
  MARKET_SIZING: 'Market Sizing',
  COMPETITIVE_INTELLIGENCE: 'Competitive Intelligence',
  INDUSTRY_TRENDS: 'Industry Trends',
  AUDIENCE_DEEP_DIVE: 'Audience Analysis',
  BRAND_POSITIONING: 'Brand Positioning',
  PRODUCT_ARCHITECTURE: 'Product Architecture',
  FINANCIAL_PROJECTIONS: 'Financial Projections',
  GO_TO_MARKET: 'Go-to-Market Strategy',
  OPERATIONAL_FRAMEWORK: 'Operational Framework',
  IMPLEMENTATION_ROADMAP: 'Implementation Roadmap',
  EXECUTIVE_SUMMARY: 'Executive Summary',
  COMPILATION: 'Final Compilation',
}

const STATUS_CONFIG = {
  COMPLETE: { label: 'Complete', variant: 'default' as const, color: 'text-green-600', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'In Progress', variant: 'secondary' as const, color: 'text-blue-600', icon: Loader2 },
  PENDING: { label: 'Pending', variant: 'outline' as const, color: 'text-gray-400', icon: Loader2 },
  FAILED: { label: 'Failed', variant: 'destructive' as const, color: 'text-red-600', icon: Loader2 },
  REVIEW_REQUIRED: { label: 'Review Required', variant: 'warning' as const, color: 'text-orange-600', icon: Loader2 },
}

export default function BlueprintsPage() {
  const [blueprints, setBlueprints] = useState<BlueprintItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [emailGeneratingId, setEmailGeneratingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchBlueprints = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/blueprints')
      const result = await response.json()

      if (result.success) {
        // Fetch email draft status for blueprint items
        const itemsWithEmails = await Promise.all(
          result.data.map(async (item: BlueprintItem) => {
            // Only blueprints have workflow state and email drafts
            if (item.type === 'blueprint') {
              try {
                const emailResponse = await fetch(`/api/blueprints/${item.id}/email-status`)
                const emailResult = await emailResponse.json()
                return {
                  ...item,
                  emailDraft: emailResult.data?.emailDraft || null,
                }
              } catch {
                return item
              }
            }
            return item
          })
        )
        setBlueprints(itemsWithEmails)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load blueprints',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load blueprints',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBlueprints()
    const interval = setInterval(fetchBlueprints, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleGenerateApprovalEmail = async (blueprintId: string) => {
    setEmailGeneratingId(blueprintId)
    try {
      const response = await fetch(`/api/blueprints/${blueprintId}/generate-email`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Email draft generated',
          description: 'Approval email has been created and is ready for review',
        })
        await fetchBlueprints()
      } else {
        throw new Error(result.error || 'Failed to generate approval email')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate approval email',
        variant: 'destructive',
      })
    } finally {
      setEmailGeneratingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.label}
      </Badge>
    )
  }

  const getCompletedStagesCount = (blueprint: BlueprintItem) => {
    return blueprint.researchStages.filter(s => s.status === 'COMPLETE').length
  }

  const handleDownloadPdf = async (blueprint: BlueprintItem) => {
    if (!blueprint.pdfPath) {
      toast({
        title: 'PDF not available',
        description: 'Please generate the PDF first',
        variant: 'destructive',
      })
      return
    }

    const blueprintEngineUrl = process.env.NEXT_PUBLIC_BLUEPRINT_ENGINE_URL || 'http://localhost:3010'
    window.open(`${blueprintEngineUrl}${blueprint.pdfPath}`, '_blank')
  }

  if (isLoading && blueprints.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Plans & Blueprints</h1>
          <p className="text-muted-foreground">
            Manage comprehensive business plans and AI-generated blueprints
          </p>
        </div>
        <Button onClick={fetchBlueprints} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Empty State */}
      {blueprints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No business plans or blueprints yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Business plans can be created from the <Link href="/business-plans" className="underline">Business Plans</Link> page.
              Blueprints are automatically generated when applications are processed through the workflow system.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {blueprints.map((blueprint) => {
            const statusConfig = STATUS_CONFIG[blueprint.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
            const completedStages = getCompletedStagesCount(blueprint)

            return (
              <Card key={blueprint.id} className="overflow-hidden">
                {/* Blueprint Header */}
                <div className="border-b bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h2 className="text-xl font-semibold">{blueprint.application.fullName}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {blueprint.type === 'blueprint' ? 'Blueprint' : `Business Plan v${blueprint.version || 1}`}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {blueprint.application.industryNiche}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          {getStatusBadge(blueprint.status)}
                          {blueprint.type === 'blueprint' ? (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                {completedStages}/12 stages
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                Generated {formatDateTime(blueprint.generatedAt)}
                              </span>
                            </>
                          )}
                          {blueprint.emailDraft && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <Badge variant="outline" className="text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                Email Drafted
                              </Badge>
                            </>
                          )}
                        </div>
                        {blueprint.lastStageAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Last updated: {formatDateTime(blueprint.lastStageAt)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(blueprint.status === 'COMPLETE' || blueprint.status === 'APPROVED' || blueprint.status === 'DELIVERED') && blueprint.markdown && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* TODO: Add preview modal */}}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      )}

                      {blueprint.pdfPath && (
                        <Button
                          size="sm"
                          onClick={() => handleDownloadPdf(blueprint)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      )}

                      {blueprint.type === 'blueprint' && (blueprint.status === 'COMPLETE' || blueprint.status === 'APPROVED') && !blueprint.emailDraft && (
                        <Button
                          size="sm"
                          onClick={() => handleGenerateApprovalEmail(blueprint.id)}
                          disabled={emailGeneratingId === blueprint.id}
                        >
                          {emailGeneratingId === blueprint.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4 mr-2" />
                          )}
                          {emailGeneratingId === blueprint.id ? 'Generating...' : 'Generate Email'}
                        </Button>
                      )}

                      {blueprint.emailDraft && (
                        <Button
                          size="sm"
                          variant="secondary"
                          asChild
                        >
                          <Link href={`/email-drafts`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Review Email
                          </Link>
                        </Button>
                      )}

                      {blueprint.type === 'business-plan' && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link href={`/business-plans?focus=${blueprint.id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <Progress value={blueprint.progress} className="h-2" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Overall Progress</span>
                      <span className="text-xs font-medium">{blueprint.progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Stages Summary or Business Plan Info */}
                <div className="p-4">
                  {blueprint.type === 'blueprint' ? (
                    <>
                      <h3 className="text-sm font-medium mb-3">Research Stages</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {blueprint.researchStages.slice(0, 12).map((stage) => {
                          const stageConfig = stage.status === 'COMPLETE' ? 'bg-green-500' :
                                             stage.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                             stage.status === 'FAILED' ? 'bg-red-500' : 'bg-gray-300'

                          return (
                            <div key={stage.id} className="flex items-center gap-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${stageConfig}`} />
                              <span className="truncate">{STAGE_LABELS[stage.stage] || stage.stage}</span>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium mb-3">Business Plan Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Version</div>
                          <div className="font-medium">v{blueprint.version || 1}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Generated By</div>
                          <div className="font-medium truncate" title={blueprint.generatedBy}>
                            {blueprint.generatedBy?.split('@')[0] || 'System'}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Status</div>
                          <div>{getStatusBadge(blueprint.status)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Created</div>
                          <div className="font-medium">{formatDateTime(blueprint.generatedAt)}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Metadata */}
                <div className="border-t p-4 bg-muted/20">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    {blueprint.type === 'blueprint' ? (
                      <>
                        {blueprint.startedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Started: {formatDateTime(blueprint.startedAt)}
                          </div>
                        )}
                        {blueprint.completedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Completed: {formatDateTime(blueprint.completedAt)}
                          </div>
                        )}
                        {blueprint.totalTokensUsed > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Tokens: {blueprint.totalTokensUsed.toLocaleString()}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Generated: {formatDateTime(blueprint.generatedAt)}
                        </div>
                        {blueprint.approvedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Approved: {formatDateTime(blueprint.approvedAt)}
                          </div>
                        )}
                        {blueprint.deliveredAt && (
                          <div className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Delivered: {formatDateTime(blueprint.deliveredAt)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
