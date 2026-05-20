'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Webhook {
  id: string
  name: string
  url: string
  secret: string
  events: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const WEBHOOK_EVENTS = [
  { value: 'client.created', label: 'Client Created', category: 'Client' },
  { value: 'client.updated', label: 'Client Updated', category: 'Client' },
  { value: 'client.activated', label: 'Client Activated', category: 'Client' },
  { value: 'client.archived', label: 'Client Archived', category: 'Client' },
  { value: 'business_plan.created', label: 'Business Plan Created', category: 'Business Plan' },
  { value: 'business_plan.approved', label: 'Business Plan Approved', category: 'Business Plan' },
  { value: 'deliverable.created', label: 'Deliverable Created', category: 'Deliverable' },
  { value: 'deliverable.completed', label: 'Deliverable Completed', category: 'Deliverable' },
  { value: 'deliverable.overdue', label: 'Deliverable Overdue', category: 'Deliverable' },
  { value: 'ticket.created', label: 'Ticket Created', category: 'Ticket' },
  { value: 'ticket.updated', label: 'Ticket Updated', category: 'Ticket' },
  { value: 'ticket.resolved', label: 'Ticket Resolved', category: 'Ticket' }
]

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks')
      if (!response.ok) throw new Error('Failed to fetch webhooks')
      const data = await response.json()
      setWebhooks(data)
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
      toast({
        title: 'Error',
        description: 'Failed to load webhooks',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingWebhook(null)
    setFormData({
      name: '',
      url: '',
      secret: '',
      events: [],
      isActive: true
    })
    setDialogOpen(true)
  }

  const openEditDialog = (webhook: Webhook) => {
    setEditingWebhook(webhook)
    setFormData({
      name: webhook.name,
      url: webhook.url,
      secret: webhook.secret,
      events: webhook.events,
      isActive: webhook.isActive
    })
    setDialogOpen(true)
  }

  const handleEventToggle = (eventValue: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventValue)
        ? prev.events.filter(e => e !== eventValue)
        : [...prev.events, eventValue]
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.url || !formData.secret || formData.events.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields and select at least one event',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    try {
      const method = editingWebhook ? 'PUT' : 'POST'
      const url = editingWebhook ? `/api/webhooks/${editingWebhook.id}` : '/api/webhooks'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save webhook')
      }

      toast({
        title: 'Success',
        description: `Webhook ${editingWebhook ? 'updated' : 'created'} successfully`
      })

      setDialogOpen(false)
      fetchWebhooks()
    } catch (error) {
      console.error('Failed to save webhook:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save webhook',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete webhook')
      }

      toast({
        title: 'Success',
        description: 'Webhook deleted successfully'
      })

      fetchWebhooks()
    } catch (error) {
      console.error('Failed to delete webhook:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete webhook',
        variant: 'destructive'
      })
    }
  }

  const generateSecret = () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const secret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    setFormData(prev => ({ ...prev, secret }))
  }

  const groupedEvents = WEBHOOK_EVENTS.reduce((acc, event) => {
    if (!acc[event.category]) acc[event.category] = []
    acc[event.category].push(event)
    return acc
  }, {} as Record<string, typeof WEBHOOK_EVENTS>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading webhooks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground mt-1">
            Configure HTTP callbacks for real-time event notifications
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Webhook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {webhooks.filter(w => w.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {webhooks.filter(w => !w.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Webhooks</CardTitle>
          <CardDescription>Manage your webhook endpoints and event subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first webhook
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Create Webhook
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{webhook.name}</h3>
                      {webhook.isActive ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {webhook.url}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created {new Date(webhook.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(webhook)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
            </DialogTitle>
            <DialogDescription>
              Configure webhook endpoint and select events to subscribe to
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Slack Notifications"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">Webhook URL *</Label>
              <Input
                id="url"
                placeholder="https://your-server.com/webhooks"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>

            {/* Secret */}
            <div className="space-y-2">
              <Label htmlFor="secret">Secret Key *</Label>
              <div className="flex gap-2">
                <Input
                  id="secret"
                  placeholder="Used for HMAC signature verification"
                  value={formData.secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={generateSecret}>
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this secret safe. It's used to verify webhook payloads.
              </p>
            </div>

            {/* Events */}
            <div className="space-y-3">
              <Label>Events to Subscribe *</Label>
              <div className="space-y-4">
                {Object.entries(groupedEvents).map(([category, events]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                    <div className="space-y-2 pl-4">
                      {events.map((event) => (
                        <div key={event.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={event.value}
                            checked={formData.events.includes(event.value)}
                            onCheckedChange={() => handleEventToggle(event.value)}
                          />
                          <Label htmlFor={event.value} className="text-sm font-normal cursor-pointer">
                            {event.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, isActive: checked as boolean }))
                }
              />
              <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                Active (webhook will receive events)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editingWebhook ? 'Update Webhook' : 'Create Webhook'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
