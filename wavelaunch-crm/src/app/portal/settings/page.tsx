import { redirect } from 'next/navigation'
import { getPortalSession, getPortalUser } from '@/lib/auth/portal-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, User, Bell, Lock } from 'lucide-react'
import { ChangePasswordForm } from '@/components/portal/change-password-form'

export default async function PortalSettingsPage() {
  const session = await getPortalSession()

  if (!session) {
    redirect('/portal/login')
  }

  const portalUser = await getPortalUser(session.userId)

  if (!portalUser) {
    redirect('/portal/login')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your profile and account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-lg font-medium">{portalUser.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email Verified</Label>
              <div>
                {portalUser.emailVerified ? (
                  <Badge>Verified</Badge>
                ) : (
                  <Badge variant="outline">Not Verified</Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Creator Name</Label>
              <p className="text-lg font-medium">{portalUser.client.creatorName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Brand Name</Label>
              <p className="text-lg font-medium">
                {portalUser.client.brandName || 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Login</Label>
              <p className="text-lg font-medium">
                {portalUser.lastLoginAt
                  ? new Date(portalUser.lastLoginAt).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Member Since</Label>
              <p className="text-lg font-medium">
                {new Date(portalUser.invitedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Deliverables</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when a new deliverable is ready
                </p>
              </div>
              <Badge variant={portalUser.notifyNewDeliverable ? 'default' : 'outline'}>
                {portalUser.notifyNewDeliverable ? 'On' : 'Off'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Messages</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when you receive a new message
                </p>
              </div>
              <Badge variant={portalUser.notifyNewMessage ? 'default' : 'outline'}>
                {portalUser.notifyNewMessage ? 'On' : 'Off'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Milestone Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get reminders about upcoming milestones
                </p>
              </div>
              <Badge variant={portalUser.notifyMilestoneReminder ? 'default' : 'outline'}>
                {portalUser.notifyMilestoneReminder ? 'On' : 'Off'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Summary</p>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of your progress
                </p>
              </div>
              <Badge variant={portalUser.notifyWeeklySummary ? 'default' : 'outline'}>
                {portalUser.notifyWeeklySummary ? 'On' : 'Off'}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Notification preference management will be available soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
