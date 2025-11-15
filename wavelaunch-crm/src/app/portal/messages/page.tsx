import { redirect } from 'next/navigation'
import { getPortalSession } from '@/lib/auth/portal-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default async function PortalMessagesPage() {
  const session = await getPortalSession()

  if (!session) {
    redirect('/portal/login')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with your Wavelaunch team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messaging System
          </CardTitle>
          <CardDescription>
            This feature will be available in Week 3 of development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md">
              The messaging system is currently under development. Soon you'll be able to
              send and receive messages directly from your Wavelaunch team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
