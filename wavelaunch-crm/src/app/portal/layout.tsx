import { redirect } from 'next/navigation'
import { getPortalSession, getPortalUser } from '@/lib/auth/portal-auth'
import { PortalNav } from '@/components/portal/portal-nav'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get session
  const session = await getPortalSession()

  // Protection logic:
  // Instead of a global redirect here which can cause loops,
  // we let the middleware or individual pages handle redirections.


  // Get user data if we have a session
  let userData = null
  if (session) {
    userData = await getPortalUser(session.userId)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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
