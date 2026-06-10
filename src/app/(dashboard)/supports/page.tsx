'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, 
  Filter, 
  Layers, 
  Sparkles, 
  BookOpen, 
  Info, 
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
}

interface EventChoice {
  text: string
  reward: string
}

interface CardEvent {
  title: string
  choices: EventChoice[]
}

interface SupportCard {
  id: string
  name: string
  rarity: string // SSR, SR, R
  type: string // Speed, Stamina, Power, Guts, Wisdom, Friend, Group
  imageUrl?: string
  effects: string // JSON representation
  events?: string // JSON representation
  skills: Skill[]
}

export default function SupportsPage() {
  const [search, setSearch] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [activeCard, setActiveCard] = useState<SupportCard | null>(null)

  // Fetch support cards via React Query
  const { data: cards = [], isLoading } = useQuery<SupportCard[]>({
    queryKey: ['supportCards'],
    queryFn: async () => {
      const res = await fetch('/api/supports')
      if (!res.ok) throw new Error('Failed to load support cards')
      return res.json()
    }
  })

  // Filter cards
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase())
    const matchesRarity = selectedRarity === 'All' || card.rarity === selectedRarity
    const matchesType = selectedType === 'All' || card.type === selectedType
    return matchesSearch && matchesRarity && matchesType
  })

  // Parser helpers
  const getCardEffects = (card: SupportCard): Record<string, string> => {
    try {
      return JSON.parse(card.effects)
    } catch {
      return {}
    }
  }

  const getCardEvents = (card: SupportCard): CardEvent[] => {
    if (!card.events) return []
    try {
      return JSON.parse(card.events)
    } catch {
      return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Support Card Explorer</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Analisis efek kartu support, bonus latihan (Friendship & Training), skema event pilihan, dan bonus skill hints.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-2 flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari kartu support..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg py-2 pl-9 pr-10 text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <HelpTooltip content="Cari kartu support berdasarkan nama." />
            </div>
          </div>

          <div className="flex items-center justify-end text-xs text-zinc-500 gap-1.5">
            <Filter className="w-3.5 h-3.5 text-violet-400" />
            <span>Found {filteredCards.length} Support Decks</span>
          </div>
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-zinc-900/60 text-xs">
          {/* Rarity filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider">Rarity:</span>
            <div className="flex items-center gap-1">
              {['All', 'SSR', 'SR', 'R'].map(rarity => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                    selectedRarity === rarity
                      ? 'bg-violet-600 border-violet-500 text-white font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider">Type:</span>
            <div className="flex items-center gap-1">
              {['All', 'Speed', 'Stamina', 'Power', 'Guts', 'Wisdom'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                    selectedType === type
                      ? 'bg-violet-600 border-violet-500 text-white font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Support Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-12 text-center text-zinc-500">
          Tidak ada kartu support yang cocok dengan filter Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCards.map((card) => {
            const cardEffects = getCardEffects(card)
            return (
              <div
                key={card.id}
                onClick={() => setActiveCard(card)}
                className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-violet-600/5 relative"
              >
                {/* Rarity & Type Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                    {card.rarity}
                  </span>
                  <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md ${
                    card.type === 'Speed' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/50' :
                    card.type === 'Stamina' ? 'bg-rose-950/40 text-rose-400 border border-rose-900/50' :
                    card.type === 'Power' ? 'bg-orange-950/40 text-orange-400 border border-orange-900/50' :
                    card.type === 'Guts' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' :
                    'bg-cyan-950/40 text-cyan-400 border border-cyan-900/50'
                  }`}>
                    {card.type}
                  </span>
                </div>

                <h3 className="font-bold text-white text-md group-hover:text-violet-400 transition-colors leading-snug">
                  {card.name}
                </h3>

                {/* Primary Card Effects */}
                <div className="space-y-1 mt-3 text-xs border-t border-zinc-900/60 pt-3">
                  {cardEffects.friendshipBonus && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Friendship Bonus:</span>
                      <span className="text-zinc-200 font-semibold">{cardEffects.friendshipBonus}</span>
                    </div>
                  )}
                  {cardEffects.trainingEffect && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Training Effect:</span>
                      <span className="text-zinc-200 font-semibold">{cardEffects.trainingEffect}</span>
                    </div>
                  )}
                  {cardEffects.initialBond && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Initial Bond:</span>
                      <span className="text-zinc-200 font-semibold">{cardEffects.initialBond}</span>
                    </div>
                  )}
                </div>

                {/* Skills Hint count footer */}
                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center gap-1.5 text-[9px] text-zinc-500">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Provides {card.skills.length} Skill Hints</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Support Card Detail Modal */}
      {activeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex items-start justify-between gap-4 sticky top-0 bg-zinc-950 z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                    {activeCard.rarity} CARD
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-violet-600/10 border border-violet-900/50 text-violet-400 rounded">
                    {activeCard.type} TYPE
                  </span>
                </div>
                <h2 className="text-xl font-extrabold font-display text-white">{activeCard.name}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Card ID: {activeCard.id}</p>
              </div>
              <button
                onClick={() => setActiveCard(null)}
                className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Detailed Effects List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  Support Effects & Multipliers
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(getCardEffects(activeCard)).map(([effectKey, value]) => {
                    // format effect names
                    const formattedKey = effectKey
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())

                    const getEffectHelp = (key: string) => {
                      const lower = key.toLowerCase();
                      if (lower.includes('training')) return "Bonus tambahan saat melakukan training.";
                      if (lower.includes('friendship')) return "Bonus saat support mencapai friendship tinggi.";
                      if (lower.includes('race')) return "Bonus reward dari race.";
                      if (lower.includes('fan')) return "Bonus jumlah fan yang didapat.";
                      if (lower.includes('hint')) return "Kesempatan mendapatkan skill lebih murah.";
                      return null;
                    }

                    const helpText = getEffectHelp(effectKey);

                    return (
                      <div key={effectKey} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1 justify-between">
                          {formattedKey}
                          {helpText && <HelpTooltip content={helpText} />}
                        </span>
                        <span className="text-base font-extrabold text-violet-400 mt-1">{value}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Card Events Choice Tree */}
              {activeCard.events && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    Card Event Paths
                  </h3>
                  <div className="space-y-3">
                    {getCardEvents(activeCard).map((evt, idx) => (
                      <div key={idx} className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4 space-y-3">
                        <span className="font-bold text-xs text-zinc-300 block">{evt.title}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {evt.choices.map((choice, cIdx) => (
                            <div key={cIdx} className="bg-zinc-950/80 border border-zinc-800/40 rounded-lg p-2.5">
                              <span className="block text-[11px] font-semibold text-white">└ Option: &quot;{choice.text}&quot;</span>
                              <span className="block text-[10px] text-emerald-400 font-medium mt-1">Reward: {choice.reward}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Provided Skill Hints */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  Skill Hints Offered ({activeCard.skills.length})
                </h3>
                {activeCard.skills.length === 0 ? (
                  <p className="text-xs text-zinc-500">Kartu ini tidak menyediakan bonus skill hint.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {activeCard.skills.map(skill => (
                      <div key={skill.id} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1">
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
