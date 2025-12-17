'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '@/schemas/application'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepCompetition({ form }: StepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="differentiation">
          How do you plan to differentiate your venture? <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="differentiation"
          {...register('differentiation')}
          placeholder="What makes your brand different from others in the market? How will you stand out?"
          rows={4}
          className="resize-none"
        />
        {errors.differentiation && (
          <p className="text-sm text-red-500">{errors.differentiation.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="uniqueValueProps">
          Your unique value propositions (USPs) <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="uniqueValueProps"
          {...register('uniqueValueProps')}
          placeholder="List the specific advantages and unique benefits you offer that competitors don't..."
          rows={4}
          className="resize-none"
        />
        {errors.uniqueValueProps && (
          <p className="text-sm text-red-500">{errors.uniqueValueProps.message}</p>
        )}
        <p className="text-sm text-slate-500">
          Think about product quality, customer experience, brand story, innovation, etc.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergingCompetitors">
          Emerging/disruptive competitors you monitor <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="emergingCompetitors"
          {...register('emergingCompetitors')}
          placeholder="List brands or competitors you watch closely and what you learn from them..."
          rows={4}
          className="resize-none"
        />
        {errors.emergingCompetitors && (
          <p className="text-sm text-red-500">{errors.emergingCompetitors.message}</p>
        )}
      </div>
    </div>
  )
}
