'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/notes/rich-text-editor'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
  Edit,
  Tag,
  X,
} from 'lucide-react'
interface NoteWithRelations {
  id: string
  clientId: string
  content: string
  title: string
  isImportant: boolean
  tags: string[]
  category: string | null
  authorId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  client: {
    id: string
    creatorName: string
    brandName: string | null
  }
  createdByUser: {
    id: string
    name: string
    email: string
  }
}

export default function ClientNotesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [notes, setNotes] = useState<NoteWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showImportantOnly, setShowImportantOnly] = useState(false)

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteWithRelations | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    isImportant: false,
  })
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<NoteWithRelations | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [params.id, selectedTag, showImportantOnly])

  const fetchNotes = async () => {
    try {
      const queryParams = new URLSearchParams({
        clientId: params.id as string,
      })

      if (selectedTag) queryParams.append('tag', selectedTag)
      if (showImportantOnly) queryParams.append('important', 'true')

      const res = await fetch(`/api/notes?${queryParams}`)
      const data = await res.json()

      if (data.success) {
        setNotes(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingNote(null)
    setFormData({
      title: '',
      content: '',
      tags: [],
      isImportant: false,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (note: NoteWithRelations) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags,
      isImportant: note.isImportant,
    })
    setDialogOpen(true)
  }

  const handleSaveNote = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a title',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      if (editingNote) {
        // Update existing note
        const res = await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        const data = await res.json()
        if (data.success) {
          await fetchNotes()
          setDialogOpen(false)
          toast({
            title: 'Success',
            description: 'Note updated successfully',
          })
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to update note',
            variant: 'destructive',
          })
        }
      } else {
        // Create new note
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            clientId: params.id,
          }),
        })

        const data = await res.json()
        if (data.success) {
          await fetchNotes()
          setDialogOpen(false)
          toast({
            title: 'Success',
            description: 'Note created successfully',
          })
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to create note',
            variant: 'destructive',
          })
        }
      }
    } catch (error) {
      console.error('Failed to save note:', error)
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async () => {
    if (!noteToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/notes/${noteToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.success) {
        await fetchNotes()
        setDeleteDialogOpen(false)
        setNoteToDelete(null)
        toast({
          title: 'Success',
          description: 'Note deleted successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete note',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const toggleImportant = async (note: NoteWithRelations) => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isImportant: !note.isImportant,
        }),
      })

      const data = await res.json()
      if (data.success) {
        await fetchNotes()
      }
    } catch (error) {
      console.error('Failed to toggle important:', error)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  // Get all unique tags from notes
  const allTags = Array.from(
    new Set(notes.flatMap((note) => note.tags))
  ).sort()

  // Filter notes by search query
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/clients/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Important filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="important"
            checked={showImportantOnly}
            onCheckedChange={(checked) => setShowImportantOnly(checked === true)}
          />
          <Label htmlFor="important" className="cursor-pointer">
            Important only
          </Label>
        </div>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag(null)}
          >
            All Tags
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </Button>
          ))}
        </div>
      )}

      {/* Notes list */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">
            {searchQuery || selectedTag || showImportantOnly
              ? 'No notes match your filters'
              : 'No notes yet. Create your first note to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border bg-card p-4 space-y-3 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{note.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => toggleImportant(note)}
                >
                  {note.isImportant ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Content preview */}
              <div
                className="text-sm text-muted-foreground line-clamp-3 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: note.content || '<p>No content</p>',
                }}
              />

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(note)}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNoteToDelete(note)
                    setDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Edit Note' : 'Create Note'}
            </DialogTitle>
            <DialogDescription>
              {editingNote
                ? 'Update the note details below'
                : 'Add a new note for this client'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter note title..."
                className="mt-1"
              />
            </div>

            {/* Important */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isImportant"
                checked={formData.isImportant}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isImportant: checked === true })
                }
              />
              <Label htmlFor="isImportant" className="cursor-pointer">
                Mark as important
              </Label>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Add a tag..."
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <Label>Content</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) =>
                  setFormData({ ...formData, content })
                }
                placeholder="Write your note..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote} disabled={saving}>
              {saving ? 'Saving...' : editingNote ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{noteToDelete?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNote}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
