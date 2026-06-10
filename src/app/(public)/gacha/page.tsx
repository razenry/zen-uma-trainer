'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Star, Clock, CalendarDays, TrendingUp, ChevronRight, Gift, Users, Shield } from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'

type Banner = {
  id: string
  name: string
  bannerType: string
  startDate: string
  endDate: string
  featuredContent: string | null
  rateUpContent: string | null
  status: string
  bannerStatus: string
}

type GachaAdvice = {
  action: 'PULL' | 'SKIP' | 'MAYBE'
  reasons: string[]
  recommendation: string
}

function analyzeGacha(banner: Banner, ownedCharacters: string[], ownedSupports: string[]): GachaAdvice {
  const rateUp = JSON.parse(banner.rateUpContent || '[]') as string[]
  const isChar = banner.bannerType === 'CHARACTER'

  const alreadyOwned = rateUp.some(id => 
    isChar ? ownedCharacters.includes(id) : ownedSupports.includes(id)
  )

  const reasons: string[] = []
  let action: 'PULL' | 'SKIP' | 'MAYBE' = 'MAYBE'
  let recommendation = ''

  if (alreadyOwned && isChar) {
    reasons.push('Already own the featured character (duplicate = limit break only)')
    reasons.push('Consider saving tickets for new character releases')
    action = 'SKIP'
    recommendation = 'Save gems for anniversary or new character banners'
  } else if (alreadyOwned && !isChar) {
    reasons.push('Already own the featured support card')
    reasons.push('Duplicate SSR support cards can increase limit break level')
    if (rateUp.length > 0) {
      reasons.push('Limited banner – duplicates have value for max lb')
      action = 'MAYBE'
      recommendation = 'Pull if you want max limit break on the support. Otherwise save.'
    }
  } else if (!alreadyOwned && isChar) {
    reasons.push('New character not in your roster')
    reasons.push('Strong addition for competitive events')
    action = 'PULL'
    recommendation = 'Strongly recommended pull – secure the featured character'
  } else if (!alreadyOwned && !isChar) {
    reasons.push('Missing SSR support card from your deck')
    reasons.push('Strong support card increases training efficiency significantly')
    action = 'PULL'
    recommendation = 'Pull to expand your support card deck for training diversity'
  }

  if (banner.bannerStatus === 'UPCOMING') {
    reasons.push('Banner not yet active – save your gems')
    if (action === 'PULL') action = 'MAYBE'
    recommendation = 'Wait for banner to go live before pulling'
  }

  return { action, reasons, recommendation }
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: 'Active', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  UPCOMING: { label: 'Upcoming', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  ENDED: { label: 'Ended', class: 'bg-zinc-700/40 text-zinc-500 border border-zinc-700/30' },
}

const ACTION_CONFIG: Record<string, { label: string; class: string; icon: string }> = {
  PULL: { label: 'PULL', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '✅' },
  MAYBE: { label: 'MAYBE', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: '🤔' },
  SKIP: { label: 'SKIP', class: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '❌' },
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function GachaPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'ENDED'>('ACTIVE')
  // Simulated owned items for demo
  const ownedCharacters = ['char_special_week']
  const ownedSupports: string[] = []

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch('/api/banners')
        const data = await res.json()
        setBanners(data.banners || [])
      } catch {}
      finally { setLoading(false) }
    }
    fetchBanners()
  }, [])

  const filtered = banners.filter(b => filter === 'ALL' || b.bannerStatus === filter)
  const activeCount = banners.filter(b => b.bannerStatus === 'ACTIVE').length
  const upcomingCount = banners.filter(b => b.bannerStatus === 'UPCOMING').length

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/20 via-zinc-950 to-purple-900/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-semibold mb-4 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Gacha Banner System
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Banner <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">Planner</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mb-8">
            Track current, upcoming, and past gacha banners. The built-in Gacha Analyzer evaluates your roster to give Pull / Skip / Maybe recommendations.
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold text-sm">{activeCount} Active</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-400 font-semibold text-sm">{upcomingCount} Upcoming</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6 w-fit">
          {(['ALL', 'ACTIVE', 'UPCOMING', 'ENDED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filter === s ? 'bg-fuchsia-600 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              {s === 'ALL' ? 'All Banners' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Banner Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No banners found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(banner => {
              const status = STATUS_CONFIG[banner.bannerStatus] || STATUS_CONFIG.ENDED
              const isChar = banner.bannerType === 'CHARACTER'
              const advice = analyzeGacha(banner, ownedCharacters, ownedSupports)
              const actionCfg = ACTION_CONFIG[advice.action]
              const daysLeft = Math.ceil((new Date(banner.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

              return (
                <div key={banner.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-fuchsia-900/10">
                  {/* Banner Header */}
                  <div className={`h-1.5 w-full ${isChar ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`} />
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${isChar ? 'bg-fuchsia-600/20' : 'bg-amber-500/20'}`}>
                          {isChar ? '🌟' : '🃏'}
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">
                            {isChar ? 'Character Banner' : 'Support Banner'}
                          </p>
                          <h3 className="text-white font-bold text-sm leading-tight">{banner.name}</h3>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.class}`}>{status.label}</span>
                    </div>

                    {banner.featuredContent && (
                      <div className="flex items-center gap-2 p-2.5 bg-zinc-800/60 rounded-xl mb-3">
                        <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="text-xs text-zinc-300 font-medium">{banner.featuredContent}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-4">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        <span>{formatDate(banner.startDate)} – {formatDate(banner.endDate)}</span>
                      </div>
                      {banner.bannerStatus === 'ACTIVE' && daysLeft > 0 && (
                        <span className="text-amber-400 font-bold">{daysLeft}d left</span>
                      )}
                    </div>

                    {/* Gacha Analyzer */}
                    <div className={`p-3 rounded-xl border ${actionCfg.class} mb-3`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold">Gacha Analyzer</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${actionCfg.class} flex items-center gap-1`}>
                          {actionCfg.icon} {actionCfg.label}
                          {advice.action === 'PULL' && <HelpTooltip content="Disarankan melakukan pull." />}
                          {advice.action === 'SKIP' && <HelpTooltip content="Disarankan menyimpan resource." />}
                          {advice.action === 'MAYBE' && <HelpTooltip content="Masih layak dipertimbangkan." />}
                        </span>
                      </div>

                      {/* Meta Impact */}
                      <div className="mb-2 flex items-center justify-between text-[10px] text-zinc-400 border-b border-dashed border-current/25 pb-1.5">
                        <span className="flex items-center gap-1">
                          Meta Impact
                          <HelpTooltip content="Dampak banner terhadap meta saat ini." />
                        </span>
                        <span className="font-bold text-white uppercase">{isChar ? 'Medium Impact' : 'High Impact (Core)'}</span>
                      </div>

                      <ul className="space-y-1">
                        {advice.reasons.map((r, i) => (
                          <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-1.5">
                            <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-60" />
                            {r}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10px] font-semibold text-white mt-2 pt-2 border-t border-current/20">
                        💡 {advice.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Gacha Note */}
        <div className="mt-8 p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-zinc-500">
              <strong className="text-zinc-400">Note:</strong> Gacha Analyzer recommendations are based on your current roster. 
              Update your owned characters and support cards in your profile to get personalized pull advice. 
              Base SSR rate in Uma Musume is 3%. Rate-up SSR rate is approximately 1.5%.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
