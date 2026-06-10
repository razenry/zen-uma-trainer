'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Trophy, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  AlertTriangle,
  Loader2 
} from 'lucide-react'

interface Race {
  id: string
  name: string
  distance: number
  track: string
  direction: string
  season: string
  weather?: string
  surface?: string
}

export default function RacesPage() {
  // Stat sliders input
  const [speed, setSpeed] = useState(1050)
  const [stamina, setStamina] = useState(750)
  const [power, setPower] = useState(900)
  const [guts, setGuts] = useState(400)
  const [wisdom, setWisdom] = useState(700)

  const [selectedRaceId, setSelectedRaceId] = useState('race_arima_kinen')

  // Fetch races
  const { data: races = [], isLoading } = useQuery<Race[]>({
    queryKey: ['races'],
    queryFn: () => fetch('/api/races').then(res => res.json())
  })

  const activeRace = races.find(r => r.id === selectedRaceId)

  // Dynamically compute requirements based on race distance
  const getRaceRequirements = (race?: Race) => {
    if (!race) {
      return { speed: 1000, stamina: 700, power: 900, guts: 400, wisdom: 700 }
    }
    const dist = race.distance
    if (dist <= 1400) {
      // Sprint
      return { speed: 1200, stamina: 400, power: 1050, guts: 300, wisdom: 700 }
    } else if (dist <= 1800) {
      // Mile
      return { speed: 1200, stamina: 600, power: 1050, guts: 350, wisdom: 750 }
    } else if (dist <= 2450) {
      // Medium
      return { speed: 1150, stamina: 850, power: 1000, guts: 450, wisdom: 800 }
    } else {
      // Long
      return { speed: 1050, stamina: 1050, power: 950, guts: 500, wisdom: 800 }
    }
  }

  const requirements = getRaceRequirements(activeRace)

  // Comparative analysis calculations
  const analysis = {
    strengths: [] as string[],
    weaknesses: [] as { name: string; gap: number }[],
    riskLevel: 'Low' as 'Low' | 'Medium' | 'High' | 'Critical',
    riskDesc: 'Build Anda sepenuhnya siap untuk balapan ini!'
  }

  const statValues = { speed, stamina, power, guts, wisdom }
  const statKeys = ['speed', 'stamina', 'power', 'guts', 'wisdom'] as const

  statKeys.forEach(key => {
    const currentVal = statValues[key]
    const reqVal = requirements[key]
    if (currentVal >= reqVal) {
      analysis.strengths.push(key.toUpperCase())
    } else {
      analysis.weaknesses.push({
        name: key.toUpperCase(),
        gap: reqVal - currentVal
      })
    }
  })

  // Compute Risk Level
  const totalGaps = analysis.weaknesses.reduce((sum, w) => sum + w.gap, 0)
  const staminaGap = requirements.stamina - stamina
  const speedGap = requirements.speed - speed

  if (analysis.weaknesses.length === 0) {
    analysis.riskLevel = 'Low'
    analysis.riskDesc = 'Semua target statistik terpenuhi. Peluang menang sangat tinggi!'
  } else if (staminaGap > 200 || speedGap > 150) {
    analysis.riskLevel = 'Critical'
    analysis.riskDesc = 'KRITIKAL: Stamina atau Speed Anda sangat jauh di bawah target. Kemungkinan besar kehabisan napas/kalah telak.'
  } else if (totalGaps > 300 || staminaGap > 100) {
    analysis.riskLevel = 'High'
    analysis.riskDesc = 'RISIKO TINGGI: Latihan Anda kurang optimal pada beberapa aspek krusial. Dianjurkan melakukan peningkatan stat.'
  } else {
    analysis.riskLevel = 'Medium'
    analysis.riskDesc = 'RISIKO SEDANG: Statistik Anda hampir menyamai persyaratan. Hasil balapan bisa didukung oleh pemilihan skill taktis.'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Race Analyzer</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Analisis kecocokan build statistik Anda saat ini dengan target balapan resmi untuk mengukur tingkat risiko kekalahan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-6">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            Input Build Statistik Saat Ini
          </h2>

          <div className="space-y-4">
            {/* Speed */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold uppercase">SPEED</span>
                <span className="text-indigo-400 font-bold">{speed} / 1500</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Stamina */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold uppercase">STAMINA</span>
                <span className="text-rose-400 font-bold">{stamina} / 1500</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                value={stamina}
                onChange={(e) => setStamina(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Power */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold uppercase">POWER</span>
                <span className="text-orange-400 font-bold">{power} / 1500</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                value={power}
                onChange={(e) => setPower(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Guts */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold uppercase">GUTS</span>
                <span className="text-emerald-400 font-bold">{guts} / 1500</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                value={guts}
                onChange={(e) => setGuts(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Wisdom */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold uppercase">WISDOM</span>
                <span className="text-cyan-400 font-bold">{wisdom} / 1500</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                value={wisdom}
                onChange={(e) => setWisdom(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Target Race Selector & Analysis Results */}
        <div className="space-y-6">
          {/* Race Selector */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-violet-400" />
              Pilih Target Balapan
            </h3>

            <select
              value={selectedRaceId}
              onChange={(e) => setSelectedRaceId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-all"
            >
              {races.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.distance}m - {r.track})</option>
              ))}
            </select>

            {activeRace && (
              <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg space-y-1 text-xs text-zinc-400">
                <div className="flex justify-between"><span className="text-zinc-500">Lintasan:</span><span className="text-zinc-200 font-semibold">{activeRace.track} ({activeRace.direction})</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Musim:</span><span className="text-zinc-200 font-semibold">{activeRace.season}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Cuaca:</span><span className="text-zinc-200 font-semibold">{activeRace.weather || 'Normal'}</span></div>
              </div>
            )}
          </div>

          {/* Analysis Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-violet-400" />
              Hasil Analisis & Risiko
            </h3>

            {/* Risk Indicator Header */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-850 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">Tingkat Risiko</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${
                  analysis.riskLevel === 'Critical' ? 'bg-red-950/80 text-red-400 border border-red-800/80' :
                  analysis.riskLevel === 'High' ? 'bg-orange-950/80 text-orange-400 border border-orange-850/80' :
                  analysis.riskLevel === 'Medium' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80' :
                  'bg-emerald-950/85 text-emerald-400 border border-emerald-900/50'
                }`}>
                  {analysis.riskLevel} Risk
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-normal">
                {analysis.riskDesc}
              </p>
            </div>

            {/* Comparison meters */}
            <div className="space-y-3 pt-2">
              <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Perbandingan Statistik</span>
              {statKeys.map((key) => {
                const currentVal = statValues[key]
                const reqVal = requirements[key]
                const percent = Math.min(100, Math.round((currentVal / reqVal) * 100))
                
                return (
                  <div key={key} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-semibold">{key.toUpperCase()}</span>
                      <span className="text-zinc-500">{currentVal} <strong className="text-zinc-300">/ {reqVal}</strong></span>
                    </div>
                    <div className="w-full bg-zinc-900 border border-zinc-900/60 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-305 ${
                          currentVal >= reqVal ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Strengths & Weaknesses checklists */}
            <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4 text-xs">
              {/* Strength */}
              <div className="space-y-2">
                <span className="block text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Kelebihan
                </span>
                {analysis.strengths.length === 0 ? (
                  <span className="text-[10px] text-zinc-500">None</span>
                ) : (
                  <ul className="space-y-1 text-zinc-300 font-medium">
                    {analysis.strengths.map(s => <li key={s}>• {s}</li>)}
                  </ul>
                )}
              </div>

              {/* Weakness */}
              <div className="space-y-2">
                <span className="block text-[10px] font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Kekurangan
                </span>
                {analysis.weaknesses.length === 0 ? (
                  <span className="text-[10px] text-zinc-500">None</span>
                ) : (
                  <ul className="space-y-1 text-zinc-300 font-medium">
                    {analysis.weaknesses.map(w => (
                      <li key={w.name} className="text-red-400">
                        • {w.name} (-{w.gap})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
