'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Edit, CheckCircle2, Clock } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/loading'

interface PromptTemplate {
  id: string
  name: string
  type: string
  yamlPath: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PromptsPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/prompts')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTemplateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BUSINESS_PLAN: 'Business Plan',
      DELIVERABLE_M1: 'Month 1',
      DELIVERABLE_M2: 'Month 2',
      DELIVERABLE_M3: 'Month 3',
      DELIVERABLE_M4: 'Month 4',
      DELIVERABLE_M5: 'Month 5',
      DELIVERABLE_M6: 'Month 6',
      DELIVERABLE_M7: 'Month 7',
      DELIVERABLE_M8: 'Month 8',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompt Templates</h1>
          <p className="text-muted-foreground">
            Manage AI prompt templates for business plans and deliverables
          </p>
        </div>
        <Button disabled>
          <FileText className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="text-sm text-muted-foreground">
              Get started by creating your first prompt template
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {getTemplateTypeLabel(template.type)}
                    </CardDescription>
                  </div>
                  {template.isActive ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Path:</span>
                    <p className="mt-1 truncate text-muted-foreground">
                      {template.yamlPath}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Updated:</span>
                    <p className="mt-1 text-muted-foreground">
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="border-t p-4">
                <Button variant="outline" size="sm" className="w-full" disabled>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">About Prompt Templates</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p>
            Prompt templates are YAML files that define how the AI generates business
            plans and monthly deliverables. Each template contains instructions, context,
            and formatting guidelines for the AI.
          </p>
          <p className="mt-2">
            Templates are stored in the <code className="rounded bg-blue-100 px-1 py-0.5">/data/prompts/</code> directory
            and can be customized to match your business requirements.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
