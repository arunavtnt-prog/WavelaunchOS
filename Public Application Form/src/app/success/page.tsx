'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ExternalLink, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import confetti from 'canvas-confetti'

export default function SuccessPage() {
  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const wavelaunchUrl = process.env.NEXT_PUBLIC_WAVELAUNCH_URL || 'https://wavelaunch.vc'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
          >
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Application Submitted!
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Thank you for applying to Wavelaunch Studio
            </p>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="glass-effect border-2">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">
                      What Happens Next?
                    </h2>
                    <ul className="space-y-3 text-slate-700">
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2">•</span>
                        <span>You'll receive a confirmation email shortly</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2">•</span>
                        <span>Our team will review your application within 5-7 business days</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2">•</span>
                        <span>We'll analyze your audience, niche, and brand vision</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2">•</span>
                        <span>You'll receive a custom roadmap with product recommendations and strategy</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2">•</span>
                        <span>If approved, we'll schedule a call to discuss next steps</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-blue-900">
                    <strong>Important:</strong> Please check your email (including spam folder) for
                    our confirmation message and further instructions. Keep an eye out for updates
                    from our team.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <Button
              size="lg"
              onClick={() => window.open(wavelaunchUrl, '_blank')}
              className="bg-primary text-primary-foreground px-8 py-6 text-lg"
            >
              Visit Wavelaunch VC
              <ExternalLink className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-sm text-slate-500">
              Learn more about our portfolio and success stories
            </p>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-12 text-slate-600"
          >
            <p className="text-sm">
              Have questions?{' '}
              <a
                href="mailto:hello@wavelaunch.studio"
                className="text-blue-600 hover:underline font-medium"
              >
                Contact our team
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
