'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ArrowLeft, Archive, ArchiveRestore } from 'lucide-react'
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
import type { Client } from '@prisma/client'

export default function ArchivedClientsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  useEffect(() => {
    fetchArchivedClients()
  }, [search])

  const fetchArchivedClients = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)

      const res = await fetch(`/api/clients/archived?${params}`)
      const data = await res.json()

      if (data.success) {
        setClients(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch archived clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreClick = (clientId: string) => {
    setSelectedClientId(clientId)
    setRestoreDialogOpen(true)
  }

  const handleRestore = async () => {
    if (!selectedClientId) return

    try {
      setRestoring(true)
      const res = await fetch(`/api/clients/${selectedClientId}/restore`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Client restored',
          description: 'The client has been restored successfully.',
        })
        fetchArchivedClients() // Refresh list
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
      setSelectedClientId(null)
    }
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Archived Clients</h1>
            <p className="text-muted-foreground">{clients.length} archived clients</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search archived clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No archived clients</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Archived clients will appear here.
          </p>
          <Link href="/clients" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div key={client.id} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{client.name}</h3>
                </div>
                <span className="rounded-full px-2 py-1 text-xs bg-gray-100 text-gray-800">
                  ARCHIVED
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {client.industryNiche}
                </p>
                {client.deletedAt && (
                  <p className="text-xs text-muted-foreground">
                    Archived {new Date(client.deletedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Link href={`/clients/${client.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View
                  </Button>
                </Link>
                <Button
                  onClick={() => handleRestoreClick(client.id)}
                  className="flex-1"
                >
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Restore
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Client?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedClient && (
                <>
                  This will restore <strong>{selectedClient.name}</strong> and mark them as
                  active again.
                </>
              )}
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
