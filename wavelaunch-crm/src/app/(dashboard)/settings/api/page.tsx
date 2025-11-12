'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Key, AlertTriangle } from 'lucide-react'

export default function APIConfigPage() {
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Placeholder for save functionality
    setTimeout(() => {
      setSaving(false)
      alert('API configuration saved! (This is a placeholder - configure via environment variables)')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">API Configuration</h1>
        <p className="text-muted-foreground">
          Configure Claude API keys and AI settings
        </p>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">Configuration Note</p>
            <p className="mt-1">
              For production use, configure API keys via environment variables (.env.local):
            </p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>ANTHROPIC_API_KEY - Your Claude API key</li>
              <li>BACKUP_API_KEY - Optional key for backup automation</li>
            </ul>
            <p className="mt-2">
              This UI is a placeholder for future enhanced configuration management.
            </p>
          </div>
        </div>
      </div>

      {/* API Key Configuration */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Claude API Key</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1"
              />
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your Claude API key from console.anthropic.com
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-sm text-yellow-900">
              <strong>Security Note:</strong> API keys should be stored securely in environment
              variables, not in the database. This UI is for reference only.
            </p>
          </div>
        </div>
      </div>

      {/* Current Configuration */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Claude API Key</span>
            <span className="text-sm text-muted-foreground">
              {process.env.NEXT_PUBLIC_HAS_API_KEY ?
                '✓ Configured (via env)' :
                '✗ Not configured'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Model</span>
            <span className="text-sm text-muted-foreground">
              claude-3-5-sonnet-20241022
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium">Max Tokens</span>
            <span className="text-sm text-muted-foreground">
              8000
            </span>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium">1. Get your Claude API key</p>
            <p className="text-muted-foreground mt-1">
              Sign up at console.anthropic.com and create an API key
            </p>
          </div>
          <div>
            <p className="font-medium">2. Add to environment variables</p>
            <p className="text-muted-foreground mt-1">
              Create or update .env.local in your project root:
            </p>
            <pre className="mt-2 p-3 bg-muted rounded text-xs">
ANTHROPIC_API_KEY=sk-ant-your-key-here
            </pre>
          </div>
          <div>
            <p className="font-medium">3. Restart the application</p>
            <p className="text-muted-foreground mt-1">
              Restart your Next.js development server to load the new environment variables
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
