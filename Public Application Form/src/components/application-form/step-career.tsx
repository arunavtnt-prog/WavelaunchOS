'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '@/schemas/application'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepCareerBackground({ form }: StepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="professionalMilestones">
          Significant milestones in your professional career <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="professionalMilestones"
          {...register('professionalMilestones')}
          placeholder="Share key achievements, career highlights, and professional accomplishments..."
          rows={4}
          className="resize-none"
        />
        {errors.professionalMilestones && (
          <p className="text-sm text-red-500">{errors.professionalMilestones.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="personalTurningPoints">
          Main turning points in your personal career <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="personalTurningPoints"
          {...register('personalTurningPoints')}
          placeholder="Describe pivotal moments that shaped your journey..."
          rows={4}
          className="resize-none"
        />
        {errors.personalTurningPoints && (
          <p className="text-sm text-red-500">{errors.personalTurningPoints.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="visionForVenture">
          Your vision for this new venture <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="visionForVenture"
          {...register('visionForVenture')}
          placeholder="What do you envision for this brand? What impact do you want to make?"
          rows={4}
          className="resize-none"
        />
        {errors.visionForVenture && (
          <p className="text-sm text-red-500">{errors.visionForVenture.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hopeToAchieve">
          What you hope to achieve <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="hopeToAchieve"
          {...register('hopeToAchieve')}
          placeholder="Share your goals, aspirations, and what success looks like to you..."
          rows={4}
          className="resize-none"
        />
        {errors.hopeToAchieve && (
          <p className="text-sm text-red-500">{errors.hopeToAchieve.message}</p>
        )}
      </div>
    </div>
  )
}
