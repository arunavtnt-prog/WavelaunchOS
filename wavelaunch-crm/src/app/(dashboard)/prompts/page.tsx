'use client'

import { useState } from 'react'
import { FileCode, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PromptsPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Prompt Templates</h1>
          <p className="text-muted-foreground">
            Manage prompt templates for AI-powered document generation
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          disabled
        />
      </div>

      {/* Coming soon message */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Management Coming Soon</CardTitle>
          <CardDescription>
            This feature is planned for a future release
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The Prompt Management interface will allow you to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>View and edit all AI prompt templates</li>
              <li>Create custom templates for specific use cases</li>
              <li>Version control for prompt changes</li>
              <li>Test prompts with sample data</li>
              <li>Import/export templates as YAML files</li>
              <li>Track prompt performance and token usage</li>
              <li>A/B test different prompt variations</li>
            </ul>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Current Implementation:</p>
              <p className="text-xs text-muted-foreground">
                Prompt templates are currently stored in the database and managed via Prisma Studio.
                You can access them by running: <code className="bg-background px-2 py-1 rounded">pnpm db:studio</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template categories preview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="opacity-50">
          <CardHeader>
            <FileCode className="h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle>Business Plans</CardTitle>
            <CardDescription>Templates for business plan generation</CardDescription>
          </CardHeader>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <FileCode className="h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle>Deliverables</CardTitle>
            <CardDescription>Monthly deliverable templates (M1-M8)</CardDescription>
          </CardHeader>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <FileCode className="h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle>Custom</CardTitle>
            <CardDescription>User-defined prompt templates</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
