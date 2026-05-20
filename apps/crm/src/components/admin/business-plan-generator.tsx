'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wand2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BusinessPlanGeneratorProps {
  clientId: string
  clientName: string
  hasBusinessPlan: boolean
  hasCompletedOnboarding: boolean
}

export function BusinessPlanGenerator({
  clientId,
  clientName,
  hasBusinessPlan,
  hasCompletedOnboarding,
}: BusinessPlanGeneratorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  // Only show if client has completed onboarding and doesn't have a business plan
  if (hasBusinessPlan || !hasCompletedOnboarding) {
    return null
  }

  const handleGeneratePlan = async () => {
    setIsGenerating(true)
    setProgress(0)
    setCurrentStep('Preparing client data...')

    try {
      // Simulate progress
      setProgress(20)
      setCurrentStep('Analyzing business information...')

      await new Promise(resolve => setTimeout(resolve, 1000))

      setProgress(40)
      setCurrentStep('Generating AI business plan draft...')

      // Call the API to generate business plan
      const response = await fetch(`/api/admin/business-plans/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate business plan')
      }

      setProgress(80)
      setCurrentStep('Finalizing draft...')

      await new Promise(resolve => setTimeout(resolve, 500))

      setProgress(100)
      setCurrentStep('Complete!')

      toast({
        title: 'Business Plan Created',
        description: `Draft business plan has been generated for ${clientName}`,
      })

      // Redirect to business plan page after a brief delay
      setTimeout(() => {
        router.push(`/clients/${clientId}/business-plan`)
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error('Generate plan error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate business plan',
        variant: 'destructive',
      })
      setIsGenerating(false)
      setProgress(0)
      setCurrentStep('')
    }
  }

  return (
    <Card className="border-primary/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              Ready to Generate Business Plan
            </CardTitle>
            <CardDescription>
              {clientName} has completed onboarding questionnaire
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isGenerating ? (
          <>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                All required information has been collected. You can now generate an AI-powered business plan draft based on the client's onboarding responses.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Onboarding Complete</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span>Ready to Generate</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Draft Pending</span>
              </div>
            </div>

            <Button
              onClick={handleGeneratePlan}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate AI Business Plan Draft
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{currentStep}</p>
                <Progress value={progress} className="mt-2" />
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              This may take a few moments...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
