'use client'

import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Layers, FileSpreadsheet, ClipboardCheck, ImageIcon, History, ArrowRight, ArrowLeft, CheckCircle, ShieldAlert, X } from 'lucide-react'

const CMS_TOUR_STEPS = [
  {
    title: "CMS Dashboard Guide",
    desc: "Selamat datang di CMS Portal! Di sini Anda dapat memantau ringkasan seluruh data aplikasi, status draft yang sedang aktif, dan statistik entitas database secara real-time.",
    icon: LayoutDashboard,
    color: "text-violet-400 bg-violet-500/10 border-violet-500/20"
  },
  {
    title: "Master Data Management",
    desc: "Kelola data master aplikasi mulai dari Uma Musume (Karakter), Skill, Support Card, Race, hingga Scenario. Semua perubahan di sini akan disimpan sebagai draft terlebih dahulu.",
    icon: Layers,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
  {
    title: "Import Center",
    desc: "Unggah data secara massal menggunakan file CSV atau XLSX. Sistem menyediakan template unduhan dan validasi data otomatis sebelum diimpor ke database.",
    icon: FileSpreadsheet,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    title: "Review Center Workflow",
    desc: "Modul khusus Moderator dan Admin untuk memvalidasi draft yang diajukan oleh Data Entry. Anda dapat menyetujui (Approve) atau menolak (Reject) draft dengan catatan.",
    icon: ClipboardCheck,
    color: "text-teal-400 bg-teal-500/10 border-teal-500/20"
  },
  {
    title: "Media Library",
    desc: "Kelola gambar ikon karakter, ilustrasi support card, dan aset gambar lainnya secara terpusat agar mempermudah pengisian form entitas.",
    icon: ImageIcon,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
  },
  {
    title: "Audit Logs & Security",
    desc: "Pantau seluruh rekam aktivitas sistem (siapa, kapan, dan apa yang diubah). Khusus Admin dapat mengelola hak akses role pengguna untuk menjaga keamanan data.",
    icon: History,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  }
]

export default function CMSTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if CMS tour is complete
    const isComplete = localStorage.getItem('uma_cms_tour_complete')
    if (!isComplete) {
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < CMS_TOUR_STEPS.length - 1) {
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
    localStorage.setItem('uma_cms_tour_complete', '1')
    setIsOpen(false)
  }

  if (!isOpen) return null

  const step = CMS_TOUR_STEPS[currentStep]
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
          {CMS_TOUR_STEPS.map((_, i) => (
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
            <div className="min-w-0">
              <span className="block text-[9px] text-zinc-500 font-extrabold tracking-wider uppercase leading-none mb-1">
                CMS GUIDED TOUR • STEP {currentStep + 1} OF {CMS_TOUR_STEPS.length}
              </span>
              <h3 className="text-base font-bold text-white font-display leading-tight">
                {step.title}
              </h3>
            </div>
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
              {currentStep === CMS_TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              {currentStep < CMS_TOUR_STEPS.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
