import { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import { loginSchema } from '@/schemas/auth'
import { Role } from '@prisma/client'
import { compare } from 'bcryptjs'
import NextAuth from 'next-auth'

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

          // Find user
          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) {
            return null
          }

          // Verify password using simple bcrypt compare
          const isValidPassword = await compare(password, user.passwordHash)

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  basePath: '/api/auth',
  pages: {
    signIn: '/login',
    error: '/login',
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
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  session: {
    strategy: 'jwt',
  },
}

// Export auth, signIn, signOut for direct import from config
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Export authConfig as authOptions for backward compatibility
export const authOptions = authConfig
