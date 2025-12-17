'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '@/schemas/application'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepBusinessGoals({ form }: StepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="scalingGoals">
          Personal goals for scaling <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="scalingGoals"
          {...register('scalingGoals')}
          placeholder="What are your revenue targets, growth milestones, and scaling objectives?"
          rows={4}
          className="resize-none"
        />
        {errors.scalingGoals && (
          <p className="text-sm text-red-500">{errors.scalingGoals.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="growthStrategies">
          Strategies/channels you want to explore <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="growthStrategies"
          {...register('growthStrategies')}
          placeholder="Which marketing channels, platforms, or strategies are you interested in leveraging?"
          rows={4}
          className="resize-none"
        />
        {errors.growthStrategies && (
          <p className="text-sm text-red-500">{errors.growthStrategies.message}</p>
        )}
        <p className="text-sm text-slate-500">
          Examples: Social media, influencer partnerships, email marketing, paid ads, SEO, content marketing
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="longTermVision">
          Long-term vision for your brand <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="longTermVision"
          {...register('longTermVision')}
          placeholder="Where do you see your brand in 3-5 years? What's the ultimate vision?"
          rows={4}
          className="resize-none"
        />
        {errors.longTermVision && (
          <p className="text-sm text-red-500">{errors.longTermVision.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="specificDeadlines">
          Deadlines or milestones we should consider (optional)
        </Label>
        <Textarea
          id="specificDeadlines"
          {...register('specificDeadlines')}
          placeholder="Any important dates, launch windows, or time-sensitive goals..."
          rows={3}
          className="resize-none"
        />
        {errors.specificDeadlines && (
          <p className="text-sm text-red-500">{errors.specificDeadlines.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalInfo">
          Any other relevant information? (optional)
        </Label>
        <Textarea
          id="additionalInfo"
          {...register('additionalInfo')}
          placeholder="Share anything else you think we should know about you or your brand vision..."
          rows={4}
          className="resize-none"
        />
        {errors.additionalInfo && (
          <p className="text-sm text-red-500">{errors.additionalInfo.message}</p>
        )}
      </div>
    </div>
  )
}
