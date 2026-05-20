'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '@/schemas/application'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BRAND_PERSONALITIES, FONT_PREFERENCES } from '@/types'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepBrandIdentity({ form }: StepProps) {
  const { register, formState: { errors }, setValue, watch } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="idealBrandImage">
          Ideal brand image
        </Label>
        <Textarea
          id="idealBrandImage"
          {...register('idealBrandImage')}
          placeholder="Describe how you want your brand to be perceived..."
          rows={3}
          className="resize-none"
        />
        {errors.idealBrandImage && (
          <p className="text-sm text-red-500">{errors.idealBrandImage.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="inspirationBrands">
          Influencers or brands you admire
        </Label>
        <Textarea
          id="inspirationBrands"
          {...register('inspirationBrands')}
          placeholder="List brands or influencers that inspire you and explain why..."
          rows={3}
          className="resize-none"
        />
        {errors.inspirationBrands && (
          <p className="text-sm text-red-500">{errors.inspirationBrands.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="brandingAesthetics">
          Branding aesthetics / visual identity / tone of voice
        </Label>
        <Textarea
          id="brandingAesthetics"
          {...register('brandingAesthetics')}
          placeholder="Describe your desired visual style, colors, imagery, and communication tone..."
          rows={3}
          className="resize-none"
        />
        {errors.brandingAesthetics && (
          <p className="text-sm text-red-500">{errors.brandingAesthetics.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emotionsBrandEvokes">
          Emotions or adjectives your brand should evoke
        </Label>
        <Textarea
          id="emotionsBrandEvokes"
          {...register('emotionsBrandEvokes')}
          placeholder="e.g., Empowering, Luxurious, Trustworthy, Innovative, Playful..."
          rows={2}
          className="resize-none"
        />
        {errors.emotionsBrandEvokes && (
          <p className="text-sm text-red-500">{errors.emotionsBrandEvokes.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="brandPersonality">
            Brand personality
          </Label>
          <Select
            value={watch('brandPersonality')}
            onValueChange={(value) => setValue('brandPersonality', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select brand personality" />
            </SelectTrigger>
            <SelectContent>
              {BRAND_PERSONALITIES.map((personality) => (
                <SelectItem key={personality.value} value={personality.value}>
                  {personality.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.brandPersonality && (
            <p className="text-sm text-red-500">{errors.brandPersonality.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredFont">
            Font preference
          </Label>
          <Select
            value={watch('preferredFont')}
            onValueChange={(value) => setValue('preferredFont', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font style" />
            </SelectTrigger>
            <SelectContent>
              {FONT_PREFERENCES.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.preferredFont && (
            <p className="text-sm text-red-500">{errors.preferredFont.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
