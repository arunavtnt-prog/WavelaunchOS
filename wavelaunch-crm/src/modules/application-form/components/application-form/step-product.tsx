'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '../../schemas/application'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Checkbox } from '../../components/ui/checkbox'
import { PRODUCT_CATEGORIES } from '../../types'
import { useState, useEffect } from 'react'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function StepProductDirection({ form }: StepProps) {
  const { register, formState: { errors }, setValue, watch } = form
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const industryNiche = watch('industryNiche') || ''

  // Get suggested categories based on niche
  const suggestedCategories = PRODUCT_CATEGORIES.filter(cat =>
    cat.niches.some(niche =>
      industryNiche.toLowerCase().includes(niche.toLowerCase())
    )
  )

  useEffect(() => {
    const currentCategories = watch('productCategories') || []
    if (currentCategories.length > 0) {
      setSelectedCategories(currentCategories)
    }
  }, [])

  const handleCategoryChange = (categoryValue: string, checked: boolean) => {
    let updated: string[]
    if (checked) {
      updated = [...selectedCategories, categoryValue]
    } else {
      updated = selectedCategories.filter(c => c !== categoryValue)
    }
    setSelectedCategories(updated)
    setValue('productCategories', updated)
  }

  return (
    <div className="space-y-10">
      {suggestedCategories.length > 0 && (
        <div className="border-b border-white/10 pb-8">
          <p className="text-xs font-normal tracking-wide uppercase text-foreground/40 mb-4">
            Suggested for {industryNiche}
          </p>
          <div className="flex flex-wrap gap-3">
            {suggestedCategories.map((cat) => (
              <span
                key={cat.value}
                className="px-4 py-2 border border-white/20 text-foreground/70 text-sm"
              >
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Label>
          Product Categories <span className="text-foreground/30">*</span>
        </Label>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {PRODUCT_CATEGORIES.map((category) => (
            <div key={category.value} className="flex items-start space-x-3">
              <Checkbox
                id={category.value}
                checked={selectedCategories.includes(category.value)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category.value, checked as boolean)
                }
              />
              <Label
                htmlFor={category.value}
                className="font-normal normal-case tracking-normal text-foreground/70 cursor-pointer leading-tight text-sm"
              >
                {category.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.productCategories && (
          <p className="text-xs text-red-400/80 mt-1">{errors.productCategories.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="otherProductIdeas">
          Other Product Ideas
        </Label>
        <Textarea
          id="otherProductIdeas"
          {...register('otherProductIdeas')}
          placeholder="Additional product ideas..."
          rows={3}
        />
        {errors.otherProductIdeas && (
          <p className="text-xs text-red-400/80 mt-1">{errors.otherProductIdeas.message}</p>
        )}
      </div>
    </div>
  )
}
