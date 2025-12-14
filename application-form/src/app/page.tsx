'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function D26IntroPage() {
    const router = useRouter()

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#FDFBF7] font-sans">
            {/* Left Column: Intro Panel (Replicating Reference Design Style) */}
            <div className="w-full lg:w-[50%] p-12 lg:p-20 flex flex-col justify-center relative">
                <div className="max-w-md mx-auto w-full">
                    {/* Header / Logo Area */}
                    <div className="mb-16">
                        <span className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-gray-900">Wavelaunch Studio.</span>
                    </div>

                    <div>
                        {/* Headline */}
                        <h1 className="font-serif text-5xl md:text-[72px] text-gray-900 mb-4 tracking-tight leading-none">
                            Start your D26<br />Application?
                        </h1>

                        {/* Sub-headline */}
                        <p className="text-gray-400 text-sm mb-12 tracking-wide font-medium">
                            Each application is reviewed individually and deliberately.
                        </p>

                        {/* Form Replacement Content */}
                        <div className="space-y-8">
                            {/* Editorial Copy */}
                            <div className="prose prose-stone">
                                <p className="text-gray-600 text-base leading-relaxed font-light">
                                    Most accelerators want a deck and a dream. We want to understand who you are, what you've built, and whether we're the right partners to scale it.
                                </p>
                            </div>

                            {/* CTA */}
                            <div className="pt-4">
                                <Button
                                    onClick={() => router.push('/apply')}
                                    className="w-full bg-[#1A1A1A] text-white hover:bg-black text-sm font-medium tracking-widest uppercase py-6 h-auto rounded-none transition-all active:scale-[0.98]"
                                >
                                    Start Application
                                </Button>
                            </div>

                            {/* "Google Sign In" Style Alternative Action */}
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = 'https://studio.wavelaunch.org'}
                                className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black text-sm font-medium tracking-widest uppercase py-6 h-auto rounded-none flex items-center justify-center gap-3"
                            >
                                Return to Studio
                            </Button>
                        </div>

                        {/* Footer */}
                        <div className="mt-16 text-center">
                            <p className="text-xs text-gray-400 tracking-wide">
                                Already have an account? <span className="text-gray-900 font-medium cursor-pointer hover:underline">Log in</span>
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Right Column: Visual (Replicating Reference Style) */}
            <div className="hidden lg:block w-full lg:w-[50%] relative bg-black overflow-hidden h-screen">
                <Image
                    src="/d26_right_bg.png"
                    alt="D26 Aesthetic"
                    fill
                    className="object-cover opacity-90"
                    priority
                />

                {/* Overlays - Removed as they are baked into the image */}
                {/* Mirror effect overlay to ensure it blends nicely if needed, otherwise clean image */}
                <div className="absolute inset-0 z-10 pointer-events-none"></div>

                {/* Glitch Overlay Effect - Kept for atmosphere, but reduced intensity */}
                <div className="absolute top-[20%] left-[-10%] w-[120%] h-[20%] bg-white/5 blur-3xl mix-blend-overlay rotate-12 pointer-events-none opacity-50"></div>
            </div>
        </div >
    )
}
