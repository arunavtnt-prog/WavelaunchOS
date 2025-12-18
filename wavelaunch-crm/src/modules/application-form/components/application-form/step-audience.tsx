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
          Target Audience <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="targetAudience"
          {...register('targetAudience')}
          placeholder="Who you want to reach..."
          rows={3}
        />
        {errors.targetAudience && (
          <p className="text-xs text-red-400/80 mt-1">{errors.targetAudience.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="demographicProfile">
          Demographic Profile <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="demographicProfile"
          {...register('demographicProfile')}
          placeholder="Gender, location, interests..."
          rows={3}
        />
        {errors.demographicProfile && (
          <p className="text-xs text-red-400/80 mt-1">{errors.demographicProfile.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-2">
          <Label htmlFor="targetDemographicAge">
            Target Age Range <span className="text-red-500">*</span>
          </Label>
          <Input
            id="targetDemographicAge"
            {...register('targetDemographicAge')}
            placeholder="18-35, 25-45..."
          />
          {errors.targetDemographicAge && (
            <p className="text-xs text-red-400/80 mt-1">{errors.targetDemographicAge.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="audienceGenderSplit">
            Gender Split <span className="text-red-500">*</span>
          </Label>
          <Input
            id="audienceGenderSplit"
            {...register('audienceGenderSplit')}
            placeholder="70% female, 30% male..."
          />
          {errors.audienceGenderSplit && (
            <p className="text-xs text-red-400/80 mt-1">{errors.audienceGenderSplit.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="audienceMaritalStatus">
          Marital Status <span className="text-red-500">*</span>
        </Label>
        <Input
          id="audienceMaritalStatus"
          {...register('audienceMaritalStatus')}
          placeholder="Mostly single, Mixed, Primarily married..."
        />
        {errors.audienceMaritalStatus && (
          <p className="text-xs text-red-400/80 mt-1">{errors.audienceMaritalStatus.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentChannels">
          Discovery Channels <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="currentChannels"
          {...register('currentChannels')}
          placeholder="How your audience currently finds you..."
          rows={3}
        />
        {errors.currentChannels && (
          <p className="text-xs text-red-400/80 mt-1">{errors.currentChannels.message}</p>
        )}
      </div>
    </div>
  )
}
