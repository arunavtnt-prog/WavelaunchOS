'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Send, Edit, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { loadFormData, clearFormData } from '@/lib/autosave'
import { ApplicationFormData } from '@/schemas/application'

export default function ReviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<ApplicationFormData> | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const data = loadFormData()
    if (Object.keys(data).length === 0) {
      toast({
        title: 'No Data Found',
        description: 'Please complete the application first.',
        variant: 'destructive',
      })
      router.push('/apply')
      return
    }
    setFormData(data)
  }, [])

  const handleEdit = (stepIndex: number) => {
    router.push(`/apply?step=${stepIndex}`)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Check if this is admin mode (from URL parameter or session)
      const urlParams = new URLSearchParams(window.location.search)
      const isAdminMode = urlParams.get('mode') === 'admin' || 
                        window.location.pathname.startsWith('/admin')

      // Submit to working CRM for both public and admin
      const response = await fetch(process.env.NEXT_PUBLIC_CRM_API_URL || 'https://penguin-wavelaunch-os.vercel.app/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.CRM_API_TOKEN ? `Bearer ${process.env.CRM_API_TOKEN}` : '',
        },
        body: JSON.stringify({
          ...formData,
          source: isAdminMode ? 'admin' : 'public',
          submittedAt: new Date().toISOString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        clearFormData()
        if (isAdminMode) {
          toast({
            title: 'Client Added Successfully',
            description: 'Application has been submitted and is ready for review.',
          })
          // Redirect back to admin dashboard or clients page
          setTimeout(() => {
            window.location.href = '/admin/clients'
          }, 2000)
        } else {
          router.push('/success')
        }
      } else {
        toast({
          title: 'Submission Failed',
          description: result.error || 'Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Submission Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setShowConfirmDialog(false)
    }
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const sections = [
    {
      title: 'Basic Information',
      fields: [
        { label: 'Full Name', value: formData.fullName },
        { label: 'Email', value: formData.email },
        { label: 'Instagram', value: formData.instagramHandle ? `@${formData.instagramHandle}` : 'Not provided' },
        { label: 'TikTok', value: formData.tiktokHandle ? `@${formData.tiktokHandle}` : 'Not provided' },
        { label: 'Country', value: formData.country },
        { label: 'Industry/Niche', value: formData.industryNiche },
        { label: 'Age', value: formData.age },
      ],
      stepIndex: 0,
    },
    {
      title: 'Career Background',
      fields: [
        { label: 'Professional Milestones', value: formData.professionalMilestones },
        { label: 'Personal Turning Points', value: formData.personalTurningPoints },
        { label: 'Vision for Venture', value: formData.visionForVenture },
        { label: 'Hope to Achieve', value: formData.hopeToAchieve },
      ],
      stepIndex: 1,
    },
    {
      title: 'Audience & Demographics',
      fields: [
        { label: 'Target Audience', value: formData.targetAudience },
        { label: 'Demographic Profile', value: formData.demographicProfile },
        { label: 'Target Age', value: formData.targetDemographicAge },
        { label: 'Gender Split', value: formData.audienceGenderSplit },
        { label: 'Marital Status', value: formData.audienceMaritalStatus },
        { label: 'Current Channels', value: formData.currentChannels },
      ],
      stepIndex: 2,
    },
    {
      title: 'Audience Pain Points & Needs',
      fields: [
        { label: 'Key Pain Points', value: formData.keyPainPoints },
        { label: 'Brand Values', value: formData.brandValues },
      ],
      stepIndex: 3,
    },
    {
      title: 'Competition & Market Understanding',
      fields: [
        { label: 'Differentiation Strategy', value: formData.differentiation },
        { label: 'Unique Value Propositions', value: formData.uniqueValueProps },
        { label: 'Emerging Competitors', value: formData.emergingCompetitors },
      ],
      stepIndex: 4,
    },
    {
      title: 'Brand Identity',
      fields: [
        { label: 'Ideal Brand Image', value: formData.idealBrandImage },
        { label: 'Inspiration Brands', value: formData.inspirationBrands },
        { label: 'Branding Aesthetics', value: formData.brandingAesthetics },
        { label: 'Emotions Brand Evokes', value: formData.emotionsBrandEvokes },
        { label: 'Brand Personality', value: formData.brandPersonality },
        { label: 'Preferred Font', value: formData.preferredFont },
      ],
      stepIndex: 5,
    },
    {
      title: 'Product Direction',
      fields: [
        { label: 'Product Categories', value: formData.productCategories?.join(', ') },
        { label: 'Other Product Ideas', value: formData.otherProductIdeas || 'None' },
      ],
      stepIndex: 6,
    },
    {
      title: 'Business Goals',
      fields: [
        { label: 'Scaling Goals', value: formData.scalingGoals },
        { label: 'Growth Strategies', value: formData.growthStrategies },
        { label: 'Long-term Vision', value: formData.longTermVision },
        { label: 'Specific Deadlines', value: formData.specificDeadlines || 'None' },
        { label: 'Additional Info', value: formData.additionalInfo || 'None' },
      ],
      stepIndex: 7,
    },
  ]

  return (
    <div className="min-h-screen bg-background py-8 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Review Your Application
          </h1>
          <p className="text-muted-foreground">
            Please review all your answers before submitting
          </p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl text-foreground">{section.title}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(section.stepIndex)}
                    className="border-border bg-background hover:bg-muted text-muted-foreground"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="border-b border-border last:border-0 pb-3 last:pb-0">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {field.label}
                        </p>
                        <p className="text-foreground whitespace-pre-wrap">
                          {field.value || 'Not provided'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between mt-8"
        >
          <Button
            variant="outline"
            onClick={() => router.push('/apply')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>

          <Button
            onClick={() => setShowConfirmDialog(true)}
            className="bg-primary text-primary-foreground"
            size="lg"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Application
          </Button>
        </motion.div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Submission</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit your application? Once submitted, you won't be able
                to make changes. Our team will review your application and contact you within 5-7
                business days.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Confirm & Submit
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
