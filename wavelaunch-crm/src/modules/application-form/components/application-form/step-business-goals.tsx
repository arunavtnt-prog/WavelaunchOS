'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '../../schemas/application'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepBusinessGoals({ form }: StepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="scalingGoals">
          Scaling Goals <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="scalingGoals"
          {...register('scalingGoals')}
          placeholder="Revenue targets, growth milestones..."
          rows={4}
        />
        {errors.scalingGoals && (
          <p className="text-xs text-red-400/80 mt-1">{errors.scalingGoals.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="growthStrategies">
          Growth Strategies <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="growthStrategies"
          {...register('growthStrategies')}
          placeholder="Marketing channels, platforms..."
          rows={4}
        />
        {errors.growthStrategies && (
          <p className="text-xs text-red-400/80 mt-1">{errors.growthStrategies.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="longTermVision">
          Long-Term Vision <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="longTermVision"
          {...register('longTermVision')}
          placeholder="Where you see your brand in 3-5 years..."
          rows={4}
        />
        {errors.longTermVision && (
          <p className="text-xs text-red-400/80 mt-1">{errors.longTermVision.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="specificDeadlines">
          Key Deadlines
        </Label>
        <Textarea
          id="specificDeadlines"
          {...register('specificDeadlines')}
          placeholder="Important dates, launch windows..."
          rows={3}
        />
        {errors.specificDeadlines && (
          <p className="text-xs text-red-400/80 mt-1">{errors.specificDeadlines.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalInfo">
          Additional Information
        </Label>
        <Textarea
          id="additionalInfo"
          {...register('additionalInfo')}
          placeholder="Anything else we should know..."
          rows={4}
        />
        {errors.additionalInfo && (
          <p className="text-xs text-red-400/80 mt-1">{errors.additionalInfo.message}</p>
        )}
      </div>
    </div>
  )
}
