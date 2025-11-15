import { redirect } from 'next/navigation'
import { getPortalSession, getPortalUser } from '@/lib/auth/portal-auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, Eye } from 'lucide-react'

export default async function PortalDocumentsPage() {
  const session = await getPortalSession()

  if (!session) {
    redirect('/portal/login')
  }

  const portalUser = await getPortalUser(session.userId)

  if (!portalUser) {
    redirect('/portal/login')
  }

  const client = portalUser.client

  // Get business plan
  const businessPlans = await prisma.businessPlan.findMany({
    where: { clientId: client.id },
    orderBy: { version: 'desc' },
  })

  // Get deliverables
  const deliverables = await prisma.deliverable.findMany({
    where: { clientId: client.id },
    orderBy: { month: 'asc' },
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Access your business plan and monthly deliverables
        </p>
      </div>

      {/* Business Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Business Plan</CardTitle>
          <CardDescription>
            Your comprehensive business strategy and roadmap
          </CardDescription>
        </CardHeader>
        <CardContent>
          {businessPlans.length > 0 ? (
            <div className="space-y-3">
              {businessPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Business Plan v{plan.version}</p>
                      <p className="text-sm text-muted-foreground">
                        Updated {new Date(plan.updatedAt).toLocaleDateString()}
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
                    {plan.pdfUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={plan.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Your business plan is being prepared. Check back soon!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Deliverables</CardTitle>
          <CardDescription>
            Your month-by-month content and strategy deliverables
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deliverables.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-sm font-bold text-primary">
                        {deliverable.month}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{deliverable.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deliverable.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    {deliverable.pdfUrl && (
                      <Button size="sm" variant="ghost" asChild>
                        <a
                          href={deliverable.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No deliverables available yet. They will appear here as they are created.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
