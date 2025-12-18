'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { User, Edit3, Save, X, Settings, Shield, Calendar, Mail, Globe, Phone } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastLoginAt?: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditForm({
          name: data.name || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 h-full">
        {/* Profile Overview */}
        <div className="md:col-span-1 h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{profile.role}</span>
              </div>
              <div className="border-t my-4"></div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Member since</span>
                </div>
                <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                {profile.lastLoginAt && (
                  <>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Last login</span>
                    </div>
                    <p>{new Date(profile.lastLoginAt).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2 h-full">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Edit your personal information' : 'Your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              {isEditing ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm text-muted-foreground">Additional profile fields coming soon.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="mt-1">{profile.name || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p>{profile.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Additional profile fields coming soon.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
