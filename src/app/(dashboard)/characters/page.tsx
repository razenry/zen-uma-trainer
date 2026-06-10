'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, 
  Filter, 
  Sparkles, 
  Info, 
  Star, 
  Activity, 
  BookOpen,
  Calendar,
  X,
  Loader2 
} from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'

interface Skill {
  id: string
  name: string
  description: string
  category: string
  trigger: string
}

interface EventChoice {
  text: string
  reward: string
}

interface TrainingEvent {
  title: string
  choices: EventChoice[]
}

interface Character {
  id: string
  name: string
  rarity: number
  distanceType: string
  runningStyle: string
  growthBonus: string
  imageUrl?: string
  uniqueSkillId?: string
  uniqueSkill?: Skill
  skills: Skill[]
  events?: string // JSON string
}

export default function CharactersPage() {
  const [search, setSearch] = useState('')
  const [selectedDistance, setSelectedDistance] = useState<string>('All')
  const [selectedStyle, setSelectedStyle] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('rarity-desc')
  const [activeChar, setActiveChar] = useState<Character | null>(null)

  // Fetch characters from our route handler
  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ['characters'],
    queryFn: async () => {
      const res = await fetch('/api/characters')
      if (!res.ok) throw new Error('Failed to load characters')
      return res.json()
    }
  })

  // Filter & Sort
  const filteredCharacters = characters
    .filter(char => {
      const matchesSearch = char.name.toLowerCase().includes(search.toLowerCase())
      const matchesDistance = selectedDistance === 'All' || char.distanceType.includes(selectedDistance)
      const matchesStyle = selectedStyle === 'All' || char.runningStyle.includes(selectedStyle)
      return matchesSearch && matchesDistance && matchesStyle
    })
    .sort((a, b) => {
      if (sortBy === 'rarity-desc') return b.rarity - a.rarity
      if (sortBy === 'rarity-asc') return a.rarity - b.rarity
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
      return b.name.localeCompare(a.name)
    })

  // Parse events JSON helper
  const getEventsList = (char: Character): TrainingEvent[] => {
    if (!char.events) return []
    try {
      return JSON.parse(char.events)
    } catch {
      return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Character Explorer</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Jelajahi basis data Uma Musume beserta bonus pertumbuhan, statistik kecocokan, skill unik, dan daftar event latihan.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2 flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari nama karakter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg py-2 pl-9 pr-10 text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <HelpTooltip content="Cari karakter berdasarkan nama." />
            </div>
          </div>

          {/* Sort Selection */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 rounded-lg py-2 px-3 outline-none focus:border-violet-500 transition-all"
            >
              <option value="rarity-desc">Sort by: Rarity (High to Low)</option>
              <option value="rarity-asc">Sort by: Rarity (Low to High)</option>
              <option value="name-asc">Sort by: Name (A-Z)</option>
              <option value="name-desc">Sort by: Name (Z-A)</option>
            </select>
          </div>

          {/* Quick Filters Indicator */}
          <div className="flex items-center justify-end text-xs text-zinc-500 gap-1.5">
            <Filter className="w-3.5 h-3.5 text-violet-400" />
            <span>Found {filteredCharacters.length} Uma Musume</span>
          </div>
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-zinc-900/60 text-xs">
          {/* Distance Filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider">Distance:</span>
            <div className="flex items-center gap-1">
              {['All', 'Short', 'Mile', 'Medium', 'Long'].map(dist => (
                <button
                  key={dist}
                  onClick={() => setSelectedDistance(dist)}
                  className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                    selectedDistance === dist
                      ? 'bg-violet-600 border-violet-500 text-white font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          {/* Running Style Filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider">Running Style:</span>
            <div className="flex items-center gap-1">
              {['All', 'Runner', 'Leader', 'Betweener', 'Chaser'].map(style => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                    selectedStyle === style
                      ? 'bg-violet-600 border-violet-500 text-white font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Characters */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-12 text-center text-zinc-500">
          Tidak ada karakter yang cocok dengan kriteria filter Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCharacters.map((char) => (
            <div
              key={char.id}
              onClick={() => setActiveChar(char)}
              className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-violet-600/5 relative overflow-hidden"
            >
              {/* Star Rating */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: char.rarity }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Character Details */}
              <h3 className="font-bold text-white text-lg group-hover:text-violet-400 transition-colors leading-tight">
                {char.name}
              </h3>
              
              <div className="space-y-1.5 mt-3 text-xs">
                <div className="flex justify-between text-zinc-400 items-center">
                  <span className="flex items-center gap-1">
                    Growth Bonus
                    <HelpTooltip content="Bonus pertumbuhan yang mempengaruhi hasil training." />
                  </span>
                  <span className="text-zinc-200 font-semibold text-right">{char.growthBonus}</span>
                </div>
                <div className="flex justify-between text-zinc-400 items-center">
                  <span className="flex items-center gap-1">
                    Aptitude
                    <HelpTooltip content="Kecocokan karakter terhadap jarak dan gaya lari." />
                  </span>
                  <span className="text-zinc-200 font-semibold text-right truncate max-w-[120px]">{char.distanceType}</span>
                </div>
                <div className="flex justify-between text-zinc-400 items-center">
                  <span className="flex items-center gap-1">
                    Running Style
                    <HelpTooltip content="Strategi lari yang digunakan karakter." />
                  </span>
                  <span className="text-zinc-200 font-semibold text-right truncate max-w-[120px]">{char.runningStyle}</span>
                </div>
              </div>

              {/* Unique Skill Card footer */}
              {char.uniqueSkill && (
                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center gap-2 text-[10px] text-zinc-500">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span className="font-semibold text-zinc-400 truncate">Unique: {char.uniqueSkill.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Character Detail Modal Dialog */}
      {activeChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-900 flex items-start justify-between gap-4 sticky top-0 bg-zinc-950 z-10">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {Array.from({ length: activeChar.rarity }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <h2 className="text-2xl font-extrabold font-display text-white">{activeChar.name}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Character ID: {activeChar.id}</p>
              </div>
              <button
                onClick={() => setActiveChar(null)}
                className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    Growth Bonus
                    <HelpTooltip content="Bonus pertumbuhan yang mempengaruhi hasil training." />
                  </span>
                  <span className="text-sm font-bold text-violet-400 block mt-1">{activeChar.growthBonus}</span>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    Aptitude (Dist)
                    <HelpTooltip content="Kecocokan karakter terhadap jarak lari." />
                  </span>
                  <span className="text-sm font-bold text-white block mt-1">{activeChar.distanceType}</span>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 col-span-2 md:col-span-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    Running Style
                    <HelpTooltip content="Strategi lari yang digunakan karakter." />
                  </span>
                  <span className="text-sm font-bold text-white block mt-1">{activeChar.runningStyle}</span>
                </div>
              </div>

              {/* Unique Skill Section */}
              {activeChar.uniqueSkill && (
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-2.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                    Signature Unique Skill
                    <HelpTooltip content="Skill eksklusif milik karakter." />
                  </h3>
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/50 rounded-lg">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-sm text-violet-300">{activeChar.uniqueSkill.name}</span>
                      <span className="text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 bg-violet-600/10 border border-violet-900/50 text-violet-400 rounded-md">
                        {activeChar.uniqueSkill.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                      {activeChar.uniqueSkill.description}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                      <span><strong>Condition:</strong> {activeChar.uniqueSkill.trigger}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended Build Section */}
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-2.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-400" />
                  Rekomendasi Build Meta
                  <HelpTooltip content="Build yang paling efektif berdasarkan meta saat ini." />
                </h3>
                <p className="text-xs text-zinc-350 leading-relaxed">
                  Meta merekomendasikan target stat utama <strong>Speed & Power</strong> untuk mendukung Running Style <strong className="text-violet-400 font-semibold">{activeChar.runningStyle}</strong>. Prioritaskan kartu bantuan tipe Speed dan Intelligent (Wisdom).
                </p>
              </div>

              {/* Training Events choices */}
              {activeChar.events && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    Daftar Event Pilihan Latihan
                  </h3>
                  <div className="space-y-3">
                    {getEventsList(activeChar).map((evt, idx) => (
                      <div key={idx} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 space-y-3">
                        <span className="font-bold text-xs text-zinc-300 block">{evt.title}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {evt.choices.map((choice, cIdx) => (
                            <div key={cIdx} className="bg-zinc-950/80 border border-zinc-800/40 rounded-lg p-2.5">
                              <span className="block text-[11px] font-semibold text-white">└ Pilihan: &quot;{choice.text}&quot;</span>
                              <span className="block text-[10px] text-emerald-400 font-medium mt-1">Hasil: {choice.reward}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Skills List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  Kumpulan Skill Bawaan ({activeChar.skills.length})
                </h3>
                {activeChar.skills.length === 0 ? (
                  <p className="text-xs text-zinc-500">Tidak ada skill bawaan.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {activeChar.skills.map(skill => (
                      <div key={skill.id} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-bold text-xs text-zinc-200">{skill.name}</span>
                          <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-md">
                            {skill.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-normal">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
