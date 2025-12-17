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
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="professionalMilestones">
          Professional milestones <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="professionalMilestones"
          {...register('professionalMilestones')}
          placeholder="Key career achievements..."
          rows={3}
          className="resize-none"
        />
        {errors.professionalMilestones && (
          <p className="text-sm text-red-500">{errors.professionalMilestones.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="personalTurningPoints">
          Personal turning points <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="personalTurningPoints"
          {...register('personalTurningPoints')}
          placeholder="Pivotal moments..."
          rows={3}
          className="resize-none"
        />
        {errors.personalTurningPoints && (
          <p className="text-sm text-red-500">{errors.personalTurningPoints.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="visionForVenture">
          Vision for this venture <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="visionForVenture"
          {...register('visionForVenture')}
          placeholder="Desired impact..."
          rows={3}
          className="resize-none"
        />
        {errors.visionForVenture && (
          <p className="text-sm text-red-500">{errors.visionForVenture.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hopeToAchieve">
          Definition of success <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="hopeToAchieve"
          {...register('hopeToAchieve')}
          placeholder="Your aspirations..."
          rows={3}
          className="resize-none"
        />
        {errors.hopeToAchieve && (
          <p className="text-sm text-red-500">{errors.hopeToAchieve.message}</p>
        )}
      </div>
    </div>
  )
}
