import { redirect } from 'next/navigation'
import { getPortalSession, getPortalUser } from '@/lib/auth/portal-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, User, Bell, Lock } from 'lucide-react'
import { ChangePasswordForm } from '@/components/portal/change-password-form'
import { NotificationPreferences } from '@/components/portal/notification-preferences'

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
              <p className="text-lg font-medium">{portalUser.client.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Brand Name</Label>
              <p className="text-lg font-medium">
                {portalUser.client.name || 'Not set'}
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
        <CardContent>
          <NotificationPreferences
            initialPreferences={{
              notifyNewDeliverable: portalUser.notifyNewDeliverable,
              notifyNewMessage: portalUser.notifyNewMessage,
              notifyMilestoneReminder: portalUser.notifyMilestoneReminder,
              notifyWeeklySummary: portalUser.notifyWeeklySummary,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
