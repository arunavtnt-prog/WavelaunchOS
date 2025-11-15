'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '@/schemas/application'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PRODUCT_CATEGORIES } from '@/types'
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
    <div className="space-y-6">
      {suggestedCategories.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Suggested based on your niche ({industryNiche}):
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedCategories.map((cat) => (
              <span
                key={cat.value}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>
          Product categories you're interested in <span className="text-red-500">*</span>
        </Label>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
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
                className="font-normal cursor-pointer leading-tight"
              >
                {category.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.productCategories && (
          <p className="text-sm text-red-500">{errors.productCategories.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherProductIdeas">
          Other product ideas (optional)
        </Label>
        <Textarea
          id="otherProductIdeas"
          {...register('otherProductIdeas')}
          placeholder="If you have product ideas not listed above, describe them here..."
          rows={3}
          className="resize-none"
        />
        {errors.otherProductIdeas && (
          <p className="text-sm text-red-500">{errors.otherProductIdeas.message}</p>
        )}
      </div>
    </div>
  )
}
