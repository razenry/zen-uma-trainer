'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Gamepad2, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Please confirm your password' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

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

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a letter', pass: /[a-zA-Z]/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="mt-1.5 space-y-1">
      {checks.map((c, i) => (
        <div key={i} className={`flex items-center gap-1.5 text-[10px] ${c.pass ? 'text-emerald-400' : 'text-zinc-500'}`}>
          <CheckCircle2 className={`w-3 h-3 ${c.pass ? 'text-emerald-400' : 'text-zinc-700'}`} />
          {c.label}
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [watchedPassword, setWatchedPassword] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  // Watch password for strength indicator
  React.useEffect(() => {
    const sub = watch((value) => setWatchedPassword(value.password || ''))
    return () => sub.unsubscribe()
  }, [watch])

  const onSubmit = async (data: RegisterForm) => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })
      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Registration failed. Please try again.')
        return
      }

      // Auto sign-in after registration
      const signInRes = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInRes?.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        // Redirect to login with success flag
        router.push('/login?registered=1')
      }
    } catch {
      setError('A system error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setError('Google sign-up failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  const isAnyLoading = loading || googleLoading

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-radial from-zinc-900 via-black to-black p-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-indigo-600/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl mb-3">
            <Gamepad2 className="w-8 h-8 text-violet-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
            Join Zen Uma Trainer
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Create your trainer account for free</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-950/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Create Account</h2>
          <p className="text-xs text-zinc-500 mb-5">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-xs text-red-400 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Google Sign-Up Button */}
          <button
            onClick={handleGoogleSignUp}
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
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-zinc-950/80 text-zinc-500 tracking-wider">OR CREATE WITH EMAIL</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your trainer name"
                {...register('name')}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all"
              />
              {errors.name && (
                <span className="text-[10px] text-red-500 mt-1 block">{errors.name.message}</span>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                placeholder="trainer@example.com"
                {...register('email')}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all"
              />
              {errors.email && (
                <span className="text-[10px] text-red-500 mt-1 block">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  {...register('password')}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[10px] text-red-500 mt-1 block">{errors.password.message}</span>
              )}
              <PasswordStrength password={watchedPassword} />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  {...register('confirmPassword')}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] text-red-500 mt-1 block">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl py-3 shadow-lg shadow-violet-500/10 cursor-pointer disabled:opacity-50 transition-all mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-[10px] text-zinc-600 text-center mt-4">
            By creating an account, you agree to our{' '}
            <span className="text-zinc-500">Terms of Service</span> and{' '}
            <span className="text-zinc-500">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
