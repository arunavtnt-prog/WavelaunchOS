'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '../../schemas/application'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepCompetition({ form }: StepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="differentiation">
          Differentiation Strategy <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="differentiation"
          {...register('differentiation')}
          placeholder="What makes your brand different..."
          rows={4}
        />
        {errors.differentiation && (
          <p className="text-xs text-red-400/80 mt-1">{errors.differentiation.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="uniqueValueProps">
          Unique Value Propositions <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="uniqueValueProps"
          {...register('uniqueValueProps')}
          placeholder="Specific advantages you offer..."
          rows={4}
        />
        {errors.uniqueValueProps && (
          <p className="text-xs text-red-400/80 mt-1">{errors.uniqueValueProps.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergingCompetitors">
          Competitors You Monitor <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="emergingCompetitors"
          {...register('emergingCompetitors')}
          placeholder="Brands you watch closely..."
          rows={4}
        />
        {errors.emergingCompetitors && (
          <p className="text-xs text-red-400/80 mt-1">{errors.emergingCompetitors.message}</p>
        )}
      </div>
    </div>
  )
}
