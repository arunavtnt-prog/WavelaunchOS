'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '@/schemas/application'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COUNTRIES } from '@/types'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepBasicInfo({ form }: StepProps) {
  const { register, formState: { errors }, setValue, watch } = form

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-[10px] text-white/40 ml-1">*</span>
          </Label>
          <Input
            id="fullName"
            {...register('fullName')}
            placeholder="Your full name"
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-[10px] text-white/40 ml-1">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="instagramHandle">Instagram Handle</Label>
          <div className="flex items-center">
            <span className="h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 border border-r-0 border-slate-200 dark:border-zinc-700 rounded-l-xl text-slate-500 dark:text-zinc-400">
              @
            </span>
            <Input
              id="instagramHandle"
              {...register('instagramHandle')}
              placeholder="username"
              className="rounded-l-none border-l-0"
            />
          </div>
          {errors.instagramHandle && (
            <p className="text-sm text-red-500">{errors.instagramHandle.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiktokHandle">TikTok Handle</Label>
          <div className="flex items-center">
            <span className="h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 border border-r-0 border-slate-200 dark:border-zinc-700 rounded-l-xl text-slate-500 dark:text-zinc-400">
              @
            </span>
            <Input
              id="tiktokHandle"
              {...register('tiktokHandle')}
              placeholder="username"
              className="rounded-l-none border-l-0"
            />
          </div>
          {errors.tiktokHandle && (
            <p className="text-sm text-red-500">{errors.tiktokHandle.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="country">
            Country
          </Label>
          <Select
            value={watch('country')}
            onValueChange={(value) => setValue('country', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-sm text-red-500">{errors.country.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">
            Age
          </Label>
          <Input
            id="age"
            type="number"
            {...register('age', { valueAsNumber: true })}
            placeholder="Your age"
            min="18"
            max="100"
          />
          {errors.age && (
            <p className="text-sm text-red-500">{errors.age.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industryNiche">
          Industry/Niche
        </Label>
        <Input
          id="industryNiche"
          {...register('industryNiche')}
          placeholder="e.g., Fashion, Beauty, Fitness, Tech, Lifestyle"
        />
        {errors.industryNiche && (
          <p className="text-sm text-red-500">{errors.industryNiche.message}</p>
        )}
      </div>
    </div>
  )
}
