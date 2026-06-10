'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layers, Sparkles, AlertCircle, HelpCircle, Loader2 } from 'lucide-react'

export default function SupportDeckOptimizerPage() {
  const [characterId, setCharacterId] = useState<string>('char_special_week')
  const [scenario, setScenario] = useState<string>('URA Scenario')

  // Fetch Characters
  const { data: characters = [], isLoading: charsLoading } = useQuery<any[]>({
    queryKey: ['characters'],
    queryFn: () => fetch('/api/characters').then(res => res.json())
  })

  // Fetch Supports
  const { data: supports = [], isLoading: supportsLoading } = useQuery<any[]>({
    queryKey: ['supportCards'],
    queryFn: () => fetch('/api/supports').then(res => res.json())
  })

  const isLoading = charsLoading || supportsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  const selectedChar = characters.find(c => c.id === characterId)

  // Optimization Logic depending on Scenario
  let bestCards: any[] = []
  let alternativeCards: any[] = []
  let budgetCards: any[] = []

  let rationale = 'Membuat rekomendasi deck berdasarkan prioritas statistik skenario.'

  if (supports.length > 0) {
    const kitasan = supports.find(s => s.id === 'card_kitasan_black')
    const creek = supports.find(s => s.id === 'card_super_creek')
    const fine = supports.find(s => s.id === 'card_fine_motion')
    const condor = supports.find(s => s.id === 'card_el_condor_pasa')

    if (scenario.includes('Arc') || scenario.includes('L\'Arc')) {
      // L'Arc: Needs Stamina and Speed
      bestCards = [kitasan, creek].filter(Boolean)
      alternativeCards = [condor, fine].filter(Boolean)
      budgetCards = [
        { name: 'Marvelous Sunday (SR) - Wisdom', type: 'Wisdom' },
        { name: 'Mayano Top Gun (SR) - Speed', type: 'Speed' }
      ]
      rationale = `Skenario Project L'Arc membutuhkan stamina yang tinggi untuk Prix de l'Arc de Triomphe (2400m). Kitasan Black (Speed) dan Super Creek (Stamina) adalah paduan mutlak untuk mencapai target.`
    } else if (scenario.includes('UAF') || scenario.includes('U.A.F')) {
      // UAF: Needs Speed and Power
      bestCards = [kitasan, condor].filter(Boolean)
      alternativeCards = [creek, fine].filter(Boolean)
      budgetCards = [
        { name: 'Mihono Bourbon (SR) - Power', type: 'Power' },
        { name: 'Daitaku Helios (SR) - Speed', type: 'Speed' }
      ]
      rationale = `Skenario U.A.F berfokus pada kekuatan fisik ekstrem untuk memenangkan trial olahraga. Kombinasi Kitasan Black (Speed) dan El Condor Pasa (Power) memberikan peningkatan status latihan tertinggi.`
    } else {
      // Default / URA: Balanced
      bestCards = [kitasan, fine, creek].filter(Boolean)
      alternativeCards = [condor].filter(Boolean)
      budgetCards = [
        { name: 'Sweep Tosho (SR) - Speed', type: 'Speed' },
        { name: 'Tosen Jordan (SR) - Speed', type: 'Speed' }
      ]
      rationale = `Latihan URA Finals sangat seimbang. Menggabungkan Speed, Stamina, dan Wisdom adalah rancangan paling stabil bagi pemula.`
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Support Deck Optimizer</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Optimalkan komposisi dek kartu bantuan Anda sesuai dengan Uma Musume pilihan dan skenario latihan yang dituju.
          </p>
        </div>
      </div>

      {/* Select Setup Card */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" /> Konfigurasi Target Optimasi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Character */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Pilih Uma Musume</label>
            <select
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-all cursor-pointer"
            >
              {characters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Scenario */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Pilih Skenario Pelatihan</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-all cursor-pointer"
            >
              <option value="URA Scenario">URA Scenario (Balanced)</option>
              <option value="L'Arc Scenario">L&apos;Arc Scenario (Endurance / Stamina)</option>
              <option value="UAF Scenario">U.A.F Scenario (Speed / Power)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rationale description card */}
      <div className="bg-violet-950/10 border border-violet-900/30 rounded-xl p-4 flex gap-3 text-xs text-zinc-300 items-start">
        <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <span className="font-extrabold text-violet-400 block uppercase tracking-wider text-[10px]">Analisis Strategi AI</span>
          <p className="leading-relaxed">{rationale}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Deck */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">Best Deck Recommended</h3>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Top Tier</span>
          </div>

          <div className="space-y-2.5">
            {bestCards.map((card, idx) => (
              <div key={idx} className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="block font-bold text-white">{card.name}</span>
                  <span className="block text-[10px] text-zinc-500 mt-1 uppercase font-semibold">{card.type} Card</span>
                </div>
                <span className="text-[10px] font-bold text-violet-400">SSR</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Deck */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">Alternative Deck</h3>
            <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Balanced</span>
          </div>

          <div className="space-y-2.5">
            {alternativeCards.map((card, idx) => (
              <div key={idx} className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="block font-bold text-white">{card.name}</span>
                  <span className="block text-[10px] text-zinc-500 mt-1 uppercase font-semibold">{card.type} Card</span>
                </div>
                <span className="text-[10px] font-bold text-violet-400">SSR</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Deck */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">Budget/F2P Deck</h3>
            <span className="text-[10px] font-extrabold text-zinc-400 bg-zinc-700/40 border border-zinc-700/50 px-2 py-0.5 rounded-full uppercase tracking-wider">F2P Friendly</span>
          </div>

          <div className="space-y-2.5">
            {budgetCards.map((card, idx) => (
              <div key={idx} className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="block font-bold text-white">{card.name}</span>
                  <span className="block text-[10px] text-zinc-500 mt-1 uppercase font-semibold">{card.type} Card</span>
                </div>
                <span className="text-[10px] font-bold text-amber-500">SR</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
