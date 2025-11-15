'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw, Sparkles } from 'lucide-react'

interface Section {
  id: string
  sectionName: string
  sectionOrder: number
  content: string
  version: number
}

interface SectionRegeneratorProps {
  businessPlanId: string
  onRegenerated?: () => void
}

export function SectionRegenerator({
  businessPlanId,
  onRegenerated,
}: SectionRegeneratorProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    if (open) {
      fetchSections()
    }
  }, [open])

  const fetchSections = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/business-plans/${businessPlanId}/sections`)
      const data = await res.json()

      if (data.success) {
        setSections(data.data)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load sections',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load sections',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSection = (sectionName: string) => {
    const newSelected = new Set(selectedSections)
    if (newSelected.has(sectionName)) {
      newSelected.delete(sectionName)
    } else {
      newSelected.add(sectionName)
    }
    setSelectedSections(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedSections.size === sections.length) {
      setSelectedSections(new Set())
    } else {
      setSelectedSections(new Set(sections.map((s) => s.sectionName)))
    }
  }

  const handleRegenerate = async () => {
    if (selectedSections.size === 0) {
      toast({
        title: 'No sections selected',
        description: 'Please select at least one section to regenerate',
        variant: 'destructive',
      })
      return
    }

    setRegenerating(true)
    try {
      const res = await fetch(
        `/api/business-plans/${businessPlanId}/regenerate-sections`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionNames: Array.from(selectedSections),
          }),
        }
      )

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message || 'Sections regenerated successfully',
        })
        setOpen(false)
        setSelectedSections(new Set())
        if (onRegenerated) {
          onRegenerated()
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to regenerate sections',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate sections',
        variant: 'destructive',
      })
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Regenerate Sections
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Regenerate Sections</DialogTitle>
          <DialogDescription>
            Select specific sections to regenerate using AI. This saves tokens by only
            regenerating what you need.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading sections...
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sections found. The document may need to be parsed first.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="text-sm font-medium">
                  {selectedSections.size} of {sections.length} selected
                </div>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedSections.size === sections.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.has(section.sectionName)}
                      onCheckedChange={() => handleToggleSection(section.sectionName)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={section.id}
                        className="font-medium cursor-pointer"
                      >
                        {section.sectionName}
                      </label>
                      <div className="text-xs text-muted-foreground mt-1">
                        Version {section.version} •{' '}
                        {section.content.length > 100
                          ? `${section.content.substring(0, 100)}...`
                          : section.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  {selectedSections.size > 0 && (
                    <span>
                      Estimated token savings: ~
                      {Math.round(
                        ((sections.length - selectedSections.size) / sections.length) *
                          100
                      )}
                      %
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={regenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    disabled={selectedSections.size === 0 || regenerating}
                  >
                    {regenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Regenerate {selectedSections.size} Section
                        {selectedSections.size !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
