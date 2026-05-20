'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Instrument_Serif } from 'next/font/google'

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
})

export default function SuccessPage() {

  const wavelaunchUrl = process.env.NEXT_PUBLIC_WAVELAUNCH_URL || 'https://wavelaunch.vc'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Minimal Status Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 border-2 border-green-500/30 rounded-full mb-8"
          >
            <div className="w-2 h-2 bg-green-500/60 rounded-full"></div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className={`text-5xl md:text-[56px] font-bold text-foreground mb-4 ${instrumentSerif.className}`}>
              Application Submitted
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your application is now under review.
            </p>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <Card className="glass-effect border border-border bg-card/50">
              <CardContent className="p-8">
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    What happens next
                  </h2>
                  <ol className="space-y-4 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="text-foreground font-medium">1.</span>
                      <span>A confirmation email will be sent shortly.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-foreground font-medium">2.</span>
                      <span>Our team will review your application across audience, category, and brand potential.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-foreground font-medium">3.</span>
                      <span>Reviews typically take 5–7 business days.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-foreground font-medium">4.</span>
                      <span>If selected, you will receive next steps via email.</span>
                    </li>
                  </ol>
                  <p className="text-sm text-muted-foreground mt-6 italic">
                    You do not need to take any further action at this time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            <Button
              size="lg"
              onClick={() => window.open('https://studio.wavelaunch.org/documentation', '_blank')}
              className="bg-primary text-primary-foreground px-8 py-6 text-lg"
            >
              Download the D26 Overview
              <ExternalLink className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-sm text-slate-500 max-w-md mx-auto">
              This document outlines our program structure, execution model, and partnership terms.
            </p>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-12 text-slate-600"
          >
            <p className="text-sm">
              For inquiries, contact our team.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
