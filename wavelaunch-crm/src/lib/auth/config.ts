import { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { loginSchema } from '@/schemas/auth'
import {
  isAccountLocked,
  getLockoutTimeRemaining,
  handleFailedLogin,
  handleSuccessfulLogin,
  verifyPassword,
  isSessionExpired,
} from './security'

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          const { email, password } = loginSchema.parse(credentials)

          // Check if account is locked
          const locked = await isAccountLocked(email)
          if (locked) {
            const remaining = await getLockoutTimeRemaining(email)
            throw new Error(
              `Account is locked due to multiple failed login attempts. Please try again in ${remaining} minutes.`
            )
          }

          // Find user
          const user = await db.user.findUnique({
            where: { email },
          })

          if (!user) {
            // Don't reveal that user doesn't exist - just log failed attempt
            // We can't get request details here, so we'll use placeholder
            await handleFailedLogin(email, 'unknown', 'unknown', 'invalid_credentials')
            return null
          }

          // Verify password
          const isValidPassword = await verifyPassword(password, user.passwordHash)

          if (!isValidPassword) {
            // Log failed attempt and handle lockout
            await handleFailedLogin(email, 'unknown', 'unknown', 'invalid_password')
            return null
          }

          // Successful login - log it and reset failed attempts
          await handleSuccessfulLogin(user.id, email, 'unknown', 'unknown')

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          // If it's our lockout error, re-throw it
          if (error instanceof Error && error.message.includes('Account is locked')) {
            throw error
          }
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // Check if session has expired
        const expired = await isSessionExpired(token.id as string)
        if (expired) {
          // Session expired - return null to force re-authentication
          throw new Error('Session expired. Please log in again.')
        }

        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
}
