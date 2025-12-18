'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

import { ApplicationFormData, applicationSchema } from './schemas/application'
import { FORM_STEPS } from './types'
import { useToast } from '@/components/ui/use-toast'
import { saveFormData, loadFormData, hasSavedData } from './lib/autosave'

import { StepBasicInfo } from './components/application-form/step-basic-info'
import { StepCareerBackground } from './components/application-form/step-career'
import { StepAudienceDemographics } from './components/application-form/step-audience'
import { StepPainPoints } from './components/application-form/step-pain-points'
import { StepCompetition } from './components/application-form/step-competition'
import { StepBrandIdentity } from './components/application-form/step-brand-identity'
import { StepProductDirection } from './components/application-form/step-product'
import { StepBusinessGoals } from './components/application-form/step-business-goals'
import { StepLogistics } from './components/application-form/step-logistics'

export default function ApplicationFormRoot() {
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [zipFile, setZipFile] = useState<File | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange',
    defaultValues: {
      productCategories: [],
      termsAccepted: false,
    },
  })

  const { trigger, watch } = form

  // Load saved data on mount
  useEffect(() => {
    if (isMounted && hasSavedData()) {
      const savedData = loadFormData()
      Object.entries(savedData).forEach(([key, value]) => {
        form.setValue(key as keyof ApplicationFormData, value as any)
      })
      toast({
        title: 'Progress Restored',
        description: 'Your previous answers have been loaded.',
      })
    }
  }, [isMounted])

  // Autosave on form changes
  useEffect(() => {
    if (isMounted) {
      const subscription = watch((value) => {
        saveFormData(value as Partial<ApplicationFormData>)
      })
      return () => subscription.unsubscribe()
    }
  }, [watch, isMounted])

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

  const currentStepData = FORM_STEPS[currentStep]

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-transparent py-16 px-4 flex flex-col items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent py-16 px-4 flex flex-col items-center relative transition-colors duration-300 overflow-hidden">
      {/* Header with Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mb-8 flex items-center justify-between"
      >
        <h1 className="font-serif text-4xl md:text-5xl text-foreground tracking-[-0.02em] leading-[0.9]">
          Wavelaunch Studio
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground hidden sm:flex">
            <span className="font-medium">{String(currentStep + 1).padStart(2, '0')} / {String(FORM_STEPS.length).padStart(2, '0')}</span>
            <div className="flex gap-1.5">
              {FORM_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-foreground' : 'bg-foreground/20'}`}
                />
              ))}
            </div>
          </div>
          <ModeToggle />
        </div>
      </motion.div>

      {/* Minimal Divider */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1, ease: "circOut" }}
        className="w-full max-w-2xl h-px bg-foreground/10 mb-10"
      />

      {/* Main Form Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4 leading-[1.1] tracking-[-0.02em]">{currentStepData.title}</h2>
            {currentStepData.description && (
              <p className="text-muted-foreground text-base leading-relaxed max-w-md">{currentStepData.description}</p>
            )}
          </div>

          <div className="relative">
            <form className="space-y-12">
              {renderStep()}

              <div className="flex justify-between items-center pt-10">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`text-muted-foreground hover:text-foreground text-sm font-medium transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  {currentStep === FORM_STEPS.length - 1 ? "Submit" : "Continue"}
                  {currentStep < FORM_STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-2xl mt-8 text-center text-xs text-muted-foreground/50 font-light tracking-widest uppercase select-none"
      >
        Confidential Admissions Portal
      </motion.div>
    </div>
  )
}
