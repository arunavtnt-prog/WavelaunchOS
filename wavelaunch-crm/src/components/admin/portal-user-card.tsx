'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Key,
  Copy,
  Link as LinkIcon,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

interface PortalUserCardProps {
  clientId: string
  clientEmail: string
  creatorName: string
}

interface PortalUser {
  id: string
  email: string
  isActive: boolean
  emailVerified: boolean
  invitedAt: string
  activatedAt: string | null
  lastLoginAt: string | null
  inviteToken: string | null
  inviteTokenExpiry: string | null
  completedOnboarding: boolean
  onboardingCompletedAt: string | null
}

export function PortalUserCard({ clientId, clientEmail, creatorName }: PortalUserCardProps) {
  const { toast } = useToast()
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [email, setEmail] = useState(clientEmail)
  const [sendEmail, setSendEmail] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [generatingInvite, setGeneratingInvite] = useState(false)

  useEffect(() => {
    fetchPortalUser()
  }, [clientId])

  const fetchPortalUser = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/portal-users?clientId=${clientId}`)
      const data = await res.json()

      if (data.success) {
        setPortalUser(data.data)
      } else {
        setPortalUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch portal user:', error)
      setPortalUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    try {
      setInviting(true)

      // First create the portal user
      const createRes = await fetch('/api/admin/portal-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          email,
          sendWelcomeEmail: false, // We'll handle invite separately
        }),
      })

      const createData = await createRes.json()

      if (!createData.success) {
        toast({
          title: 'Error',
          description: createData.error || 'Failed to create portal access',
          variant: 'destructive',
        })
        return
      }

      // Then generate invite link
      const inviteRes = await fetch('/api/admin/portal-users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalUserId: createData.data.id,
        }),
      })

      const inviteData = await inviteRes.json()

      if (inviteData.success) {
        setInviteUrl(inviteData.data.inviteUrl)
        toast({
          title: 'Portal access created',
          description: 'Invite link generated. Copy and send to client.',
        })
        await fetchPortalUser()
        setInviteDialogOpen(false)
      } else {
        toast({
          title: 'Warning',
          description: 'Portal created but invite generation failed. Try regenerating.',
          variant: 'destructive',
        })
        await fetchPortalUser()
        setInviteDialogOpen(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create portal access',
        variant: 'destructive',
      })
    } finally {
      setInviting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!portalUser) return

    try {
      setUpdatingStatus(true)
      const res = await fetch('/api/admin/portal-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalUserId: portalUser.id,
          isActive: !portalUser.isActive,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: portalUser.isActive ? 'Portal access disabled' : 'Portal access enabled',
          description: data.message,
        })
        await fetchPortalUser()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update portal access',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update portal access',
        variant: 'destructive',
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const copyPassword = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword)
      toast({
        title: 'Copied',
        description: 'Password copied to clipboard',
      })
    }
  }

  const handleGenerateInvite = async () => {
    if (!portalUser) return

    try {
      setGeneratingInvite(true)
      const res = await fetch('/api/admin/portal-users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalUserId: portalUser.id,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setInviteUrl(data.data.inviteUrl)
        await fetchPortalUser() // Refresh to get updated token
        toast({
          title: 'Invite link generated',
          description: 'Copy the link and send it to your client',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to generate invite link',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate invite link',
        variant: 'destructive',
      })
    } finally {
      setGeneratingInvite(false)
    }
  }

  const handleRegenerateInvite = async () => {
    if (!portalUser) return

    try {
      setGeneratingInvite(true)
      const res = await fetch('/api/admin/portal-users/invite', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalUserId: portalUser.id,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setInviteUrl(data.data.inviteUrl)
        await fetchPortalUser() // Refresh to get updated token
        toast({
          title: 'Invite link regenerated',
          description: 'New invite link created and ready to send',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to regenerate invite link',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate invite link',
        variant: 'destructive',
      })
    } finally {
      setGeneratingInvite(false)
    }
  }

  const copyInviteLink = () => {
    const link = inviteUrl || (portalUser?.inviteToken ? `${window.location.origin}/portal/invite/${portalUser.inviteToken}` : null)

    if (link) {
      navigator.clipboard.writeText(link)
      toast({
        title: 'Copied',
        description: 'Invite link copied to clipboard',
      })
    }
  }

  const isInviteExpired = () => {
    if (!portalUser?.inviteTokenExpiry) return false
    return new Date() > new Date(portalUser.inviteTokenExpiry)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Client Portal Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!portalUser) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Client Portal Access
            </CardTitle>
            <CardDescription>
              Grant this client access to the portal to view their documents and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <UserX className="h-4 w-4" />
              <AlertDescription>
                This client does not have portal access yet.
              </AlertDescription>
            </Alert>

            <Button onClick={() => setInviteDialogOpen(true)} className="mt-4">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Portal Access
            </Button>
          </CardContent>
        </Card>

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Portal Access for {creatorName}</DialogTitle>
              <DialogDescription>
                Set up a portal account for this client. They will be able to log in and
                access their documents and progress.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  The email address for portal login
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="sendEmail" className="font-normal cursor-pointer">
                  Send welcome email with login credentials
                  <span className="text-muted-foreground ml-1">(Not implemented yet)</span>
                </Label>
              </div>

              {!sendEmail && (
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    A temporary password will be generated. You'll need to share it with the
                    client manually.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
                disabled={inviting}
              >
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={inviting}>
                {inviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Portal Access
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Show Password Dialog */}
        <Dialog open={showPassword} onOpenChange={setShowPassword}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Portal Access Created</DialogTitle>
              <DialogDescription>
                Share these credentials with your client. They can change their password after
                logging in.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={email} readOnly />
                </div>
              </div>

              <div>
                <Label>Temporary Password</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={temporaryPassword || ''} readOnly type="text" />
                  <Button size="icon" variant="outline" onClick={copyPassword}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Copy this password - it won't be shown again!
                </p>
              </div>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Make sure to send these credentials to your client via email or another secure
                  channel.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowPassword(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Portal user exists but not activated (pending invite)
  if (portalUser && !portalUser.activatedAt) {
    const hasInviteToken = Boolean(portalUser.inviteToken)
    const expired = isInviteExpired()
    const inviteLink = inviteUrl || (portalUser.inviteToken ? `${window.location.origin}/portal/invite/${portalUser.inviteToken}` : null)

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Portal Invitation Pending
          </CardTitle>
          <CardDescription>
            Client has been invited but hasn't activated their account yet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {portalUser.email}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Invited</p>
              <p className="mt-1">
                {new Date(portalUser.invitedAt).toLocaleDateString()}
              </p>
            </div>

            {hasInviteToken && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Invite Status</p>
                  <div className="mt-1">
                    {expired ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <AlertCircle className="h-3 w-3" />
                        Expired
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expires</p>
                  <p className="mt-1">
                    {portalUser.inviteTokenExpiry
                      ? new Date(portalUser.inviteTokenExpiry).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </>
            )}
          </div>

          {hasInviteToken && inviteLink && (
            <Alert>
              <LinkIcon className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Invite Link:</p>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="flex-1 text-xs truncate">{inviteLink}</code>
                  <Button size="sm" variant="ghost" onClick={copyInviteLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {expired && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This invite link has expired. Generate a new link to send to the client.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4 border-t">
            {!hasInviteToken ? (
              <Button onClick={handleGenerateInvite} disabled={generatingInvite}>
                {generatingInvite ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Generate Invite Link
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={copyInviteLink}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Invite Link
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRegenerateInvite}
                  disabled={generatingInvite}
                >
                  {generatingInvite ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate Link
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Send this invite link to your client. They will use it to set their password and activate their account.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Portal user activated
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {portalUser.isActive ? (
            <UserCheck className="h-5 w-5 text-green-600" />
          ) : (
            <UserX className="h-5 w-5 text-red-600" />
          )}
          Client Portal Access
        </CardTitle>
        <CardDescription>
          Manage this client's portal account and access settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <div className="mt-1">
              <Badge variant={portalUser.isActive ? 'default' : 'secondary'}>
                {portalUser.isActive ? 'Active' : 'Disabled'}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
            <div className="mt-1 flex items-center gap-2">
              {portalUser.emailVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Not verified</span>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Login Email</p>
            <p className="mt-1 flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {portalUser.email}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Login</p>
            <p className="mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {portalUser.lastLoginAt
                ? new Date(portalUser.lastLoginAt).toLocaleDateString()
                : 'Never'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Invited</p>
            <p className="mt-1">{new Date(portalUser.invitedAt).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Activated</p>
            <p className="mt-1">
              {portalUser.activatedAt
                ? new Date(portalUser.activatedAt).toLocaleDateString()
                : 'Not yet'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant={portalUser.isActive ? 'outline' : 'default'}
            onClick={handleToggleStatus}
            disabled={updatingStatus}
          >
            {updatingStatus ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : portalUser.isActive ? (
              <UserX className="mr-2 h-4 w-4" />
            ) : (
              <UserCheck className="mr-2 h-4 w-4" />
            )}
            {portalUser.isActive ? 'Disable Access' : 'Enable Access'}
          </Button>

          <Button variant="outline" asChild>
            <a
              href={`/portal/login`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Portal Login
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
