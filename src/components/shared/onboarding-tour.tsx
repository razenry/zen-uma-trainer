'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle, Gamepad2, X } from 'lucide-react'

const TOUR_STEPS = [
  {
    title: "Welcome to Uma Trainer AI",
    desc: "Platform asisten komprehensif untuk melatih Uma Musume Anda. Dilengkapi dengan AI Advisor pintar, simulator latihan real-time, data analyzer gacha, serta database terlengkap.",
    icon: Gamepad2,
    color: "text-violet-400 bg-violet-500/10 border-violet-500/20"
  },
  {
    title: "Setup Your Collection",
    desc: "Langkah pertama: Daftarkan Uma Musume dan Support Card yang Anda miliki di menu Ownership Tracker. AI akan menyesuaikan rekomendasi gacha serta build berdasarkan koleksi Anda.",
    icon: Sparkles,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
  {
    title: "Build Planner & Skill Optimizer",
    desc: "Rancang target latihan menggunakan Build Planner. Dapatkan rekomendasi statistik akhir dan gunakan Skill Optimizer untuk melihat tingkatan tier skill (S/A/B) terbaik sesuai strategi lari.",
    icon: ArrowRight,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    title: "Training Simulator & AI Advisor",
    desc: "Simulasikan 72 turn latihan penuh di Training Simulator. Gunakan saran real-time dari AI Advisor untuk memilih tindakan terbaik (Train/Rest) dengan analisa risiko kelelahan otomatis.",
    icon: Sparkles,
    color: "text-teal-400 bg-teal-500/10 border-teal-500/20"
  },
  {
    title: "Live Events & Meta Center",
    desc: "Persiapkan tim terbaik untuk turnamen Champion Meeting dan League Of Heroes. Analisis statistik lintasan, cuaca, track, serta susun line-up dengan Team Builder.",
    icon: CheckCircle,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
  },
  {
    title: "Setup Selesai!",
    desc: "Anda sekarang siap melatih Uma Musume terbaik Anda! Klik tombol di bawah untuk mulai menjelajahi seluruh fitur asisten digital ini.",
    icon: CheckCircle,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  }
]

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if onboarding is complete
    const isComplete = localStorage.getItem('uma_onboarding_complete')
    if (!isComplete) {
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleClose()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleClose = () => {
    localStorage.setItem('uma_onboarding_complete', '1')
    setIsOpen(false)
  }

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStep]
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-350">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between min-h-[320px] animate-in zoom-in-95 duration-250">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex gap-1.5 mb-6">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= currentStep ? 'bg-violet-500' : 'bg-zinc-900'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${step.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-display">
              {step.title}
            </h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pt-1">
            {step.desc}
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between border-t border-zinc-900 pt-5 mt-6">
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md shadow-violet-600/10"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              {currentStep < TOUR_STEPS.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
