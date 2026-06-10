'use client'

import React, { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface HelpTooltipProps {
  content: string
  className?: string
}

export default function HelpTooltip({ content, className = '' }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-zinc-500 hover:text-violet-400 transition-colors p-0.5 rounded cursor-help outline-none"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 rounded-lg shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 leading-relaxed text-center">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45" />
        </div>
      )}
    </div>
  )
}
