'use client'

import { useEffect, useState } from 'react'
import { Target, Zap, TrendingUp, BookOpen, Calendar, ChevronRight, Star, Layers } from 'lucide-react'

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

type PrepPlan = {
  targetSpeed: number
  targetStamina: number
  targetPower: number
  targetGuts: number
  targetWisdom: number
  requiredSkills: { name: string; priority: string; reason: string }[]
  aptitudeChecks: { category: string; required: string; note: string }[]
  targetDeck: { type: string; count: number; note: string }[]
  trainingStrategy: string[]
  daysRemaining: number
  isAchievable: boolean
}

function buildPrepPlan(event: Event, currentSpeed: number, currentStamina: number, currentPower: number, currentGuts: number, currentWisdom: number): PrepPlan {
  const dist = event.distance || 2000
  const isLong = dist >= 2400
  const isMile = dist >= 1400 && dist < 2000
  const isSprint = dist < 1400
  const isHeavy = event.trackCondition === 'Heavy'

  const targetSpeed = isSprint ? 1400 : isMile ? 1250 : isLong ? 1100 : 1200
  const targetStamina = isSprint ? 500 : isMile ? 700 : isLong ? 1100 : 850
  const targetPower = 1000
  const targetGuts = isHeavy ? 700 : 500
  const targetWisdom = 800

  const daysRemaining = Math.max(0, Math.floor((new Date(event.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  const missingTotal = Math.max(0, targetSpeed - currentSpeed) + Math.max(0, targetStamina - currentStamina) +
    Math.max(0, targetPower - currentPower) + Math.max(0, targetGuts - currentGuts) + Math.max(0, targetWisdom - currentWisdom)
  const isAchievable = daysRemaining > 7 && missingTotal < 2000

  const requiredSkills = [
    { name: isLong ? 'Corner Maestro' : 'Concentration', priority: 'S', reason: isLong ? 'Essential stamina recovery for long distance' : 'Race start advantage at mile/sprint' },
    { name: 'Straight Speed Boost', priority: 'A', reason: 'Activate in final 200m for finishing power' },
    { name: isHeavy ? 'Mudder' : 'Overtaking Skill', priority: 'A', reason: isHeavy ? 'Heavy track condition resistance' : 'Position advantage in final phase' },
    { name: 'Recovery Passive', priority: 'B', reason: 'Passive stamina recovery throughout race' },
  ]

  const aptitudeChecks = [
    { category: 'Distance Aptitude', required: isSprint ? 'Sprint: A+' : isMile ? 'Mile: A+' : isLong ? 'Long: A+' : 'Medium: A+', note: 'Must match race distance or accept 10-15% stat penalty' },
    { category: 'Ground Aptitude', required: `${event.groundType}: A+`, note: 'Turf/Dirt mismatch causes severe stat reduction' },
    { category: 'Running Style', required: 'Match your style to event meta', note: 'Leader/Runner recommended for CM events' },
  ]

  const targetDeck = [
    { type: 'Stamina SSR', count: isLong ? 2 : 1, note: isLong ? 'Two stamina SSRs required for long distance' : 'One stamina card for endurance' },
    { type: 'Speed SSR', count: 2, note: 'Primary training stat boost cards' },
    { type: 'Wisdom SSR', count: 1, note: 'Pacing improvement and corner strategy' },
    { type: 'Power/Group SSR', count: isLong ? 1 : 2, note: 'Fill remaining slots with power or group cards' },
  ]

  const trainingStrategy: string[] = []
  if (currentStamina < targetStamina) trainingStrategy.push(`🏃 Priority: Stamina Training (need ${targetStamina - currentStamina} more points)`)
  if (currentSpeed < targetSpeed) trainingStrategy.push(`⚡ Focus: Speed Training (need ${targetSpeed - currentSpeed} more points)`)
  if (currentPower < targetPower) trainingStrategy.push(`💪 Power Training to fill energy gaps`)
  if (daysRemaining < 14) trainingStrategy.push(`⏰ URGENT: Only ${daysRemaining} days left — maximize bond events`)
  if (isHeavy) trainingStrategy.push(`🌧️ Heavy track — invest in Guts stat and Mudder skills`)
  trainingStrategy.push(`✨ Complete Bond Events with your support deck to earn rare skills`)
  trainingStrategy.push(`🎯 Aim for a training scenario that aligns with your target distance`)

  return { targetSpeed, targetStamina, targetPower, targetGuts, targetWisdom, requiredSkills, aptitudeChecks, targetDeck, trainingStrategy, daysRemaining, isAchievable }
}

export default function PreparationPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [currentSpeed, setCurrentSpeed] = useState(700)
  const [currentStamina, setCurrentStamina] = useState(500)
  const [currentPower, setCurrentPower] = useState(650)
  const [currentGuts, setCurrentGuts] = useState(350)
  const [currentWisdom, setCurrentWisdom] = useState(450)
  const [plan, setPlan] = useState<PrepPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events')
        const data = await res.json()
        setEvents((data.events || []).filter((e: Event) => e.eventStatus !== 'ENDED'))
      } catch {}
      finally { setLoading(false) }
    }
    fetchEvents()
  }, [])

  function generatePlan() {
    if (!selectedEvent) return
    const p = buildPrepPlan(selectedEvent, currentSpeed, currentStamina, currentPower, currentGuts, currentWisdom)
    setPlan(p)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="relative overflow-hidden border-b border-zinc-900 bg-gradient-to-br from-cyan-900/10 via-zinc-950 to-teal-900/10">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-3 uppercase tracking-wider">
            <Target className="w-4 h-4" />
            Event Preparation Planner
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Preparation</span> Tool
          </h1>
          <p className="text-zinc-400 max-w-xl">Select your target event, input current character stats, and receive a full preparation roadmap with target stats, required skills, and training strategy.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" /> Target Event
              </h2>
              {loading ? (
                <div className="h-24 bg-zinc-800 rounded-lg animate-pulse" />
              ) : (
                <div className="space-y-2">
                  {events.map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => { setSelectedEvent(ev); setPlan(null) }}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        selectedEvent?.id === ev.id
                          ? 'bg-cyan-600/10 border-cyan-500/40 text-cyan-300'
                          : 'bg-zinc-800/50 border-zinc-700/40 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <div className="font-bold text-white text-[11px]">{ev.name}</div>
                      <div className="flex items-center gap-2 mt-1 text-zinc-500">
                        {ev.distance && <span>{ev.distance}m</span>}
                        <span className={`font-bold ${ev.eventStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {ev.eventStatus}
                        </span>
                      </div>
                    </button>
                  ))}
                  {events.length === 0 && <p className="text-zinc-500 text-xs text-center py-4">No upcoming or active events</p>}
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Current Stats
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Speed', value: currentSpeed, setter: setCurrentSpeed },
                  { label: 'Stamina', value: currentStamina, setter: setCurrentStamina },
                  { label: 'Power', value: currentPower, setter: setCurrentPower },
                  { label: 'Guts', value: currentGuts, setter: setCurrentGuts },
                  { label: 'Wisdom', value: currentWisdom, setter: setCurrentWisdom },
                ].map(({ label, value, setter }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">{label}</span>
                      <span className="text-white font-bold">{value}</span>
                    </div>
                    <input
                      type="range" min={100} max={2000} step={10} value={value}
                      onChange={e => { setter(Number(e.target.value)); setPlan(null) }}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={generatePlan}
                disabled={!selectedEvent}
                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:opacity-90 text-white font-bold text-sm transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Generate Prep Plan
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {!plan ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 font-semibold">Select an event to generate your preparation plan</p>
                <p className="text-zinc-600 text-sm mt-1">The tool will compute target stats, required skills, and training priorities</p>
              </div>
            ) : (
              <>
                {/* Readiness Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${plan.isAchievable ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div>
                    <p className={`text-sm font-bold ${plan.isAchievable ? 'text-emerald-400' : 'text-red-400'}`}>
                      {plan.isAchievable ? '✅ Preparation is achievable' : '⚠️ Extremely tight timeline'}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{plan.daysRemaining} days remaining until event ends</p>
                  </div>
                  <span className="text-3xl font-black text-white">{plan.daysRemaining}<span className="text-sm text-zinc-500">d</span></span>
                </div>

                {/* Target Stats */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" /> Target Stats
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { label: 'Speed', target: plan.targetSpeed, current: currentSpeed },
                      { label: 'Stamina', target: plan.targetStamina, current: currentStamina },
                      { label: 'Power', target: plan.targetPower, current: currentPower },
                      { label: 'Guts', target: plan.targetGuts, current: currentGuts },
                      { label: 'Wisdom', target: plan.targetWisdom, current: currentWisdom },
                    ].map(({ label, target, current }) => {
                      const met = current >= target
                      return (
                        <div key={label} className="bg-zinc-800/60 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-zinc-500 mb-1">{label}</p>
                          <p className={`text-xl font-black ${met ? 'text-emerald-400' : 'text-white'}`}>{target}</p>
                          {!met && <p className="text-[10px] text-amber-400 font-bold mt-1">-{target - current}</p>}
                          {met && <p className="text-[10px] text-emerald-500 font-bold mt-1">✓ Met</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Required Skills */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" /> Required Skills
                  </h3>
                  <div className="space-y-2">
                    {plan.requiredSkills.map((sk, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-white">{sk.name}</p>
                          <p className="text-[10px] text-zinc-500">{sk.reason}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${sk.priority === 'S' ? 'bg-violet-600/20 text-violet-400' : sk.priority === 'A' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-700/40 text-zinc-400'}`}>
                          {sk.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aptitude Checks */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" /> Aptitude Requirements
                  </h3>
                  <div className="space-y-2">
                    {plan.aptitudeChecks.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/60 rounded-xl">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-white">{a.category}: <span className="text-indigo-300">{a.required}</span></p>
                          <p className="text-[10px] text-zinc-500">{a.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Deck */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-400" /> Target Support Deck
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {plan.targetDeck.map((d, i) => (
                      <div key={i} className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/30">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-white">{d.type}</p>
                          <span className="text-[10px] text-teal-400 font-bold">x{d.count}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">{d.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training Strategy */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Training Strategy
                  </h3>
                  <ul className="space-y-2">
                    {plan.trainingStrategy.map((s, i) => (
                      <li key={i} className="text-xs text-zinc-300 p-2.5 bg-zinc-800/40 rounded-lg leading-relaxed">{s}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
