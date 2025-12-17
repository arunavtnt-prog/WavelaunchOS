'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-secondary px-6 py-3 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">Wavelaunch Studio</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to the Wavelaunch Studio Application
          </h1>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            A brand-building accelerator for creators and influencers. We help you launch
            your own profitable D2C businesses with complete end-to-end support.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* What We Offer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>What We Offer</CardTitle>
                <CardDescription>
                  Complete end-to-end support for building your brand
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
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
            <Card>
              <CardHeader>
                <CardTitle>Your Commitment</CardTitle>
                <CardDescription>
                  What we need from you to ensure success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {requirements.map((req, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-sm">{req}</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Why This Form Exists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
              className="px-12"
            >
              Start Application
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              The application takes approximately 15-20 minutes to complete
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-16 text-sm text-muted-foreground"
        >
          <p>
            Learn more about Wavelaunch VC at{' '}
            <a
              href={process.env.NEXT_PUBLIC_WAVELAUNCH_URL || 'https://wavelaunch.vc'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              wavelaunch.vc
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
