'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

import { ApplicationFormData, applicationSchema } from '@/schemas/application'
import { FORM_STEPS } from '@/constants/formSteps'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { saveFormData, loadFormData, hasSavedData } from '@/lib/autosave'

import { StepBasicInfo } from './step-basic-info'
import { StepCareerBackground } from './step-career'
import { StepAudienceDemographics } from './step-audience'
import { StepPainPoints } from './step-pain-points'
import { StepCompetition } from './step-competition'
import { StepBrandIdentity } from './step-brand-identity'
import { StepProductDirection } from './step-product'
import { StepBusinessGoals } from './step-business-goals'
import { StepLogistics } from './step-logistics'

export default function ApplyFormPage() {
  const router = useRouter()
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange',
  })
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const { watch, trigger } = form

  // Load saved data on mount
  useEffect(() => {
    if (hasSavedData()) {
      const savedData = loadFormData()
      Object.entries(savedData).forEach(([key, value]) => {
        form.setValue(key as keyof ApplicationFormData, value as any)
      })
      toast({
        title: 'Progress Restored',
        description: 'Your previous answers have been loaded.',
      })
    }
  }, [])

  // Autosave on form changes
  useEffect(() => {
    const subscription = watch((value) => {
      saveFormData(value as Partial<ApplicationFormData>)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const handleNext = async () => {
    const step = FORM_STEPS[currentStep]
    const isValid = await trigger(step.fields as any)

    if (isValid) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        router.push('/apply/review')
      }
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
      })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepBasicInfo form={form} />
      case 1: return <StepCareerBackground form={form} />
      case 2: return <StepAudienceDemographics form={form} />
      case 3: return <StepPainPoints form={form} />
      case 4: return <StepCompetition form={form} />
      case 5: return <StepBrandIdentity form={form} />
      case 6: return <StepProductDirection form={form} />
      case 7: return <StepBusinessGoals form={form} />
      case 8: return <StepLogistics form={form} zipFile={zipFile} setZipFile={setZipFile} />
      default: return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Step {currentStep + 1} of {FORM_STEPS.length}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / FORM_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentStep === FORM_STEPS.length - 1 ? 'Review' : 'Next'}
          <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
        </Button>
      </div>
    </div>
  )
}
