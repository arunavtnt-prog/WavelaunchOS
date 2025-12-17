'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '../../schemas/application'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepCareerBackground({ form }: StepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Label htmlFor="professionalMilestones">
          Professional Milestones <span className="text-foreground/30">*</span>
        </Label>
        <Textarea
          id="professionalMilestones"
          {...register('professionalMilestones')}
          placeholder="Key career achievements..."
          rows={3}
        />
        {errors.professionalMilestones && (
          <p className="text-xs text-red-400/80 mt-1">{errors.professionalMilestones.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="personalTurningPoints">
          Personal Turning Points <span className="text-foreground/30">*</span>
        </Label>
        <Textarea
          id="personalTurningPoints"
          {...register('personalTurningPoints')}
          placeholder="Pivotal moments..."
          rows={3}
        />
        {errors.personalTurningPoints && (
          <p className="text-xs text-red-400/80 mt-1">{errors.personalTurningPoints.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="visionForVenture">
          Vision for Venture <span className="text-foreground/30">*</span>
        </Label>
        <Textarea
          id="visionForVenture"
          {...register('visionForVenture')}
          placeholder="Desired impact..."
          rows={3}
        />
        {errors.visionForVenture && (
          <p className="text-xs text-red-400/80 mt-1">{errors.visionForVenture.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="hopeToAchieve">
          Definition of Success <span className="text-foreground/30">*</span>
        </Label>
        <Textarea
          id="hopeToAchieve"
          {...register('hopeToAchieve')}
          placeholder="Your aspirations..."
          rows={3}
        />
        {errors.hopeToAchieve && (
          <p className="text-xs text-red-400/80 mt-1">{errors.hopeToAchieve.message}</p>
        )}
      </div>
    </div>
  )
}
