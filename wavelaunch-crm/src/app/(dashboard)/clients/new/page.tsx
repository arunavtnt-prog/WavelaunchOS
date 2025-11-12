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
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Onboard New Client</h1>
          <p className="text-muted-foreground">
            Complete the form to create a new client profile
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="creatorName">Creator Name *</Label>
              <Input
                id="creatorName"
                {...register('creatorName')}
                placeholder="John Doe"
              />
              {errors.creatorName && (
                <p className="text-sm text-destructive">
                  {errors.creatorName.message}
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
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                {...register('brandName')}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">Niche</Label>
              <Input
                id="niche"
                {...register('niche')}
                placeholder="e.g., Skincare, Fitness"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visionStatement">Vision for this Venture *</Label>
            <textarea
              id="visionStatement"
              {...register('visionStatement')}
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Describe the vision for this brand..."
            />
            {errors.visionStatement && (
              <p className="text-sm text-destructive">
                {errors.visionStatement.message}
              </p>
            )}
          </div>
        </div>

        {/* Market & Audience */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Market & Audience</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetIndustry">Target Industry *</Label>
              <Input
                id="targetIndustry"
                {...register('targetIndustry')}
                placeholder="e.g., Beauty, Health & Wellness"
              />
              {errors.targetIndustry && (
                <p className="text-sm text-destructive">
                  {errors.targetIndustry.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDemographicAge">Target Age *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience Description *</Label>
            <textarea
              id="targetAudience"
              {...register('targetAudience')}
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Describe the target audience..."
            />
            {errors.targetAudience && (
              <p className="text-sm text-destructive">
                {errors.targetAudience.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="demographics">Demographics Profile *</Label>
            <textarea
              id="demographics"
              {...register('demographics')}
              className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Age, gender, location, interests..."
            />
            {errors.demographics && (
              <p className="text-sm text-destructive">
                {errors.demographics.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="painPoints">Key Audience Pain Points *</Label>
            <textarea
              id="painPoints"
              {...register('painPoints')}
              className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="What problems does your audience face?"
            />
            {errors.painPoints && (
              <p className="text-sm text-destructive">
                {errors.painPoints.message}
              </p>
            )}
          </div>
        </div>

        {/* Brand Identity */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Brand Identity</h2>

          <div className="space-y-2">
            <Label htmlFor="uniqueValueProps">Unique Value Propositions *</Label>
            <textarea
              id="uniqueValueProps"
              {...register('uniqueValueProps')}
              className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="What makes this brand unique?"
            />
            {errors.uniqueValueProps && (
              <p className="text-sm text-destructive">
                {errors.uniqueValueProps.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandImage">Brand Image Description *</Label>
            <textarea
              id="brandImage"
              {...register('brandImage')}
              className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="How should the brand look and feel?"
            />
            {errors.brandImage && (
              <p className="text-sm text-destructive">
                {errors.brandImage.message}
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
