import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Mail, CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

async function getDashboardStats() {
  try {
    const { db } = await import('@/lib/db/prisma');

    const [
      totalApplications,
      pendingQueue,
      snapshotGenerating,
      emailReviewPending,
      awaitingResponse,
      converted,
    ] = await Promise.all([
      db.application.count(),
      db.workflowState.count({ where: { status: 'SUBMITTED' } }),
      db.workflowState.count({ where: { status: { in: ['SNAPSHOT_QUEUED', 'SNAPSHOT_GENERATING'] } } }),
      db.workflowState.count({ where: { status: 'EMAIL_REVIEW_PENDING' } }),
      db.workflowState.count({ where: { status: 'AWAITING_RESPONSE' } }),
      db.workflowState.count({ where: { status: 'CONVERTED' } }),
    ]);

    return {
      success: true,
      totalApplications,
      pendingQueue,
      snapshotGenerating,
      emailReviewPending,
      awaitingResponse,
      converted,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed',
      totalApplications: 0,
      pendingQueue: 0,
      snapshotGenerating: 0,
      emailReviewPending: 0,
      awaitingResponse: 0,
      converted: 0,
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      description: 'All submitted applications',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Pending Queue',
      value: stats.pendingQueue,
      description: 'Awaiting admin review',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      title: 'Snapshots Generating',
      value: stats.snapshotGenerating,
      description: 'AI in progress',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Emails Awaiting Review',
      value: stats.emailReviewPending,
      description: 'Ready for approval',
      icon: Mail,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Awaiting Response',
      value: stats.awaitingResponse,
      description: 'Emails sent, waiting',
      icon: AlertCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      title: 'Converted',
      value: stats.converted,
      description: 'Successfully converted',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Wavelaunch Workflow Automation Dashboard
        </p>
      </div>

      {!stats.success && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900 dark:text-orange-100">Database Connection Issue</CardTitle>
            </div>
            <CardDescription className="text-orange-800 dark:text-orange-200">
              {stats.error || 'Unable to connect to the database. Please check your connection and try again.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-orange-800 dark:text-orange-200">
            <p className="mb-2">Possible causes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Database server is not running or not accessible</li>
              <li>Incorrect DATABASE_URL in .env.local</li>
              <li>Network or firewall issues blocking the connection</li>
            </ul>
            <p className="mt-4">The interface is still functional - you can navigate to other pages.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common workflow operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/queue"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Review Application Queue</span>
              </div>
              <Badge variant="secondary">{stats.pendingQueue} pending</Badge>
            </a>
            <a
              href="/emails"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Review Email Drafts</span>
              </div>
              <Badge variant="secondary">{stats.emailReviewPending} pending</Badge>
            </a>
            <a
              href="/conversions"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Manage Conversions</span>
              </div>
              <Badge variant="secondary">{stats.awaitingResponse} waiting</Badge>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Status</CardTitle>
            <CardDescription>
              Current system state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Blueprint Engine</span>
                <Badge variant={stats.success ? 'success' : 'destructive'}>
                  {stats.success ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Claude AI</span>
                <Badge variant={process.env.ANTHROPIC_API_KEY ? 'success' : 'destructive'}>
                  {process.env.ANTHROPIC_API_KEY ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant={stats.success ? 'success' : 'destructive'}>
                  {stats.success ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
