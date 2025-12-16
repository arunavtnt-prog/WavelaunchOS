'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientSchema, type CreateClientInput } from '@/schemas/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
  })

  const onSubmit = async (data: CreateClientInput) => {
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!result.success) {
        setError(result.error || 'Failed to create client')
        return
      }

      router.push(`/clients/${result.data.id}`)
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Client</h1>
          <p className="text-muted-foreground">
            Complete the comprehensive form to create a new client profile
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramHandle">Instagram Handle</Label>
              <Input
                id="instagramHandle"
                {...register('instagramHandle')}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktokHandle">TikTok Handle</Label>
              <Input
                id="tiktokHandle"
                {...register('tiktokHandle')}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="United States"
              />
              {errors.country && (
                <p className="text-sm text-destructive">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="industryNiche">Industry/Niche *</Label>
              <Input
                id="industryNiche"
                {...register('industryNiche')}
                placeholder="e.g., Skincare, Fitness"
              />
              {errors.industryNiche && (
                <p className="text-sm text-destructive">
                  {errors.industryNiche.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                placeholder="25"
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Career Background */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Career Background</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="professionalMilestones">Professional Milestones *</Label>
              <textarea
                id="professionalMilestones"
                {...register('professionalMilestones')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe your professional achievements and milestones..."
              />
              {errors.professionalMilestones && (
                <p className="text-sm text-destructive">
                  {errors.professionalMilestones.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalTurningPoints">Personal Turning Points *</Label>
              <textarea
                id="personalTurningPoints"
                {...register('personalTurningPoints')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe key personal moments that shaped your journey..."
              />
              {errors.personalTurningPoints && (
                <p className="text-sm text-destructive">
                  {errors.personalTurningPoints.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visionForVenture">Vision for Venture *</Label>
              <textarea
                id="visionForVenture"
                {...register('visionForVenture')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe the vision for this brand..."
              />
              {errors.visionForVenture && (
                <p className="text-sm text-destructive">
                  {errors.visionForVenture.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hopeToAchieve">Hope to Achieve *</Label>
              <textarea
                id="hopeToAchieve"
                {...register('hopeToAchieve')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="What do you hope to achieve with this venture?"
              />
              {errors.hopeToAchieve && (
                <p className="text-sm text-destructive">
                  {errors.hopeToAchieve.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Audience & Demographics */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Audience & Demographics</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience *</Label>
              <textarea
                id="targetAudience"
                {...register('targetAudience')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe your target audience..."
              />
              {errors.targetAudience && (
                <p className="text-sm text-destructive">
                  {errors.targetAudience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="demographicProfile">Demographic Profile *</Label>
              <textarea
                id="demographicProfile"
                {...register('demographicProfile')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe demographic profile..."
              />
              {errors.demographicProfile && (
                <p className="text-sm text-destructive">
                  {errors.demographicProfile.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="targetDemographicAge">Target Age Range *</Label>
                <Input
                  id="targetDemographicAge"
                  {...register('targetDemographicAge')}
                  placeholder="e.g., 25-40"
                />
                {errors.targetDemographicAge && (
                  <p className="text-sm text-destructive">
                    {errors.targetDemographicAge.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="audienceGenderSplit">Gender Split *</Label>
                <Input
                  id="audienceGenderSplit"
                  {...register('audienceGenderSplit')}
                  placeholder="e.g., 70% female, 30% male"
                />
                {errors.audienceGenderSplit && (
                  <p className="text-sm text-destructive">
                    {errors.audienceGenderSplit.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="audienceMaritalStatus">Marital Status *</Label>
                <Input
                  id="audienceMaritalStatus"
                  {...register('audienceMaritalStatus')}
                  placeholder="e.g., Single, Married"
                />
                {errors.audienceMaritalStatus && (
                  <p className="text-sm text-destructive">
                    {errors.audienceMaritalStatus.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentChannels">Current Channels *</Label>
              <textarea
                id="currentChannels"
                {...register('currentChannels')}
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="How does your audience currently find you?"
              />
              {errors.currentChannels && (
                <p className="text-sm text-destructive">
                  {errors.currentChannels.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Audience Pain Points & Needs */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Audience Pain Points & Needs</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyPainPoints">Key Pain Points *</Label>
              <textarea
                id="keyPainPoints"
                {...register('keyPainPoints')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="What problems does your audience face?"
              />
              {errors.keyPainPoints && (
                <p className="text-sm text-destructive">
                  {errors.keyPainPoints.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandValues">Brand Values *</Label>
              <textarea
                id="brandValues"
                {...register('brandValues')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="What values does your brand represent?"
              />
              {errors.brandValues && (
                <p className="text-sm text-destructive">
                  {errors.brandValues.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Competition & Market Understanding */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Competition & Market Understanding</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="uniqueValueProps">Unique Value Propositions *</Label>
              <textarea
                id="uniqueValueProps"
                {...register('uniqueValueProps')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="What makes your offering unique in the market?"
              />
              {errors.uniqueValueProps && (
                <p className="text-sm text-destructive">
                  {errors.uniqueValueProps.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergingCompetitors">Emerging Competitors *</Label>
              <textarea
                id="emergingCompetitors"
                {...register('emergingCompetitors')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Who are your main competitors and what makes them successful?"
              />
              {errors.emergingCompetitors && (
                <p className="text-sm text-destructive">
                  {errors.emergingCompetitors.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspirationBrands">Inspiration Brands *</Label>
              <textarea
                id="inspirationBrands"
                {...register('inspirationBrands')}
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Which brands inspire you and why?"
              />
              {errors.inspirationBrands && (
                <p className="text-sm text-destructive">
                  {errors.inspirationBrands.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Brand Identity Preferences */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Brand Identity Preferences</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idealBrandImage">Ideal Brand Image *</Label>
              <textarea
                id="idealBrandImage"
                {...register('idealBrandImage')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe your ideal brand image..."
              />
              {errors.idealBrandImage && (
                <p className="text-sm text-destructive">
                  {errors.idealBrandImage.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspirationBrands">Inspiration Brands *</Label>
              <textarea
                id="inspirationBrands"
                {...register('inspirationBrands')}
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="List influencers/brands you admire..."
              />
              {errors.inspirationBrands && (
                <p className="text-sm text-destructive">
                  {errors.inspirationBrands.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandingAesthetics">Branding Aesthetics *</Label>
              <textarea
                id="brandingAesthetics"
                {...register('brandingAesthetics')}
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe branding aesthetics..."
              />
              {errors.brandingAesthetics && (
                <p className="text-sm text-destructive">
                  {errors.brandingAesthetics.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotionsBrandEvokes">Emotions Brand Evokes *</Label>
              <textarea
                id="emotionsBrandEvokes"
                {...register('emotionsBrandEvokes')}
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="List emotions/adjectives your brand should evoke..."
              />
              {errors.emotionsBrandEvokes && (
                <p className="text-sm text-destructive">
                  {errors.emotionsBrandEvokes.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brandPersonality">Brand Personality *</Label>
                <Input
                  id="brandPersonality"
                  {...register('brandPersonality')}
                  placeholder="e.g., Bold, Elegant, Playful"
                />
                {errors.brandPersonality && (
                  <p className="text-sm text-destructive">
                    {errors.brandPersonality.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredFont">Preferred Font *</Label>
                <Input
                  id="preferredFont"
                  {...register('preferredFont')}
                  placeholder="e.g., Modern Sans-Serif"
                />
                {errors.preferredFont && (
                  <p className="text-sm text-destructive">
                    {errors.preferredFont.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Direction */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Product Direction</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otherProductIdeas">Other Product Ideas *</Label>
              <textarea
                id="otherProductIdeas"
                {...register('otherProductIdeas')}
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="What other products or services are you considering?"
              />
              {errors.otherProductIdeas && (
                <p className="text-sm text-destructive">
                  {errors.otherProductIdeas.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="growthStrategies">Growth Strategies *</Label>
              <textarea
                id="growthStrategies"
                {...register('growthStrategies')}
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="How do you plan to grow your business?"
              />
              {errors.growthStrategies && (
                <p className="text-sm text-destructive">
                  {errors.growthStrategies.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business Goals */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Business Goals</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scalingGoals">Scaling Goals *</Label>
              <textarea
                id="scalingGoals"
                {...register('scalingGoals')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe your scaling goals..."
              />
              {errors.scalingGoals && (
                <p className="text-sm text-destructive">
                  {errors.scalingGoals.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="growthStrategies">Growth Strategies *</Label>
              <textarea
                id="growthStrategies"
                {...register('growthStrategies')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe your growth strategies..."
              />
              {errors.growthStrategies && (
                <p className="text-sm text-destructive">
                  {errors.growthStrategies.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longTermVision">Long-Term Vision *</Label>
              <textarea
                id="longTermVision"
                {...register('longTermVision')}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe your long-term vision..."
              />
              {errors.longTermVision && (
                <p className="text-sm text-destructive">
                  {errors.longTermVision.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specificDeadlines">Specific Deadlines</Label>
              <textarea
                id="specificDeadlines"
                {...register('specificDeadlines')}
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Any specific deadlines or milestones?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <textarea
                id="additionalInfo"
                {...register('additionalInfo')}
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Any additional information we should know?"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Client'}
          </Button>
          <Link href="/clients">
            <Button type="button" variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
