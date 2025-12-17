'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

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
      {/* Editorial Progress Rail */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mb-8 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity"
      >
        <h1 className="font-serif text-[52px] md:text-[64px] text-foreground tracking-[-0.02em] leading-[0.9]">
          Wavelaunch Studio
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 text-[10px] font-light text-foreground/30 hidden sm:flex">
            <span className="tracking-[0.3em] uppercase">{String(currentStep + 1).padStart(2, '0')} / {String(FORM_STEPS.length).padStart(2, '0')}</span>
            <div className="flex gap-2">
              {FORM_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${i <= currentStep ? 'bg-foreground/50' : 'bg-foreground/10'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Minimal Divider */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1, ease: "circOut" }}
        className="w-full max-w-2xl h-px bg-foreground/10 mb-20"
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
          <div className="mb-20">
            <h2 className="text-5xl md:text-6xl font-serif text-foreground mb-6 leading-[1.1] tracking-[-0.02em]">{currentStepData.title}</h2>
            {currentStepData.description && (
              <p className="text-foreground/40 text-base leading-relaxed max-w-md font-light">{currentStepData.description}</p>
            )}
          </div>

          <div className="relative">
            <form className="space-y-12">
              {renderStep()}

              <div className="flex justify-between items-center pt-20 mt-12">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`text-foreground/40 hover:text-foreground text-sm font-normal tracking-wide transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="text-foreground border border-foreground/20 hover:border-foreground/50 bg-transparent px-8 py-3 text-sm font-normal tracking-widest uppercase transition-all hover:tracking-[0.2em]"
                >
                  {currentStep === FORM_STEPS.length - 1 ? "Submit" : "Next"}
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
        className="mt-32 mb-8 text-center text-[9px] text-foreground/15 font-light tracking-[0.35em] uppercase select-none"
      >
        Confidential Admissions Portal
      </motion.div>
    </div>
  )
}
