'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ArrowRight, Loader2, Upload, X } from 'lucide-react'

// Form steps configuration
const STEPS = [
  { id: 1, title: 'Basic Information', description: 'Tell us about yourself' },
  { id: 2, title: 'Career Background', description: 'Your journey so far' },
  { id: 3, title: 'Audience & Demographics', description: 'Who you serve' },
  { id: 4, title: 'Pain Points & Values', description: 'Understanding your audience' },
  { id: 5, title: 'Competition & Market', description: 'Market landscape' },
  { id: 6, title: 'Brand Identity', description: 'Your brand vision' },
  { id: 7, title: 'Products & Goals', description: 'What you want to create' },
  { id: 8, title: 'Review & Submit', description: 'Final review' },
]

// Product categories options
const PRODUCT_CATEGORIES = [
  'Physical Products',
  'Digital Products',
  'Online Courses',
  'Membership/Community',
  'Coaching/Consulting',
  'Services',
  'Software/Apps',
  'Content/Media',
  'Events/Workshops',
  'Merchandise',
]

// Country list (abbreviated)
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'India', 'Japan', 'South Korea', 'Singapore', 'UAE', 'Brazil', 'Mexico',
  'Argentina', 'South Africa', 'Nigeria', 'Kenya', 'Other'
]

// Initial form state
const initialFormData = {
  // Basic Information
  name: '',
  email: '',
  instagramHandle: '',
  tiktokHandle: '',
  country: '',
  industryNiche: '',
  age: '',
  // Career Background
  professionalMilestones: '',
  personalTurningPoints: '',
  visionForVenture: '',
  hopeToAchieve: '',
  // Audience & Demographics
  targetAudience: '',
  demographicProfile: '',
  targetDemographicAge: '',
  audienceGenderSplit: '',
  audienceMaritalStatus: '',
  currentChannels: '',
  // Pain Points & Values
  keyPainPoints: '',
  brandValues: '',
  // Competition & Market
  differentiation: '',
  uniqueValueProps: '',
  emergingCompetitors: '',
  // Brand Identity
  idealBrandImage: '',
  inspirationBrands: '',
  brandingAesthetics: '',
  emotionsBrandEvokes: '',
  brandPersonality: '',
  preferredFont: '',
  // Products & Goals
  productCategories: [] as string[],
  otherProductIdeas: '',
  scalingGoals: '',
  growthStrategies: '',
  longTermVision: '',
  specificDeadlines: '',
  additionalInfo: '',
  // File upload
  zipFile: null as File | null,
  // Terms
  termsAccepted: false,
}

type FormData = typeof initialFormData

