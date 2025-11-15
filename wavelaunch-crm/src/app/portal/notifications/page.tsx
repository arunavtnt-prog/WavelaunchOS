import { redirect } from 'next/navigation'
import { getPortalSession } from '@/lib/auth/portal-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default async function PortalNotificationsPage() {
  const session = await getPortalSession()

  if (!session) {
    redirect('/portal/login')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with important alerts and updates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
          </CardTitle>
          <CardDescription>
            This feature will be available in Week 4 of development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Bell className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md">
              The notification system is currently under development. Soon you'll receive
              real-time updates about new deliverables, messages, and milestones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
