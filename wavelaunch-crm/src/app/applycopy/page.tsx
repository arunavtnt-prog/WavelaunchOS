'use client'

import { useState } from 'react'
import { ApplicationFormData, applicationSchema } from '@/modules/application-form/schemas/application'
import { FORM_STEPS } from '@/modules/application-form/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { useToast } from '@/components/ui/use-toast'

import { StepBasicInfo } from '@/modules/application-form/components/application-form/step-basic-info'
import { StepBrandIdentity } from '@/modules/application-form/components/application-form/step-brand-identity'
import { StepProduct } from '@/modules/application-form/components/application-form/step-product'

export default function ApplyCopyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      instagramHandle: '',
      tiktokHandle: '',
      country: '',
      age: 18,
      industryNiche: '',
      idealBrandImage: '',
      inspirationBrands: '',
      brandingAesthetics: '',
      emotionsBrandEvokes: '',
      brandPersonality: '',
      preferredFont: '',
      productCategories: [],
      otherProductIdeas: '',
      zipFile: null,
    },
    mode: 'onChange',
  })

  const handleNext = async () => {
    const fields = FORM_STEPS[currentStep].fields
    const isValid = await form.trigger(fields as any[])
    
    if (isValid) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        // Handle form submission
        toast({
          title: "Application submitted",
          description: "Thank you for your application!",
        })
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepBasicInfo form={form} />
      case 1:
        return <StepBrandIdentity form={form} />
      case 2:
        return <StepProduct form={form} />
      default:
        return null
    }
  }

  const currentStepData = FORM_STEPS[currentStep]

  return (
    <div className="min-h-screen bg-transparent py-16 px-4 flex flex-col items-center relative transition-colors duration-300 overflow-hidden">
      {/* Header with Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mb-8 flex items-center justify-between"
      >
        <h1 className="font-serif text-4xl md:text-5xl text-foreground tracking-[-0.02em] leading-[0.9]">
          Wavelaunch Studio
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground hidden sm:flex">
            <span className="font-medium">Step {String(currentStep + 1)} of {String(FORM_STEPS.length)}</span>
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
        className="w-full max-w-3xl h-px bg-foreground/10 mb-10"
      />

      {/* Main Form Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-3xl"
        >
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-2 leading-[1.1] tracking-[-0.02em]">{currentStepData.title}</h2>
            {currentStepData.description && (
              <p className="text-muted-foreground text-base leading-relaxed max-w-md mb-2">{currentStepData.description}</p>
            )}
          </div>

          <div className="relative">
            <form className="space-y-12">
              {renderStep()}

              <div className="flex justify-end items-center pt-12 mt-10">
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
                  className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2"
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
        className="w-full max-w-3xl mt-12 text-center text-[10px] text-muted-foreground/30 font-light tracking-[0.15em] uppercase select-none"
      >
        Confidential Admissions Portal
      </motion.div>
    </div>
  )
}
