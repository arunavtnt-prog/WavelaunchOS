'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Search, FileText, ExternalLink } from 'lucide-react'

interface BusinessPlan {
  id: string
  version: number
  status: string
  generatedAt: string
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

export default function BusinessPlansPage() {
  const { toast } = useToast()
  const [plans, setPlans] = useState<BusinessPlan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<BusinessPlan[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')

  useEffect(() => {
    fetchClients()
    fetchPlans()
  }, [])

  useEffect(() => {
    filterPlans()
  }, [plans, search, statusFilter, clientFilter])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      if (data.success) {
        setClients(data.data.map((c: any) => ({ id: c.id, name: c.brandName || c.creatorName })))
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/business-plans')
      const data = await res.json()
      if (data.success) {
        setPlans(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      toast({ title: 'Error', description: 'Failed to load business plans', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const filterPlans = () => {
    let filtered = plans
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.client.creatorName.toLowerCase().includes(search.toLowerCase()) ||
          p.client.brandName?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }
    if (clientFilter !== 'all') {
      filtered = filtered.filter((p) => p.client.id === clientFilter)
    }
    setFilteredPlans(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-blue-100 text-blue-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Business Plans</h1>
        <p className="text-muted-foreground">All client business plans in one place</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No business plans found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search || statusFilter !== 'all' || clientFilter !== 'all' ? 'Try adjusting your filters' : 'No business plans have been created yet'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Version</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Generated</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${plan.client.id}`} className="text-primary hover:underline font-medium">
                        {plan.client.brandName || plan.client.creatorName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800">
                        v{plan.version}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getStatusColor(plan.status)}`}>
                        {plan.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(plan.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/clients/${plan.client.id}/business-plan/${plan.id}`}>
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
