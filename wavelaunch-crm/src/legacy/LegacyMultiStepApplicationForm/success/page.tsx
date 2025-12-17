'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Mail, Clock, ArrowLeft } from 'lucide-react'

export default function ApplicationSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success Hero */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Application Submitted!
        </h1>
        <p className="text-lg text-slate-600">
          Thank you for applying to the Wavelaunch Creator Partnership Program.
        </p>
      </div>

      {/* What&apos;s Next Card */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">What Happens Next?</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-50">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Check Your Email</h3>
                <p className="text-sm text-slate-500">
                  You&apos;ll receive a confirmation email shortly with your application details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-50">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Review Process</h3>
                <p className="text-sm text-slate-500">
                  Our team will review your application within 48 hours. We&apos;ll reach out
                  if we need any additional information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-50">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Decision</h3>
                <p className="text-sm text-slate-500">
                  Once reviewed, we&apos;ll notify you of our decision and next steps
                  if you&apos;re accepted into the program.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link href="/apply">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Contact Info */}
      <p className="text-center text-sm text-slate-500">
        Questions? Email us at{' '}
        <a href="mailto:hello@wavelaunch.studio" className="text-blue-600 hover:underline">
          hello@wavelaunch.studio
        </a>
      </p>
    </div>
  )
}
