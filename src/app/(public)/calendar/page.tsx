'use client'

import { useEffect, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Trophy, Sparkles, Clock, Bell, Filter } from 'lucide-react'

type CalendarEvent = {
  id: string
  name: string
  eventType: string
  startDate: string
  endDate: string
  eventStatus: string
  description: string | null
}

type BannerEvent = {
  id: string
  name: string
  bannerType: string
  startDate: string
  endDate: string
  bannerStatus: string
}

const EVENT_COLORS: Record<string, string> = {
  CHAMPION_MEETING: 'bg-violet-600/80 border-violet-500',
  LEAGUE_OF_HEROES: 'bg-amber-600/80 border-amber-500',
  STORY_EVENT: 'bg-pink-600/80 border-pink-500',
  TEAM_STADIUM: 'bg-emerald-600/80 border-emerald-500',
  CAMPAIGN: 'bg-cyan-600/80 border-cyan-500',
  LOGIN_BONUS: 'bg-lime-600/80 border-lime-500',
  TRAINING_CAMPAIGN: 'bg-orange-600/80 border-orange-500',
  GACHA_BANNER: 'bg-fuchsia-600/80 border-fuchsia-500',
  BANNER: 'bg-fuchsia-600/80 border-fuchsia-500',
}

const EVENT_ICONS: Record<string, string> = {
  CHAMPION_MEETING: '🏆',
  LEAGUE_OF_HEROES: '⚔️',
  STORY_EVENT: '📖',
  TEAM_STADIUM: '🏟️',
  CAMPAIGN: '🎯',
  LOGIN_BONUS: '🎁',
  TRAINING_CAMPAIGN: '💪',
  GACHA_BANNER: '✨',
  BANNER: '✨',
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isEventOnDay(event: { startDate: string; endDate: string }, year: number, month: number, day: number) {
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  const date = new Date(year, month, day)
  return date >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) && 
         date <= new Date(end.getFullYear(), end.getMonth(), end.getDate())
}

