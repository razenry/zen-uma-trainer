'use client'

import React from 'react'
import { Loader2, AlertCircle, Inbox, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-4 max-w-md mx-auto my-6"
    >
      <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl text-zinc-500">
        {icon || <Inbox className="w-8 h-8 text-violet-400" />}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-bold text-white text-base tracking-tight font-display">{title}</h3>
        <p className="text-zinc-400 text-xs leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-550 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}

export function LoadingState({ message = 'Loading records...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-20 space-y-3">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      <p className="text-zinc-400 text-xs font-semibold animate-pulse">{message}</p>
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-red-950/20 border border-red-900/50 rounded-2xl text-center space-y-4 max-w-md mx-auto my-6"
    >
      <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-sm">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>System Error Encountered</span>
      </div>
      <p className="text-red-300/80 text-xs font-mono bg-red-950/40 p-3 rounded-lg border border-red-950/65 overflow-x-auto text-left leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-650 hover:bg-red-555 text-white font-bold text-xs rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </motion.div>
  )
}
