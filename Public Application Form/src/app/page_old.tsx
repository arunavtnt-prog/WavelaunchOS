'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function WelcomePage() {
  const router = useRouter()

  const applicationSteps = [
    {
      id: "01",
      title: "Sub-minute Application",
      description: "Connect your professional identity. No cover letters.",
      time: "INSTANT"
    },
    {
      id: "02",
      title: "Founder Interview",
      description: "Deep dive into your product and market thesis.",
      time: "DAY 1"
    },
    {
      id: "03",
      title: "Due Diligence",
      description: "Rapid validation of technical and commercial claims.",
      time: "DAY 2-3"
    },
    {
      id: "04",
      title: "Investment Decision",
      description: "Standard terms issued 48 hours after review.",
      time: "DAY 5"
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/warm_cinematic_bg.png"
          alt="Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        {/* Vignette Overlay - Stronger Left Anchor */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 via-40% to-transparent opacity-90"></div>
      </div>

      {/* Navigation */}
      <nav className="w-full py-8 px-12 flex justify-between items-center relative z-20">
        <div className="flex gap-8 items-center text-sm font-medium text-white/90">
          <span className="text-white hover:text-white/80 transition-colors cursor-pointer">Wavelaunch Studio</span>
          <a href="#" className="hidden md:block text-white/70 hover:text-white transition-colors">Contact</a>
          <a href="#" className="hidden md:block text-white/70 hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex gap-8 items-center text-sm font-medium">
          <a href="#" className="hidden md:block text-white/50 hover:text-white transition-colors">Overview</a>
          <a href="#" className="hidden md:block text-white/50 hover:text-white transition-colors">Program</a>
          <a href="#" className="hidden md:block text-white/50 hover:text-white transition-colors">Process</a>
          <Button variant="outline" className="bg-transparent border border-white/20 text-white/60 hover:text-white hover:bg-white/5 font-medium px-5 py-2 h-auto rounded text-xs tracking-wider uppercase">
            Download Brochure
          </Button>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen px-12 lg:px-20 pt-[3.125rem] pb-20">

        {/* Left Column: Hero Text */}
        <div className="flex-1 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge - Editorial Eyebrow */}
            <div className="flex items-center gap-4 mb-10 pl-1">
              <div className="w-8 h-[1px] bg-white/40"></div>
              <span className="text-[0.6875rem] font-medium text-white/60 tracking-[0.2em] uppercase">Accelerator Funded by Wavelaunch VC</span>
            </div>

            {/* Headline - Adjusted size */}
            <h1 className="font-serif text-6xl md:text-7xl lg:text-[7rem] leading-[0.9] text-white tracking-tight mb-8">
              Start your D26 <br /> Application.
            </h1>

            {/* Copy */}
            <p className="text-white/80 text-base leading-relaxed max-w-lg mb-6 font-light">
              Most accelerators want a deck and a dream. We want to understand who you are, what you've built, and whether we're the right partners to scale it. This application is the first real conversation.
            </p>

            <p className="text-white/60 text-base leading-relaxed max-w-lg mb-12">
              We invest up to $250K and handle everything—product, branding, manufacturing, marketing, operations. You keep 100% ownership in this exclusive co-founding structure.
            </p>

            {/* CTA & Status */}
            <div className="flex items-center gap-6">
              <Button
                onClick={() => router.push('/apply')}
                className="bg-white text-black hover:bg-white/90 text-sm font-bold tracking-[0.2em] uppercase px-6 py-8 h-auto rounded flex items-center gap-3 transition-transform active:scale-95"
              >
                Start Application
                <ArrowRight className="w-4 h-4" strokeWidth={1} />
              </Button>

              <div className="flex items-center gap-2 text-xs font-medium text-white/80 tracking-wide uppercase">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                2026 Applications Open
              </div>
            </div>

            <div className="mt-6 flex gap-2 text-xs text-white/40">
              <span>✓ Progress automatically saved</span>
              <span>•</span>
              <span>Takes ~15 minutes</span>
            </div>

          </motion.div>
        </div>

        {/* Right Column: Floating Glass Card - Smoked Glass */}
        <div className="hidden lg:flex flex-1 justify-end h-full items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-[36rem] h-auto min-h-[39.5rem] bg-black/40 backdrop-blur-[2.5rem] rounded-[1.75rem] border border-white/10 p-12 flex flex-col justify-center relative overflow-hidden shadow-2xl"
          >
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/[0.05] to-transparent pointer-events-none"></div>

            <div className="mb-10 text-right border-b border-white/10 pb-4">
              <span className="block text-[0.72rem] tracking-[0.3em] uppercase text-white/40 mb-1">Application Flow</span>
              <span className="block text-[1.3rem] font-serif italic text-white/70">Selective Admissions</span>
            </div>

            <div className="space-y-10 relative pl-4">
              {/* Vertical Line - Shifted for new node size */}
              <div className="absolute left-[0.5rem] top-2 bottom-4 w-[1px] bg-white/10"></div>

              {[0, 1, 2, 3].map((i) => (
                <div key={applicationSteps[i].id} className={`relative pl-8 ${i === 0 ? "opacity-100" : i === 1 ? "opacity-70" : i === 2 ? "opacity-40" : "opacity-20"}`}>
                  {/* Line Connector */}
                  {i !== 3 && (
                    <div className="absolute left-[0.36rem] top-8 bottom-[-1.5rem] w-[1px] bg-white/10"></div>
                  )}

                  {/* Node */}
                  <div className={`absolute left-0 top-1.5 w-[0.8rem] h-[0.8rem] rounded-full border border-white/20 ${i === 0 ? "bg-white" : "bg-transparent"}`}></div>

                  <div className="space-y-1">
                    <div className="text-[0.8rem] font-medium tracking-[0.2em] text-white/50 uppercase">Step {applicationSteps[i].id}</div>
                    <div className="text-[1.3rem] font-serif text-white">
                      {applicationSteps[i].title}
                    </div>
                    <div className="text-base font-light text-white/60 leading-relaxed pr-4">
                      {applicationSteps[i].description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
