'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSimulatorStore } from '@/store/simulator.store'
import { calculateBestTraining, Stats, AdvisorOutput } from '@/lib/advisor'
import { 
  Zap, 
  Smile, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Trophy, 
  RefreshCw, 
  Play, 
  HelpCircle, 
  AlertTriangle,
  Loader2 
} from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'

// Map Motivation to display label and styles
const MOTIVATION_THEMES = {
  "Worst": "bg-red-950 border-red-800 text-red-400",
  "Bad": "bg-orange-950 border-orange-850 text-orange-400",
  "Normal": "bg-zinc-900 border-zinc-800 text-zinc-400",
  "Good": "bg-blue-950 border-blue-800 text-blue-400",
  "Perfect": "bg-emerald-950 border-emerald-800 text-emerald-400"
}

export default function SimulatorPage() {
  const sim = useSimulatorStore()
  
  // UI States
  const [isStarted, setIsStarted] = useState(false)
  const [activeTab, setActiveTab] = useState<'simulate' | 'config'>('config')

  // Fetch character & support cards for setup dropdowns
  const { data: characters = [], isLoading: charsLoading } = useQuery<any[]>({
    queryKey: ['characters'],
    queryFn: () => fetch('/api/characters').then(res => res.json())
  })

  const { data: supports = [], isLoading: supportsLoading } = useQuery<any[]>({
    queryKey: ['supportCards'],
    queryFn: () => fetch('/api/supports').then(res => res.json())
  })

  const activeChar = characters.find(c => c.id === sim.characterId)

  // Compute AI Advisor Recommendations dynamically from current state
  const [advisorOutput, setAdvisorOutput] = useState<AdvisorOutput | null>(null)

  useEffect(() => {
    if (!activeChar) return

    // parse growth bonus
    // e.g. "Stamina +20%, Wisdom +10%"
    const growthBonus: Record<string, number> = {}
    if (activeChar.growthBonus) {
      const parts = activeChar.growthBonus.split(', ')
      parts.forEach((p: string) => {
        const [stat, val] = p.split(' +')
        const statName = stat.toLowerCase().trim()
        const percentage = parseInt(val) / 100
        growthBonus[statName] = percentage
      })
    }

    const output = calculateBestTraining({
      turn: sim.currentTurn,
      energy: sim.energy,
      motivation: sim.motivation,
      speed: sim.speed,
      stamina: sim.stamina,
      power: sim.power,
      guts: sim.guts,
      wisdom: sim.wisdom,
      growthBonus,
      targetStats: {
        speed: 1200,
        stamina: 800,
        power: 1000,
        guts: 450,
        wisdom: 800
      }
    })
    setAdvisorOutput(output)
  }, [sim.currentTurn, sim.energy, sim.motivation, sim.speed, sim.stamina, sim.power, sim.guts, sim.wisdom, sim.characterId, characters])

  const handleStartSimulation = () => {
    setIsStarted(true)
    setActiveTab('simulate')
  }

  const handleResetSimulation = () => {
    sim.reset()
    setIsStarted(false)
    setActiveTab('config')
  }

  const handleTrainClick = (actionName: string, gains: any) => {
    sim.performTraining(actionName, gains)
  }

  // Calculate session completion percentage
  const progressPercent = Math.round((sim.currentTurn / 72) * 100)

  if (charsLoading || supportsLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Training Simulator</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Simulasikan setiap turn pelatihan dan biarkan AI Advisor merekomendasikan opsi latihan terbaik secara real-time.
          </p>
        </div>
        
        {isStarted && (
          <button
            onClick={handleResetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Simulator
          </button>
        )}
      </div>

      {/* Navigation tabs */}
      {isStarted && (
        <div className="flex border-b border-zinc-900 gap-4 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('simulate')}
            className={`pb-2.5 px-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'simulate' ? 'border-violet-500 text-violet-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Simulasi Aktif
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'config' ? 'border-violet-500 text-violet-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Konfigurasi Deck
          </button>
        </div>
      )}

      {/* Config Mode Tab */}
      {activeTab === 'config' && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-violet-400" />
            Konfigurasi Simulasi Baru
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Character Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Pilih Uma Musume</label>
              <select
                value={sim.characterId}
                onChange={(e) => sim.setCharacter(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-all"
              >
                {characters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {activeChar && (
                <div className="mt-2.5 p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 text-xs text-zinc-400">
                  <span className="font-bold text-zinc-300 block">Growth Bonus: {activeChar.growthBonus}</span>
                  <span className="block mt-1">Distance suitability: {activeChar.distanceType}</span>
                </div>
              )}
            </div>

            {/* Scenario Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Pilih Skenario Pelatihan</label>
              <select
                value={sim.scenario}
                onChange={(e) => sim.setScenario(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-all"
              >
                <option value="URA Scenario">URA Scenario (Default)</option>
                <option value="L'Arc Scenario">L&apos;Arc Scenario (Global Meta)</option>
                <option value="Aoba Academy">Tracen Aoba Festival</option>
              </select>
            </div>

            {/* Deck Config Summary */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Deck Support Cards</label>
              <div className="space-y-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300 block mb-1">Select Support Cards (max 6):</span>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {supports.map((card: any) => {
                    const isSelected = sim.deck.includes(card.id)
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            sim.setDeck(sim.deck.filter(id => id !== card.id))
                          } else {
                            if (sim.deck.length < 6) {
                              sim.setDeck([...sim.deck, card.id])
                            }
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-md border text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-violet-600/10 border-violet-500/40 text-violet-300' 
                            : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span className="truncate pr-2">{card.name}</span>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 flex-shrink-0">
                          {card.type} • {isSelected ? 'Selected' : 'Add'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-6 flex justify-end">
            <button
              onClick={handleStartSimulation}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-violet-600/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Mulai Simulasi Pelatihan
            </button>
          </div>
        </div>
      )}

      {/* Simulator Mode Tab */}
      {activeTab === 'simulate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main simulator grid controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Simulation Status Card */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-violet-600/2 to-transparent pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Character Profile and Turn */}
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-violet-400 block">
                    {sim.scenario}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {activeChar?.name} <span className="text-zinc-500 font-semibold text-sm">pacing run</span>
                  </h2>
                </div>

                {/* Turn progress indicator */}
                <div className="text-right">
                  <span className="block text-xs font-semibold text-zinc-500">TURN {sim.currentTurn} / 72</span>
                  <div className="w-32 bg-zinc-900 border border-zinc-800 rounded-full h-2 mt-1.5 relative overflow-hidden">
                    <div 
                      className="bg-violet-500 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Energy and Motivation bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
                {/* Energy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ENERGY: {sim.energy}/100
                      <HelpTooltip content="Semakin rendah energy, semakin besar risiko gagal." />
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg h-3 relative overflow-hidden">
                    <div 
                      className={`h-full rounded-lg transition-all duration-300 ${
                        sim.energy < 30 ? 'bg-red-500' : sim.energy < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${sim.energy}%` }}
                    />
                  </div>
                </div>

                {/* Motivation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-semibold flex items-center gap-1">
                      <Smile className="w-3.5 h-3.5 text-blue-400" />
                      MOTIVATION:
                      <HelpTooltip content="Mempengaruhi efektivitas training." />
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide border ${MOTIVATION_THEMES[sim.motivation]}`}>
                      {sim.motivation}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 pt-1.5">
                    {["Worst", "Bad", "Normal", "Good", "Perfect"].map((mot) => {
                      const isActive = sim.motivation === mot
                      return (
                        <button
                          key={mot}
                          onClick={() => sim.setMotivation(mot as any)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            isActive ? 'bg-violet-500 shadow-md shadow-violet-500/50' : 'bg-zinc-900 hover:bg-zinc-800'
                          }`}
                          title={`Set to ${mot}`}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Stats Radar-like Widget */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1">
                Statistik Karakter Saat Ini
                <HelpTooltip content="Stat yang dimiliki saat ini." />
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* Speed */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center space-y-2">
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">SPEED</span>
                  <input
                    type="number"
                    value={sim.speed}
                    onChange={(e) => sim.updateStats({ speed: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-center text-base font-bold text-indigo-400 rounded-md py-1 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                {/* Stamina */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center space-y-2">
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">STAMINA</span>
                  <input
                    type="number"
                    value={sim.stamina}
                    onChange={(e) => sim.updateStats({ stamina: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-center text-base font-bold text-rose-400 rounded-md py-1 outline-none focus:border-rose-500 transition-all"
                  />
                </div>
                {/* Power */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center space-y-2">
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">POWER</span>
                  <input
                    type="number"
                    value={sim.power}
                    onChange={(e) => sim.updateStats({ power: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-center text-base font-bold text-orange-400 rounded-md py-1 outline-none focus:border-orange-500 transition-all"
                  />
                </div>
                {/* Guts */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center space-y-2">
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">GUTS</span>
                  <input
                    type="number"
                    value={sim.guts}
                    onChange={(e) => sim.updateStats({ guts: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-center text-base font-bold text-emerald-400 rounded-md py-1 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                {/* Wisdom */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center space-y-2 col-span-2 md:col-span-1">
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">WISDOM</span>
                  <input
                    type="number"
                    value={sim.wisdom}
                    onChange={(e) => sim.updateStats({ wisdom: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-center text-base font-bold text-cyan-400 rounded-md py-1 outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Action Simulator buttons / Simulation Completed Summary */}
            {sim.currentTurn >= 72 ? (
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6 relative overflow-hidden animate-in fade-in duration-300">
                <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-emerald-600/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">Simulasi Latihan Selesai!</h3>
                    <p className="text-xs text-zinc-400">Selamat! Anda telah menyelesaikan 72 turn pelatihan penuh.</p>
                  </div>
                </div>

                {/* Stat comparison vs Target */}
                <div className="border-t border-zinc-900 pt-5 space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Perbandingan Statistik Akhir vs Target</h4>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'Speed', current: sim.speed, target: 1200, color: 'text-indigo-400' },
                      { name: 'Stamina', current: sim.stamina, target: 800, color: 'text-rose-400' },
                      { name: 'Power', current: sim.power, target: 1000, color: 'text-orange-400' },
                      { name: 'Guts', current: sim.guts, target: 450, color: 'text-emerald-400' },
                      { name: 'Wisdom', current: sim.wisdom, target: 800, color: 'text-cyan-400' }
                    ].map((item) => {
                      const diff = item.current - item.target
                      const isMet = diff >= 0
                      return (
                        <div key={item.name} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                          <span className="text-xs font-bold text-zinc-300 w-20">{item.name}</span>
                          <div className="flex-1 flex items-center justify-between px-6">
                            <span className={`text-sm font-extrabold ${item.color}`}>{item.current}</span>
                            <span className="text-zinc-650 text-xs">vs</span>
                            <span className="text-zinc-400 text-sm font-semibold">{item.target}</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isMet ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {isMet ? `+${diff} (Met)` : `${diff} (Short)`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Final Rank and Score Calculation */}
                {(() => {
                  const totalStats = sim.speed + sim.stamina + sim.power + sim.guts + sim.wisdom
                  let rank = 'C'
                  let rankColor = 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
                  if (totalStats >= 5000) {
                    rank = 'SS'
                    rankColor = 'text-pink-400 bg-pink-500/10 border-pink-500/20 shadow-md shadow-pink-500/10'
                  } else if (totalStats >= 4500) {
                    rank = 'S'
                    rankColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-md shadow-amber-500/10'
                  } else if (totalStats >= 4000) {
                    rank = 'A+'
                    rankColor = 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                  } else if (totalStats >= 3500) {
                    rank = 'A'
                    rankColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                  } else if (totalStats >= 3000) {
                    rank = 'B+'
                    rankColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                  } else if (totalStats >= 2500) {
                    rank = 'B'
                    rankColor = 'text-teal-400 bg-teal-500/10 border-teal-500/20'
                  }
                  
                  return (
                    <div className="p-4 bg-zinc-900 border border-zinc-900 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-display">Peringkat Akhir</span>
                        <span className="block text-xs text-zinc-400 mt-0.5">Total akumulasi stat: <strong className="text-white font-bold">{totalStats}</strong></span>
                      </div>
                      <div className={`text-sm font-black px-4 py-2 rounded-xl border ${rankColor}`}>
                        {rank} Rank
                      </div>
                    </div>
                  )
                })()}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={handleResetSimulation}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:text-white text-zinc-300 rounded-lg text-xs font-bold cursor-pointer transition-all"
                  >
                    Simulasi Baru
                  </button>
                </div>
              </div>
            ) : (
              advisorOutput && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <span>Aktivitas Latihan Tersedia (Click to Execute)</span>
                    <HelpTooltip content="Aksi yang direkomendasikan AI." />
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {advisorOutput.actions.map((act) => {
                      const isRest = act.name === 'Rest'
                      const gains = act.predictedGain
                      
                      return (
                        <button
                          key={act.name}
                          onClick={() => handleTrainClick(act.name, gains)}
                          className="bg-zinc-950 border border-zinc-900 hover:border-zinc-850 rounded-xl p-4 text-left transition-all hover:bg-zinc-900/20 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group animate-in fade-in zoom-in-95 duration-200"
                        >
                          {/* Highlight Best Option banner */}
                          {advisorOutput.bestAction === act.name && (
                            <div className="absolute top-0 right-0 bg-violet-600 text-white font-extrabold text-[8px] uppercase tracking-wider py-0.5 px-2.5 rounded-bl-lg shadow-md">
                              RECOMMENDED BEST
                            </div>
                          )}

                          <div>
                            <span className="block text-sm font-bold text-white group-hover:text-violet-400 transition-colors">
                              {act.name}
                            </span>
                            <span className="block text-[10px] text-zinc-500 leading-tight mt-1 truncate max-w-[280px]">
                              {act.reason}
                            </span>
                          </div>

                          {/* Gains info and action statistics */}
                          <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2.5 mt-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                              {isRest ? (
                                <span className="text-emerald-400">Energy +{gains.energy}</span>
                              ) : (
                                Object.entries(gains).map(([stat, val]) => {
                                  if (stat === 'energy') return null
                                  return (
                                    <span key={stat} className={
                                      stat === 'speed' ? 'text-indigo-400' :
                                      stat === 'stamina' ? 'text-rose-400' :
                                      stat === 'power' ? 'text-orange-400' :
                                      stat === 'guts' ? 'text-emerald-400' :
                                      'text-cyan-400'
                                    }>
                                      {stat.toUpperCase().slice(0,3)} +{val}
                                    </span>
                                  )
                                })
                              )}
                            </div>
                            
                            {/* Failure risk level */}
                            {act.riskScore > 0 ? (
                              <span className={`text-[10px] font-bold flex items-center gap-1 ${
                                act.riskScore > 30 ? 'text-red-400' : 'text-amber-400'
                              }`}>
                                <AlertTriangle className="w-3 h-3" />
                                {act.riskScore}% Fail
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-500 font-semibold">0% Fail</span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Sidebar Advisor Panel */}
          {advisorOutput && (
            <div className="space-y-6">
              {/* AI Best Action Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Rekomendasi AI Terkini
                </h3>
                
                <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-900/40 space-y-2">
                  <span className="text-[9px] font-extrabold uppercase text-violet-400 tracking-wider flex items-center gap-1">
                    Tindakan Terbaik
                    <HelpTooltip content="Aksi terbaik berdasarkan kondisi saat ini." />
                  </span>
                  <span className="text-lg font-bold text-white block">{advisorOutput.bestAction}</span>
                  <p className="text-xs text-zinc-300 leading-normal">
                    {advisorOutput.actions.find(a => a.name === advisorOutput.bestAction)?.reason}
                  </p>
                </div>
                
                {/* Risk Level Panel */}
                <div className="space-y-2 border-t border-zinc-900 pt-4">
                  <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    Analisis Risiko Kelelahan
                    <HelpTooltip content="Risiko yang mungkin terjadi jika memilih aksi tertentu." />
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                      Level Risiko:
                      <HelpTooltip content="Tingkat risiko dari keputusan." />
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide ${
                      advisorOutput.riskAnalysis.level === 'Critical' ? 'bg-red-950/80 text-red-400 border border-red-800/80' :
                      advisorOutput.riskAnalysis.level === 'High' ? 'bg-orange-950/80 text-orange-400 border border-orange-800/80' :
                      advisorOutput.riskAnalysis.level === 'Medium' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80' :
                      'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {advisorOutput.riskAnalysis.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    {advisorOutput.riskAnalysis.description}
                  </p>
                </div>

                {/* Long term impact tracking */}
                <div className="space-y-2 border-t border-zinc-900 pt-4">
                  <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    Estimasi Progres Target
                    <HelpTooltip content="Dampak keputusan terhadap hasil akhir training." />
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Status Laju:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide ${
                      advisorOutput.longTermImpact.status === 'Ahead' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80' :
                      advisorOutput.longTermImpact.status === 'Behind' ? 'bg-red-950/80 text-red-400 border border-red-800/80' :
                      'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {advisorOutput.longTermImpact.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    {advisorOutput.longTermImpact.description}
                  </p>
                </div>

                {/* Stat Priority */}
                <div className="space-y-2 border-t border-zinc-900 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                      Prioritas Stat:
                      <HelpTooltip content="Stat yang paling penting untuk ditingkatkan." />
                    </span>
                    <span className="text-xs font-extrabold text-violet-400 uppercase bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">Speed & Power</span>
                  </div>
                </div>
              </div>

              {/* Target Stat Board */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-violet-400" />
                  Target Akhir Build
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Target Speed:</span>
                    <span className="text-white font-bold">1200</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Target Stamina:</span>
                    <span className="text-white font-bold">800</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Target Power:</span>
                    <span className="text-white font-bold">1000</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Target Guts:</span>
                    <span className="text-white font-bold">450</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Target Wisdom:</span>
                    <span className="text-white font-bold">800</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
