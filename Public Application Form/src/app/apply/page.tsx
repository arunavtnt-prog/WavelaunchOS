'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, FileText } from 'lucide-react'

import { ApplicationFormData, applicationSchema } from '@/schemas/application'
import { FORM_STEPS } from '@/types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { saveFormData, loadFormData, hasSavedData } from '@/lib/autosave'

import { StepBasicInfo } from '@/components/application-form/step-basic-info'
import { StepCareerBackground } from '@/components/application-form/step-career'
import { StepAudienceDemographics } from '@/components/application-form/step-audience'
import { StepPainPoints } from '@/components/application-form/step-pain-points'
import { StepCompetition } from '@/components/application-form/step-competition'
import { StepBrandIdentity } from '@/components/application-form/step-brand-identity'
import { StepProductDirection } from '@/components/application-form/step-product'
import { StepBusinessGoals } from '@/components/application-form/step-business-goals'
import { StepLogistics } from '@/components/application-form/step-logistics'

export default function ApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange',
    defaultValues: {
      productCategories: [],
      termsAccepted: false,
    },
  })

  const { handleSubmit, trigger, watch } = form

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

  const progressPercentage = ((currentStep + 1) / FORM_STEPS.length) * 100

  const handleNext = async () => {
    const step = FORM_STEPS[currentStep]
    const isValid = await trigger(step.fields as any)

    if (isValid) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // Go to review page
        router.push('/apply/review')
      }
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
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
      case 0:
        return <StepBasicInfo form={form} />
      case 1:
        return <StepCareerBackground form={form} />
      case 2:
        return <StepAudienceDemographics form={form} />
      case 3:
        return <StepPainPoints form={form} />
      case 4:
        return <StepCompetition form={form} />
      case 5:
        return <StepBrandIdentity form={form} />
      case 6:
        return <StepProductDirection form={form} />
      case 7:
        return <StepBusinessGoals form={form} />
      case 8:
        return <StepLogistics form={form} zipFile={zipFile} setZipFile={setZipFile} />
      default:
        return null
    }
  }

  const currentStepData = FORM_STEPS[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Wavelaunch Studio Application
          </h1>
          <p className="text-slate-600">
            Step {currentStep + 1} of {FORM_STEPS.length}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </motion.div>

        {/* Steps Navigation */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {FORM_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => {
                  if (index < currentStep) {
                    setCurrentStep(index)
                  }
                }}
                className={`
                  px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${
                    index === currentStep
                      ? 'bg-blue-600 text-white shadow-lg'
                      : index < currentStep
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-slate-200 text-slate-400'
                  }
                  ${index < currentStep ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {index < currentStep && <Check className="inline w-3 h-3 mr-1" />}
                {step.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-effect border-2">
              <CardHeader>
                <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {renderStep()}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>

                    <Button
                      type="button"
                      onClick={handleNext}
                      className="gradient-luxury text-white"
                    >
                      {currentStep === FORM_STEPS.length - 1 ? (
                        <>
                          Review Application
                          <FileText className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Auto-save indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-4 text-sm text-slate-500"
        >
          Your progress is automatically saved
        </motion.div>
      </div>
    </div>
  )
}
