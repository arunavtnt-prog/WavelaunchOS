'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, RefreshCw, Settings2, FileText, Zap } from 'lucide-react'

type AutoSendSettings = {
  enabled: boolean
  confidenceThreshold: number
  intents: string[]
}

type ConnectionStatus = {
  workflowDashboard: { connected: boolean }
  instantlyApi: { configured: boolean }
}

export default function InstantlySettingsPage() {
  const [settings, setSettings] = useState<AutoSendSettings>({
    enabled: true,
    confidenceThreshold: 0.9,
    intents: ['INTERESTED'],
  })
  const [connection, setConnection] = useState<ConnectionStatus>({
    workflowDashboard: { connected: false },
    instantlyApi: { configured: false },
  })
  const [testingConnection, setTestingConnection] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    fetchSettings()
    checkConnection()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/instantly/settings')
      const data = await res.json()
      if (data.success && data.data) {
        setSettings(data.data.autoSend || settings)
        setConnection({
          workflowDashboard: data.data.workflowDashboard || { connected: false },
          instantlyApi: data.data.instantlyApi || { configured: false },
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const checkConnection = async () => {
    try {
      setTestingConnection(true)
      const res = await fetch('/api/admin/instantly/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-connection' }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setConnection({
          workflowDashboard: data.data.workflowDashboard,
          instantlyApi: data.data.instantlyApi,
        })
      }
    } catch (error) {
      console.error('Error testing connection:', error)
    } finally {
      setTestingConnection(false)
    }
  }

  const testInstantlyApi = async () => {
    try {
      setTestingConnection(true)
      setTestResult(null)
      const res = await fetch('/api/admin/instantly/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-instantly-api' }),
      })
      const data = await res.json()
      if (res.ok) {
        setTestResult({ success: true, message: 'Successfully connected to Instantly API' })
      } else {
        setTestResult({ success: false, message: data.error || 'Connection failed' })
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Connection failed: ' + (error as Error).message })
    } finally {
      setTestingConnection(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/instantly/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoSend: settings,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Settings saved successfully')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const toggleIntent = (intent: string) => {
    if (settings.intents.includes(intent)) {
      setSettings({
        ...settings,
        intents: settings.intents.filter((i) => i !== intent),
      })
    } else {
      setSettings({
        ...settings,
        intents: [...settings.intents, intent],
      })
    }
  }

  const AVAILABLE_INTENTS = ['INTERESTED', 'PRICING', 'SCHEDULING', 'QUESTIONS', 'OTHER']

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Instantly Settings</h1>
        <p className="text-muted-foreground mt-1">Configure auto-send rules and playbook settings</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Check connectivity to Workflow Dashboard and Instantly API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connection.workflowDashboard.connected ? (
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="h-4 w-4 text-red-500" />
                </div>
              )}
              <div>
                <div className="text-sm font-medium">Workflow Dashboard</div>
                <div className="text-xs text-muted-foreground">
                  {connection.workflowDashboard.connected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
            <Button
              onClick={checkConnection}
              disabled={testingConnection}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${testingConnection ? 'animate-spin' : ''}`} />
              Test
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connection.instantlyApi.configured ? (
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <X className="h-4 w-4 text-yellow-500" />
                </div>
              )}
              <div>
                <div className="text-sm font-medium">Instantly API</div>
                <div className="text-xs text-muted-foreground">
                  {connection.instantlyApi.configured ? 'Configured' : 'Not configured'}
                </div>
              </div>
            </div>
            <Button
              onClick={testInstantlyApi}
              disabled={testingConnection}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${testingConnection ? 'animate-spin' : ''}`} />
              Test
            </Button>
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md text-sm ${
                testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {testResult.success ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {testResult.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Send Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto-Send Configuration
          </CardTitle>
          <CardDescription>
            Configure automatic sending of high-confidence draft replies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Enable Auto-Send</div>
              <div className="text-xs text-muted-foreground">
                Automatically send replies that meet confidence threshold
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Confidence Threshold</div>
                <div className="text-xs text-muted-foreground">
                  Only auto-send drafts with confidence above this level
                </div>
              </div>
              <Badge variant="secondary">
                {(settings.confidenceThreshold * 100).toFixed(0)}%
              </Badge>
            </div>
            <Slider
              value={[settings.confidenceThreshold]}
              onValueChange={([value]) => setSettings({ ...settings, confidenceThreshold: value })}
              min={0.7}
              max={0.95}
              step={0.05}
              disabled={!settings.enabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>70%</span>
              <span>95%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-2">Auto-Send Intents</div>
              <div className="text-xs text-muted-foreground">
                Only auto-send drafts with these intent classifications
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTENTS.map((intent) => (
                <Badge
                  key={intent}
                  variant={settings.intents.includes(intent) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => settings.enabled && toggleIntent(intent)}
                >
                  {settings.intents.includes(intent) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {intent}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playbook Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Playbook Management
          </CardTitle>
          <CardDescription>
            Configure email templates and playbook sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              The <strong>D26 Playbook</strong> is configured with the standard Wavelaunch Studio
              email template including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Opening with warm greeting</li>
              <li>Wavelaunch Studio overview ($50-100K investment)</li>
              <li>Terms explanation (10% equity, 25% revenue, $5K fee)</li>
              <li>Vision Form CTA (https://apply.wavelaunch.org)</li>
              <li>Professional closing with signature</li>
            </ul>
            <p className="text-xs">
              To modify playbook content, edit the workflow-dashboard directly or update the
              PlaybookStore configuration.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
