'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '@/schemas/application'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepPainPoints({ form }: StepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="keyPainPoints">
          Key needs and pain points you want to address <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="keyPainPoints"
          {...register('keyPainPoints')}
          placeholder="What problems does your audience face? What needs are not being met by current solutions?"
          rows={5}
          className="resize-none"
        />
        {errors.keyPainPoints && (
          <p className="text-sm text-red-500">{errors.keyPainPoints.message}</p>
        )}
        <p className="text-sm text-slate-500">
          Be specific about the challenges and frustrations your target audience experiences
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brandValues">
          Values or principles your brand must embody <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="brandValues"
          {...register('brandValues')}
          placeholder="What core values and principles should your brand represent? What do you stand for?"
          rows={5}
          className="resize-none"
        />
        {errors.brandValues && (
          <p className="text-sm text-red-500">{errors.brandValues.message}</p>
        )}
        <p className="text-sm text-slate-500">
          Think about authenticity, sustainability, innovation, inclusivity, quality, etc.
        </p>
      </div>
    </div>
  )
}
