'use client'

import { useEffect, useState } from 'react'
import { Trophy, Calendar, Zap, Star, Filter, Clock, MapPin, Wind, Droplets, ArrowRight, Bell, TrendingUp } from 'lucide-react'
import Link from 'next/link'
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

const EVENT_TYPE_LABELS: Record<string, string> = {
  CHAMPION_MEETING: 'Champion Meeting',
  LEAGUE_OF_HEROES: 'League of Heroes',
  STORY_EVENT: 'Story Event',
  TEAM_STADIUM: 'Team Stadium',
  CAMPAIGN: 'Campaign',
  LOGIN_BONUS: 'Login Bonus',
  TRAINING_CAMPAIGN: 'Training Campaign',
  GACHA_BANNER: 'Gacha Banner',
}

const EVENT_TYPE_HINTS: Record<string, string> = {
  CHAMPION_MEETING: 'Mode kompetitif PvP musiman.',
  LEAGUE_OF_HEROES: 'Mode kompetitif berbasis tim.',
  STORY_EVENT: 'Event cerita dengan reward khusus.',
  CAMPAIGN: 'Bonus event yang meningkatkan progres pemain.',
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  CHAMPION_MEETING: 'from-violet-600 to-indigo-600',
  LEAGUE_OF_HEROES: 'from-amber-500 to-orange-600',
  STORY_EVENT: 'from-pink-500 to-rose-600',
  TEAM_STADIUM: 'from-emerald-500 to-teal-600',
  CAMPAIGN: 'from-cyan-500 to-blue-600',
  LOGIN_BONUS: 'from-lime-500 to-green-600',
  TRAINING_CAMPAIGN: 'from-orange-500 to-amber-600',
  GACHA_BANNER: 'from-fuchsia-500 to-purple-600',
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  CHAMPION_MEETING: '🏆',
  LEAGUE_OF_HEROES: '⚔️',
  STORY_EVENT: '📖',
  TEAM_STADIUM: '🏟️',
  CAMPAIGN: '🎯',
  LOGIN_BONUS: '🎁',
  TRAINING_CAMPAIGN: '💪',
  GACHA_BANNER: '✨',
}

const STATUS_CONFIG: Record<string, { label: string; class: string; dot: string }> = {
  ACTIVE: { label: 'Active', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-400 animate-pulse' },
  UPCOMING: { label: 'Upcoming', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', dot: 'bg-blue-400' },
  ENDED: { label: 'Ended', class: 'bg-zinc-700/40 text-zinc-500 border border-zinc-700/30', dot: 'bg-zinc-500' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDaysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'ACTIVE' | 'ENDED'>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      const res = await fetch('/api/events')
      if (!res.ok) throw new Error('Gagal memuat daftar event.')
      const data = await res.json()
      setEvents(data.events || [])
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memuat event.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const filtered = events.filter(e => {
    const statusMatch = filter === 'ALL' || e.eventStatus === filter
    const typeMatch = typeFilter === 'ALL' || e.eventType === typeFilter
    return statusMatch && typeMatch
  })

  const activeCount = events.filter(e => e.eventStatus === 'ACTIVE').length
  const upcomingCount = events.filter(e => e.eventStatus === 'UPCOMING').length

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-zinc-950 to-indigo-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold mb-4 tracking-wider uppercase">
            <Zap className="w-4 h-4" />
            Event Center
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
            Live Events & <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Active Campaigns</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mb-8">
            Track all active, upcoming, and past events on the Uma Musume Global server. Never miss a Champion Meeting or Banner again.
          </p>
          {/* Stats Row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold text-sm">{activeCount} Active Now</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-400 font-semibold text-sm">{upcomingCount} Upcoming</span>
            </div>
            <Link href="/events/champion-meeting" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-colors">
              <Trophy className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-violet-400 font-semibold text-sm">CM Analyzer</span>
              <ArrowRight className="w-3 h-3 text-violet-400" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {(['ALL', 'ACTIVE', 'UPCOMING', 'ENDED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === s ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'All Status' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex-wrap">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${typeFilter === 'ALL' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'}`}
            >All Types</button>
            {Object.keys(EVENT_TYPE_LABELS).map(t => (
              <div key={t} className="flex items-center gap-1">
                <button
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${typeFilter === t ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  {EVENT_TYPE_ICONS[t]} {EVENT_TYPE_LABELS[t]}
                </button>
                {EVENT_TYPE_HINTS[t] && (
                  <HelpTooltip content={EVENT_TYPE_HINTS[t]} className="mr-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {errorMsg ? (
          <ErrorState message={errorMsg} onRetry={fetchEvents} />
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Events Found"
            description="Tidak ada turnamen atau campaign yang aktif untuk kategori filter saat ini."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(ev => {
              const status = STATUS_CONFIG[ev.eventStatus] || STATUS_CONFIG.ENDED
              const gradient = EVENT_TYPE_COLORS[ev.eventType] || 'from-zinc-600 to-zinc-700'
              const icon = EVENT_TYPE_ICONS[ev.eventType] || '🎯'
              const daysLeft = getDaysLeft(ev.endDate)
              const isChampMeeting = ev.eventType === 'CHAMPION_MEETING'

              return (
                <div
                  key={ev.id}
                  className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-violet-900/10 hover:-translate-y-0.5"
                >
                  {/* Color Strip Header */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

                  <div className="p-5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg text-lg`}>
                          {icon}
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{EVENT_TYPE_LABELS[ev.eventType]}</p>
                          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{ev.name}</h3>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${status.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </div>
                    </div>

                    {ev.description && (
                      <p className="text-zinc-400 text-xs leading-relaxed mb-3 line-clamp-2">{ev.description}</p>
                    )}

                    {/* Race Details for CM/LOH */}
                    {isChampMeeting && ev.distance && (
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-lg px-2 py-1.5">
                          <Trophy className="w-3 h-3 text-violet-400" />
                          <span className="text-[10px] text-zinc-300 font-medium">{ev.distance}m {ev.groundType}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-lg px-2 py-1.5">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span className="text-[10px] text-zinc-300 font-medium">{ev.location || 'TBD'}</span>
                        </div>
                        {ev.weather && (
                          <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-lg px-2 py-1.5">
                            <Wind className="w-3 h-3 text-cyan-400" />
                            <span className="text-[10px] text-zinc-300 font-medium">{ev.weather}</span>
                          </div>
                        )}
                        {ev.trackCondition && (
                          <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-lg px-2 py-1.5">
                            <Droplets className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] text-zinc-300 font-medium">{ev.trackCondition}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Date Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(ev.startDate)} – {formatDate(ev.endDate)}</span>
                      </div>
                      {ev.eventStatus === 'ACTIVE' && daysLeft > 0 && (
                        <span className="text-[10px] text-amber-400 font-bold">{daysLeft}d left</span>
                      )}
                    </div>

                    {/* Actions */}
                    {isChampMeeting && (
                      <Link
                        href="/events/champion-meeting"
                        className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${gradient} text-white hover:opacity-90 transition-opacity`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Analyze This Event
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
