'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '../../schemas/application'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepAudienceDemographics({ form }: StepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="targetAudience">
          Who is your target audience? <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="targetAudience"
          {...register('targetAudience')}
          placeholder="Describe who you want to reach with your brand..."
          rows={3}
          className="resize-none"
        />
        {errors.targetAudience && (
          <p className="text-sm text-red-500">{errors.targetAudience.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="demographicProfile">
          Demographic profile (gender, location, interests, etc.) <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="demographicProfile"
          {...register('demographicProfile')}
          placeholder="Provide details about your audience demographics..."
          rows={3}
          className="resize-none"
        />
        {errors.demographicProfile && (
          <p className="text-sm text-red-500">{errors.demographicProfile.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="targetDemographicAge">
            Age of your target demographic <span className="text-red-500">*</span>
          </Label>
          <Input
            id="targetDemographicAge"
            {...register('targetDemographicAge')}
            placeholder="e.g., 18-35, 25-45"
          />
          {errors.targetDemographicAge && (
            <p className="text-sm text-red-500">{errors.targetDemographicAge.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="audienceGenderSplit">
            Gender split <span className="text-red-500">*</span>
          </Label>
          <Input
            id="audienceGenderSplit"
            {...register('audienceGenderSplit')}
            placeholder="e.g., 70% female, 30% male"
          />
          {errors.audienceGenderSplit && (
            <p className="text-sm text-red-500">{errors.audienceGenderSplit.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="audienceMaritalStatus">
          Marital status <span className="text-red-500">*</span>
        </Label>
        <Input
          id="audienceMaritalStatus"
          {...register('audienceMaritalStatus')}
          placeholder="e.g., Mostly single, Mixed, Primarily married"
        />
        {errors.audienceMaritalStatus && (
          <p className="text-sm text-red-500">{errors.audienceMaritalStatus.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentChannels">
          How does your audience currently find you? <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="currentChannels"
          {...register('currentChannels')}
          placeholder="Describe the platforms, content types, or methods through which people discover you..."
          rows={3}
          className="resize-none"
        />
        {errors.currentChannels && (
          <p className="text-sm text-red-500">{errors.currentChannels.message}</p>
        )}
      </div>
    </div>
  )
}
