'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles, Save, Ticket, HelpCircle, Check, Loader2, Coins } from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'

export default function ResourcePlannerPage() {
  const queryClient = useQueryClient()
  const [jewels, setJewels] = useState<number>(3000)
  const [tickets, setTickets] = useState<number>(5)
  const [ssrTickets, setSsrTickets] = useState<number>(1)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  // Fetch Profile data
  const { data: profileData, isLoading } = useQuery<any>({
    queryKey: ['profile'],
    queryFn: () => fetch('/api/profile').then(res => res.json()),
  })

  // Sync states on load
  useEffect(() => {
    if (profileData?.user) {
      setJewels(profileData.user.jewels ?? 3000)
      setTickets(profileData.user.tickets ?? 5)
      setSsrTickets(profileData.user.ssrTickets ?? 1)
    }
  }, [profileData])

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (updatedFields: any) =>
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      }).then(res => res.json()),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(['profile'], (old: any) => ({
          ...old,
          user: {
            ...old.user,
            ...data.data
          }
        }))
        setSaveStatus('Resources saved successfully!')
        setTimeout(() => setSaveStatus(null), 3000)
      }
    }
  })

  const handleSave = () => {
    saveMutation.mutate({ jewels, tickets, ssrTickets })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  // Calculations
  const jewelPulls = Math.floor(jewels / 150)
  const totalPulls = jewelPulls + tickets
  const sparkProgress = Math.min(100, Math.round((totalPulls / 200) * 100))
  const pullsToSpark = Math.max(0, 200 - totalPulls)
  const jewelsToSpark = pullsToSpark * 150

  // Pull Recommendations
  let recType: 'save' | 'pull' = 'save'
  let recTitle = 'Rekomendasi: Hemat & Tabung!'
  let recDesc = `Saat ini Anda memiliki ${totalPulls} tarikan. Kami menyarankan untuk menyimpan jewels hingga mencapai minimal 200 tarikan (30.000 Jewels) guna menjamin batas jaminan (Spark) pada banner meta.`
  
  if (totalPulls >= 200) {
    recType = 'pull'
    recTitle = 'Rekomendasi: Siap Melakukan Pull!'
    recDesc = `Selamat! Sumber daya Anda sudah melampaui batas Spark (200 tarikan). Anda memiliki jaminan untuk mendapatkan karakter/kartu target pilihan pada banner berikutnya.`
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Resource Planner</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Rencanakan dan hitung akumulasi jewels serta tiket tarikan Anda untuk bersiap menghadapi banner meta berikutnya.
          </p>
        </div>

        {saveStatus && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-xs font-semibold animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            {saveStatus}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Resource Input Form */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-4">
            <Coins className="w-4 h-4 text-violet-400" />
            Kelola Sumber Daya Gacha Anda
          </h2>

          <div className="space-y-5">
            {/* Jewels */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  Total Jewels
                  <HelpTooltip content="Mata uang utama untuk gacha." />
                </label>
                <span className="text-sm font-extrabold text-violet-400 font-mono">{jewels.toLocaleString()}</span>
              </div>
              <input
                type="number"
                value={jewels}
                onChange={(e) => setJewels(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:border-violet-500 outline-none transition-all font-mono"
                placeholder="e.g. 30000"
              />
              <span className="block text-[10px] text-zinc-500">Setara dengan {jewelPulls} kali tarikan tunggal.</span>
            </div>

            {/* Draw Tickets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    Single Draw Tickets
                    <HelpTooltip content="Tiket yang dapat digunakan untuk pull." />
                  </label>
                  <span className="text-sm font-extrabold text-zinc-300 font-mono">{tickets}</span>
                </div>
                <input
                  type="number"
                  value={tickets}
                  onChange={(e) => setTickets(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:border-violet-500 outline-none transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Guaranteed SSR Tickets</label>
                  <span className="text-sm font-extrabold text-zinc-300 font-mono">{ssrTickets}</span>
                </div>
                <input
                  type="number"
                  value={ssrTickets}
                  onChange={(e) => setSsrTickets(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:border-violet-500 outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-violet-600/10 cursor-pointer disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Simpan Rencana
            </button>
          </div>
        </div>

        {/* Right Column: AI Analysis & Progress */}
        <div className="space-y-6">
          {/* Progress Circular/Standard Dashboard Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Estimasi Tabungan Spark
            </h3>

            {/* Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 font-semibold flex items-center gap-1">
                  Progres Spark:
                  <HelpTooltip content="Apakah resource cukup untuk spark." />
                </span>
                <span className="text-white font-mono font-bold">{totalPulls} / 200 ({sparkProgress}%)</span>
              </div>
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    sparkProgress >= 100 ? 'bg-emerald-500' : sparkProgress >= 50 ? 'bg-amber-500' : 'bg-violet-500'
                  }`}
                  style={{ width: `${sparkProgress}%` }}
                />
              </div>
            </div>

            {/* Missing points */}
            {pullsToSpark > 0 ? (
              <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs space-y-1">
                <p className="text-zinc-400">
                  Kurang <strong className="text-amber-400 font-bold">{pullsToSpark} tarikan</strong> lagi untuk jaminan.
                </p>
                <p className="text-zinc-500 text-[10px]">
                  Atau setara dengan tambahan <strong className="text-zinc-300 font-semibold">{jewelsToSpark.toLocaleString()} Jewels</strong>.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-xs text-emerald-400">
                Luar biasa! Akumulasi tarikan Anda saat ini sudah mencukupi target Spark.
              </div>
            )}
          </div>

          {/* Recommendations Card */}
          <div className={`border rounded-xl p-5 space-y-3 shadow-xl ${
            recType === 'pull' 
              ? 'bg-emerald-950/15 border-emerald-900/50' 
              : 'bg-violet-950/15 border-violet-900/40'
          }`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              recType === 'pull' ? 'text-emerald-400' : 'text-violet-400'
            }`}>
              <span>{recTitle}</span>
              <HelpTooltip content="Saran menyimpan resource." />
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {recDesc}
            </p>
            
            <div className="flex items-center gap-2.5 pt-1 text-[10px] text-zinc-500 font-semibold border-t border-zinc-900">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Dihitung berdasarkan 150 Jewels/pull.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
