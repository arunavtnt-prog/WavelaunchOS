'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function ApplyIntroPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Content (Dark Mode with subtle gradient) */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-black via-black to-[#0a0a0a] flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-16 lg:py-0 min-h-[60vh] lg:min-h-screen relative">
        {/* Subtle vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md mx-auto relative z-10 w-full"
        >

          {/* Heading */}
          <div className="mb-8 overflow-visible">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#f97316] shrink-0" />
              <h1 className="text-[26px] leading-tight text-white whitespace-nowrap" style={{ fontFamily: 'HelveticaNeue-Medium, "Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 400 }}>
                Apply to Wavelaunch Studio
              </h1>
            </div>
            <div className="h-px w-full bg-white opacity-30 mt-4" />
          </div>

          {/* Subtitle */}
          <p className="text-zinc-400 mb-6">
            Each application is reviewed individually and deliberately.
          </p>

          {/* Body */}
          <p className="text-zinc-300 text-base leading-relaxed mb-12">
            We&apos;re not looking for pitch decks or polished business plans—we want to understand who you are, what you&apos;ve built so far, and whether we&apos;re the right partners to help you scale it into a real company.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <Link href="/apply" className="block">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 bg-white text-black text-xs tracking-[0.2em] uppercase font-medium rounded-[3px] hover:bg-zinc-100 transition-all duration-200"
              >
                START APPLICATION
              </motion.button>
            </Link>
            <a href="https://studio.wavelaunch.org" className="block">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 bg-transparent border border-zinc-700 text-zinc-300 text-xs tracking-[0.2em] uppercase font-medium rounded-[3px] hover:border-zinc-500 hover:text-white transition-all duration-200"
              >
                RETURN TO STUDIO
              </motion.button>
            </a>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-600 mt-12">
            Already have an account?{' '}
            <a
              href="https://login.wavelaunch.org"
              className="text-zinc-500 hover:text-white transition-colors duration-200"
            >
              Log in
            </a>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Hero Image */}
      <div className="w-full lg:w-1/2 h-[40vh] lg:h-auto lg:min-h-screen relative overflow-hidden">
        <Image
          src="/bg-hero.jpg"
          alt="Creator"
          fill
          className="object-cover"
          quality={100}
          priority
        />
        {/* Subtle edge gradient for seamless blend */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
