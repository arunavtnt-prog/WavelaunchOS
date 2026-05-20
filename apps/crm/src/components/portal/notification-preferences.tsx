'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface NotificationPreferencesProps {
  initialPreferences: {
    notifyNewDeliverable: boolean
    notifyNewMessage: boolean
    notifyMilestoneReminder: boolean
    notifyWeeklySummary: boolean
  }
}

export function NotificationPreferences({
  initialPreferences,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [updating, setUpdating] = useState<string | null>(null)

  const updatePreference = async (key: string, value: boolean) => {
    setUpdating(key)

    try {
      const response = await fetch('/api/portal/settings/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update preference')
      }

      setPreferences((prev) => ({ ...prev, [key]: value }))
      toast.success('Preference updated successfully')
    } catch (error) {
      console.error('Update preference error:', error)
      toast.error('Failed to update preference')
    } finally {
      setUpdating(null)
    }
  }

  const preferenceItems = [
    {
      key: 'notifyNewDeliverable',
      label: 'New Deliverables',
      description: 'Get notified when a new deliverable is ready',
    },
    {
      key: 'notifyNewMessage',
      label: 'New Messages',
      description: 'Get notified when you receive a new message',
    },
    {
      key: 'notifyMilestoneReminder',
      label: 'Milestone Reminders',
      description: 'Get reminders about upcoming milestones',
    },
    {
      key: 'notifyWeeklySummary',
      label: 'Weekly Summary',
      description: 'Receive a weekly summary of your progress',
    },
  ]

  return (
    <div className="space-y-4">
      {preferenceItems.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between py-3 border-b last:border-0"
        >
          <div className="space-y-0.5 flex-1">
            <Label htmlFor={item.key} className="font-medium cursor-pointer">
              {item.label}
            </Label>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {updating === item.key && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id={item.key}
              checked={preferences[item.key as keyof typeof preferences]}
              onCheckedChange={(checked) => updatePreference(item.key, checked)}
              disabled={updating === item.key}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
