'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

import { ApplicationFormData, applicationSchema } from '@/schemas/application'
import { FORM_STEPS } from '@/types'
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

import { DotScreenShader } from '@/components/ui/dot-shader-background'

export default function ApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
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
      case 8: return <StepLogistics form={form} />
      default: return null
    }
  }

  const currentStepData = FORM_STEPS[currentStep]

  return (
    <div className="min-h-screen bg-transparent py-16 px-4 flex flex-col items-center relative transition-colors duration-300 overflow-hidden isolate">
      {/* Dot Shader Background */}
      <DotScreenShader />

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
          {/* Form Container */}
          <div className="bg-gradient-to-b from-[#0E0E0E]/5 to-[#0E0E0E]/6 border border-white/4 rounded-2xl p-12 md:p-14 backdrop-blur-sm">
            {/* Brand and Progress in header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-[HelveticaNeue-Medium] font-normal text-[22px] text-white/50 tracking-normal leading-none">
                Wavelaunch Studio<span className="text-[16px] align-super">+</span>
              </h1>
              
              {/* Progress indicator inside card */}
              <div className="flex items-center gap-8 hidden sm:flex">
                {/* Editorial Progress Line */}
                <div className="relative w-32 h-px bg-white/10">
                  <motion.div 
                    className="absolute top-0 left-0 h-px bg-gradient-to-r from-white/40 via-white/70 to-white/40"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep + 1) / FORM_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />
                  {/* Decorative endpoint */}
                  <motion.div 
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/60"
                    initial={{ left: "0%" }}
                    animate={{ left: `${((currentStep + 1) / FORM_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    style={{ marginLeft: "-3px" }}
                  />
                </div>
                
                {/* Serif Numerals */}
                <motion.div 
                  className="font-serif text-[15px] tracking-[0.05em] text-white/60 font-light"
                  key={currentStep}
                  initial={{ opacity: 0.4, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {String(currentStep + 1).padStart(2, '0')} / {String(FORM_STEPS.length).padStart(2, '0')}
                </motion.div>
              </div>
            </div>
            
            {/* Brand Divider */}
            <div className="mb-8 h-px bg-white/6"></div>
            
            <div className="mb-8">
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
