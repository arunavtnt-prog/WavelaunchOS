import NextAuth from 'next-auth'
import { authConfig } from './config'

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Export authConfig as authOptions for backward compatibility
export const authOptions = authConfig
