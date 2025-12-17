import { redirect } from 'next/navigation'
import { getPortalSession, getPortalUser } from '@/lib/auth/portal-auth'
import { PortalNav } from '@/components/portal/portal-nav'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if this is a public portal page
  const publicPages = ['/portal/login', '/portal/forgot-password', '/portal/reset-password']

  // For public pages, render without auth check
  // This is a simplified check - in production, you'd use middleware
  const isPublicPage = false // Will be determined by middleware

  // Get session
  const session = await getPortalSession()

  // If no session and not a public page, redirect to login
  if (!session && !isPublicPage) {
    // This layout won't apply to login pages due to their own layout
    redirect('/portal/login')
  }

  // Get user data if we have a session
  let userData = null
  if (session) {
    userData = await getPortalUser(session.userId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session && userData && (
        <PortalNav
          user={{
            email: userData.email,
            client: {
              name: userData.client.fullName,
              brandName: userData.client.fullName,
            },
          }}
        />
      )}
      <main className={session ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  )
}
