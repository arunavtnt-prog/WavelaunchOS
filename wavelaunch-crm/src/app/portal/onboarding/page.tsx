'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Target,
  Users,
  Trophy,
  Palette,
  TrendingUp,
  BookOpen,
  Rocket
} from 'lucide-react'

interface OnboardingData {
  // Step 1: Business Basics
  niche: string
  visionStatement: string
  goals: string

  // Step 2: Target Audience
  targetIndustry: string
  targetAudience: string
  targetDemographicAge: string
  demographics: string
  audienceGenderSplit: string
  audienceMaritalStatus: string

  // Step 3: Value Proposition
  painPoints: string
  uniqueValueProps: string
  competitiveDifferentiation: string
  emergingCompetitors: string

  // Step 4: Brand Identity
  brandImage: string
  brandPersonality: string
  preferredFont: string
  brandValues: string
  brandingAesthetics: string
  emotionsBrandEvokes: string
  inspirationBrands: string

  // Step 5: Growth & Vision
  scalingGoals: string
  growthStrategies: string
  longTermVision: string
  currentChannels: string
  specificDeadlines: string

  // Step 6: Your Story
  professionalMilestones: string
  personalTurningPoints: string
  socialHandles: string
  additionalInfo: string
}

const STEPS = [
  {
    id: 1,
    title: 'Business Basics',
    icon: Target,
    description: 'Tell us about your business foundation'
  },
  {
    id: 2,
    title: 'Target Audience',
    icon: Users,
    description: 'Who are you serving?'
  },
  {
    id: 3,
    title: 'Value Proposition',
    icon: Trophy,
    description: 'What makes you unique?'
  },
  {
    id: 4,
    title: 'Brand Identity',
    icon: Palette,
    description: 'How do you present yourself?'
  },
  {
    id: 5,
    title: 'Growth & Vision',
    icon: TrendingUp,
    description: 'Where are you headed?'
  },
  {
    id: 6,
    title: 'Your Story',
    icon: BookOpen,
    description: 'The personal touch'
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  const [formData, setFormData] = useState<OnboardingData>({
    niche: '',
    visionStatement: '',
    goals: '',
    targetIndustry: '',
    targetAudience: '',
    targetDemographicAge: '',
    demographics: '',
    audienceGenderSplit: '',
    audienceMaritalStatus: '',
    painPoints: '',
    uniqueValueProps: '',
    competitiveDifferentiation: '',
    emergingCompetitors: '',
    brandImage: '',
    brandPersonality: '',
    preferredFont: '',
    brandValues: '',
    brandingAesthetics: '',
    emotionsBrandEvokes: '',
    inspirationBrands: '',
    scalingGoals: '',
    growthStrategies: '',
    longTermVision: '',
    currentChannels: '',
    specificDeadlines: '',
    professionalMilestones: '',
    personalTurningPoints: '',
    socialHandles: '',
    additionalInfo: '',
  })

  const updateField = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    setError(null)

    switch (step) {
      case 1:
        if (!formData.niche.trim()) {
          setError('Please enter your business niche')
          return false
        }
        if (!formData.visionStatement.trim()) {
          setError('Please share your vision statement')
          return false
        }
        break
      case 2:
        if (!formData.targetIndustry.trim()) {
          setError('Please specify your target industry')
          return false
        }
        if (!formData.targetAudience.trim()) {
          setError('Please describe your target audience')
          return false
        }
        if (!formData.targetDemographicAge.trim()) {
          setError('Please specify the age range of your target audience')
          return false
        }
        if (!formData.demographics.trim()) {
          setError('Please provide demographic details (e.g., location, income level)')
          return false
        }
        break
      case 3:
        if (!formData.painPoints.trim()) {
          setError('Please describe the pain points you solve')
          return false
        }
        if (!formData.uniqueValueProps.trim()) {
          setError('Please describe your unique value propositions')
          return false
        }
        break
      case 4:
        if (!formData.brandImage.trim()) {
          setError('Please describe your desired brand image')
          return false
        }
        if (!formData.brandPersonality.trim()) {
          setError('Please describe your brand personality')
          return false
        }
        if (!formData.preferredFont.trim()) {
          setError('Please specify your preferred font style (e.g., modern, classic, playful)')
          return false
        }
        break
      // Steps 5 and 6 are optional
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrevious = () => {
    setError(null)
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateStep(currentStep)) {
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/portal/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to save onboarding data')
        setIsSubmitting(false)
        return
      }

      // Show celebration
      setShowCelebration(true)

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/portal/dashboard')
        router.refresh()
      }, 3000)
    } catch (err) {
      console.error('Onboarding error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / STEPS.length) * 100
  const CurrentIcon = STEPS[currentStep - 1].icon

  // Celebration screen
  if (showCelebration) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-6">
            <div className="relative">
              <Rocket className="h-24 w-24 text-primary animate-bounce" />
              <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🎉 Congratulations!
              </h2>
              <p className="text-xl text-muted-foreground">
                You've completed your onboarding!
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100 space-y-2">
              <p className="text-sm font-medium">What happens next:</p>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Our team will review your information
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  We'll create your personalized business plan
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  You'll receive updates in your dashboard
                </li>
              </ul>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to your dashboard...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CurrentIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {STEPS[currentStep - 1].title}
                </CardTitle>
                <CardDescription>
                  {STEPS[currentStep - 1].description}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {STEPS.length}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {STEPS.map((step, idx) => (
                <span
                  key={step.id}
                  className={currentStep > idx ? 'text-primary font-medium' : ''}
                >
                  {step.id}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={currentStep === STEPS.length ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Business Basics */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="niche">
                    Business Niche <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="niche"
                    placeholder="e.g., Sustainable fashion, SaaS for healthcare, etc."
                    value={formData.niche}
                    onChange={(e) => updateField('niche', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    What industry or market segment do you operate in?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visionStatement">
                    Vision Statement <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="visionStatement"
                    placeholder="Describe your long-term vision for your business..."
                    value={formData.visionStatement}
                    onChange={(e) => updateField('visionStatement', e.target.value)}
                    required
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    What is the ultimate impact you want to create?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Business Goals (Optional)</Label>
                  <Textarea
                    id="goals"
                    placeholder="What are your short-term and long-term business goals?"
                    value={formData.goals}
                    onChange={(e) => updateField('goals', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Target Audience */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetIndustry">
                    Target Industry <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="targetIndustry"
                    placeholder="e.g., Healthcare, E-commerce, Technology"
                    value={formData.targetIndustry}
                    onChange={(e) => updateField('targetIndustry', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">
                    Target Audience Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="targetAudience"
                    placeholder="Describe your ideal customer in detail..."
                    value={formData.targetAudience}
                    onChange={(e) => updateField('targetAudience', e.target.value)}
                    required
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDemographicAge">
                    Target Age Range <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="targetDemographicAge"
                    placeholder="e.g., 25-45 years old"
                    value={formData.targetDemographicAge}
                    onChange={(e) => updateField('targetDemographicAge', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demographics">
                    Demographics Details <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="demographics"
                    placeholder="Location, income level, education, occupation, etc."
                    value={formData.demographics}
                    onChange={(e) => updateField('demographics', e.target.value)}
                    required
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audienceGenderSplit">Gender Split (Optional)</Label>
                    <Input
                      id="audienceGenderSplit"
                      placeholder="e.g., 60% Female, 40% Male"
                      value={formData.audienceGenderSplit}
                      onChange={(e) => updateField('audienceGenderSplit', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audienceMaritalStatus">Marital Status (Optional)</Label>
                    <Input
                      id="audienceMaritalStatus"
                      placeholder="e.g., Mostly married with families"
                      value={formData.audienceMaritalStatus}
                      onChange={(e) => updateField('audienceMaritalStatus', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Value Proposition */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="painPoints">
                    Pain Points You Solve <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="painPoints"
                    placeholder="What problems does your business solve for your customers?"
                    value={formData.painPoints}
                    onChange={(e) => updateField('painPoints', e.target.value)}
                    required
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uniqueValueProps">
                    Unique Value Propositions <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="uniqueValueProps"
                    placeholder="What makes your solution unique and better than alternatives?"
                    value={formData.uniqueValueProps}
                    onChange={(e) => updateField('uniqueValueProps', e.target.value)}
                    required
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competitiveDifferentiation">
                    Competitive Differentiation (Optional)
                  </Label>
                  <Textarea
                    id="competitiveDifferentiation"
                    placeholder="How do you stand out from competitors?"
                    value={formData.competitiveDifferentiation}
                    onChange={(e) => updateField('competitiveDifferentiation', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergingCompetitors">
                    Emerging Competitors (Optional)
                  </Label>
                  <Textarea
                    id="emergingCompetitors"
                    placeholder="Who are your main competitors or emerging threats?"
                    value={formData.emergingCompetitors}
                    onChange={(e) => updateField('emergingCompetitors', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Brand Identity */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brandImage">
                    Desired Brand Image <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="brandImage"
                    placeholder="How do you want your brand to be perceived?"
                    value={formData.brandImage}
                    onChange={(e) => updateField('brandImage', e.target.value)}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandPersonality">
                    Brand Personality <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="brandPersonality"
                    placeholder="e.g., Professional, friendly, innovative, trustworthy..."
                    value={formData.brandPersonality}
                    onChange={(e) => updateField('brandPersonality', e.target.value)}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredFont">
                    Preferred Font Style <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="preferredFont"
                    placeholder="e.g., Modern sans-serif, Classic serif, Playful"
                    value={formData.preferredFont}
                    onChange={(e) => updateField('preferredFont', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandValues">Brand Values (Optional)</Label>
                  <Textarea
                    id="brandValues"
                    placeholder="What core values does your brand represent?"
                    value={formData.brandValues}
                    onChange={(e) => updateField('brandValues', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandingAesthetics">Branding Aesthetics (Optional)</Label>
                  <Textarea
                    id="brandingAesthetics"
                    placeholder="Colors, visual style preferences, mood boards..."
                    value={formData.brandingAesthetics}
                    onChange={(e) => updateField('brandingAesthetics', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emotionsBrandEvokes">Emotions Your Brand Evokes (Optional)</Label>
                  <Input
                    id="emotionsBrandEvokes"
                    placeholder="e.g., Trust, excitement, comfort, aspiration"
                    value={formData.emotionsBrandEvokes}
                    onChange={(e) => updateField('emotionsBrandEvokes', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspirationBrands">Inspiration Brands (Optional)</Label>
                  <Input
                    id="inspirationBrands"
                    placeholder="Brands you admire or draw inspiration from"
                    value={formData.inspirationBrands}
                    onChange={(e) => updateField('inspirationBrands', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Growth & Vision */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground italic">
                  All fields in this section are optional but help us create a better plan for you.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="scalingGoals">Scaling Goals</Label>
                  <Textarea
                    id="scalingGoals"
                    placeholder="How do you plan to scale your business?"
                    value={formData.scalingGoals}
                    onChange={(e) => updateField('scalingGoals', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="growthStrategies">Growth Strategies</Label>
                  <Textarea
                    id="growthStrategies"
                    placeholder="What strategies will you use to grow?"
                    value={formData.growthStrategies}
                    onChange={(e) => updateField('growthStrategies', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longTermVision">Long-Term Vision (5-10 years)</Label>
                  <Textarea
                    id="longTermVision"
                    placeholder="Where do you see your business in 5-10 years?"
                    value={formData.longTermVision}
                    onChange={(e) => updateField('longTermVision', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentChannels">Current Marketing Channels</Label>
                  <Input
                    id="currentChannels"
                    placeholder="e.g., Instagram, Google Ads, Email marketing"
                    value={formData.currentChannels}
                    onChange={(e) => updateField('currentChannels', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specificDeadlines">Specific Deadlines or Milestones</Label>
                  <Textarea
                    id="specificDeadlines"
                    placeholder="Any important dates or milestones coming up?"
                    value={formData.specificDeadlines}
                    onChange={(e) => updateField('specificDeadlines', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Your Story */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground italic">
                  This is your chance to share your personal journey and what drives you.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="professionalMilestones">Professional Milestones</Label>
                  <Textarea
                    id="professionalMilestones"
                    placeholder="Share key achievements in your professional journey..."
                    value={formData.professionalMilestones}
                    onChange={(e) => updateField('professionalMilestones', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalTurningPoints">Personal Turning Points</Label>
                  <Textarea
                    id="personalTurningPoints"
                    placeholder="What personal experiences shaped your business vision?"
                    value={formData.personalTurningPoints}
                    onChange={(e) => updateField('personalTurningPoints', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialHandles">Social Media Handles</Label>
                  <Textarea
                    id="socialHandles"
                    placeholder="Instagram: @yourhandle&#10;LinkedIn: yourprofile&#10;Twitter: @yourhandle"
                    value={formData.socialHandles}
                    onChange={(e) => updateField('socialHandles', e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Share your social media presence (one per line)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Anything Else?</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any additional information you'd like us to know..."
                    value={formData.additionalInfo}
                    onChange={(e) => updateField('additionalInfo', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button type="submit" disabled={isSubmitting}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Complete Onboarding
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
