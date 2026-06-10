'use client'

import React, { useState, useEffect } from 'react'
import { calculateBestTraining, Stats, AdvisorOutput } from '@/lib/advisor'
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle, 
  Zap, 
  Smile, 
  BarChart2 
} from 'lucide-react'

const MOTIVATIONS = ["Worst", "Bad", "Normal", "Good", "Perfect"]

const MOTIVATION_LABELS = {
  "Worst": "Worst (Sangat Buruk)",
  "Bad": "Bad (Buruk)",
  "Normal": "Normal (Biasa)",
  "Good": "Good (Baik)",
  "Perfect": "Perfect (Sangat Baik)"
}

export default function AdvisorPage() {
  // Input states
  const [turn, setTurn] = useState(35)
  const [energy, setEnergy] = useState(58)
  const [motivation, setMotivation] = useState<string>("Great") // user input says "Great" (which translates to Good/Perfect in engine)
  const [speed, setSpeed] = useState(450)
  const [stamina, setStamina] = useState(300)
  const [power, setPower] = useState(380)
  const [guts, setGuts] = useState(220)
  const [wisdom, setWisdom] = useState(340)

  // Output recommendation state
  const [advisorOutput, setAdvisorOutput] = useState<AdvisorOutput | null>(null)

  useEffect(() => {
    // Normalizing "Great" to "Good" for our internal rule engine
    const internalMotivation = motivation === 'Great' ? 'Good' : motivation

    const output = calculateBestTraining({
      turn,
      energy,
      motivation: internalMotivation,
      speed,
      stamina,
      power,
      guts,
      wisdom,
      targetStats: {
        speed: 1200,
        stamina: 800,
        power: 1000,
        guts: 450,
        wisdom: 800
      }
    })
    setAdvisorOutput(output)
  }, [turn, energy, motivation, speed, stamina, power, guts, wisdom])

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">AI Training Advisor</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Masukkan status latihan Anda saat ini secara manual untuk menerima rekomendasi tindakan terbaik dan analisis risiko.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-6">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-violet-400" />
            Input Parameter Latihan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Turn */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold uppercase">Turn Pelatihan</span>
                <span className="text-white font-bold">{turn} / 72</span>
              </div>
              <input
                type="range"
                min="1"
                max="72"
                value={turn}
                onChange={(e) => setTurn(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold uppercase flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Energy Status
                </span>
                <span className="text-white font-bold">{energy} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>

            {/* Motivation selection */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tingkat Motivasi</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[...MOTIVATIONS, "Great"].map((mot) => {
                  const isActive = motivation === mot
                  return (
                    <button
                      key={mot}
                      type="button"
                      onClick={() => setMotivation(mot)}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center ${
                        isActive 
                          ? 'bg-violet-600 border-violet-500 text-white font-extrabold shadow-lg shadow-violet-600/10'
                          : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-300'
                      }`}
                    >
                      {mot}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Stats Inputs Grid */}
          <div className="border-t border-zinc-900 pt-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kondisi Statistik Saat Ini</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Speed */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center space-y-2">
                <span className="block text-[10px] text-zinc-500 font-semibold uppercase">SPEED</span>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-center text-sm font-bold text-indigo-400 rounded-md py-1 outline-none"
                />
              </div>

              {/* Stamina */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center space-y-2">
                <span className="block text-[10px] text-zinc-500 font-semibold uppercase">STAMINA</span>
                <input
                  type="number"
                  value={stamina}
                  onChange={(e) => setStamina(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-center text-sm font-bold text-rose-400 rounded-md py-1 outline-none"
                />
              </div>

              {/* Power */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center space-y-2">
                <span className="block text-[10px] text-zinc-500 font-semibold uppercase">POWER</span>
                <input
                  type="number"
                  value={power}
                  onChange={(e) => setPower(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-center text-sm font-bold text-orange-400 rounded-md py-1 outline-none"
                />
              </div>

              {/* Guts */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center space-y-2">
                <span className="block text-[10px] text-zinc-500 font-semibold uppercase">GUTS</span>
                <input
                  type="number"
                  value={guts}
                  onChange={(e) => setGuts(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-center text-sm font-bold text-emerald-400 rounded-md py-1 outline-none"
                />
              </div>

              {/* Wisdom */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center space-y-2 col-span-2 md:col-span-1">
                <span className="block text-[10px] text-zinc-500 font-semibold uppercase">WISDOM</span>
                <input
                  type="number"
                  value={wisdom}
                  onChange={(e) => setWisdom(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-center text-sm font-bold text-cyan-400 rounded-md py-1 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        {advisorOutput && (
          <div className="space-y-6">
            {/* Top Best Action Recommended */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-violet-600 text-white font-extrabold text-[8px] uppercase tracking-wider py-0.5 px-3 rounded-bl-lg shadow">
                RECOMMENDED BEST
              </div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-violet-400" />
                Rekomendasi AI
              </h3>

              <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-900/40 space-y-2 mt-2">
                <span className="block text-[9px] font-extrabold uppercase text-violet-400 tracking-wider">Tindakan Terbaik</span>
                <span className="text-lg font-bold text-white block">{advisorOutput.bestAction}</span>
                <p className="text-xs text-zinc-300 leading-normal">
                  {advisorOutput.actions.find(a => a.name === advisorOutput.bestAction)?.reason}
                </p>
              </div>

              {/* Failure risk indicator */}
              <div className="space-y-2 border-t border-zinc-900 pt-4">
                <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Analisis Risiko Kelelahan</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">Level Risiko:</span>
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

              {/* Pacing status */}
              <div className="space-y-2 border-t border-zinc-900 pt-4">
                <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Laju Target Jangka Panjang</span>
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
            </div>

            {/* List of other recommendations ranked */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Daftar Peringkat Opsi Latihan</h3>
              
              <div className="space-y-2.5">
                {advisorOutput.actions.map((act) => (
                  <div key={act.name} className="flex items-center justify-between gap-3 p-2 bg-zinc-900/30 border border-zinc-900 rounded-lg">
                    <div>
                      <span className="block text-xs font-bold text-zinc-200">{act.name}</span>
                      <span className="block text-[9px] text-zinc-500 truncate max-w-[150px]">{act.reason}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {act.riskScore > 0 && (
                        <span className="text-[9px] font-bold text-amber-500">
                          {act.riskScore}% Fail
                        </span>
                      )}
                      <span className="text-xs font-black text-violet-400 bg-violet-600/10 px-2 py-0.5 rounded border border-violet-900/50">
                        Score: {act.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
