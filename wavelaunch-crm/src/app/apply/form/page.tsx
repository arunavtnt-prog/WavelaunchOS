'use client'

import dynamic from 'next/dynamic'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Instrument_Serif, Inter } from 'next/font/google'

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  axes: ["opsz"],
  style: "normal"
});

const ApplicationFormRoot = dynamic(() => import('@/modules/application-form').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
})

export default function ApplyFormPage() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="wavelaunch-theme">
      <style jsx global>{`
        @tailwind base;
        @tailwind components;
        @tailwind utilities;

        @layer base {
          :root {
            /* Light Mode - High Contrast White */
            --background: 0 0% 100%;
            --foreground: 0 0% 0%;
            --card: 0 0% 100%;
            --card-foreground: 0 0% 0%;
            --popover: 0 0% 100%;
            --popover-foreground: 0 0% 0%;
            --primary: 0 0% 9%;
            --primary-foreground: 0 0% 98%;
            --secondary: 0 0% 96.1%;
            --secondary-foreground: 0 0% 9%;
            --muted: 0 0% 96.1%;
            --muted-foreground: 0 0% 45.1%;
            --accent: 0 0% 96.1%;
            --accent-foreground: 0 0% 9%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 0 0% 98%;
            --border: 0 0% 89.8%;
            --input: 0 0% 89.8%;
            --ring: 0 0% 3.9%;
            --radius: 0.5rem;
          }

          .dark {
            /* Warm Near-Black Editorial Theme */
            --background: 240 5% 6%;
            --foreground: 0 0% 92%;
            --card: 240 5% 8%;
            --card-foreground: 0 0% 92%;
            --popover: 240 5% 8%;
            --popover-foreground: 0 0% 92%;
            --primary: 0 0% 92%;
            --primary-foreground: 240 5% 6%;
            --secondary: 240 3% 12%;
            --secondary-foreground: 0 0% 92%;
            --muted: 240 3% 12%;
            --muted-foreground: 240 2% 45%;
            --accent: 240 3% 15%;
            --accent-foreground: 0 0% 92%;
            --destructive: 0 62.8% 30.6%;
            --destructive-foreground: 0 0% 98%;
            --border: 0 0% 20%;
            --input: 0 0% 20%;
            --ring: 0 0% 80%;
            --radius: 0.5rem;
          }
        }

        @layer base {
          * {
            border-color: hsl(var(--border) / 0.5);
          }

          body {
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
          }

          .font-serif {
            font-family: var(--font-serif), Georgia, serif;
          }
        }

        @media (min-width: 1024px) {
          html {
            font-size: 85%;
          }
        }
      `}</style>
      <div className={`${inter.variable} ${instrumentSerif.variable} font-sans antialiased bg-background text-foreground`}>
        <ApplicationFormRoot />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
