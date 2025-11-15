'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Search, Plus, Edit, Trash2, FileText, Check, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface PromptTemplate {
  id: string
  name: string
  description?: string
  type: string
  content: string
  variables?: string
  isActive: boolean
  isDefault: boolean
  version: number
  createdAt: string
  updatedAt: string
}

const PROMPT_TYPES = [
  { value: 'BUSINESS_PLAN', label: 'Business Plan' },
  { value: 'DELIVERABLE_M1', label: 'Month 1 Deliverable' },
  { value: 'DELIVERABLE_M2', label: 'Month 2 Deliverable' },
  { value: 'DELIVERABLE_M3', label: 'Month 3 Deliverable' },
  { value: 'DELIVERABLE_M4', label: 'Month 4 Deliverable' },
  { value: 'DELIVERABLE_M5', label: 'Month 5 Deliverable' },
  { value: 'DELIVERABLE_M6', label: 'Month 6 Deliverable' },
  { value: 'DELIVERABLE_M7', label: 'Month 7 Deliverable' },
  { value: 'DELIVERABLE_M8', label: 'Month 8 Deliverable' },
  { value: 'CUSTOM', label: 'Custom' },
]

export default function PromptsPage() {
  const { toast } = useToast()
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'CUSTOM',
    content: '',
    isActive: false,
    isDefault: false,
  })

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts')
      const data = await res.json()

      if (data.success) {
        setPrompts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load prompt templates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const extractVariables = (content: string): string[] => {
    const regex = /\{(\w+)\}/g
    const matches = content.matchAll(regex)
    const variables = new Set<string>()
    for (const match of matches) {
      variables.add(match[1])
    }
    return Array.from(variables)
  }

  const handleCreate = async () => {
    try {
      setSubmitting(true)
      const variables = extractVariables(formData.content)

      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          variables,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Prompt template created successfully',
        })
        setCreateDialogOpen(false)
        resetForm()
        fetchPrompts()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create prompt',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create prompt template',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedPrompt) return

    try {
      setSubmitting(true)
      const variables = extractVariables(formData.content)

      const res = await fetch(`/api/prompts/${selectedPrompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          variables,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Prompt template updated successfully',
        })
        setEditDialogOpen(false)
        setSelectedPrompt(null)
        resetForm()
        fetchPrompts()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update prompt',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update prompt template',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPrompt) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/prompts/${selectedPrompt.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Prompt template deleted successfully',
        })
        setDeleteDialogOpen(false)
        setSelectedPrompt(null)
        fetchPrompts()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete prompt',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete prompt template',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt)
    setFormData({
      name: prompt.name,
      description: prompt.description || '',
      type: prompt.type,
      content: prompt.content,
      isActive: prompt.isActive,
      isDefault: prompt.isDefault,
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt)
    setDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'CUSTOM',
      content: '',
      isActive: false,
      isDefault: false,
    })
  }

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.name.toLowerCase().includes(search.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(search.toLowerCase())

    const matchesType = typeFilter === 'all' || prompt.type === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompt Templates</h1>
          <p className="text-muted-foreground">
            Manage AI prompt templates for business plans and deliverables
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PROMPT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredPrompts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No prompt templates</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first prompt template.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPrompts.map((prompt) => {
            const variables = prompt.variables ? JSON.parse(prompt.variables) : []
            const typeLabel = PROMPT_TYPES.find((t) => t.value === prompt.type)?.label || prompt.type

            return (
              <div
                key={prompt.id}
                className="rounded-lg border bg-card p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{prompt.name}</h3>
                    {prompt.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {prompt.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(prompt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(prompt)}
                      disabled={prompt.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-blue-100 text-blue-800">
                    {typeLabel}
                  </span>
                  {prompt.isActive && (
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">
                      <Check className="mr-1 h-3 w-3" />
                      Active
                    </span>
                  )}
                  {prompt.isDefault && (
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-purple-100 text-purple-800">
                      Default
                    </span>
                  )}
                </div>

                {variables.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Variables:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {variables.map((v: string) => (
                        <code
                          key={v}
                          className="text-xs px-2 py-1 bg-muted rounded"
                        >
                          {`{${v}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground line-clamp-3 font-mono">
                    {prompt.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Prompt Template</DialogTitle>
            <DialogDescription>
              Create a new AI prompt template. Use {`{variableName}`} for dynamic content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Advanced Business Plan Generator"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of this template"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMPT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">Prompt Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder={`You are an expert business consultant. Create a comprehensive business plan for {clientName} in the {industry} industry...\n\nUse variables like {clientName}, {industry}, {targetAudience}, etc.`}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Variables detected:{' '}
                {extractVariables(formData.content).length > 0
                  ? extractVariables(formData.content).map((v) => `{${v}}`).join(', ')
                  : 'None'}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as active template
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked as boolean })
                  }
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as default
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting || !formData.name || !formData.content}>
              {submitting ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prompt Template</DialogTitle>
            <DialogDescription>
              Update the prompt template. Use {`{variableName}`} for dynamic content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Template Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Advanced Business Plan Generator"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of this template"
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMPT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-content">Prompt Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Enter your prompt content..."
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Variables detected:{' '}
                {extractVariables(formData.content).length > 0
                  ? extractVariables(formData.content).map((v) => `{${v}}`).join(', ')
                  : 'None'}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <label
                  htmlFor="edit-isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as active template
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked as boolean })
                  }
                  disabled={selectedPrompt?.isDefault}
                />
                <label
                  htmlFor="edit-isDefault"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as default
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={submitting || !formData.name || !formData.content}>
              {submitting ? 'Updating...' : 'Update Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPrompt?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
