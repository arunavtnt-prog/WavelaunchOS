'use client'

import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Loader2,
  BarChart3,
} from 'lucide-react'
import { DocumentPreviewModal } from '@/components/portal/document-preview-modal'
import { useToast } from '@/hooks/use-toast'

interface BusinessPlan {
  id: string
  version: number
  status: string
  pdfUrl: string | null
  createdAt: Date
  updatedAt: Date
}

interface Deliverable {
  id: string
  month: string
  title: string
  status: string
  pdfUrl: string | null
  createdAt: Date
  updatedAt: Date
}

interface DocumentStats {
  totalBusinessPlans: number
  totalDeliverables: number
  completedDeliverables: number
  inProgressDeliverables: number
  pendingDeliverables: number
}

export default function PortalDocumentsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([])
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Preview modal
  const [previewDocument, setPreviewDocument] = useState<any>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [typeFilter, statusFilter, sortBy, sortOrder])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: typeFilter,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/portal/documents?${params}`)
      const data = await response.json()

      if (data.success) {
        setBusinessPlans(data.data.businessPlans)
        setDeliverables(data.data.deliverables)
        setStats(data.data.stats)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load documents',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (doc: any, type: 'business-plan' | 'deliverable') => {
    setPreviewDocument({ ...doc, type })
    setPreviewOpen(true)
  }

  const handleDownload = async (
    docId: string,
    type: 'business-plan' | 'deliverable'
  ) => {
    try {
      const endpoint =
        type === 'business-plan'
          ? `/api/portal/documents/business-plans/${docId}/download`
          : `/api/portal/documents/deliverables/${docId}/download`

      const response = await fetch(endpoint)
      const data = await response.json()

      if (data.success) {
        window.open(data.data.downloadUrl, '_blank')
        toast({
          title: 'Download started',
          description: 'Your document is being downloaded',
        })
      } else {
        toast({
          title: 'Download failed',
          description: data.error || 'Failed to download document',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while downloading',
        variant: 'destructive',
      })
    }
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  // Filter documents by search query
  const filteredBusinessPlans = businessPlans.filter((plan) =>
    `Business Plan v${plan.version}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDeliverables = deliverables.filter((del) =>
    `${del.month} ${del.title}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Access your business plan and monthly deliverables
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Business Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBusinessPlans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completedDeliverables}
              </div>
              <p className="text-xs text-muted-foreground">of 8 deliverables</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.inProgressDeliverables}
              </div>
              <p className="text-xs text-muted-foreground">currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats.completedDeliverables / 8) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">overall completion</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filter Documents</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setTypeFilter('all')
                setStatusFilter('all')
                setSortBy('updatedAt')
                setSortOrder('desc')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="business-plans">Business Plans</SelectItem>
                  <SelectItem value="deliverables">Deliverables</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt">Last Updated</SelectItem>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Business Plans */}
          {(typeFilter === 'all' || typeFilter === 'business-plans') &&
            filteredBusinessPlans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Plans</CardTitle>
                  <CardDescription>
                    Your comprehensive business strategy documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredBusinessPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              Business Plan v{plan.version}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Updated{' '}
                              {new Date(plan.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              plan.status === 'APPROVED'
                                ? 'default'
                                : plan.status === 'DELIVERED'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {plan.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(plan, 'business-plan')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Button>
                          {plan.pdfUrl && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleDownload(plan.id, 'business-plan')
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Monthly Deliverables */}
          {(typeFilter === 'all' || typeFilter === 'deliverables') &&
            filteredDeliverables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Deliverables</CardTitle>
                  <CardDescription>
                    Your month-by-month content and strategy deliverables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {filteredDeliverables.map((deliverable) => (
                      <div
                        key={deliverable.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {deliverable.month}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                              {deliverable.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                deliverable.updatedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant={
                              deliverable.status === 'DELIVERED' ||
                              deliverable.status === 'APPROVED'
                                ? 'default'
                                : deliverable.status === 'IN_PROGRESS'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-xs"
                          >
                            {deliverable.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handlePreview(deliverable, 'deliverable')
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {deliverable.pdfUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDownload(deliverable.id, 'deliverable')
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Empty State */}
          {filteredBusinessPlans.length === 0 &&
            filteredDeliverables.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No documents found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Your documents will appear here as they are created'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
        </>
      )}

      {/* Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={previewDocument}
      />
    </div>
  )
}
