'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Send, Edit, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { loadFormData, clearFormData } from '@/lib/autosave'
import { ApplicationFormData } from '@/schemas/application'

export default function ReviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<ApplicationFormData> | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const data = loadFormData()
    if (Object.keys(data).length === 0) {
      toast({
        title: 'No Data Found',
        description: 'Please complete application first.',
      })
      router.push('/apply')
      return
    }
    setFormData(data)
  }, [])

  const handleEdit = (stepIndex: number) => {
    router.push(`/apply/form`)
  }

  const handleSubmit = async () => {
    if (!formData) return
    
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        body: (() => {
          const form = new FormData()
          
          // Add all form fields
          Object.entries(formData).forEach(([key, value]) => {
            if (key === 'productCategories' && Array.isArray(value)) {
              form.append(key, JSON.stringify(value))
            } else if (typeof value === 'string') {
              form.append(key, value)
            }
          })
          
          // Add termsAccepted as boolean
          form.append('termsAccepted', 'true')
          
          return form
        })(),
      })

      const result = await response.json()

      if (result.success) {
        clearFormData()
        toast({
          title: 'Application Submitted Successfully!',
          description: 'Your application has been received and is under review.',
        })
        router.push('/apply/success')
      } else {
        toast({
          title: 'Submission Failed',
          description: result.error || 'Failed to submit application. Please try again.',
        })
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit application. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
      setShowConfirmDialog(false)
    }
  }

  const renderFieldValue = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return value || 'Not provided'
  }

  const formatLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, '')
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Review Your Application</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/apply/form')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>
        </div>

        {/* Application Summary */}
        <div className="grid gap-6">
          {Object.entries(formData).map(([section, data]) => (
            <Card key={section} className="overflow-hidden">
              <CardHeader className="bg-slate-50">
                <CardTitle className="text-lg">
                  {formatLabel(section)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {typeof data === 'object' && data !== null ? (
                    Object.entries(data).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start border-b pb-2">
                        <span className="font-medium text-slate-700 min-w-0 flex-1">
                          {formatLabel(key)}
                        </span>
                        <span className="text-slate-600 text-right ml-4">
                          {renderFieldValue(key, value)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600">
                      {renderFieldValue(section, data)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <Button
            variant="outline"
            onClick={() => setShowConfirmDialog(true)}
            className="bg-white dark:bg-neutral-900 text-foreground border border-input z-10 hover:bg-accent hover:text-accent-foreground px-6 py-6 text-sm font-medium rounded transition-all shadow-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Application
          </Button>
          
          <Button
            onClick={() => setShowConfirmDialog(true)}
            className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-sm font-medium tracking-wide rounded transition-all shadow-none hover:shadow-lg active:scale-[0.98]"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Application
          </Button>
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Application?</DialogTitle>
            <DialogDescription>
              Are you ready to submit your application? You can edit it later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}