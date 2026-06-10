'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Zap, Target, Users, ChevronRight, Clock, Trophy } from 'lucide-react'

type Scenario = {
  id: string
  name: string
  description: string | null
  releaseDate: string | null
  status: string
}

const SCENARIO_GUIDES: Record<string, {
  icon: string
  color: string
  overview: string
  priorityStats: { stat: string; level: string; note: string }[]
  trainingStrategy: string[]
  recommendedDeck: { type: string; count: number; note: string }[]
  recommendedChars: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
}> = {
  'URA Realistic Training': {
    icon: '🏆',
    color: 'from-violet-600 to-indigo-600',
    overview: 'The original Uma Musume scenario. Focuses on the URA Finals championship through 3 main race phases. Balanced stat requirements with a focus on consistently meeting race entry conditions.',
    priorityStats: [
      { stat: 'Speed', level: 'High', note: 'Core requirement for all race phases' },
      { stat: 'Stamina', level: 'High', note: 'Critical for Middle and Long races' },
      { stat: 'Power', level: 'Medium', note: 'Helps maintain position changes' },
      { stat: 'Wisdom', level: 'Medium', note: 'Improves pacing and reduces mistakes' },
      { stat: 'Guts', level: 'Low', note: 'Minor boost to late-race recovery' },
    ],
    trainingStrategy: [
      'Focus on Speed and Stamina in early turns (1-24)',
      'Rush for SSR support bond events to acquire key skills',
      'Enter all fan-required races even if not optimal',
      'Prioritize Unique Skill evolution in the final turn phase',
    ],
    recommendedDeck: [
      { type: 'Speed SSR', count: 2, note: 'Core stat training boost' },
      { type: 'Stamina SSR', count: 2, note: 'Endurance for race phases' },
      { type: 'Wisdom SSR', count: 1, note: 'Pacing and Corner strategy' },
      { type: 'Group/Friend SSR', count: 1, note: 'Energy and motivation management' },
    ],
    recommendedChars: ['Special Week', 'Silence Suzuka', 'Tokai Teio', 'Mejiro McQueen'],
    difficulty: 'Beginner',
  },
  'Aoharu Cup': {
    icon: '🤝',
    color: 'from-teal-600 to-cyan-600',
    overview: 'Team-based training scenario with group matches and cooperative training. Emphasizes Guts and Power synergy through team events. Unique Summer Camp mechanic provides stat burst opportunities.',
    priorityStats: [
      { stat: 'Power', level: 'High', note: 'Team match performance key stat' },
      { stat: 'Guts', level: 'High', note: 'Aoharu team synergy bonus stat' },
      { stat: 'Speed', level: 'High', note: 'Core race performance requirement' },
      { stat: 'Stamina', level: 'Medium', note: 'Sustain through team matches' },
      { stat: 'Wisdom', level: 'Medium', note: 'Error reduction in team events' },
    ],
    trainingStrategy: [
      'Maximize Summer Camp training for burst stat gains',
      'Prioritize team match participation for bonus rewards',
      'Stack Group type support cards for synergy bonuses',
      'Focus on Guts alongside Speed in early training turns',
    ],
    recommendedDeck: [
      { type: 'Speed SSR', count: 2, note: 'Primary stat source' },
      { type: 'Power SSR', count: 1, note: 'Team match advantage' },
      { type: 'Guts SSR', count: 1, note: 'Team synergy bonus stat' },
      { type: 'Group SSR', count: 2, note: 'Aoharu team training boost' },
    ],
    recommendedChars: ['Oguri Cap', 'Vodka', 'Daiwa Scarlet', 'Narita Brian'],
    difficulty: 'Intermediate',
  },
  "Project L'Arc": {
    icon: '🌍',
    color: 'from-amber-500 to-orange-600',
    overview: "Prepare your character for the prestigious Prix de l'Arc de Triomphe in France. Long-distance international race demands exceptional Stamina combined with high Speed. Overseas training trips provide massive stat bonuses.",
    priorityStats: [
      { stat: 'Stamina', level: 'Critical', note: "2400m Arc distance requires max stamina investment" },
      { stat: 'Speed', level: 'High', note: 'High speed required to compete internationally' },
      { stat: 'Power', level: 'High', note: 'Corner and straight acceleration source' },
      { stat: 'Guts', level: 'Medium', note: 'Recovery in late-race phases' },
      { stat: 'Wisdom', level: 'Medium', note: 'Pacing optimization for 2400m' },
    ],
    trainingStrategy: [
      'Invest heavily in Stamina SSRs (2 minimum required)',
      'Complete Overseas Training trips for massive stat bonuses',
      'Acquire Corner Maestro and Recovery skills as top priority',
      "Target 1100+ Stamina before entering the Arc qualifier",
      'Use Project L\'Arc specific training scenarios for multiplier bonuses',
    ],
    recommendedDeck: [
      { type: 'Stamina SSR', count: 2, note: 'Critical for 2400m+ distance' },
      { type: 'Speed SSR', count: 2, note: 'International competition speed requirement' },
      { type: 'Power SSR', count: 1, note: 'Acceleration and corner performance' },
      { type: 'Wisdom SSR', count: 1, note: 'Arc pacing optimization' },
    ],
    recommendedChars: ['Mejiro McQueen', 'Manhattan Cafe', 'Narita Brian', 'Sweep Tosho'],
    difficulty: 'Advanced',
  },
  'U.A.F. Ready GO! Start': {
    icon: '🏟️',
    color: 'from-rose-600 to-pink-600',
    overview: 'Athletic trial-based scenario spanning 15 sports categories. Speed and Power are dominant stats. Trial matches across Athletics, Swimming, and Ball Sports provide unique training bonuses. Strategic sport selection is key.',
    priorityStats: [
      { stat: 'Speed', level: 'Critical', note: 'Core performance stat across all 15 sports' },
      { stat: 'Power', level: 'Critical', note: 'Physical output stat for UAF trials' },
      { stat: 'Guts', level: 'High', note: 'Trial match recovery and endurance' },
      { stat: 'Stamina', level: 'Medium', note: 'Supporting endurance stat' },
      { stat: 'Wisdom', level: 'Low', note: 'Minor pacing improvement' },
    ],
    trainingStrategy: [
      'Prioritize Speed and Power training in ALL phases',
      'Select sport categories that match your character strengths',
      'Stack Power SSR and Speed SSR cards for maximum gains',
      'Complete trial match chains for stat burst bonuses',
      'Acquire Straight Speed skills for final phase performance',
    ],
    recommendedDeck: [
      { type: 'Speed SSR', count: 2, note: 'Dominant training stat' },
      { type: 'Power SSR', count: 2, note: 'UAF trial performance stat' },
      { type: 'Guts SSR', count: 1, note: 'Trial match endurance' },
      { type: 'Group SSR', count: 1, note: 'Team trial bonus' },
    ],
    recommendedChars: ['Special Week', 'Silence Suzuka', 'Vodka', 'Seiun Sky'],
    difficulty: 'Expert',
  },
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Intermediate: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Advanced: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Expert: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'text-red-400 bg-red-500/10',
  High: 'text-amber-400 bg-amber-500/10',
  Medium: 'text-blue-400 bg-blue-500/10',
  Low: 'text-zinc-400 bg-zinc-800/60',
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchScenarios() {
      try {
        const res = await fetch('/api/scenarios')
        const data = await res.json()
        setScenarios(data.scenarios || [])
        if (data.scenarios?.length) setSelected(data.scenarios[0].name)
      } catch {}
      finally { setLoading(false) }
    }
    fetchScenarios()
  }, [])

  const guide = selected ? SCENARIO_GUIDES[selected] : null

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/15 via-zinc-950 to-emerald-900/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-3 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            Scenario Guides
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Training <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Scenario</span> Guide
          </h1>
          <p className="text-zinc-400 max-w-xl">Deep-dive guides for all major Uma Musume training scenarios. Learn optimal stat priorities, deck compositions, and turn-by-turn strategy.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden sticky top-4">
              <div className="p-4 border-b border-zinc-800">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Select Scenario</p>
              </div>
              {loading ? (
                <div className="p-4 space-y-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-zinc-800 rounded-lg animate-pulse" />)}
                </div>
              ) : (
                <div className="p-2">
                  {scenarios.map(sc => {
                    const guide = SCENARIO_GUIDES[sc.name]
                    return (
                      <button
                        key={sc.id}
                        onClick={() => setSelected(sc.name)}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 cursor-pointer mb-1 ${
                          selected === sc.name ? 'bg-teal-600/10 border border-teal-500/30' : 'hover:bg-zinc-800/60'
                        }`}
                      >
                        <span className="text-xl">{guide?.icon || '📋'}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${selected === sc.name ? 'text-teal-300' : 'text-white'}`}>{sc.name}</p>
                          {guide && (
                            <span className={`text-[10px] font-semibold ${DIFFICULTY_COLORS[guide.difficulty]?.split(' ')[0]}`}>
                              {guide.difficulty}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                  {scenarios.length === 0 && <p className="text-zinc-500 text-xs text-center py-6">No scenarios found</p>}
                </div>
              )}
            </div>
          </div>

          {/* Guide Content */}
          <div className="lg:col-span-3 space-y-5">
            {!selected || !guide ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 font-semibold">Select a scenario to view its guide</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className={`bg-gradient-to-br ${guide.color} rounded-2xl p-6`}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{guide.icon}</span>
                    <div>
                      <h2 className="text-2xl font-black text-white">{selected}</h2>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border bg-white/10 text-white border-white/20 mt-1 inline-block`}>
                        {guide.difficulty} Difficulty
                      </span>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">{guide.overview}</p>
                </div>

                {/* Priority Stats */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" /> Priority Stats
                  </h3>
                  <div className="space-y-2">
                    {guide.priorityStats.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${PRIORITY_COLORS[s.level]}`}>{s.level.toUpperCase()}</span>
                        <span className="text-sm font-bold text-white w-20">{s.stat}</span>
                        <span className="text-xs text-zinc-400">{s.note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training Strategy */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" /> Training Strategy
                  </h3>
                  <ul className="space-y-2">
                    {guide.trainingStrategy.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 p-3 bg-zinc-800/50 rounded-xl">
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-zinc-300">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Deck */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-indigo-400" /> Recommended Deck
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {guide.recommendedDeck.map((d, i) => (
                      <div key={i} className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/30">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-white">{d.type}</p>
                          <span className="text-[10px] text-indigo-400 font-bold">×{d.count}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">{d.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Characters */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-400" /> Recommended Characters
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {guide.recommendedChars.map((char, i) => (
                      <span key={i} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300 font-medium">
                        {char}
                      </span>
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
