'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '../../schemas/application'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { BRAND_PERSONALITIES, FONT_PREFERENCES } from '../../types'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepBrandIdentity({ form }: StepProps) {
  const { register, formState: { errors }, setValue, watch } = form

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Label htmlFor="idealBrandImage">
          Ideal Brand Image <span className="text-foreground/30">*</span>
        </Label>
        <Textarea
          id="idealBrandImage"
          {...register('idealBrandImage')}
          placeholder="How you want your brand to be perceived..."
          rows={3}
        />
        {errors.idealBrandImage && (
          <p className="text-xs text-red-400/80 mt-1">{errors.idealBrandImage.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="inspirationBrands">
          Brands You Admire <span className="text-foreground/30">*</span>
        </Label>
        <Textarea
          id="inspirationBrands"
          {...register('inspirationBrands')}
          placeholder="Brands or influencers that inspire you..."
          rows={3}
        />
        {errors.inspirationBrands && (
          <p className="text-xs text-red-400/80 mt-1">{errors.inspirationBrands.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="brandingAesthetics">
          Visual Identity <span className="text-foreground/30">*</span>
        </Label>
        <Textarea
          id="brandingAesthetics"
          {...register('brandingAesthetics')}
          placeholder="Visual style, colors, imagery, tone..."
          rows={3}
        />
        {errors.brandingAesthetics && (
          <p className="text-xs text-red-400/80 mt-1">{errors.brandingAesthetics.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="emotionsBrandEvokes">
          Brand Emotions <span className="text-foreground/30">*</span>
        </Label>
        <Textarea
          id="emotionsBrandEvokes"
          {...register('emotionsBrandEvokes')}
          placeholder="Empowering, Luxurious, Trustworthy..."
          rows={2}
        />
        {errors.emotionsBrandEvokes && (
          <p className="text-xs text-red-400/80 mt-1">{errors.emotionsBrandEvokes.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="brandPersonality">
            Brand Personality <span className="text-foreground/30">*</span>
          </Label>
          <Select
            value={watch('brandPersonality')}
            onValueChange={(value) => setValue('brandPersonality', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select personality" />
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
            <p className="text-xs text-red-400/80 mt-1">{errors.brandPersonality.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="preferredFont">
            Font Preference <span className="text-foreground/30">*</span>
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
            <p className="text-xs text-red-400/80 mt-1">{errors.preferredFont.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
