import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // ── Google OAuth Provider ───────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // ── Email / Password Provider ───────────────────────────────────────────
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        // Guest Mode bypass (no password needed)
        if (credentials.email === 'guest@zenuma.com') {
          return {
            id: 'guest-id',
            name: 'Guest Trainer',
            email: 'guest@zenuma.com',
            role: 'USER',
            avatar: '/avatars/default.png',
            provider: 'credentials',
          }
        }

        if (!credentials.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          // User exists but only has OAuth account
          return null
        }

        // Compare hashed password
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) {
          // Fallback for legacy plain-text seeded passwords
          if (user.password !== credentials.password) return null
        }

        if (user.suspended) return null

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => {}) // Non-blocking

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar || user.image || '/avatars/default.png',
          provider: 'credentials',
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt', // Use JWT for credentials; adapter handles DB sessions for OAuth
  },

  callbacks: {
    // ── Called when a new sign-in attempt happens ──────────────────────────
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false
        return true
      }
      return true
    },

    // ── JWT callback: persist user data in token ───────────────────────────
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role ?? 'USER'
        const avatar = (user as any).avatar
        token.avatar = (!avatar || avatar === '/avatars/default.png')
          ? (user.image || '/avatars/default.png')
          : avatar
        token.provider = account?.provider ?? 'credentials'
      }
      return token
    },

    // ── Session callback: expose token data to client ──────────────────────
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).avatar = token.avatar
        ;(session.user as any).provider = token.provider
      }
      return session
    },
  },

  events: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => {})
      }
    },
    async linkAccount({ user, account }) {
      if (account?.provider === 'google' && user?.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: account.providerAccountId,
            emailVerified: new Date(),
          },
        }).catch(() => {})
      }
    },
    async createUser({ user }) {
      if (user?.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            avatar: user.image || '/avatars/default.png',
          },
        }).catch(() => {})
      }
    },
  },

  pages: {
    signIn: '/login',
    error: '/login', // Redirect auth errors to login with ?error= param
  },

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'zen-uma-fallback-secret',

  debug: process.env.NODE_ENV === 'development',
}
