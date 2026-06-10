'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Search, 
  Filter, 
  Flag,
  X,
  Compass,
  Award,
  Users
} from 'lucide-react'
import { LoadingState, EmptyState } from '@/components/shared/ui-states'
import HelpTooltip from '@/components/shared/help-tooltip'

interface Race {
  id: string
  name: string
  distance: number
  groundType: string
  season: string
  grade: string
  fanRequirement: number
  direction: string
  weather?: string
  surface?: string
}

export default function RaceExplorerPage() {
  const [search, setSearch] = useState('')
  const [groundType, setGroundType] = useState('All')
  const [season, setSeason] = useState('All')
  const [selectedGrade, setSelectedGrade] = useState('All')

  // Race Detail Drawer State
  const [activeRace, setActiveRace] = useState<Race | null>(null)

  // Query races list
  const { data: races = [], isLoading, error } = useQuery<Race[]>({
    queryKey: ['racesCatalog'],
    queryFn: async () => {
      const res = await fetch('/api/races')
      if (!res.ok) throw new Error('Failed to load races catalog')
      return res.json()
    }
  })

  const filteredRaces = races.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase())
    const matchesGround = groundType === 'All' || r.groundType === groundType
    const matchesSeason = season === 'All' || r.season === season
    const matchesGrade = selectedGrade === 'All' || r.grade === selectedGrade
    return matchesSearch && matchesGround && matchesSeason && matchesGrade
  })

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Race Explorer</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Catalog of official track runs including distance specs, terrain types, directions, and qualification fan bounds.
        </p>
      </div>

      {/* Filters Dashboard */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-4 space-y-4 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-2 flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search race name or track specifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl py-2 pl-9 pr-10 text-xs text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-550 outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <HelpTooltip content="Cari race berdasarkan nama." />
            </div>
          </div>

          <div className="flex items-center justify-end text-xs text-zinc-500 gap-1.5 font-medium">
            <Filter className="w-3.5 h-3.5 text-violet-400" />
            <span>Found {filteredRaces.length} Races</span>
          </div>
        </div>

        {/* Categories filters */}
        <div className="flex flex-col gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900/60 text-xs">
          
          {/* Ground Type */}
          <div className="flex items-start md:items-center gap-2 flex-col md:flex-row">
            <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] shrink-0 mt-1.5 md:mt-0">Ground Type:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Turf', 'Dirt'].map(g => (
                <button
                  key={g}
                  onClick={() => setGroundType(g)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                    groundType === g
                      ? 'bg-violet-600 border-violet-500 text-white font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Season */}
          <div className="flex items-start md:items-center gap-2 flex-col md:flex-row">
            <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] shrink-0 mt-1.5 md:mt-0">Season:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Spring', 'Summer', 'Autumn', 'Winter'].map(s => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                    season === s
                      ? 'bg-violet-600 border-violet-500 text-white font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grade */}
          <div className="flex items-start md:items-center gap-2 flex-col md:flex-row">
            <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] shrink-0 mt-1.5 md:mt-0">Grade:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'G1', 'G2', 'G3', 'Pre-OP', 'OP'].map(grade => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedGrade === grade
                      ? 'bg-violet-600 border-violet-500 text-white font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-855 text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Races list cards */}
      {isLoading ? (
        <LoadingState message="Fetching official races roster..." />
      ) : error ? (
        <div className="p-8 text-center text-red-400 border border-red-955/40 rounded-xl bg-red-950/5">
          Error: {error.message || 'Failed to load races list.'}
        </div>
      ) : filteredRaces.length === 0 ? (
        <EmptyState 
          title="No Races Roster Found"
          description="No official runs match your active terrain filters or search strings. Try adjusting category values."
          actionLabel="Clear Filters"
          onAction={() => { setSearch(''); setGroundType('All'); setSeason('All'); setSelectedGrade('All'); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRaces.map(race => (
            <div 
              key={race.id} 
              onClick={() => setActiveRace(race)}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-extrabold">
                  <span className="bg-violet-600/10 border border-violet-500/30 text-violet-650 dark:text-violet-400 px-2 py-0.5 rounded uppercase">
                    {race.grade}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                    {race.season} Season
                  </span>
                </div>

                <h3 className="font-bold text-zinc-800 dark:text-white text-sm group-hover:text-violet-650 dark:group-hover:text-violet-400 transition-colors">
                  {race.name}
                </h3>
              </div>

              {/* Race specs details */}
              <div className="grid grid-cols-3 gap-1.5 border-t border-zinc-100 dark:border-zinc-900/60 pt-3 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">
                <div>
                  <span className="block text-[8px] text-zinc-400">Distance</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-bold">{race.distance}m</span>
                </div>
                <div>
                  <span className="block text-[8px] text-zinc-400">Track Type</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-bold">{race.groundType}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-zinc-400">Direction</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-bold truncate block" title={race.direction}>{race.direction}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Detail Modal Drawer */}
      <AnimatePresence>
        {activeRace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-violet-600/10 border border-violet-900/50 text-violet-650 dark:text-violet-400 rounded">
                      {activeRace.grade} GRADE
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 text-zinc-550 rounded uppercase">
                      {activeRace.season} RUN
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-white font-display leading-tight">{activeRace.name}</h2>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">ID: {activeRace.id}</p>
                </div>
                <button
                  onClick={() => setActiveRace(null)}
                  className="p-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-4 text-xs">
                
                {/* Specific stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 rounded-xl p-3.5 space-y-1">
                    <span className="block text-[9px] text-zinc-450 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5 text-violet-400" /> Distance Focus
                      <HelpTooltip content="Panjang lintasan race." />
                    </span>
                    <span className="text-base font-extrabold text-zinc-850 dark:text-white font-display">
                      {activeRace.distance} meters
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 rounded-xl p-3.5 space-y-1">
                    <span className="block text-[9px] text-zinc-450 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-violet-400" /> Terrain & Turf
                      <HelpTooltip content="Jenis lintasan yang digunakan." />
                    </span>
                    <span className="text-base font-extrabold text-zinc-850 dark:text-white font-display">
                      {activeRace.groundType}
                    </span>
                  </div>
                </div>

                {/* Requirements & specs */}
                <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 space-y-3">
                  <span className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Race Conditions</span>
                  
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-zinc-650 dark:text-zinc-450 border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                      <span className="font-semibold">Direction:</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold">{activeRace.direction}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-650 dark:text-zinc-450 border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                      <span className="font-semibold">Minimum Fan Requirement:</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-zinc-500" /> {activeRace.fanRequirement.toLocaleString()} Fans
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-650 dark:text-zinc-450 border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                      <span className="font-semibold flex items-center gap-1">
                        Weather Outlook
                        <HelpTooltip content="Kondisi cuaca race." />
                      </span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold">{activeRace.weather || 'Sunny'}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-650 dark:text-zinc-450">
                      <span className="font-semibold">Surface Condition:</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold">{activeRace.surface || 'Good'}</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Setup */}
                <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 space-y-3">
                  <span className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Recommended Setup</span>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-zinc-655 dark:text-zinc-450 border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                      <span className="font-semibold flex items-center gap-1">
                        Recommended Stats
                        <HelpTooltip content="Stat minimum yang disarankan." />
                      </span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold">SPD 900+ • STM 700+</span>
                    </div>
                    <div className="flex flex-col gap-1 text-zinc-650 dark:text-zinc-450">
                      <span className="font-semibold flex items-center gap-1">
                        Recommended Skills
                        <HelpTooltip content="Skill yang efektif pada race ini." />
                      </span>
                      <span className="text-violet-400 font-bold">Corner Maestro, Shadow Break</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
