'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Folder, StickyNote, Activity, Archive, ArchiveRestore } from 'lucide-react'
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
import { PortalUserCard } from '@/components/admin/portal-user-card'
import { ClientMessaging } from '@/components/admin/client-messaging'
import { OnboardingDetails } from '@/components/admin/onboarding-details'
import { BusinessPlanGenerator } from '@/components/admin/business-plan-generator'
import type { ClientWithRelations } from '@/types'

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [client, setClient] = useState<ClientWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    fetchClient()
  }, [params.id])

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${params.id}`)
      const data = await res.json()

      if (data.success) {
        setClient(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch client:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async () => {
    try {
      setArchiving(true)
      const res = await fetch(`/api/clients/${params.id}/archive`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Client archived',
          description: 'The client has been archived successfully.',
        })
        router.push('/clients')
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to archive client',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive client',
        variant: 'destructive',
      })
    } finally {
      setArchiving(false)
      setArchiveDialogOpen(false)
    }
  }

  const handleRestore = async () => {
    try {
      setRestoring(true)
      const res = await fetch(`/api/clients/${params.id}/restore`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Client restored',
          description: 'The client has been restored successfully.',
        })
        fetchClient()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to restore client',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore client',
        variant: 'destructive',
      })
    } finally {
      setRestoring(false)
      setRestoreDialogOpen(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Client not found</h2>
        <Link href="/clients" className="mt-4 inline-block">
          <Button variant="outline">Back to Clients</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{client.name}</h1>
        </div>
        {client.deletedAt ? (
          <Button
            onClick={() => setRestoreDialogOpen(true)}
            disabled={restoring}
            variant="outline"
          >
            <ArchiveRestore className="mr-2 h-4 w-4" />
            {restoring ? 'Restoring...' : 'Restore Client'}
          </Button>
        ) : (
          <>
            <Button>Edit Client</Button>
            <Button
              onClick={() => setArchiveDialogOpen(true)}
              disabled={archiving}
              variant="outline"
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Client
            </Button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href={`/clients/${client.id}/business-plan`}>
          <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Business Plans</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{client._count?.businessPlans || 0}</p>
          </div>
        </Link>

        <Link href={`/clients/${client.id}/deliverables`}>
          <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Deliverables</span>
            </div>
            <p className="mt-2 text-2xl font-bold">
              {client.deliverables?.length || 0}/8
            </p>
          </div>
        </Link>

        <Link href={`/clients/${client.id}/files`}>
          <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Files</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{client._count?.files || 0}</p>
          </div>
        </Link>

        <Link href={`/clients/${client.id}/notes`}>
          <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Notes</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{client._count?.notes || 0}</p>
          </div>
        </Link>
      </div>

      {/* Overview */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Overview</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="mt-1">{client.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                  client.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {client.status}
              </span>
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Industry</p>
            <p className="mt-1">{client.industryNiche}</p>
          </div>

                  </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Vision</p>
          <p className="mt-1 text-sm">{client.visionForVenture}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Target Audience
          </p>
          <p className="mt-1 text-sm">{client.targetAudience}</p>
        </div>
      </div>

      {/* Portal Access */}
      {!client.deletedAt && (
        <PortalUserCard
          clientId={client.id}
          clientEmail={client.email}
          creatorName={client.name}
        />
      )}

      {/* Business Plan Generator - Show if onboarding complete but no business plan */}
      {!client.deletedAt && (
        <BusinessPlanGenerator
          clientId={client.id}
          clientName={client.name}
          hasBusinessPlan={(client._count?.businessPlans || 0) > 0}
          hasCompletedOnboarding={true} // Fresh clients from applications have completed onboarding
        />
      )}

      {/* Onboarding Details - Show all collected information */}
      {!client.deletedAt && (
        <OnboardingDetails client={client} />
      )}

      {/* Client Messaging */}
      {!client.deletedAt && (
        <ClientMessaging
          clientId={client.id}
          creatorName={client.fullName}
        />
      )}

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Link href={`/clients/${client.id}/business-plan`}>
            <Button variant="outline" className="h-auto py-4 w-full">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Business Plans</span>
              </div>
            </Button>
          </Link>

          <Link href={`/clients/${client.id}/deliverables`}>
            <Button variant="outline" className="h-auto py-4 w-full">
              <div className="flex flex-col items-center gap-2">
                <Activity className="h-6 w-6" />
                <span>Deliverables</span>
              </div>
            </Button>
          </Link>

          <Link href={`/clients/${client.id}/files`}>
            <Button variant="outline" className="h-auto py-4 w-full">
              <div className="flex flex-col items-center gap-2">
                <Folder className="h-6 w-6" />
                <span>Files</span>
              </div>
            </Button>
          </Link>

          <Link href={`/clients/${client.id}/notes`}>
            <Button variant="outline" className="h-auto py-4 w-full">
              <div className="flex flex-col items-center gap-2">
                <StickyNote className="h-6 w-6" />
                <span>Notes</span>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
        {client.activities && client.activities.length > 0 ? (
          <div className="space-y-3">
            {client.activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 border-l-2 pl-4"
              >
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString()} •{' '}
                    System User
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No activity yet</p>
        )}
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive {client.fullName}. You can restore them later from the archived clients page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={archiving}>
              {archiving ? 'Archiving...' : 'Archive Client'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore {client.name} and mark them as active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={restoring}>
              {restoring ? 'Restoring...' : 'Restore Client'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
