'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  UserCheck,
  UserX,
  Mail,
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PortalUser {
  id: string
  email: string
  isActive: boolean
  emailVerified: boolean
  invitedAt: string
  activatedAt: string | null
  lastLoginAt: string | null
  hasInviteToken: boolean
  inviteTokenExpiry: string | null
  client: {
    id: string
    creatorName: string
    brandName: string | null
    email: string
    status: string
  }
}

export default function PortalUsersPage() {
  const { toast } = useToast()
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<PortalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [generatingInvite, setGeneratingInvite] = useState<string | null>(null)
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [inviteDialog, setInviteDialog] = useState<{
    open: boolean
    url: string
    token: string
  }>({ open: false, url: '', token: '' })

  useEffect(() => {
    fetchPortalUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [portalUsers, search, statusFilter])

  const fetchPortalUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/portal-users')
      const data = await res.json()

      if (data.success) {
        setPortalUsers(data.data)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch portal users',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to fetch portal users:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch portal users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...portalUsers]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.client.creatorName.toLowerCase().includes(searchLower) ||
          user.client.brandName?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => {
        if (statusFilter === 'active') {
          return user.isActive && user.activatedAt !== null
        } else if (statusFilter === 'invited') {
          return user.activatedAt === null && user.hasInviteToken
        } else if (statusFilter === 'inactive') {
          return !user.isActive
        }
        return true
      })
    }

    setFilteredUsers(filtered)
  }

  const handleGenerateInvite = async (portalUserId: string) => {
    try {
      setGeneratingInvite(portalUserId)
      const res = await fetch('/api/admin/portal-users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalUserId }),
      })
      const data = await res.json()

      if (data.success) {
        setInviteDialog({
          open: true,
          url: data.data.inviteUrl,
          token: data.data.inviteToken,
        })
        await fetchPortalUsers()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to generate invite',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate invite',
        variant: 'destructive',
      })
    } finally {
      setGeneratingInvite(null)
    }
  }

  const handleRegenerateInvite = async (portalUserId: string) => {
    try {
      setGeneratingInvite(portalUserId)
      const res = await fetch('/api/admin/portal-users/invite', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalUserId }),
      })
      const data = await res.json()

      if (data.success) {
        setInviteDialog({
          open: true,
          url: data.data.inviteUrl,
          token: data.data.inviteToken,
        })
        toast({
          title: 'Success',
          description: 'Invite link regenerated successfully',
        })
        await fetchPortalUsers()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to regenerate invite',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate invite',
        variant: 'destructive',
      })
    } finally {
      setGeneratingInvite(null)
    }
  }

  const handleToggleActive = async (portalUserId: string, currentlyActive: boolean) => {
    try {
      setUpdatingUser(portalUserId)
      const res = await fetch('/api/admin/portal-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalUserId,
          isActive: !currentlyActive,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message || 'User status updated successfully',
        })
        await fetchPortalUsers()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update user status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      })
    } finally {
      setUpdatingUser(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Invite link copied to clipboard',
    })
  }

  const getStatusBadge = (user: PortalUser) => {
    if (!user.isActive) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
          <XCircle className="h-3 w-3" />
          Inactive
        </span>
      )
    }
    if (user.activatedAt) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
          <CheckCircle className="h-3 w-3" />
          Active
        </span>
      )
    }
    if (user.hasInviteToken) {
      const isExpired =
        user.inviteTokenExpiry && new Date(user.inviteTokenExpiry) < new Date()
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
            isExpired
              ? 'bg-orange-100 text-orange-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          <Clock className="h-3 w-3" />
          {isExpired ? 'Invite Expired' : 'Invited'}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    )
  }

  const getStats = () => {
    const active = portalUsers.filter((u) => u.isActive && u.activatedAt).length
    const invited = portalUsers.filter((u) => !u.activatedAt && u.hasInviteToken).length
    const inactive = portalUsers.filter((u) => !u.isActive).length
    return { active, invited, inactive, total: portalUsers.length }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portal Users</h1>
          <p className="text-muted-foreground">
            Manage client portal access across all clients
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Active</p>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Invited</p>
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600">{stats.invited}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Inactive</p>
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="invited">Invited Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No portal users found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Portal users will appear here when clients are onboarded'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-lg border bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.email}</h3>
                        {getStatusBadge(user)}
                      </div>
                      <Link
                        href={`/clients/${user.client.id}`}
                        className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                      >
                        <span>
                          {user.client.creatorName}
                          {user.client.brandName && ` • ${user.client.brandName}`}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Invited</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(user.invitedAt), { addSuffix: true })}
                      </p>
                    </div>
                    {user.activatedAt && (
                      <div>
                        <p className="text-muted-foreground">Activated</p>
                        <p className="font-medium">
                          {formatDistanceToNow(new Date(user.activatedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    )}
                    {user.lastLoginAt && (
                      <div>
                        <p className="text-muted-foreground">Last Login</p>
                        <p className="font-medium">
                          {formatDistanceToNow(new Date(user.lastLoginAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    )}
                    {user.hasInviteToken && user.inviteTokenExpiry && (
                      <div>
                        <p className="text-muted-foreground">Invite Expires</p>
                        <p
                          className={`font-medium ${
                            new Date(user.inviteTokenExpiry) < new Date()
                              ? 'text-red-600'
                              : ''
                          }`}
                        >
                          {new Date(user.inviteTokenExpiry) < new Date()
                            ? 'Expired'
                            : formatDistanceToNow(new Date(user.inviteTokenExpiry), {
                                addSuffix: true,
                              })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!user.activatedAt && (
                    <>
                      {user.hasInviteToken ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateInvite(user.id)}
                          disabled={generatingInvite === user.id}
                        >
                          <RefreshCw
                            className={`mr-2 h-4 w-4 ${
                              generatingInvite === user.id ? 'animate-spin' : ''
                            }`}
                          />
                          Resend Invite
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateInvite(user.id)}
                          disabled={generatingInvite === user.id}
                        >
                          <Mail
                            className={`mr-2 h-4 w-4 ${
                              generatingInvite === user.id ? 'animate-pulse' : ''
                            }`}
                          />
                          Generate Invite
                        </Button>
                      )}
                    </>
                  )}
                  <Button
                    variant={user.isActive ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    disabled={updatingUser === user.id}
                  >
                    {user.isActive ? (
                      <>
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Link Dialog */}
      <AlertDialog open={inviteDialog.open} onOpenChange={(open) => setInviteDialog({ ...inviteDialog, open })}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Portal Invite Link Generated</AlertDialogTitle>
            <AlertDialogDescription>
              Share this link with your client to complete their portal registration. The link
              expires in 7 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted p-4">
              <p className="mb-2 text-sm font-medium">Invite URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background p-2 text-xs break-all">
                  {inviteDialog.url}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(inviteDialog.url)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setInviteDialog({ open: false, url: '', token: '' })}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
