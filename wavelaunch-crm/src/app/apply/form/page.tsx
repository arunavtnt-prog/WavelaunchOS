'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ApplicationFormPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    stage: '',
    description: '',
    goals: '',
    challenges: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="px-8 py-6 border-b border-zinc-800">
        <Link href="/apply" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
          ← Back to Application
        </Link>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <div className="mb-12">
            <h1 className="font-serif text-5xl text-white mb-4">
              Application Form
            </h1>
            <p className="text-zinc-400 text-lg">
              Tell us about yourself and your project. We review every application personally.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-white">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#f97316] transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#f97316] transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#f97316] transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-zinc-300 mb-2">
                    Company/Project Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#f97316] transition-colors"
                    placeholder="Your Company"
                  />
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-white">Project Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-zinc-300 mb-2">
                    Website (if any)
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#f97316] transition-colors"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="stage" className="block text-sm font-medium text-zinc-300 mb-2">
                    Current Stage *
                  </label>
                  <select
                    id="stage"
                    name="stage"
                    required
                    value={formData.stage}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-[#f97316] transition-colors"
                  >
                    <option value="">Select stage</option>
                    <option value="idea">Idea/Concept</option>
                    <option value="prototype">Prototype</option>
                    <option value="mvp">MVP</option>
                    <option value="early-revenue">Early Revenue</option>
                    <option value="growth">Growth</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#f97316] transition-colors resize-none"
                  placeholder="Describe your project in detail..."
                />
              </div>

              <div>
                <label htmlFor="goals" className="block text-sm font-medium text-zinc-300 mb-2">
                  What are your goals for the next 6 months? *
                </label>
                <textarea
                  id="goals"
                  name="goals"
                  required
                  rows={3}
                  value={formData.goals}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#f97316] transition-colors resize-none"
                  placeholder="What do you want to achieve in the next 6 months?"
                />
              </div>

              <div>
                <label htmlFor="challenges" className="block text-sm font-medium text-zinc-300 mb-2">
                  What are your biggest challenges right now? *
                </label>
                <textarea
                  id="challenges"
                  name="challenges"
                  required
                  rows={3}
                  value={formData.challenges}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#f97316] transition-colors resize-none"
                  placeholder="What obstacles are you currently facing?"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full md:w-auto px-12 py-4 bg-[#f97316] text-white text-xs tracking-[0.2em] uppercase font-medium rounded-[3px] hover:bg-[#ea580c] transition-all duration-200"
              >
                Submit Application
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
