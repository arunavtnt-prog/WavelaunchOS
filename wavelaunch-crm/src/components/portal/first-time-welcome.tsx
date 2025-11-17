'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sparkles,
  Rocket,
  Target,
  TrendingUp,
  MessageSquare,
  FileText,
  CheckCircle2,
  ArrowRight,
  X,
  Star,
} from 'lucide-react'

interface FirstTimeWelcomeProps {
  clientName: string
  brandName?: string
}

export function FirstTimeWelcome({ clientName, brandName }: FirstTimeWelcomeProps) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check if this is first time visiting dashboard after onboarding
    const hasSeenWelcome = localStorage.getItem('wavelaunch-welcome-seen')

    if (!hasSeenWelcome) {
      // Show welcome after a brief delay for dramatic effect
      setTimeout(() => {
        setShow(true)
        setIsAnimating(true)
      }, 500)
    }
  }, [])

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setShow(false)
      localStorage.setItem('wavelaunch-welcome-seen', 'true')
      router.refresh()
    }, 300)
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!show) return null

  const STEPS = [
    {
      icon: Rocket,
      title: "🎉 Welcome to Your Portal!",
      description: `Hi ${clientName}! You've successfully completed onboarding${brandName ? ` for ${brandName}` : ''}. Your personalized business plan journey starts here.`,
      gradient: "from-blue-600 to-purple-600",
      highlight: "Your journey has begun"
    },
    {
      icon: Target,
      title: "📊 Track Your Progress",
      description: "Monitor your 8-month transformation journey. Watch as your business plan comes to life with monthly deliverables, progress updates, and milestone tracking.",
      gradient: "from-purple-600 to-pink-600",
      highlight: "Stay on track"
    },
    {
      icon: MessageSquare,
      title: "💬 Direct Team Access",
      description: "Have questions? Need guidance? Message your dedicated Wavelaunch team directly through the portal. We're here to support your success every step of the way.",
      gradient: "from-pink-600 to-red-600",
      highlight: "We're here for you"
    },
    {
      icon: FileText,
      title: "📁 Your Business Plan",
      description: "Our team is reviewing your onboarding information and will create your personalized business plan. You'll be notified when it's ready for review!",
      gradient: "from-red-600 to-orange-600",
      highlight: "Coming soon"
    },
  ]

  const currentStep = STEPS[step]
  const CurrentIcon = currentStep.icon

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Floating stars animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <Star
            key={i}
            className={`absolute text-yellow-400 animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${12 + Math.random() * 12}px`,
              height: `${12 + Math.random() * 12}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <Card
        className={`relative w-full max-w-2xl mx-4 shadow-2xl transform transition-all duration-500 ${
          isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <CardContent className="p-8 space-y-8">
          {/* Icon and Title */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className={`absolute inset-0 bg-gradient-to-r ${currentStep.gradient} blur-2xl opacity-30 animate-pulse`} />
              <div className={`relative flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-gradient-to-r ${currentStep.gradient}`}>
                <CurrentIcon className="h-12 w-12 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                {currentStep.title}
              </h2>
              <p className={`text-sm font-semibold bg-gradient-to-r ${currentStep.gradient} bg-clip-text text-transparent`}>
                {currentStep.highlight}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6">
            <p className="text-center text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Features Grid - Only show on first step */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Target, label: 'Progress Tracking', color: 'text-blue-600' },
                { icon: MessageSquare, label: 'Direct Messaging', color: 'text-purple-600' },
                { icon: FileText, label: 'Business Plan', color: 'text-pink-600' },
                { icon: TrendingUp, label: '8-Month Journey', color: 'text-orange-600' },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all hover:scale-105"
                >
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === step
                    ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'w-2 bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={`flex-1 bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 text-white border-0`}
            >
              {step === STEPS.length - 1 ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Skip link */}
          <div className="text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
