'use client'

import { useEffect, useState } from 'react'
import { Trophy, TrendingUp, AlertTriangle, CheckCircle2, Zap, Target, Shield, ChevronDown } from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'
import { EmptyState, ErrorState } from '@/components/shared/ui-states'

type Event = {
  id: string
  name: string
  eventType: string
  startDate: string
  endDate: string
  description: string | null
  eventStatus: string
  distance?: number | null
  groundType?: string | null
  weather?: string | null
  trackCondition?: string | null
  direction?: string | null
  location?: string | null
  season?: string | null
}

type AnalysisResult = {
  raceType: string
  targetSpeed: number
  targetStamina: number
  targetPower: number
  targetGuts: number
  targetWisdom: number
  strengths: string[]
  weaknesses: string[]
  missingStats: { stat: string; deficit: number; priority: string }[]
  recommendedSkills: { name: string; reason: string; priority: string }[]
  recommendedDeck: { type: string; note: string }[]
  winRatePotential: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  riskReason: string
}

const CHARACTERS = [
  { id: 'char_special_week', name: 'Special Week', speed: 400, stamina: 300, power: 350, guts: 200, wisdom: 300, style: 'Leader', distance: 'Long', aptLong: 'A', aptMedium: 'A' },
  { id: 'char_silence_suzuka', name: 'Silence Suzuka', speed: 500, stamina: 200, power: 300, guts: 300, wisdom: 250, style: 'Runner', distance: 'Mile', aptMile: 'A', aptFront: 'S' },
]

function analyzeForEvent(event: Event, charId: string, buildSpeed: number, buildStamina: number, buildPower: number, buildGuts: number, buildWisdom: number): AnalysisResult {
  const dist = event.distance || 2000
  const isLong = dist >= 2400
  const isMile = dist >= 1400 && dist < 2000
  const isSprint = dist < 1400
  const isHeavy = event.trackCondition === 'Heavy' || event.trackCondition === 'Slightly Heavy'
  
  const targetSpeed = isSprint ? 1400 : isMile ? 1250 : isLong ? 1100 : 1200
  const targetStamina = isSprint ? 500 : isMile ? 700 : isLong ? 1100 : 850
  const targetPower = 1000
  const targetGuts = isHeavy ? 700 : 500
  const targetWisdom = 800

  const missingStats: { stat: string; deficit: number; priority: string }[] = []
  const statMap = [
    { stat: 'Speed', current: buildSpeed, target: targetSpeed, priority: isLong ? 'High' : 'Critical' },
    { stat: 'Stamina', current: buildStamina, target: targetStamina, priority: isLong ? 'Critical' : 'High' },
    { stat: 'Power', current: buildPower, target: targetPower, priority: 'High' },
    { stat: 'Guts', current: buildGuts, target: targetGuts, priority: isHeavy ? 'High' : 'Medium' },
    { stat: 'Wisdom', current: buildWisdom, target: targetWisdom, priority: 'Medium' },
  ]
  
  for (const s of statMap) {
    if (s.current < s.target) {
      missingStats.push({ stat: s.stat, deficit: s.target - s.current, priority: s.priority })
    }
  }

  const strengths: string[] = []
  const weaknesses: string[] = []
  
  if (buildSpeed >= targetSpeed) strengths.push('Speed meets race requirement')
  else weaknesses.push(`Speed deficit: ${targetSpeed - buildSpeed} points short`)
  if (buildStamina >= targetStamina) strengths.push('Stamina sufficient for distance')
  else weaknesses.push(`Stamina deficit: ${targetStamina - buildStamina} points short`)
  if (buildPower >= targetPower) strengths.push('Power fully optimized')
  else weaknesses.push(`Power needs ${targetPower - buildPower} more points`)
  if (buildGuts >= targetGuts) strengths.push('Guts stable for track conditions')
  if (buildWisdom >= targetWisdom) strengths.push('Wisdom well-calibrated')

  const totalTarget = targetSpeed + targetStamina + targetPower + targetGuts + targetWisdom
  const totalCurrent = Math.min(buildSpeed, targetSpeed) + Math.min(buildStamina, targetStamina) + 
    Math.min(buildPower, targetPower) + Math.min(buildGuts, targetGuts) + Math.min(buildWisdom, targetWisdom)
  const winRatePotential = Math.round((totalCurrent / totalTarget) * 100)

  const recommendedSkills = [
    { name: isLong ? 'Corner Maestro' : 'Concentration', reason: isLong ? 'Critical stamina recovery in corners' : 'Improved race start reaction', priority: 'S' },
    { name: 'Recovery Skills', reason: isHeavy ? 'Heavy track drains stamina faster' : 'Maintain stamina through middle phase', priority: 'A' },
    { name: 'Straight Acceleration', reason: 'Activate speed boost in final stretch', priority: 'A' },
  ]

  const recommendedDeck = [
    { type: 'Stamina SSR', note: isLong ? 'Critical for 2400m+ distance' : 'Recommended for endurance support' },
    { type: 'Speed SSR', note: 'Boost speed training efficiency' },
    { type: 'Wisdom SSR', note: 'Improve pacing and corner strategy' },
  ]

  const riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 
    winRatePotential >= 85 ? 'Low' : winRatePotential >= 70 ? 'Medium' : winRatePotential >= 50 ? 'High' : 'Critical'
  
  const riskReason = riskLevel === 'Critical'
    ? 'Major stat deficits detected. Significant preparation required before this event.'
    : riskLevel === 'High'
    ? 'Several stats below target. Focus on high-priority training sessions.'
    : riskLevel === 'Medium'
    ? 'Minor adjustments needed. Focus on missing skills and optimization.'
    : 'Build looks strong for this event. Fine-tune skills and deck.'

  return {
    raceType: isSprint ? 'Sprint' : isMile ? 'Mile' : isLong ? 'Long' : 'Medium',
    targetSpeed, targetStamina, targetPower, targetGuts, targetWisdom,
    strengths, weaknesses, missingStats, recommendedSkills, recommendedDeck,
    winRatePotential, riskLevel, riskReason
  }
}

