'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Calendar, 
  Mail, 
  Globe, 
  Instagram, 
  Music, 
  Target, 
  Lightbulb,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ArrowRight
} from 'lucide-react'

interface Application {
  id: string
  fullName: string
  email: string
  instagramHandle?: string
  tiktokHandle?: string
  country: string
  industryNiche: string
  age: number
  professionalMilestones: string
  personalTurningPoints: string
  visionForVenture: string
  hopeToAchieve: string
  targetAudience: string
  demographicProfile: string
  targetDemographicAge: string
  audienceGenderSplit?: string
  currentChannels: string
  keyPainPoints: string
  brandValues: string
  differentiation: string
  uniqueValueProps: string
  idealBrandImage: string
  brandingAesthetics: string
  brandPersonality: string
  productCategories: string
  scalingGoals: string
  longTermVision: string
  status: string
  createdAt: string
  reviewedAt?: string
  reviewNotes?: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const data = await response.json()
      if (data.success) {
        setApplications(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string, reviewNotes?: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reviewNotes }),
      })
      
      if (response.ok) {
        fetchApplications()
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication(null)
        }
      }
    } catch (error) {
      console.error('Failed to update application:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REVIEWED': return 'bg-blue-100 text-blue-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'REVIEWED': return <Eye className="h-4 w-4" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">
          Manage and review submitted applications
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Applications List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Applications ({applications.length})
              </CardTitle>
              <CardDescription>
                Click to view application details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] overflow-y-auto">
                <div className="space-y-2">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                        selectedApplication?.id === application.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedApplication(application)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{application.fullName}</div>
                          <div className="text-sm text-muted-foreground truncate">{application.email}</div>
                          <div className="text-xs text-muted-foreground">{application.industryNiche}</div>
                        </div>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{application.status}</span>
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No applications found. Submit a test application to see it here.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Details */}
        <div className="lg:col-span-2">
          {selectedApplication ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {selectedApplication.fullName}
                    </CardTitle>
                    <CardDescription>{selectedApplication.email}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(selectedApplication.status)}>
                    {getStatusIcon(selectedApplication.status)}
                    <span className="ml-1">{selectedApplication.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="career">Career</TabsTrigger>
                    <TabsTrigger value="audience">Audience</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span className="font-medium">Country:</span>
                          <span>{selectedApplication.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span className="font-medium">Industry:</span>
                          <span>{selectedApplication.industryNiche}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Age:</span>
                          <span>{selectedApplication.age}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {selectedApplication.instagramHandle && (
                          <div className="flex items-center gap-2">
                            <Instagram className="h-4 w-4" />
                            <span className="font-medium">Instagram:</span>
                            <span>{selectedApplication.instagramHandle}</span>
                          </div>
                        )}
                        {selectedApplication.tiktokHandle && (
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            <span className="font-medium">TikTok:</span>
                            <span>{selectedApplication.tiktokHandle}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Applied:</span>
                          <span>{new Date(selectedApplication.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="career" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Professional Milestones</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.professionalMilestones}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Personal Turning Points</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.personalTurningPoints}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="audience" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Target Audience</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.targetAudience}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Demographic Profile</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.demographicProfile}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Key Pain Points</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.keyPainPoints}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="business" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Vision for Venture</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.visionForVenture}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Hope to Achieve</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.hopeToAchieve}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Long-term Vision</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.longTermVision}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                        <hr className="my-4" />

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {selectedApplication.status === 'PENDING' && (
                    <>
                      <Button 
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'REVIEWED')}
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Mark as Reviewed
                      </Button>
                      <Button 
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'APPROVED')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'REJECTED')}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedApplication.status === 'REVIEWED' && (
                    <>
                      <Button 
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'APPROVED')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'REJECTED')}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[600px]">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No Application Selected</h3>
                  <p className="text-sm">Select an application from the list to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
