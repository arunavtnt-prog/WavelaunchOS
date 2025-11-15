'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Plus, Upload, Inbox } from 'lucide-react'

export default function SubmissionsPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">D2D Submissions</h1>
          <p className="text-muted-foreground">
            Direct-to-Designer submission tracking
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Submission
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Design Request</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Request Title</Label>
              <Input id="title" placeholder="e.g., Logo design for new brand" />
            </div>
            <div>
              <Label htmlFor="client">Client</Label>
              <Input id="client" placeholder="Select client..." />
            </div>
            <div>
              <Label htmlFor="details">Requirements</Label>
              <Textarea
                id="details"
                placeholder="Provide detailed design requirements..."
                rows={6}
              />
            </div>
            <div>
              <Label>Attachments</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop files here, or click to browse
                </p>
                <Input type="file" className="hidden" multiple />
              </div>
            </div>
            <div className="flex gap-2">
              <Button>Submit Request</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="text-center py-12 border rounded-lg">
        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No submissions yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a submission to request design work from your team
        </p>
      </div>
    </div>
  )
}
