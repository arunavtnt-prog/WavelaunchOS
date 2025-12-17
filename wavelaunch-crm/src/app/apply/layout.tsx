import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply - Wavelaunch Studio',
  description: 'Apply to work with Wavelaunch Studio - Creator Partnership Application',
}

// Force dynamic rendering for the apply section
export const dynamic = 'force-dynamic'

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">Wavelaunch Studio</h1>
                <p className="text-xs text-slate-500">Creator Partnership Program</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Wavelaunch Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
