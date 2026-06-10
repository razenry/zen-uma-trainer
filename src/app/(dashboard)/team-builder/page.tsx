'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Swords, Check, Trash2, Shield, Plus, HelpCircle, Loader2, Sparkles } from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'

export default function TeamBuilderPage() {
  const [teamSize, setTeamSize] = useState<3 | 6>(3)
  const [teamType, setTeamType] = useState<'Standard' | 'Champion Meeting' | 'League of Heroes'>('Standard')
  const [selectedSlots, setSelectedSlots] = useState<Record<number, string>>({})

  // Fetch Characters
  const { data: characters = [], isLoading } = useQuery<any[]>({
    queryKey: ['characters'],
    queryFn: () => fetch('/api/characters').then(res => res.json())
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  const handleSelectSlot = (slotIndex: number, charId: string) => {
    // Check if character is already selected in another slot
    const alreadySelected = Object.entries(selectedSlots).some(([idx, id]) => parseInt(idx) !== slotIndex && id === charId)
    if (alreadySelected) return // Avoid duplicate characters in the team

    setSelectedSlots(prev => ({
      ...prev,
      [slotIndex]: charId
    }))
  }

  const handleRemoveSlot = (slotIndex: number) => {
    setSelectedSlots(prev => {
      const next = { ...prev }
      delete next[slotIndex]
      return next
    })
  }

  const handleTeamTypeChange = (type: typeof teamType) => {
    setTeamType(type)
    setSelectedSlots({}) // Reset selections
    if (type === 'Standard') {
      setTeamSize(3)
    } else {
      setTeamSize(3)
    }
  }

  // Analytics Calculations
  const activeTeamSize = teamType === 'Standard' ? teamSize : 3
  const selectedChars = Object.values(selectedSlots).map(id => characters.find(c => c.id === id)).filter(Boolean) as any[]

  // Compute Team Synergy
  let synergyPercent = 0
  let synergyStatus = 'No Team Formed'
  let synergyDesc = 'Isi slot tim Anda untuk memulai analisis sinergi taktis.'
  let synergyColor = 'text-zinc-400 bg-zinc-900/60 border-zinc-800'

  // Compute Team Score
  let totalScore = 0

  // Weakness Analysis Bullets
  const weaknesses: string[] = []

  if (selectedChars.length > 0) {
    totalScore = selectedChars.length * 12500 // Base score per character

    // Analyze Running Styles (Runner, Leader, Betweener, Chaser)
    const styles = selectedChars.map(c => c.runningStyle?.split(', ')[0] || 'Leader')
    const uniqueStyles = Array.from(new Set(styles))
    
    // Analyze Distance suits
    const distances = selectedChars.map(c => c.distanceType?.split(', ')[0] || 'Medium')
    const uniqueDistances = Array.from(new Set(distances))

    if (teamType === 'Champion Meeting') {
      // In CM, having 1 Runner and 2 Behinders (Betweener/Chaser) or similar is common.
      // Having duplicate styles might block each other.
      const hasDuplicates = styles.length !== uniqueStyles.length
      if (hasDuplicates) {
        synergyPercent = 60
        synergyStatus = 'Sinergi Sedang'
        synergyDesc = 'Terdapat karakter dengan Running Style yang sama. Hal ini dapat meningkatkan risiko pemblokiran jalur (blocking) di fase akhir balapan.'
        synergyColor = 'text-amber-400 bg-amber-950/15 border-amber-900/40'
        weaknesses.push('Risko blocking tinggi akibat running style duplikat.')
      } else {
        synergyPercent = 95
        synergyStatus = 'Sinergi Sangat Baik'
        synergyDesc = 'Penyebaran Running Style optimal (e.g. Runner + Leader + Betweener). Memungkinkan kontrol pacing balapan dari depan hingga barisan belakang.'
        synergyColor = 'text-emerald-400 bg-emerald-950/15 border-emerald-900/40'
      }
    } else if (teamType === 'League of Heroes') {
      // LOH rewards consistency. Having robust, high-rank characters is important.
      synergyPercent = 85
      synergyStatus = 'Sinergi LOH Solid'
      synergyDesc = 'Kombinasi tim seimbang untuk memaksimalkan akumulasi skor poin konsistensi balap.'
      synergyColor = 'text-blue-400 bg-blue-950/15 border-blue-900/40'
    } else {
      // Standard 3/6 Uma Team
      const fillRate = selectedChars.length / activeTeamSize
      synergyPercent = Math.round(fillRate * 90)
      synergyStatus = 'Sinergi Terhitung'
      synergyDesc = `Tim terisi ${selectedChars.length}/${activeTeamSize}. Lengkapi seluruh slot untuk hasil optimal.`
      synergyColor = 'text-violet-400 bg-violet-950/15 border-violet-900/40'
    }

    // Common weakness checks
    if (uniqueDistances.length > 1) {
      weaknesses.push('Spesialisasi jarak tidak konsisten lintas anggota tim.')
    }
    if (selectedChars.some(c => c.rarity < 3)) {
      weaknesses.push('Terdapat karakter dengan bintang awal rendah (< 3★). Butuh peningkatan bakat.')
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Tidak ada kelemahan taktis kritis yang terdeteksi. Tim siap balapan!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-1.5">
            Team Builder
            <HelpTooltip content="Bangun tim terbaik untuk LoH." />
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Bentuk tim Uma Musume Anda untuk turnamen Champion Meeting, League of Heroes, atau Team Stadium dan analisa kekuatan sinerginya.
          </p>
        </div>
      </div>

      {/* Select Mode Toolbar */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Mode Tim:</span>
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-semibold">
            {(['Standard', 'Champion Meeting', 'League of Heroes'] as const).map(t => (
              <button
                key={t}
                onClick={() => handleTeamTypeChange(t)}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                  teamType === t ? 'bg-violet-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {teamType === 'Standard' && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Ukuran Tim:</span>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-semibold">
              {[3, 6].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setTeamSize(s as any)
                    setSelectedSlots({})
                  }}
                  className={`px-3.5 py-1.5 rounded-md cursor-pointer transition-all ${
                    teamSize === s ? 'bg-violet-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {s} Uma
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team Slots */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Swords className="w-4 h-4 text-violet-400" />
            Susunan Tim Aktif ({activeTeamSize} Slot)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(activeTeamSize)].map((_, index) => {
              const charId = selectedSlots[index]
              const char = characters.find(c => c.id === charId)
              
              return (
                <div 
                  key={index} 
                  className={`border rounded-2xl p-5 flex flex-col justify-between items-center text-center gap-4 min-h-[200px] relative ${
                    char 
                      ? 'bg-zinc-900/30 border-zinc-800' 
                      : 'bg-zinc-950/20 border-zinc-900 border-dashed'
                  }`}
                >
                  {char && (
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="absolute top-3 right-3 p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-md cursor-pointer transition-all border border-transparent hover:border-red-900/30"
                      title="Remove from slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <span className="absolute top-3 left-3 text-[10px] font-extrabold text-zinc-600 uppercase tracking-widest">
                    Uma {index + 1}
                  </span>

                  {char ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl shadow-inner mt-4">
                        🏇
                      </div>
                      <div className="space-y-1">
                        <span className="block text-sm font-bold text-white">{char.name}</span>
                        <span className="block text-[10px] text-zinc-500 font-semibold uppercase">
                          {char.runningStyle?.split(', ')[0]} • {char.distanceType?.split(', ')[0]}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-zinc-900/10 border border-zinc-800/40 border-dashed flex items-center justify-center text-2xl text-zinc-700 mt-4">
                        +
                      </div>
                      <div className="w-full space-y-2">
                        <select
                          onChange={(e) => handleSelectSlot(index, e.target.value)}
                          defaultValue=""
                          className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-400 outline-none cursor-pointer transition-all"
                        >
                          <option value="" disabled>Pilih Uma Musume</option>
                          {characters
                            .filter(c => !Object.values(selectedSlots).includes(c.id))
                            .map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="space-y-6">
          {/* Synergy Overview Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" /> Analisis Sinergi Tim
              <HelpTooltip content="Kesesuaian antar anggota tim." />
            </h3>

            {/* Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 font-semibold">Skor Sinergi:</span>
                <span className="text-white font-mono font-bold">{synergyPercent}%</span>
              </div>
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-violet-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${synergyPercent}%` }}
                />
              </div>
            </div>

            {/* Synergy Details */}
            <div className={`p-4 border rounded-xl space-y-2 text-xs ${synergyColor}`}>
              <span className="font-extrabold uppercase block tracking-wider text-[10px]">
                {synergyStatus}
              </span>
              <p className="leading-relaxed text-zinc-300">
                {synergyDesc}
              </p>
            </div>
          </div>

          {/* Weakness Analysis Panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" /> Deteksi Kelemahan Taktis
              <HelpTooltip content="Analisis kelemahan tim." />
            </h3>

            <ul className="space-y-2.5">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs">
                  <span className="text-rose-400 text-sm mt-0.5">•</span>
                  <span className="text-zinc-300 leading-snug">{w}</span>
                </li>
              ))}
              {selectedChars.length === 0 && (
                <li className="text-zinc-500 text-xs text-center py-4">Isi slot tim untuk melihat hasil analisis kerentanan.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
