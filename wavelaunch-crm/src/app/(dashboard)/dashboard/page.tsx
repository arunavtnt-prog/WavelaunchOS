import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, FileText, HardDrive, AlertCircle } from 'lucide-react'

async function DashboardStats() {
  // TODO: Fetch real stats from API
  const stats = {
    clients: 0,
    pendingDeliverables: 0,
    storageUsed: 0,
    storageLimit: 50,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Clients</p>
            <p className="text-2xl font-bold">{stats.clients}/100</p>
          </div>
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Pending Deliverables
            </p>
            <p className="text-2xl font-bold">{stats.pendingDeliverables}</p>
          </div>
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Storage</p>
            <p className="text-2xl font-bold">
              {stats.storageUsed} GB / {stats.storageLimit} GB
            </p>
          </div>
          <HardDrive className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-2xl font-bold text-green-600">Healthy</p>
          </div>
          <AlertCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/clients/new">
          <Button>New Client</Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/clients/new">
            <Button variant="outline" className="h-20 w-full">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>Onboard Client</span>
              </div>
            </Button>
          </Link>
          <Link href="/files">
            <Button variant="outline" className="h-20 w-full">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>View Files</span>
              </div>
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" className="h-20 w-full">
              <div className="flex flex-col items-center gap-2">
                <HardDrive className="h-6 w-6" />
                <span>Settings</span>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">
          No recent activity. Start by onboarding your first client!
        </p>
      </div>
    </div>
  )
}