export default function CalendarPage() {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [banners, setBanners] = useState<BannerEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())
  const [view, setView] = useState<'month' | 'timeline'>('month')

  useEffect(() => {
    async function fetchAll() {
      try {
        const [evRes, banRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/banners'),
        ])
        const [evData, banData] = await Promise.all([evRes.json(), banRes.json()])
        setEvents(evData.events || [])
        setBanners(banData.banners || [])
      } catch {}
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
    setSelectedDay(null)
  }

  function getEventsOnDay(day: number) {
    const evs = events.filter(e => isEventOnDay(e, currentYear, currentMonth, day))
    const bans = banners.filter(b => isEventOnDay(b, currentYear, currentMonth, day))
    return { events: evs, banners: bans }
  }

  const selectedDayData = selectedDay ? getEventsOnDay(selectedDay) : null
  const todayDay = now.getDate()
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear()

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/15 via-zinc-950 to-indigo-900/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-3 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            Event Calendar
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Calendar</span>
          </h1>
          <p className="text-zinc-400 max-w-xl">View all events and banners on a monthly calendar. Click on any day to see what's happening.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* View Toggle + Month Nav */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-white min-w-[180px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button onClick={nextMonth} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {(['month', 'timeline'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${view === v ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            {view === 'month' ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-zinc-800">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-3 text-center text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{d}</div>
                  ))}
                </div>
                {/* Calendar Cells */}
                <div className="grid grid-cols-7">
                  {/* Empty cells for first week */}
                  {[...Array(firstDay)].map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[80px] border-r border-b border-zinc-800/50 last:border-r-0" />
                  ))}
                  {/* Day cells */}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1
                    const { events: dayEvs, banners: dayBans } = getEventsOnDay(day)
                    const hasItems = dayEvs.length > 0 || dayBans.length > 0
                    const isToday = isCurrentMonth && day === todayDay
                    const isSelected = day === selectedDay

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                        className={`min-h-[80px] border-r border-b border-zinc-800/50 last:border-r-0 p-1.5 text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-600/10' : 'hover:bg-zinc-800/30'
                        } ${(day + firstDay) % 7 === 0 ? 'border-r-0' : ''}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                          isToday ? 'bg-blue-600 text-white' : isSelected ? 'bg-blue-500/20 text-blue-300' : 'text-zinc-400'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvs.slice(0, 2).map(ev => (
                            <div
                              key={ev.id}
                              className={`text-[9px] px-1 py-0.5 rounded text-white font-medium truncate border-l-2 ${EVENT_COLORS[ev.eventType] || 'bg-zinc-700 border-zinc-500'}`}
                            >
                              {EVENT_ICONS[ev.eventType]} {ev.name.split(' ').slice(0, 2).join(' ')}
                            </div>
                          ))}
                          {dayBans.slice(0, 1).map(ban => (
                            <div
                              key={ban.id}
                              className="text-[9px] px-1 py-0.5 rounded text-white font-medium truncate bg-fuchsia-600/80 border-l-2 border-fuchsia-400"
                            >
                              ✨ {ban.name.split(' ').slice(0, 2).join(' ')}
                            </div>
                          ))}
                          {(dayEvs.length + dayBans.length > 3) && (
                            <div className="text-[9px] text-zinc-500">+{dayEvs.length + dayBans.length - 3} more</div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Timeline View */
              <div className="space-y-3">
                {loading ? (
                  [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />)
                ) : [...events, ...banners.map(b => ({ ...b, eventType: 'BANNER', description: null, eventStatus: b.bannerStatus }))].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((item, i) => {
                  const typeKey = 'eventType' in item ? item.eventType : 'BANNER'
                  const color = EVENT_COLORS[typeKey] || 'bg-zinc-700 border-zinc-600'
                  return (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border bg-zinc-900 ${color.split(' ')[1] ? `border-l-4 ${color.split(' ')[1]}` : 'border-zinc-800'}`}>
                      <span className="text-xl">{EVENT_ICONS[typeKey] || '📅'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.eventStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : item.eventStatus === 'UPCOMING' ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-700/40 text-zinc-500'}`}>
                        {item.eventStatus}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Selected Day / Legend */}
          <div className="lg:col-span-1 space-y-4">
            {/* Day Detail */}
            {selectedDay && selectedDayData && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">
                  {MONTH_NAMES[currentMonth]} {selectedDay}
                </h3>
                {selectedDayData.events.length === 0 && selectedDayData.banners.length === 0 ? (
                  <p className="text-xs text-zinc-500">No events on this day</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayData.events.map(ev => (
                      <div key={ev.id} className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/30">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{EVENT_ICONS[ev.eventType]}</span>
                          <p className="text-xs font-bold text-white">{ev.name}</p>
                        </div>
                        <p className="text-[10px] text-zinc-500">{ev.eventStatus}</p>
                        {ev.description && <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{ev.description}</p>}
                      </div>
                    ))}
                    {selectedDayData.banners.map(ban => (
                      <div key={ban.id} className="p-3 rounded-xl bg-fuchsia-600/5 border border-fuchsia-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <span>✨</span>
                          <p className="text-xs font-bold text-white">{ban.name}</p>
                        </div>
                        <p className="text-[10px] text-fuchsia-400">{ban.bannerType === 'CHARACTER' ? 'Character Banner' : 'Support Banner'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wide">Event Types</h3>
              <div className="space-y-2">
                {Object.entries(EVENT_ICONS).filter(([k]) => k !== 'BANNER').map(([type, icon]) => (
                  <div key={type} className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-sm ${(EVENT_COLORS[type] || 'bg-zinc-700').split(' ')[0]}`} />
                    <span className="text-[11px] text-zinc-400">{icon} {type.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscribe CTA */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Event Reminders
              </h3>
              <p className="text-xs text-zinc-500 mb-3">Subscribe to get reminders 1, 3, or 7 days before events start.</p>
              <button className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors cursor-pointer">
                Set Up Reminders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
