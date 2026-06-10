'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { HelpCircle, Gamepad2, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

type LoginForm = z.infer<typeof loginSchema>

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: 'Google sign-in failed. Please try again.',
  OAuthCallback: 'Google authentication error. Please try again.',
  OAuthCreateAccount: 'Could not create account with Google. Please try email sign-in.',
  EmailCreateAccount: 'Could not create account. Please try again.',
  Callback: 'Authentication callback error.',
  OAuthAccountNotLinked: 'This email is already registered. Sign in with your password to link your Google account.',
  EmailSignin: 'Email sign-in failed. Check your email address.',
  CredentialsSignin: 'Incorrect email or password.',
  SessionRequired: 'Please sign in to continue.',
  Default: 'Authentication error. Please try again.',
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.Default)
    }
    const registered = searchParams.get('registered')
    if (registered === '1') {
      setError(null)
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (res?.error) {
        setError('Incorrect email or password. Please try again.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('A system error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setError('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setError(null)
    setGuestLoading(true)
    try {
      const res = await signIn('credentials', {
        email: 'guest@zenuma.com',
        redirect: false,
      })
      if (res?.error) {
        setError('Guest login failed.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('An error occurred.')
    } finally {
      setGuestLoading(false)
    }
  }


  const isAnyLoading = loading || googleLoading || guestLoading
  const justRegistered = searchParams.get('registered') === '1'

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-radial from-zinc-900 via-black to-black p-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl mb-3">
            <Gamepad2 className="w-8 h-8 text-violet-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
            Zen Uma Trainer
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Global Uma Musume Training Assistant</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-950/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Sign In</h2>
          <p className="text-xs text-zinc-500 mb-5">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Register here
            </Link>
          </p>

          {/* Success registered message */}
          {justRegistered && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/80 text-xs text-emerald-400 flex items-center gap-2">
              <span>✓</span> Account created! Please sign in.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-xs text-red-400 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isAnyLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm rounded-xl py-3 px-4 shadow-sm transition-all disabled:opacity-50 cursor-pointer border border-zinc-200 mb-4"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-zinc-950/80 text-zinc-500 tracking-wider">OR</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="trainer@example.com"
                {...register('email')}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all"
              />
              {errors.email && (
                <span className="text-[10px] text-red-500 mt-1 block">{errors.email.message}</span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all"
              />
              {errors.password && (
                <span className="text-[10px] text-red-500 mt-1 block">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl py-3 shadow-lg shadow-violet-500/10 cursor-pointer disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider: Other Methods */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-zinc-950/80 text-zinc-500">OTHER</span>
            </div>
          </div>

          {/* Guest Mode */}
          <button
            onClick={handleGuestLogin}
            disabled={isAnyLoading}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 font-semibold text-sm rounded-xl py-2.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            {guestLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <HelpCircle className="w-4 h-4 text-violet-400" />
                Continue as Guest
              </>
            )}
          </button>


        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
