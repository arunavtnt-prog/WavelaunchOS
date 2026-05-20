'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '@/schemas/application'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepLogistics({ form }: StepProps) {
  const { formState: { errors }, setValue, watch } = form
  const termsAccepted = watch('termsAccepted')

  return (
    <div className="space-y-6">
      <div className="border-t pt-6">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="termsAccepted"
            checked={termsAccepted}
            onCheckedChange={(checked) => setValue('termsAccepted', checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="termsAccepted"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              I accept the terms and privacy policy
            </Label>
            <p className="text-sm text-slate-500">
              By submitting this application, I agree to Wavelaunch Studio's{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_WAVELAUNCH_URL || 'https://wavelaunch.vc'}/terms`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_WAVELAUNCH_URL || 'https://wavelaunch.vc'}/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </a>
              . I understand that my application will be reviewed and I may be contacted for
              further discussion.
            </p>
          </div>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-red-500 mt-2">{errors.termsAccepted.message}</p>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-700 leading-relaxed">
          <strong>Note:</strong> Your application progress is automatically saved. You can safely
          close this page and return later to complete your application. All your answers will be
          preserved.
        </p>
      </div>
    </div>
  )
}
