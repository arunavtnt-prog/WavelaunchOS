'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Search, Calendar, ExternalLink } from 'lucide-react'

interface Deliverable {
  id: string
  month: number
  title: string
  status: string
  createdAt: string
  client: {
    id: string
    creatorName: string
    brandName?: string
  }
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'REJECTED', label: 'Rejected' },
]

const MONTH_OPTIONS = [
  { value: 'all', label: 'All Months' },
  ...Array.from({ length: 8 }, (_, i) => ({
    value: String(i + 1),
    label: `Month ${i + 1}`,
  })),
]

export default function DeliverablesHubPage() {
  const { toast } = useToast()
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [filteredDeliverables, setFilteredDeliverables] = useState<Deliverable[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')

  useEffect(() => {
    fetchClients()
    fetchDeliverables()
  }, [])

  useEffect(() => {
    filterDeliverables()
  }, [deliverables, search, statusFilter, monthFilter, clientFilter])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()

      if (data.success) {
        setClients(
          data.data.map((c: any) => ({
            id: c.id,
            name: c.brandName || c.creatorName,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const fetchDeliverables = async () => {
    try {
      const res = await fetch('/api/deliverables')
      const data = await res.json()

      if (data.success) {
        setDeliverables(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
      toast({
        title: 'Error',
        description: 'Failed to load deliverables',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterDeliverables = () => {
    let filtered = deliverables

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.client.creatorName.toLowerCase().includes(search.toLowerCase()) ||
          d.client.brandName?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.status === statusFilter)
    }

    // Month filter
    if (monthFilter !== 'all') {
      filtered = filtered.filter((d) => d.month === parseInt(monthFilter))
    }

    // Client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter((d) => d.client.id === clientFilter)
    }

    setFilteredDeliverables(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Group deliverables by month for overview
  const deliverablesByMonth = Array.from({ length: 8 }, (_, i) => {
    const month = i + 1
    const monthDeliverables = deliverables.filter((d) => d.month === month)
    const completed = monthDeliverables.filter(
      (d) => d.status === 'DELIVERED' || d.status === 'APPROVED'
    ).length

    return {
      month,
      total: monthDeliverables.length,
      completed,
      percentage: monthDeliverables.length > 0 ? (completed / monthDeliverables.length) * 100 : 0,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deliverables Hub</h1>
        <p className="text-muted-foreground">
          Centralized view of all client deliverables across the 8-month program
        </p>
      </div>

      {/* Overview Progress */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">8-Month Program Overview</h3>
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
          {deliverablesByMonth.map((month) => (
            <div key={month.month} className="text-center">
              <div className="mb-2">
                <p className="text-sm font-medium">M{month.month}</p>
                <p className="text-xs text-muted-foreground">
                  {month.completed}/{month.total}
                </p>
              </div>
              <div className="h-20 bg-muted rounded overflow-hidden">
                <div
                  className="bg-green-600 transition-all"
                  style={{ height: `${month.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(month.percentage)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deliverables or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTH_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Deliverables List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredDeliverables.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No deliverables found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search || statusFilter !== 'all' || monthFilter !== 'all' || clientFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No deliverables have been created yet'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Month</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDeliverables.map((deliverable) => (
                  <tr key={deliverable.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800">
                        M{deliverable.month}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{deliverable.title}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${deliverable.client.id}`}
                        className="text-primary hover:underline"
                      >
                        {deliverable.client.brandName || deliverable.client.creatorName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getStatusColor(
                          deliverable.status
                        )}`}
                      >
                        {deliverable.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(deliverable.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/clients/${deliverable.client.id}/deliverables/${deliverable.id}`}
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