export default function ApplicationFormPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load saved form data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wavelaunch_application')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Don't restore file from localStorage
        setFormData({ ...parsed, zipFile: null })
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save form data to localStorage on change
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { zipFile, ...dataToSave } = formData
    localStorage.setItem('wavelaunch_application', JSON.stringify(dataToSave))
  }, [formData])

  const updateField = (field: keyof FormData, value: string | boolean | string[] | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleProductCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Full name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
        if (!formData.country) newErrors.country = 'Country is required'
        if (!formData.industryNiche.trim()) newErrors.industryNiche = 'Industry/niche is required'
        if (!formData.age) newErrors.age = 'Age is required'
        else if (parseInt(formData.age) < 18) newErrors.age = 'Must be 18 or older'
        break
      case 2:
        if (!formData.professionalMilestones.trim()) newErrors.professionalMilestones = 'This field is required'
        if (!formData.personalTurningPoints.trim()) newErrors.personalTurningPoints = 'This field is required'
        if (!formData.visionForVenture.trim()) newErrors.visionForVenture = 'This field is required'
        if (!formData.hopeToAchieve.trim()) newErrors.hopeToAchieve = 'This field is required'
        break
      case 3:
        if (!formData.targetAudience.trim()) newErrors.targetAudience = 'This field is required'
        if (!formData.demographicProfile.trim()) newErrors.demographicProfile = 'This field is required'
        if (!formData.targetDemographicAge.trim()) newErrors.targetDemographicAge = 'This field is required'
        if (!formData.audienceGenderSplit.trim()) newErrors.audienceGenderSplit = 'This field is required'
        if (!formData.currentChannels.trim()) newErrors.currentChannels = 'This field is required'
        break
      case 4:
        if (!formData.keyPainPoints.trim()) newErrors.keyPainPoints = 'This field is required'
        if (!formData.brandValues.trim()) newErrors.brandValues = 'This field is required'
        break
      case 5:
        if (!formData.differentiation.trim()) newErrors.differentiation = 'This field is required'
        if (!formData.uniqueValueProps.trim()) newErrors.uniqueValueProps = 'This field is required'
        break
      case 6:
        if (!formData.idealBrandImage.trim()) newErrors.idealBrandImage = 'This field is required'
        if (!formData.brandingAesthetics.trim()) newErrors.brandingAesthetics = 'This field is required'
        if (!formData.brandPersonality.trim()) newErrors.brandPersonality = 'This field is required'
        break
      case 7:
        if (formData.productCategories.length === 0) newErrors.productCategories = 'Select at least one category'
        if (!formData.scalingGoals.trim()) newErrors.scalingGoals = 'This field is required'
        if (!formData.longTermVision.trim()) newErrors.longTermVision = 'This field is required'
        break
      case 8:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    if (!validateStep(8)) return

    setIsSubmitting(true)
    try {
      const submitData = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'zipFile' && value instanceof File) {
          submitData.append('zipFile', value)
        } else if (key === 'productCategories' && Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value))
        } else if (key !== 'zipFile') {
          submitData.append(key, String(value))
        }
      })

      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        body: submitData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application')
      }

      // Clear saved form data
      localStorage.removeItem('wavelaunch_application')

      // Redirect to success page
      router.push('/apply/success')
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit application' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-900">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
          </span>
          <span className="text-slate-500">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.name}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagramHandle">Instagram Handle</Label>
                  <Input
                    id="instagramHandle"
                    value={formData.instagramHandle}
                    onChange={(e) => updateField('instagramHandle', e.target.value)}
                    placeholder="@yourusername"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktokHandle">TikTok Handle</Label>
                  <Input
                    id="tiktokHandle"
                    value={formData.tiktokHandle}
                    onChange={(e) => updateField('tiktokHandle', e.target.value)}
                    placeholder="@yourusername"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(v) => updateField('country', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industryNiche">Industry/Niche *</Label>
                  <Input
                    id="industryNiche"
                    value={formData.industryNiche}
                    onChange={(e) => updateField('industryNiche', e.target.value)}
                    placeholder="e.g., Fitness, Beauty"
                  />
                  {errors.industryNiche && <p className="text-sm text-red-500">{errors.industryNiche}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    placeholder="25"
                  />
                  {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Career Background */}
          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="professionalMilestones">Professional Milestones *</Label>
                <Textarea
                  id="professionalMilestones"
                  value={formData.professionalMilestones}
                  onChange={(e) => updateField('professionalMilestones', e.target.value)}
                  placeholder="Describe your key professional achievements and milestones..."
                  rows={4}
                />
                {errors.professionalMilestones && <p className="text-sm text-red-500">{errors.professionalMilestones}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalTurningPoints">Personal Turning Points *</Label>
                <Textarea
                  id="personalTurningPoints"
                  value={formData.personalTurningPoints}
                  onChange={(e) => updateField('personalTurningPoints', e.target.value)}
                  placeholder="What personal experiences or turning points led you here?"
                  rows={4}
                />
                {errors.personalTurningPoints && <p className="text-sm text-red-500">{errors.personalTurningPoints}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="visionForVenture">Vision for Your Venture *</Label>
                <Textarea
                  id="visionForVenture"
                  value={formData.visionForVenture}
                  onChange={(e) => updateField('visionForVenture', e.target.value)}
                  placeholder="What's your vision for this brand/venture?"
                  rows={4}
                />
                {errors.visionForVenture && <p className="text-sm text-red-500">{errors.visionForVenture}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hopeToAchieve">What You Hope to Achieve *</Label>
                <Textarea
                  id="hopeToAchieve"
                  value={formData.hopeToAchieve}
                  onChange={(e) => updateField('hopeToAchieve', e.target.value)}
                  placeholder="What specific outcomes do you want from this partnership?"
                  rows={4}
                />
                {errors.hopeToAchieve && <p className="text-sm text-red-500">{errors.hopeToAchieve}</p>}
              </div>
            </>
          )}

          {/* Step 3: Audience & Demographics */}
          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <Textarea
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => updateField('targetAudience', e.target.value)}
                  placeholder="Who is your ideal customer? Describe them in detail..."
                  rows={3}
                />
                {errors.targetAudience && <p className="text-sm text-red-500">{errors.targetAudience}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="demographicProfile">Demographic Profile *</Label>
                <Textarea
                  id="demographicProfile"
                  value={formData.demographicProfile}
                  onChange={(e) => updateField('demographicProfile', e.target.value)}
                  placeholder="Describe demographics: location, income level, lifestyle..."
                  rows={3}
                />
                {errors.demographicProfile && <p className="text-sm text-red-500">{errors.demographicProfile}</p>}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetDemographicAge">Target Age Range *</Label>
                  <Input
                    id="targetDemographicAge"
                    value={formData.targetDemographicAge}
                    onChange={(e) => updateField('targetDemographicAge', e.target.value)}
                    placeholder="e.g., 25-35"
                  />
                  {errors.targetDemographicAge && <p className="text-sm text-red-500">{errors.targetDemographicAge}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audienceGenderSplit">Gender Split *</Label>
                  <Input
                    id="audienceGenderSplit"
                    value={formData.audienceGenderSplit}
                    onChange={(e) => updateField('audienceGenderSplit', e.target.value)}
                    placeholder="e.g., 70% female, 30% male"
                  />
                  {errors.audienceGenderSplit && <p className="text-sm text-red-500">{errors.audienceGenderSplit}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audienceMaritalStatus">Audience Marital Status</Label>
                <Input
                  id="audienceMaritalStatus"
                  value={formData.audienceMaritalStatus}
                  onChange={(e) => updateField('audienceMaritalStatus', e.target.value)}
                  placeholder="e.g., Single professionals, young families"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentChannels">Current Marketing Channels *</Label>
                <Textarea
                  id="currentChannels"
                  value={formData.currentChannels}
                  onChange={(e) => updateField('currentChannels', e.target.value)}
                  placeholder="What platforms/channels do you currently use to reach your audience?"
                  rows={3}
                />
                {errors.currentChannels && <p className="text-sm text-red-500">{errors.currentChannels}</p>}
              </div>
            </>
          )}

          {/* Step 4: Pain Points & Values */}
          {currentStep === 4 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="keyPainPoints">Key Pain Points *</Label>
                <Textarea
                  id="keyPainPoints"
                  value={formData.keyPainPoints}
                  onChange={(e) => updateField('keyPainPoints', e.target.value)}
                  placeholder="What are the biggest problems/pain points your audience faces?"
                  rows={5}
                />
                {errors.keyPainPoints && <p className="text-sm text-red-500">{errors.keyPainPoints}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandValues">Brand Values *</Label>
                <Textarea
                  id="brandValues"
                  value={formData.brandValues}
                  onChange={(e) => updateField('brandValues', e.target.value)}
                  placeholder="What core values will your brand represent? What do you stand for?"
                  rows={5}
                />
                {errors.brandValues && <p className="text-sm text-red-500">{errors.brandValues}</p>}
              </div>
            </>
          )}

          {/* Step 5: Competition & Market */}
          {currentStep === 5 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="differentiation">How Will You Differentiate? *</Label>
                <Textarea
                  id="differentiation"
                  value={formData.differentiation}
                  onChange={(e) => updateField('differentiation', e.target.value)}
                  placeholder="What makes you different from competitors in your space?"
                  rows={4}
                />
                {errors.differentiation && <p className="text-sm text-red-500">{errors.differentiation}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniqueValueProps">Unique Value Propositions *</Label>
                <Textarea
                  id="uniqueValueProps"
                  value={formData.uniqueValueProps}
                  onChange={(e) => updateField('uniqueValueProps', e.target.value)}
                  placeholder="What unique value do you offer that others don't?"
                  rows={4}
                />
                {errors.uniqueValueProps && <p className="text-sm text-red-500">{errors.uniqueValueProps}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergingCompetitors">Emerging Competitors</Label>
                <Textarea
                  id="emergingCompetitors"
                  value={formData.emergingCompetitors}
                  onChange={(e) => updateField('emergingCompetitors', e.target.value)}
                  placeholder="Are there any emerging competitors you're watching? Name them."
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Step 6: Brand Identity */}
          {currentStep === 6 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="idealBrandImage">Ideal Brand Image *</Label>
                <Textarea
                  id="idealBrandImage"
                  value={formData.idealBrandImage}
                  onChange={(e) => updateField('idealBrandImage', e.target.value)}
                  placeholder="Describe how you want your brand to be perceived..."
                  rows={3}
                />
                {errors.idealBrandImage && <p className="text-sm text-red-500">{errors.idealBrandImage}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspirationBrands">Inspiration Brands</Label>
                <Textarea
                  id="inspirationBrands"
                  value={formData.inspirationBrands}
                  onChange={(e) => updateField('inspirationBrands', e.target.value)}
                  placeholder="What brands inspire you? Why?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandingAesthetics">Branding Aesthetics *</Label>
                <Textarea
                  id="brandingAesthetics"
                  value={formData.brandingAesthetics}
                  onChange={(e) => updateField('brandingAesthetics', e.target.value)}
                  placeholder="Describe your visual preferences: colors, style, mood..."
                  rows={3}
                />
                {errors.brandingAesthetics && <p className="text-sm text-red-500">{errors.brandingAesthetics}</p>}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emotionsBrandEvokes">Emotions Brand Should Evoke</Label>
                  <Input
                    id="emotionsBrandEvokes"
                    value={formData.emotionsBrandEvokes}
                    onChange={(e) => updateField('emotionsBrandEvokes', e.target.value)}
                    placeholder="e.g., Trust, excitement, luxury"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredFont">Preferred Font Style</Label>
                  <Input
                    id="preferredFont"
                    value={formData.preferredFont}
                    onChange={(e) => updateField('preferredFont', e.target.value)}
                    placeholder="e.g., Modern sans-serif, elegant serif"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandPersonality">Brand Personality *</Label>
                <Textarea
                  id="brandPersonality"
                  value={formData.brandPersonality}
                  onChange={(e) => updateField('brandPersonality', e.target.value)}
                  placeholder="If your brand were a person, how would you describe their personality?"
                  rows={3}
                />
                {errors.brandPersonality && <p className="text-sm text-red-500">{errors.brandPersonality}</p>}
              </div>
            </>
          )}

          {/* Step 7: Products & Goals */}
          {currentStep === 7 && (
            <>
              <div className="space-y-2">
                <Label>Product Categories *</Label>
                <p className="text-sm text-slate-500 mb-2">Select all that apply</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {PRODUCT_CATEGORIES.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={formData.productCategories.includes(category)}
                        onCheckedChange={() => toggleProductCategory(category)}
                      />
                      <label htmlFor={`cat-${category}`} className="text-sm cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.productCategories && <p className="text-sm text-red-500">{errors.productCategories}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherProductIdeas">Other Product Ideas</Label>
                <Textarea
                  id="otherProductIdeas"
                  value={formData.otherProductIdeas}
                  onChange={(e) => updateField('otherProductIdeas', e.target.value)}
                  placeholder="Any other product ideas not listed above?"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scalingGoals">Scaling Goals *</Label>
                <Textarea
                  id="scalingGoals"
                  value={formData.scalingGoals}
                  onChange={(e) => updateField('scalingGoals', e.target.value)}
                  placeholder="How do you plan to scale? What are your growth milestones?"
                  rows={3}
                />
                {errors.scalingGoals && <p className="text-sm text-red-500">{errors.scalingGoals}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="growthStrategies">Growth Strategies</Label>
                <Textarea
                  id="growthStrategies"
                  value={formData.growthStrategies}
                  onChange={(e) => updateField('growthStrategies', e.target.value)}
                  placeholder="What strategies will you use to grow?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longTermVision">Long-Term Vision (5+ Years) *</Label>
                <Textarea
                  id="longTermVision"
                  value={formData.longTermVision}
                  onChange={(e) => updateField('longTermVision', e.target.value)}
                  placeholder="Where do you see your brand in 5+ years?"
                  rows={3}
                />
                {errors.longTermVision && <p className="text-sm text-red-500">{errors.longTermVision}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="specificDeadlines">Specific Deadlines</Label>
                <Input
                  id="specificDeadlines"
                  value={formData.specificDeadlines}
                  onChange={(e) => updateField('specificDeadlines', e.target.value)}
                  placeholder="Any important dates or deadlines?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => updateField('additionalInfo', e.target.value)}
                  placeholder="Anything else you'd like us to know?"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Step 8: Review & Submit */}
          {currentStep === 8 && (
            <>
              <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-slate-900">Application Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Name:</span>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Country:</span>
                    <p className="font-medium">{formData.country}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Industry:</span>
                    <p className="font-medium">{formData.industryNiche}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-500">Product Categories:</span>
                    <p className="font-medium">{formData.productCategories.join(', ') || 'None selected'}</p>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-2">
                <Label>Brand Assets (Optional)</Label>
                <p className="text-sm text-slate-500">Upload a ZIP file with any brand assets, inspiration images, or documents (max 25MB)</p>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                  {formData.zipFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-slate-600">{formData.zipFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateField('zipFile', null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".zip"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 25 * 1024 * 1024) {
                              setErrors({ zipFile: 'File must be less than 25MB' })
                              return
                            }
                            updateField('zipFile', file)
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-600">Click to upload ZIP file</span>
                      </div>
                    </label>
                  )}
                </div>
                {errors.zipFile && <p className="text-sm text-red-500">{errors.zipFile}</p>}
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => updateField('termsAccepted', checked === true)}
                  />
                  <label htmlFor="terms" className="text-sm cursor-pointer">
                    I agree to the terms and conditions. I understand that submitting this application
                    does not guarantee acceptance into the program, and that all information provided
                    will be kept confidential.
                  </label>
                </div>
                {errors.termsAccepted && <p className="text-sm text-red-500">{errors.termsAccepted}</p>}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
