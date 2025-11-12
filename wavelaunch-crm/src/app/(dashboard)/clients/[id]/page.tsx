'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Folder, StickyNote, Activity } from 'lucide-react'
import type { ClientWithRelations } from '@/types'

export default function ClientDetailPage() {
  const params = useParams()
  const [client, setClient] = useState<ClientWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

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
          <h1 className="text-3xl font-bold">{client.creatorName}</h1>
          {client.brandName && (
            <p className="text-muted-foreground">{client.brandName}</p>
          )}
        </div>
        <Button>Edit Client</Button>
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
            <p className="mt-1">{client.targetIndustry}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Niche</p>
            <p className="mt-1">{client.niche || 'Not specified'}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Vision</p>
          <p className="mt-1 text-sm">{client.visionStatement}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Target Audience
          </p>
          <p className="mt-1 text-sm">{client.targetAudience}</p>
        </div>
      </div>

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
                    {activity.user?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No activity yet</p>
        )}
      </div>
    </div>
  )
}