const RISK_COLORS: Record<string, string> = {
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  High: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function ChampionMeetingPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0])
  const [buildSpeed, setBuildSpeed] = useState(800)
  const [buildStamina, setBuildStamina] = useState(600)
  const [buildPower, setBuildPower] = useState(750)
  const [buildGuts, setBuildGuts] = useState(400)
  const [buildWisdom, setBuildWisdom] = useState(500)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchCMData = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      const res = await fetch('/api/events?type=CHAMPION_MEETING')
      if (!res.ok) throw new Error('Gagal memuat event Champion Meeting.')
      const data = await res.json()
      const evs: Event[] = data.events || []
      setEvents(evs)
      const active = evs.find(e => e.eventStatus === 'ACTIVE') || evs[0]
      if (active) setSelectedEvent(active)
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCMData()
  }, [])

  function runAnalysis() {
    if (!selectedEvent) return
    const result = analyzeForEvent(selectedEvent, selectedChar.id, buildSpeed, buildStamina, buildPower, buildGuts, buildWisdom)
    setAnalysis(result)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-900 bg-gradient-to-br from-violet-900/20 via-zinc-950 to-indigo-900/10">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold mb-3 uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            Champion Meeting Analyzer
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            CM Strength <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Analyzer</span>
          </h1>
          <p className="text-zinc-400 max-w-xl">Select a Champion Meeting, input your current build stats, and get an instant strength/weakness breakdown with win rate potential.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Config Panel */}
          <div className="lg:col-span-1 space-y-4">

            {/* Event Select */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-violet-400" /> Select Event
              </h2>
              {loading ? (
                <div className="h-10 bg-zinc-800 rounded-lg animate-pulse" />
              ) : errorMsg ? (
                <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-400">
                  {errorMsg}
                </div>
              ) : events.length === 0 ? (
                <EmptyState
                  title="No CM Events"
                  description="Belum ada event Champion Meeting yang terdaftar di database."
                />
              ) : (
                <div className="space-y-2">
                  {events.map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => { setSelectedEvent(ev); setAnalysis(null) }}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        selectedEvent?.id === ev.id
                          ? 'bg-violet-600/10 border-violet-500/40 text-violet-300'
                          : 'bg-zinc-800/50 border-zinc-700/40 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <div className="font-bold text-white text-[11px] mb-1">{ev.name}</div>
                      <div className="flex items-center gap-3 text-zinc-500">
                        {ev.distance && <span>{ev.distance}m</span>}
                        {ev.groundType && <span>{ev.groundType}</span>}
                        {ev.location && <span>📍 {ev.location}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Character Select */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Character
                <HelpTooltip content="Karakter yang sedang kuat pada event ini." />
              </h2>
              <div className="space-y-2">
                {CHARACTERS.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => { setSelectedChar(ch); setAnalysis(null) }}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      selectedChar.id === ch.id
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-zinc-800/50 border-zinc-700/40 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-bold text-white">{ch.name}</div>
                    <div className="text-zinc-500 mt-0.5">{ch.style} · {ch.distance}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Build Stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" /> Current Build Stats
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Speed', value: buildSpeed, setter: setBuildSpeed, color: 'blue' },
                  { label: 'Stamina', value: buildStamina, setter: setBuildStamina, color: 'rose' },
                  { label: 'Power', value: buildPower, setter: setBuildPower, color: 'orange' },
                  { label: 'Guts', value: buildGuts, setter: setBuildGuts, color: 'red' },
                  { label: 'Wisdom', value: buildWisdom, setter: setBuildWisdom, color: 'purple' },
                ].map(({ label, value, setter, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400 font-medium">{label}</span>
                      <span className="text-white font-bold">{value}</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={2000}
                      step={10}
                      value={value}
                      onChange={e => { setter(Number(e.target.value)); setAnalysis(null) }}
                      className="w-full accent-violet-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={runAnalysis}
                disabled={!selectedEvent}
                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Run Analysis
              </button>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2 space-y-4">
            {!analysis ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                <TrendingUp className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 font-semibold">Select an event and run analysis</p>
                <p className="text-zinc-600 text-sm mt-1">Configure your build on the left to see strength & weakness breakdown</p>
              </div>
            ) : (
              <>
                {/* Win Rate Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-zinc-400 text-sm">Win Rate Potential</p>
                      <h2 className="text-4xl font-black text-white mt-1">{analysis.winRatePotential}<span className="text-2xl text-zinc-500">%</span></h2>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${RISK_COLORS[analysis.riskLevel]}`}>
                      <Shield className="w-4 h-4 inline mr-1.5" />
                      {analysis.riskLevel} Risk
                    </div>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mb-3">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-400 transition-all duration-700"
                      style={{ width: `${analysis.winRatePotential}%` }}
                    />
                  </div>
                  <p className="text-zinc-400 text-xs">{analysis.riskReason}</p>
                </div>

                {/* Target vs Current Stats */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
                    <span>Target Stats for {selectedEvent?.name}</span>
                    <HelpTooltip content="Stat yang direkomendasikan untuk event ini." />
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: 'Speed', target: analysis.targetSpeed, current: buildSpeed },
                      { label: 'Stamina', target: analysis.targetStamina, current: buildStamina },
                      { label: 'Power', target: analysis.targetPower, current: buildPower },
                      { label: 'Guts', target: analysis.targetGuts, current: buildGuts },
                      { label: 'Wisdom', target: analysis.targetWisdom, current: buildWisdom },
                    ].map(({ label, target, current }) => {
                      const pct = Math.min(100, Math.round((current / target) * 100))
                      const met = current >= target
                      return (
                        <div key={label} className="text-center">
                          <div className="text-[10px] text-zinc-500 mb-1 font-medium">{label}</div>
                          <div className={`text-sm font-black ${met ? 'text-emerald-400' : 'text-amber-400'}`}>{current}</div>
                          <div className="text-[10px] text-zinc-600">/{target}</div>
                          <div className="w-full bg-zinc-800 rounded-full h-1 mt-1">
                            <div
                              className={`h-1 rounded-full transition-all ${met ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">✓</span>{s}
                        </li>
                      ))}
                      {analysis.strengths.length === 0 && <li className="text-xs text-zinc-600">No significant strengths detected</li>}
                    </ul>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                          <span className="text-rose-500 mt-0.5">✗</span>{w}
                        </li>
                      ))}
                      {analysis.weaknesses.length === 0 && <li className="text-xs text-emerald-500 font-medium">All stats meet requirements!</li>}
                    </ul>
                  </div>
                </div>

                {/* Recommended Skills */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <span>Recommended Skills</span>
                    <HelpTooltip content="Skill yang sering digunakan pemain top." />
                  </h3>
                  <div className="space-y-2">
                    {analysis.recommendedSkills.map((sk, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-white">{sk.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{sk.reason}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${sk.priority === 'S' ? 'bg-violet-600/20 text-violet-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {sk.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Support Deck */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <span>Recommended Support Deck</span>
                    <HelpTooltip content="Support card yang direkomendasikan." />
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {analysis.recommendedDeck.map((d, i) => (
                      <div key={i} className="text-center p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/30">
                        <p className="text-xs font-bold text-white">{d.type}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{d.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
