'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Search, Inbox, ExternalLink, CheckCircle, XCircle, Clock, Download } from 'lucide-react'

interface Application {
  id: string
  fullName: string
  email: string
  instagramHandle?: string
  tiktokHandle?: string
  country: string
  industryNiche: string
  status: string
  createdAt: string
  zipFileName?: string
  convertedToClientId?: string
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

export default function SubmissionsPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, search, statusFilter])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications')
      const data = await res.json()

      if (data.success) {
        setApplications(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (search) {
      filtered = filtered.filter(
        (app) =>
          app.fullName.toLowerCase().includes(search.toLowerCase()) ||
          app.email.toLowerCase().includes(search.toLowerCase()) ||
          app.industryNiche.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }

  const openReviewDialog = (app: Application, action: 'APPROVED' | 'REJECTED') => {
    setSelectedApp(app)
    setReviewAction(action)
    setReviewNotes('')
    setReviewDialogOpen(true)
  }

  const handleReview = async () => {
    if (!selectedApp) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/applications/${selectedApp.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewAction,
          reviewNotes,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: `Application ${reviewAction.toLowerCase()} successfully`,
        })
        setReviewDialogOpen(false)
        fetchApplications()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to review application',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to review application',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleConvertToClient = async (appId: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/convert`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Application converted to client successfully',
        })
        fetchApplications()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to convert to client',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to convert to client',
        variant: 'destructive',
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">D26 Submissions</h1>
          <p className="text-muted-foreground">
            Wavelaunch Studio Intake Application submissions
          </p>
        </div>
        <Link href="/applications/new" target="_blank">
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Application Form
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Inbox className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold">{applications.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-bold">
            {applications.filter((a) => a.status === 'PENDING').length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-muted-foreground">Approved</span>
          </div>
          <p className="text-2xl font-bold">
            {applications.filter((a) => a.status === 'APPROVED').length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-muted-foreground">Rejected</span>
          </div>
          <p className="text-2xl font-bold">
            {applications.filter((a) => a.status === 'REJECTED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No applications found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'New applications will appear here'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Applicant</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Industry/Niche</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Country</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Submitted</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{app.fullName}</p>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                        {(app.instagramHandle || app.tiktokHandle) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {app.instagramHandle && `@${app.instagramHandle}`}
                            {app.instagramHandle && app.tiktokHandle && ' • '}
                            {app.tiktokHandle && `TT: @${app.tiktokHandle}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{app.industryNiche}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{app.country}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {app.zipFileName && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/api/applications/${app.id}/download`} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {app.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewDialog(app, 'APPROVED')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewDialog(app, 'REJECTED')}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status === 'APPROVED' && !app.convertedToClientId && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConvertToClient(app.id)}
                          >
                            Convert to Client
                          </Button>
                        )}
                        {app.convertedToClientId && (
                          <Link href={`/clients/${app.convertedToClientId}`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Client
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'APPROVED' ? 'Approve' : 'Reject'} Application
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'APPROVED'
                ? `Approve ${selectedApp?.fullName}'s application. You can convert them to a client afterwards.`
                : `Reject ${selectedApp?.fullName}'s application. Please provide a reason.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reviewNotes">
                {reviewAction === 'APPROVED' ? 'Notes (Optional)' : 'Rejection Reason'}
              </Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === 'APPROVED'
                    ? 'Add any notes about this approval...'
                    : 'Provide a reason for rejection...'
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={submitting || (reviewAction === 'REJECTED' && !reviewNotes)}
            >
              {submitting ? 'Processing...' : reviewAction === 'APPROVED' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
