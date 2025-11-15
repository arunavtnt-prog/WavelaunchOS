'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()

  const features = [
    'Product development & manufacturing',
    'Branding & website creation',
    'Marketing, SEO & analytics',
    'Logistics & customer support',
    'Up to $50,000 investment from Wavelaunch VC',
    'You keep 100% ownership',
  ]

  const requirements = [
    '5-10% onboarding fee',
    '6-12 months commitment',
    'Active participation in brand planning',
    'Alignment with long-term vision',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8"
          >
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-gradient">
              Wavelaunch Studio
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900">
            Welcome to the{' '}
            <span className="text-gradient">Wavelaunch Studio</span> Application
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
            A brand-building accelerator for creators and influencers. We help you launch
            your own profitable D2C businesses with complete end-to-end support.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto space-y-8">
          {/* What We Offer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="glass-effect border-2">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">
                  What We Offer
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="mt-6 text-slate-600 leading-relaxed">
                  Our team manages everything end-to-end while you collaborate on creative
                  direction and strategy. You maintain full ownership of your brand while we
                  invest in its growth.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Your Commitment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="glass-effect border-2">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">
                  Your Commitment
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {requirements.map((req, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                      </div>
                      <span className="text-slate-700">{req}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Why This Form Exists */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="glass-effect border-2">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900">
                  Why This Form Exists
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Your answers help us evaluate fit, understand your audience, identify brand
                  opportunities, and create a custom business roadmap. This roadmap will be
                  shared with you and evaluated internally by Wavelaunch VC to ensure we can
                  deliver the best possible outcome for your brand.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center pt-8"
          >
            <Button
              size="lg"
              onClick={() => router.push('/apply')}
              className="gradient-luxury text-white px-12 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              Start Application
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="mt-4 text-sm text-slate-500">
              The application takes approximately 15-20 minutes to complete
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-16 text-slate-500 text-sm"
        >
          <p>
            Learn more about Wavelaunch VC at{' '}
            <a
              href={process.env.NEXT_PUBLIC_WAVELAUNCH_URL || 'https://wavelaunch.vc'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              wavelaunch.vc
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
