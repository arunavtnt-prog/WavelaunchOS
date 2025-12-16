import { redirect } from 'next/navigation'
import { getPortalSession, getPortalUser } from '@/lib/auth/portal-auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DashboardClientWrapper } from '@/components/portal/dashboard-client-wrapper'
import {
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  MessageSquare,
  Calendar,
  Sparkles,
  AlertCircle,
} from 'lucide-react'

export default async function PortalDashboardPage() {
  const session = await getPortalSession()

  if (!session) {
    redirect('/portal/login')
  }

  // Get user with client data
  const portalUser = await getPortalUser(session.userId)

  if (!portalUser) {
    redirect('/portal/login')
  }

  const client = portalUser.client

  // Check if should show first-time welcome
  const showWelcome = portalUser.completedOnboarding === true

  // Get client's deliverables
  const deliverables = await prisma.deliverable.findMany({
    where: { clientId: client.id },
    orderBy: { month: 'asc' },
  })

  // Get client's business plan
  const businessPlans = await prisma.businessPlan.findMany({
    where: { clientId: client.id },
    orderBy: { version: 'desc' },
    take: 1,
  })

  const latestBusinessPlan = businessPlans[0]

  // Get unread messages count
  const unreadMessagesCount = await prisma.portalMessage.count({
    where: {
      clientId: client.id,
      isFromAdmin: true,
      isRead: false,
    },
  })

  // Calculate progress
  const totalMonths = 8
  const completedDeliverables = deliverables.filter(
    (d) => d.status === 'DELIVERED' || d.status === 'APPROVED'
  ).length
  const progressPercentage = Math.round((completedDeliverables / totalMonths) * 100)

  // Get month status
  const monthStatuses = Array.from({ length: 8 }, (_, i) => {
    const month = `M${i + 1}` as any
    const deliverable = deliverables.find((d) => d.month === month)
    return {
      month,
      status: deliverable?.status || 'PENDING',
      title: deliverable?.title || `Month ${i + 1} Deliverable`,
    }
  })

  const dashboardContent = (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Welcome back, {client.name}!
          {portalUser.completedOnboarding && <Sparkles className="h-6 w-6 text-yellow-500" />}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your journey with Wavelaunch
        </p>
      </div>

      {/* Business Plan Spotlight - Show prominently for new users */}
      {!latestBusinessPlan && portalUser.completedOnboarding && (
        <Card className="border-primary/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  Your Business Plan is Being Created
                </CardTitle>
                <CardDescription>
                  Our team is reviewing your onboarding information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Based on the comprehensive information you provided during onboarding, our team is crafting a personalized business plan tailored specifically to {client.name || 'your brand'}.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    You'll receive a notification when it's ready for review
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Onboarding Complete</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Plan in Progress</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Review Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {completedDeliverables} of {totalMonths} months completed
            </p>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Plan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestBusinessPlan ? (
                <Badge
                  variant={
                    latestBusinessPlan.status === 'APPROVED'
                      ? 'default'
                      : latestBusinessPlan.status === 'DELIVERED'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {latestBusinessPlan.status}
                </Badge>
              ) : (
                <Badge variant="outline">Not Started</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestBusinessPlan
                ? `Version ${latestBusinessPlan.version}`
                : 'Awaiting creation'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessagesCount}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.onboardedAt
                ? new Date(client.onboardedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Onboarding date</p>
          </CardContent>
        </Card>
      </div>

      {/* 8-Month Journey Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your 8-Month Journey</CardTitle>
          <CardDescription>
            Track your progress through the Wavelaunch program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {monthStatuses.map((item) => (
              <div
                key={item.month}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className="mt-0.5">
                  {item.status === 'DELIVERED' || item.status === 'APPROVED' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : item.status === 'IN_PROGRESS' ? (
                    <Clock className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{item.month}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.title}
                  </p>
                  <Badge
                    variant={
                      item.status === 'DELIVERED' || item.status === 'APPROVED'
                        ? 'default'
                        : item.status === 'IN_PROGRESS'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="text-xs"
                  >
                    {item.status === 'PENDING' ? 'Not Started' : item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to do</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/portal/documents"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">View Documents</p>
                <p className="text-xs text-muted-foreground">
                  Access your business plan and deliverables
                </p>
              </div>
            </a>
            <a
              href="/portal/messages"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Send Message</p>
                <p className="text-xs text-muted-foreground">
                  Contact your Wavelaunch team
                </p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Brand</CardTitle>
            <CardDescription>Your creator profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Brand Name</p>
              <p className="text-lg font-semibold">
                {client.name || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Niche</p>
              <p className="text-lg font-semibold">{client.industryNiche || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge>{client.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <DashboardClientWrapper
      clientName={client.name}
      brandName={client.name}
      showWelcome={showWelcome}
    >
      {dashboardContent}
    </DashboardClientWrapper>
  )
}
