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

  const convertToClient = async (application: Application) => {
    try {
      const response = await fetch(`/api/applications/${application.id}/convert-to-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update application status to show it's been converted
          await updateApplicationStatus(application.id, 'CONVERTED')
          // Show success message or redirect to clients page
          console.log('Application converted to client successfully')
        }
      }
    } catch (error) {
      console.error('Failed to convert application to client:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-600'
      case 'REVIEWED': return 'bg-blue-50 text-blue-600'
      case 'APPROVED': return 'bg-green-50 text-green-600'
      case 'REJECTED': return 'bg-red-50 text-red-600'
      case 'CONVERTED': return 'bg-purple-50 text-purple-600'
      default: return 'bg-gray-50 text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'REVIEWED': return <Eye className="h-4 w-4" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'CONVERTED': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">D26 Application Review</h1>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">D26 Application Review</h1>
        <p className="text-muted-foreground">
          Cohort intake and evaluation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Applications List */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Applications ({applications.length})</h2>
            </div>
            <p className="text-sm text-muted-foreground">Click to review details</p>
            <div className="h-[600px] overflow-y-auto border rounded-lg bg-background">
              <div className="divide-y">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className={`px-3 py-2 cursor-pointer transition-colors hover:bg-accent/30 ${
                      selectedApplication?.id === application.id ? 'bg-accent/50 border-l-2 border-l-primary' : ''
                    }`}
                    onClick={() => setSelectedApplication(application)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="font-medium text-sm mb-1 truncate">{application.fullName}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {application.email} • {application.industryNiche}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
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
          </div>
        </div>

        {/* Application Details */}
        <div className="lg:col-span-2">
          {selectedApplication ? (
            <div className="bg-background border rounded-lg shadow-sm">
              <div className="border-b bg-muted/30 px-6 py-4">
                <div>
                  <div className="flex items-center gap-3 text-xl font-semibold">
                    <Users className="h-6 w-6" />
                    {selectedApplication.fullName}
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    {selectedApplication.email}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Applied: {new Date(selectedApplication.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <Tabs defaultValue="basic" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-6 bg-muted/30 p-1">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Basic Info</TabsTrigger>
                    <TabsTrigger value="career" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Career</TabsTrigger>
                    <TabsTrigger value="audience" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Audience</TabsTrigger>
                    <TabsTrigger value="market" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Market</TabsTrigger>
                    <TabsTrigger value="brand" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Brand</TabsTrigger>
                    <TabsTrigger value="products" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Products</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Country</span>
                          <span className="text-muted-foreground">{selectedApplication.country}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Industry</span>
                          <span className="text-muted-foreground">{selectedApplication.industryNiche}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Age</span>
                          <span className="text-muted-foreground">{selectedApplication.age}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {selectedApplication.instagramHandle && (
                          <div className="flex items-center gap-3">
                            <Instagram className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Instagram</span>
                            <span className="text-muted-foreground">{selectedApplication.instagramHandle}</span>
                          </div>
                        )}
                        {selectedApplication.tiktokHandle && (
                          <div className="flex items-center gap-3">
                            <Music className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">TikTok</span>
                            <span className="text-muted-foreground">{selectedApplication.tiktokHandle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="career" className="space-y-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-base mb-3">Professional Milestones</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.professionalMilestones}</p>
                      </div>
                      <div className="border-l-2 border-border pl-6">
                        <h4 className="font-semibold text-base mb-3">Personal Turning Points</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.personalTurningPoints}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base mb-3">Vision for Venture</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.visionForVenture}</p>
                      </div>
                      <div className="border-l-2 border-border pl-6">
                        <h4 className="font-semibold text-base mb-3">Hope to Achieve</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.hopeToAchieve}</p>
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

                  <TabsContent value="products" className="space-y-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-base mb-3">Product Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.productCategories.split(',').map((category, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">{category.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base mb-3">Other Product Ideas</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.otherProductIdeas}</p>
                      </div>
                      <div className="border-l-2 border-border pl-6">
                        <h4 className="font-semibold text-base mb-3">Scaling Goals</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.scalingGoals}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base mb-3">Growth Strategies</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.growthStrategies}</p>
                      </div>
                      <div className="border-l-2 border-border pl-6">
                        <h4 className="font-semibold text-base mb-3">Long-term Vision</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.longTermVision}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base mb-3">Specific Deadlines</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.specificDeadlines}</p>
                      </div>
                      <div className="border-l-2 border-border pl-6">
                        <h4 className="font-semibold text-base mb-3">Additional Information</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.additionalInfo}</p>
                      </div>
                      {selectedApplication.zipFile && (
                        <div>
                          <h4 className="font-semibold text-base mb-3">Submitted File</h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplication.zipFile}</p>
                        </div>
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
                  {selectedApplication.status === 'APPROVED' && (
                    <Button 
                      onClick={() => convertToClient(selectedApplication)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Convert to Client
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-background border rounded-lg shadow-sm">
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No Application Selected</h3>
                  <p className="text-sm">Select an application from the list to review details</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
