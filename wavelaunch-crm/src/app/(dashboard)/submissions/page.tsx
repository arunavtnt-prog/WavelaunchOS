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
  ArrowRight,
  Trash2,
  Download,
  Copy,
  Check
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

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
      console.log('Converting application to client:', application.id)
      const response = await fetch(`/api/applications/${application.id}/convert-to-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        if (data.success) {
          // Update application status to show it's been converted
          await updateApplicationStatus(application.id, 'CONVERTED')
          // Show success message or redirect to clients page
          console.log('Application converted to client successfully')
          alert('Application successfully converted to client!')
        } else {
          console.error('Conversion failed:', data.error)
          alert(`Error: ${data.error}`)
        }
      } else {
        console.error('HTTP error:', response.status, data.error)
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to convert application to client:', error)
      alert('Failed to convert application to client. Check console for details.')
    }
  }

  const deleteApplication = async (applicationId: string) => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSelectedApplication(null)
        fetchApplications()
        alert('Application deleted successfully')
      } else {
        alert(`Error: ${data.error || 'Failed to delete application'}`)
      }
    } catch (error) {
      console.error('Failed to delete application:', error)
      alert('Failed to delete application')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const exportToCSV = async () => {
    try {
      const response = await fetch('/api/applications/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Failed to export CSV')
      }
    } catch (error) {
      console.error('Failed to export CSV:', error)
      alert('Failed to export CSV')
    }
  }

  const copyAnswers = async (application: Application) => {
    const answers = [
      application.fullName,
      application.email,
      application.instagramHandle || '',
      application.tiktokHandle || '',
      application.country,
      application.industryNiche,
      application.age.toString(),
      application.professionalMilestones,
      application.personalTurningPoints,
      application.visionForVenture,
      application.hopeToAchieve,
      application.targetAudience,
      application.demographicProfile,
      application.targetDemographicAge,
      application.audienceGenderSplit || '',
      application.audienceMaritalStatus || '',
      application.currentChannels,
      application.keyPainPoints,
      application.brandValues,
      application.differentiation,
      application.uniqueValueProps,
      application.emergingCompetitors || '',
      application.idealBrandImage,
      application.inspirationBrands || '',
      application.brandingAesthetics,
      application.emotionsBrandEvokes || '',
      application.brandPersonality,
      application.preferredFont || '',
      application.productCategories,
      application.otherProductIdeas || '',
      application.scalingGoals,
      application.growthStrategies || '',
      application.longTermVision,
      application.specificDeadlines || '',
      application.additionalInfo || ''
    ].join('\n')

    try {
      await navigator.clipboard.writeText(answers)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy answers:', error)
      alert('Failed to copy answers to clipboard')
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
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Cohort intake and evaluation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Applications List */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Applications ({applications.length})</h2>
              </div>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Click to review details</p>
            <div className="h-[600px] overflow-y-auto border rounded-lg bg-background">
              <div className="divide-y">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className={`px-3 py-3 cursor-pointer transition-colors hover:bg-accent/30 ${selectedApplication?.id === application.id ? 'bg-accent/50 border-l-2 border-l-primary' : ''
                      }`}
                    onClick={() => setSelectedApplication(application)}
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="font-medium text-sm text-foreground">{application.fullName || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">
                        {application.email}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {application.industryNiche}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        <span className="text-xs">{new Date(application.createdAt).toLocaleDateString()}</span>
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
        <div className="lg:col-span-3">
          {selectedApplication ? (
            <>
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
                    {/* Copy Answers button - always visible */}
                    <Button
                      variant="outline"
                      onClick={() => copyAnswers(selectedApplication)}
                      className={copied ? 'text-green-600 border-green-600' : ''}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Answers
                        </>
                      )}
                    </Button>
                    {/* Delete button - always visible */}
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>

              {/* Delete Confirmation Dialog */}
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the application from {selectedApplication?.fullName}.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => selectedApplication && deleteApplication(selectedApplication.id)}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? 'Deleting...' : 'Delete Application'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
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
