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

import { StepBasicInfo } from '@/components/application-form/step-basic-info'
import { StepCareerBackground } from '@/components/application-form/step-career'
import { StepAudienceDemographics } from '@/components/application-form/step-audience'
import { StepPainPoints } from '@/components/application-form/step-pain-points'
import { StepCompetition } from '@/components/application-form/step-competition'
import { StepBrandIdentity } from '@/components/application-form/step-brand-identity'
import { StepProductDirection } from '@/components/application-form/step-product'
import { StepBusinessGoals } from '@/components/application-form/step-business-goals'
import { StepLogistics } from '@/components/application-form/step-logistics'

import { ModeToggle } from '@/components/mode-toggle'
import { DotScreenShader } from '@/components/ui/dot-shader-background'

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

  return (
    <div className="min-h-screen bg-transparent py-16 px-4 flex flex-col items-center relative transition-colors duration-300 overflow-hidden isolate">
      {/* Dot Shader Background */}
      <DotScreenShader />

      {/* Editorial Progress Rail */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mb-8 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity"
      >
        <h1 className="font-serif text-[48px] text-foreground tracking-tight leading-none">
          Wavelaunch Studio
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground hidden sm:flex">
            <span className="tracking-widest uppercase opacity-40">0{currentStep + 1} / 0{FORM_STEPS.length}</span>
            <div className="flex gap-1.5">
              {FORM_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-foreground/80' : 'bg-foreground/10'}`}
                />
              ))}
            </div>
          </div>
          <ModeToggle />
        </div>
      </motion.div>

      {/* Sleek Divider */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "circOut" }}
        className="w-full max-w-2xl h-px bg-black/50 dark:bg-zinc-800/50 mb-16"
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
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4 leading-tight">{currentStepData.title}</h2>
            {currentStepData.description && (
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg font-light">{currentStepData.description}</p>
            )}
          </div>

          <div className="relative">
            <form className="space-y-12">
              {renderStep()}

              <div className="flex justify-between items-center pt-16 mt-8">
                <Button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`bg-white dark:bg-neutral-900 text-foreground border border-input z-10 hover:bg-accent hover:text-accent-foreground px-6 py-6 text-sm font-medium rounded transition-all shadow-sm ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-sm font-medium tracking-wide rounded transition-all shadow-none hover:shadow-lg active:scale-[0.98]"
                >
                  {currentStep === FORM_STEPS.length - 1 ? "Complete Application" : "Continue"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-24 text-center text-[10px] text-muted-foreground/60 font-medium tracking-[0.2em] uppercase"
      >
        Confidential Admissions Portal
      </motion.div>
    </div>
  )
}
