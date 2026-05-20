import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db/prisma';
import type { User } from '@prisma/client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        // Check if user is locked out
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        const isValid = await compare(credentials.password as string, user.passwordHash);

        if (!isValid) {
          // Increment failed login count
          const failedCount = user.failedLoginCount + 1;
          const lockedUntil = failedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: failedCount,
              lockedUntil,
            },
          });

          return null;
        }

        // Reset failed login count and update last login
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        // Only allow ADMIN users
        if (user.role !== 'ADMIN') {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
