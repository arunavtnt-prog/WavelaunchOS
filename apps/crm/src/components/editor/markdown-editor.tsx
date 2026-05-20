'use client'

import { useState, useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import rehypeRaw from 'rehype-raw'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Save, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onSave?: () => void
  autoSave?: boolean
  autoSaveInterval?: number // milliseconds
  readOnly?: boolean
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  onSave,
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds default
  readOnly = false,
  className,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastValueRef = useRef(value)

  // Track unsaved changes
  useEffect(() => {
    if (value !== lastValueRef.current) {
      setHasUnsavedChanges(true)
      lastValueRef.current = value
    }
  }, [value])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSave || readOnly || !hasUnsavedChanges) {
      return
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(async () => {
      await handleSave()
    }, autoSaveInterval)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [value, autoSave, onSave, readOnly, hasUnsavedChanges, autoSaveInterval])

  const handleSave = async () => {
    if (!onSave || readOnly) return

    setIsSaving(true)
    try {
      await onSave()
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleManualSave = async () => {
    await handleSave()
  }

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved yet'
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)

    if (diff < 60) return 'Saved just now'
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`
    return `Saved ${Math.floor(diff / 3600)}h ago`
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant={showPreview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>

          {!readOnly && onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Now'}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {hasUnsavedChanges && !isSaving && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span>Unsaved changes</span>
            </div>
          )}
          {isSaving && <span className="text-blue-600">Saving...</span>}
          {!hasUnsavedChanges && lastSaved && (
            <span className="text-green-600">{formatLastSaved()}</span>
          )}
          {autoSave && !readOnly && (
            <span className="text-xs">
              (Auto-save every {autoSaveInterval / 1000}s)
            </span>
          )}
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Editor Pane */}
            <div className="border-r overflow-auto">
              <CodeMirror
                value={value}
                height="100%"
                extensions={[markdown()]}
                onChange={(val) => onChange(val)}
                editable={!readOnly}
                theme="dark"
                className="h-full"
              />
            </div>

            {/* Preview Pane */}
            <div className="overflow-auto p-6 prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {value}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <CodeMirror
              value={value}
              height="100%"
              extensions={[markdown()]}
              onChange={(val) => onChange(val)}
              editable={!readOnly}
              theme="dark"
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}
