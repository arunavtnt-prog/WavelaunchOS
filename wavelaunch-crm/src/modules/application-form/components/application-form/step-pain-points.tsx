'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '../../schemas/application'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepPainPoints({ form }: StepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="keyPainPoints">
          Key Pain Points <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="keyPainPoints"
          {...register('keyPainPoints')}
          placeholder="Problems your audience faces..."
          rows={5}
        />
        {errors.keyPainPoints && (
          <p className="text-xs text-red-400/80 mt-1">{errors.keyPainPoints.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="brandValues">
          Brand Values <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="brandValues"
          {...register('brandValues')}
          placeholder="Core principles your brand represents..."
          rows={5}
        />
        {errors.brandValues && (
          <p className="text-xs text-red-400/80 mt-1">{errors.brandValues.message}</p>
        )}
      </div>
    </div>
  )
}
