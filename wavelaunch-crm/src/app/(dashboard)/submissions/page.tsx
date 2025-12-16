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
  // Basic Information
  fullName: string
  email: string
  instagramHandle?: string
  tiktokHandle?: string
  country: string
  industryNiche: string
  age: number
  // Career Background
  professionalMilestones: string
  personalTurningPoints: string
  visionForVenture: string
  hopeToAchieve: string
  // Audience & Demographics
  targetAudience: string
  demographicProfile: string
  targetDemographicAge: string
  audienceGenderSplit?: string
  audienceMaritalStatus?: string
  currentChannels: string
  // Pain Points & Values
  keyPainPoints: string
  brandValues: string
  // Competition & Market
  differentiation: string
  uniqueValueProps: string
  emergingCompetitors: string
  // Brand Identity
  idealBrandImage: string
  inspirationBrands: string
  brandingAesthetics: string
  emotionsBrandEvokes: string
  brandPersonality: string
  preferredFont: string
  // Products & Goals
  productCategories: string
  otherProductIdeas: string
  scalingGoals: string
  growthStrategies: string
  longTermVision: string
  specificDeadlines: string
  additionalInfo: string
  // File upload
  zipFile?: string
  // Status
  status: string
  createdAt: string
  reviewedAt?: string
  reviewNotes?: string
}

export default function SubmissionsPage() {
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
          <h1 className="text-3xl font-bold">D26 Submissions</h1>
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">D26 Submissions</h1>
        <p className="text-muted-foreground">
          Wavelaunch Studio Intake Application submissions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Applications List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Submissions ({applications.length})
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
                      No submissions found. Submit a test application to see it here.
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
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="career">Career</TabsTrigger>
                    <TabsTrigger value="audience">Audience</TabsTrigger>
                    <TabsTrigger value="market">Market</TabsTrigger>
                    <TabsTrigger value="brand">Brand</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
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
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Vision for Venture</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.visionForVenture}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Hope to Achieve</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.hopeToAchieve}</p>
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
                        <h4 className="font-medium mb-2">Target Demographic Age</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.targetDemographicAge}</p>
                      </div>
                      {selectedApplication.audienceGenderSplit && (
                        <div>
                          <h4 className="font-medium mb-2">Audience Gender Split</h4>
                          <p className="text-sm text-muted-foreground">{selectedApplication.audienceGenderSplit}</p>
                        </div>
                      )}
                      {selectedApplication.audienceMaritalStatus && (
                        <div>
                          <h4 className="font-medium mb-2">Audience Marital Status</h4>
                          <p className="text-sm text-muted-foreground">{selectedApplication.audienceMaritalStatus}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium mb-2">Current Channels</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.currentChannels}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Key Pain Points</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.keyPainPoints}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Brand Values</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.brandValues}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="market" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Differentiation</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.differentiation}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Unique Value Propositions</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.uniqueValueProps}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Emerging Competitors</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.emergingCompetitors}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="brand" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Ideal Brand Image</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.idealBrandImage}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Inspiration Brands</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.inspirationBrands}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Branding Aesthetics</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.brandingAesthetics}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Emotions Brand Evokes</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.emotionsBrandEvokes}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Brand Personality</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.brandPersonality}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Preferred Font</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.preferredFont}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="products" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Product Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.productCategories.split(',').map((category, index) => (
                            <Badge key={index} variant="secondary">{category.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Other Product Ideas</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.otherProductIdeas}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Scaling Goals</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.scalingGoals}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Growth Strategies</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.growthStrategies}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Long-term Vision</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.longTermVision}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Specific Deadlines</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.specificDeadlines}</p>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-medium mb-2">Additional Information</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.additionalInfo}</p>
                      </div>
                      {selectedApplication.zipFile && (
                        <>
                          <hr />
                          <div>
                            <h4 className="font-medium mb-2">Submitted File</h4>
                            <p className="text-sm text-muted-foreground">{selectedApplication.zipFile}</p>
                          </div>
                        </>
                      )}
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
                  <h3 className="font-medium mb-2">No Submission Selected</h3>
                  <p className="text-sm">Select a submission from the list to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
