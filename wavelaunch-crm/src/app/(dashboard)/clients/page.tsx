'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Search, Plus, Users, Archive, ChevronDown } from 'lucide-react'
import type { Client } from '@prisma/client'

export default function ClientsPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [bulkArchiveDialogOpen, setBulkArchiveDialogOpen] = useState(false)
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE')
  const [bulkArchiving, setBulkArchiving] = useState(false)
  const [bulkUpdating, setBulkUpdating] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [search])

  const fetchClients = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)

      const res = await fetch(`/api/clients?${params}`)
      const data = await res.json()

      if (data.success) {
        setClients(data.data)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleClientSelection = (clientId: string) => {
    const newSelected = new Set(selectedClients)
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId)
    } else {
      newSelected.add(clientId)
    }
    setSelectedClients(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedClients.size === clients.length) {
      setSelectedClients(new Set())
    } else {
      setSelectedClients(new Set(clients.map((c) => c.id)))
    }
  }

  const handleBulkArchive = async () => {
    try {
      setBulkArchiving(true)
      const res = await fetch('/api/clients/bulk-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientIds: Array.from(selectedClients) }),
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Clients archived',
          description: data.data.message,
        })
        setSelectedClients(new Set())
        fetchClients()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to archive clients',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive clients',
        variant: 'destructive',
      })
    } finally {
      setBulkArchiving(false)
      setBulkArchiveDialogOpen(false)
    }
  }

  const handleBulkStatusUpdate = async () => {
    try {
      setBulkUpdating(true)
      const res = await fetch('/api/clients/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientIds: Array.from(selectedClients),
          status: bulkStatus,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Clients updated',
          description: data.data.message,
        })
        setSelectedClients(new Set())
        fetchClients()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update clients',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update clients',
        variant: 'destructive',
      })
    } finally {
      setBulkUpdating(false)
      setBulkStatusDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            {total}/100 clients
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/clients/archived">
            <Button variant="outline">
              <Archive className="mr-2 h-4 w-4" />
              View Archived
            </Button>
          </Link>
          <Link href="/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {clients.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedClients.size === clients.length && clients.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm cursor-pointer">
              Select All
            </label>
          </div>
        )}
      </div>

      {selectedClients.size > 0 && (
        <div className="rounded-lg border bg-muted p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {selectedClients.size} client(s) selected
            </p>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Set Status
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setBulkStatus('ACTIVE')
                      setBulkStatusDialogOpen(true)
                    }}
                  >
                    Set to Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setBulkStatus('INACTIVE')
                      setBulkStatusDialogOpen(true)
                    }}
                  >
                    Set to Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkArchiveDialogOpen(true)}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive Selected
              </Button>
            </div>
          </div>
        </div>
      )}

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
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No clients yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by onboarding your first client.
          </p>
          <Link href="/clients/new" className="mt-4 inline-block">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className={`rounded-lg border bg-card p-6 transition-all ${
                selectedClients.has(client.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedClients.has(client.id)}
                  onCheckedChange={() => toggleClientSelection(client.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Link href={`/clients/${client.id}`} className="flex-1 group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold group-hover:text-primary">
                          {client.name}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          client.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {client.industryNiche}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Onboarded {new Date(client.onboardedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Archive Confirmation Dialog */}
      <AlertDialog open={bulkArchiveDialogOpen} onOpenChange={setBulkArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedClients.size} Client(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected clients. You can restore them later from the archived
              clients page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkArchive} disabled={bulkArchiving}>
              {bulkArchiving ? 'Archiving...' : 'Archive Clients'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Status Update Confirmation Dialog */}
      <AlertDialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Update {selectedClients.size} Client(s) to {bulkStatus}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will change the status of all selected clients to {bulkStatus}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkStatusUpdate} disabled={bulkUpdating}>
              {bulkUpdating ? 'Updating...' : 'Update Status'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
