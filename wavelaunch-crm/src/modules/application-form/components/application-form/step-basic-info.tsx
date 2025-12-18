'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '../../schemas/application'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { COUNTRIES } from '../../types'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepBasicInfo({ form }: StepProps) {
  const { register, formState: { errors }, setValue, watch } = form

  return (
    <div className="space-y-6">
      {/* Name + Email Group */}
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            {...register('fullName')}
            placeholder="Your full name"
          />
          {errors.fullName && (
            <p className="text-xs text-red-400/80 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-xs text-red-400/80 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Social Handles Group */}
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-2">
          <Label htmlFor="instagramHandle">Instagram</Label>
          <div className="flex">
            <div className="h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 border border-r-0 border-input rounded-l-xl text-slate-500 dark:text-zinc-400 text-sm">
              @
            </div>
            <Input
              id="instagramHandle"
              {...register('instagramHandle')}
              placeholder="username"
              className="rounded-l-none border-l-0"
            />
          </div>
          {errors.instagramHandle && (
            <p className="text-xs text-red-500 mt-1">{errors.instagramHandle.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiktokHandle">TikTok</Label>
          <div className="flex">
            <div className="h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 border border-r-0 border-input rounded-l-xl text-slate-500 dark:text-zinc-400 text-sm">
              @
            </div>
            <Input
              id="tiktokHandle"
              {...register('tiktokHandle')}
              placeholder="username"
              className="rounded-l-none border-l-0"
            />
          </div>
          {errors.tiktokHandle && (
            <p className="text-xs text-red-500 mt-1">{errors.tiktokHandle.message}</p>
          )}
        </div>
      </div>

      {/* Country + Age Group */}
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-2">
          <Label htmlFor="country">
            Country <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch('country')}
            onValueChange={(value) => setValue('country', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
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
            <p className="text-xs text-red-400/80 mt-1">{errors.country.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">
            Age <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            {...register('age', { valueAsNumber: true })}
            placeholder="Age"
            min="18"
            max="100"
          />
          {errors.age && (
            <p className="text-xs text-red-400/80 mt-1">{errors.age.message}</p>
          )}
        </div>
      </div>

      {/* Industry/Niche */}
      <div className="space-y-2">
        <Label htmlFor="industryNiche">
          Industry/Niche <span className="text-red-500">*</span>
        </Label>
        <Input
          id="industryNiche"
          {...register('industryNiche')}
          placeholder="Fashion, Beauty, Fitness, Tech, Lifestyle..."
        />
        {errors.industryNiche && (
          <p className="text-xs text-red-400/80 mt-1">{errors.industryNiche.message}</p>
        )}
      </div>
    </div>
  )
}
