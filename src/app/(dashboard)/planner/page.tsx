'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePlannerStore } from '@/store/planner.store'
import dynamic from 'next/dynamic'
import { 
  Compass, 
  Sparkles, 
  Activity, 
  Layers, 
  Flame, 
  Check, 
  HelpCircle,
  Loader2 
} from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'

// Dynamically import the PlannerChart component to bypass SSR document/window issues
const PlannerChart = dynamic(() => import('@/components/shared/planner-chart'), {
  ssr: false,
  loading: () => (
    <div className="h-60 w-full flex items-center justify-center bg-zinc-950 border border-zinc-900 rounded-xl">
      <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
    </div>
  )
})

// Targets definitions
const DISTANCE_TARGETS = {
  "Sprint": { speed: 1200, stamina: 400, power: 1000, guts: 300, wisdom: 700 },
  "Mile": { speed: 1250, stamina: 600, power: 1050, guts: 350, wisdom: 800 },
  "Medium": { speed: 1200, stamina: 850, power: 1000, guts: 450, wisdom: 850 },
  "Long": { speed: 1100, stamina: 1050, power: 950, guts: 500, wisdom: 800 }
}

export default function PlannerPage() {
  const plan = usePlannerStore()
  const [selectedScenario, setSelectedScenario] = useState("U.A.F. Ready GO! ☆")
  
  // Fetch setup details
  const { data: characters = [], isLoading: charsLoading } = useQuery<any[]>({
    queryKey: ['characters'],
    queryFn: () => fetch('/api/characters').then(res => res.json())
  })

  const { data: supports = [], isLoading: supportsLoading } = useQuery<any[]>({
    queryKey: ['supportCards'],
    queryFn: () => fetch('/api/supports').then(res => res.json())
  })

  const activeChar = characters.find(c => c.id === plan.characterId)

  // Dynamically update planner target stats when distance changes
  useEffect(() => {
    const targets = DISTANCE_TARGETS[plan.distance]
    plan.updateTargetStats(targets)
  }, [plan.distance])

  if (charsLoading || supportsLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  // Formatting chart data for Recharts
  const chartData = [
    { name: 'Speed', Target: plan.targetStats.speed, Average: 750 },
    { name: 'Stamina', Target: plan.targetStats.stamina, Average: 550 },
    { name: 'Power', Target: plan.targetStats.power, Average: 680 },
    { name: 'Guts', Target: plan.targetStats.guts, Average: 350 },
    { name: 'Wisdom', Target: plan.targetStats.wisdom, Average: 580 },
  ]

  // Filter recommended cards matching target distance/type
  const getDeckRecommendation = () => {
    if (plan.distance === 'Sprint' || plan.distance === 'Mile') {
      return supports.filter(s => s.type === 'Speed' || s.type === 'Power' || s.type === 'Wisdom')
    } else {
      return supports.filter(s => s.type === 'Stamina' || s.type === 'Speed' || s.type === 'Wisdom')
    }
  }

  const recommendedCards = getDeckRecommendation()

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Build Planner</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Rencanakan target statistik Anda berdasarkan jarak balapan dan rancang kecocokan support card meta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planner Inputs Panel */}
        <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-violet-400" />
              Perencanaan Target
            </h2>

            {/* Character Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                Pilih Uma Musume
                <HelpTooltip content="Pilih karakter yang ingin dibangun." />
              </label>
              <select
                value={plan.characterId}
                onChange={(e) => plan.setCharacter(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-all"
              >
                {characters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Distance Suitability */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                Jarak Target Balapan
                <HelpTooltip content="Pilih target jarak race." />
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Sprint', 'Mile', 'Medium', 'Long'].map((dist) => {
                  const isActive = plan.distance === dist
                  return (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => plan.setDistance(dist as any)}
                      className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center ${
                        isActive 
                          ? 'bg-violet-600 border-violet-500 text-white font-extrabold shadow'
                          : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-300'
                      }`}
                    >
                      {dist} Target
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Scenario Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                Pilih Skenario
                <HelpTooltip content="Pilih scenario training." />
              </label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-all"
              >
                {["U.A.F. Ready GO! ☆", "Reach for the stars (L'Arc)", "Grand Masters -Inherit them-", "Make a new track!!"].map(sc => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>

            {/* Running Style */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Gaya Berlari (Style)</label>
              <div className="grid grid-cols-2 gap-2">
                {['Runner', 'Leader', 'Betweener', 'Chaser'].map((style) => {
                  const isActive = plan.style === style
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => plan.setStyle(style as any)}
                      className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center ${
                        isActive 
                          ? 'bg-violet-600 border-violet-500 text-white font-extrabold shadow'
                          : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-300'
                      }`}
                    >
                      {style}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Active Target Stats List */}
          <div className="border-t border-zinc-900 pt-5 space-y-2 text-xs">
            <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              Target Statistik
              <HelpTooltip content="Target stat akhir yang perlu dicapai." />
            </span>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Target Speed:</span>
              <span className="text-white font-bold">{plan.targetStats.speed}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Target Stamina:</span>
              <span className="text-white font-bold">{plan.targetStats.stamina}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Target Power:</span>
              <span className="text-white font-bold">{plan.targetStats.power}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Target Guts:</span>
              <span className="text-white font-bold">{plan.targetStats.guts}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Target Wisdom:</span>
              <span className="text-white font-bold">{plan.targetStats.wisdom}</span>
            </div>
          </div>
        </div>

        {/* Charts & Deck recommendation panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Comparison (Recharts) */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Visualisasi & Perbandingan Statistik
            </h3>

            {/* Recharts Bar Chart */}
            <div className="h-60 w-full pt-4">
              <PlannerChart chartData={chartData} />
            </div>
            <p className="text-[10px] text-zinc-500 text-center">
              Ungu: target stat optimal untuk jarak <strong className="text-zinc-400">{plan.distance}</strong>. Abu-abu: rata-rata stat trainer umum.
            </p>
          </div>

          {/* Recommended Support Cards */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              Rekomendasi Deck Support Card Meta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendedCards.map(card => {
                const effects = JSON.parse(card.effects)
                return (
                  <div key={card.id} className="p-3.5 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-start justify-between gap-3 hover:border-zinc-800 transition-all">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[8px] font-extrabold px-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-400">
                          {card.rarity}
                        </span>
                        <span className="text-[8px] font-extrabold text-violet-400 uppercase tracking-wide">
                          {card.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-zinc-200 text-xs">{card.name}</h4>
                      <span className="block text-[10px] text-zinc-500 mt-1">
                        Friendship: {effects.friendshipBonus || 'N/A'} • Training: {effects.trainingEffect || 'N/A'}
                      </span>
                    </div>
                    <div className="p-1 rounded bg-violet-650/10 border border-violet-900/40 text-violet-400">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recommended Skills */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Rekomendasi Skill Prioritas
              <HelpTooltip content="Skill prioritas untuk build ini." />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                <span className="font-bold text-zinc-200 text-xs block">Corner Maestro</span>
                <span className="text-[10px] text-zinc-550 block mt-1">Sangat penting untuk pemulihan stamina di semua belokan.</span>
              </div>
              <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                <span className="font-bold text-zinc-200 text-xs block">Shadow Break</span>
                <span className="text-[10px] text-zinc-550 block mt-1">Meningkatkan akselerasi di belokan akhir untuk menyusul barisan depan.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
