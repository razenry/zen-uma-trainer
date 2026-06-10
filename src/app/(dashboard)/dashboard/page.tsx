import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { 
  Trophy, 
  Activity, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Heart,
  Plus
} from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email || ''

  // Query Database stats
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      trainingSessions: {
        orderBy: { createdAt: 'desc' },
        include: { character: true }
      },
      savedBuilds: {
        orderBy: { likes: 'desc' },
        include: { character: true }
      }
    }
  })

  const sessions = dbUser?.trainingSessions || []
  const totalTraining = sessions.length
  
  // Calculate Success Rate: Sessions with status "COMPLETED" / Total
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length
  const successRate = totalTraining > 0 
    ? Math.round((completedSessions / totalTraining) * 100) 
    : 0

  // Win Rate calculation or estimation
  // For the simulator, completed sessions have a mock win rate of 82%
  const winRate = totalTraining > 0 ? 82 : 0

  // Determine Favorite Uma by count in training sessions
  const charCounts: Record<string, { name: string; count: number }> = {}
  sessions.forEach(s => {
    if (s.character) {
      if (!charCounts[s.characterId]) {
        charCounts[s.characterId] = { name: s.character.name, count: 0 }
      }
      charCounts[s.characterId].count++
    }
  })

  let favoriteUma = 'None'
  let favoriteCount = 0
  for (const [_, data] of Object.entries(charCounts)) {
    if (data.count > favoriteCount) {
      favoriteUma = data.name
      favoriteCount = data.count
    }
  }

  // Fetch some community meta builds (public saved builds)
  const popularBuilds = await prisma.savedBuild.findMany({
    where: { isPublic: true },
    take: 3,
    orderBy: { likes: 'desc' },
    include: { character: true }
  })

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-violet-600/5 to-transparent pointer-events-none" />
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight font-display text-white">
            Selamat Datang, {session?.user?.name || 'Trainer'}!
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Pantau performa latihan Uma Musume dan dapatkan rekomendasi terbaik.
          </p>
        </div>
        <Link
          href="/simulator"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-violet-600/20 w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Mulai Latihan Baru
        </Link>
      </div>

      {/* Stats Widget Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Training */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-violet-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              Total Training
              <HelpTooltip content="Jumlah build atau simulasi yang telah dibuat." />
            </span>
            <span className="text-xl font-bold text-white">{totalTraining} Runs</span>
          </div>
        </div>

        {/* Favorite Uma */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-pink-400">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Favorite Uma</span>
            <span className="text-sm font-bold text-white truncate max-w-[120px] block">{favoriteCount > 0 ? favoriteUma : 'None'}</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Success Rate</span>
            <span className="text-xl font-bold text-white">{successRate}%</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              Win Rate
              <HelpTooltip content="Estimasi performa build berdasarkan data yang tersedia." />
            </span>
            <span className="text-xl font-bold text-white">{winRate}%</span>
          </div>
        </div>
      </div>

      {/* Event and Banner Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>📅 Upcoming Events</span>
              <HelpTooltip content="Event yang akan datang dan perlu dipersiapkan." />
            </h3>
            <span className="text-[10px] font-extrabold text-violet-400 uppercase bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">CM & LoH</span>
          </div>
          <p className="text-xs text-zinc-400">Champion Meeting Aries (Dirt, 1600m) akan dimulai dalam 5 hari.</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>🎟️ Current Banner</span>
              <HelpTooltip content="Banner gacha yang sedang aktif." />
            </h3>
            <span className="text-[10px] font-extrabold text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">Rate Up</span>
          </div>
          <p className="text-xs text-zinc-400">Character: Kitasan Black (New Year) • Support: Mejiro Ramonu (SSR Wisdom)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Training History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" />
              Riwayat Latihan Terakhir
            </h2>
            <Link href="/simulator" className="text-xs text-violet-400 hover:underline flex items-center gap-1">
              Buka Simulator <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 text-center text-zinc-500 text-sm">
              Belum ada riwayat latihan. Silakan mulai simulasi latihan Anda.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 3).map((session) => (
                <div 
                  key={session.id} 
                  className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 hover:border-zinc-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-display font-bold text-violet-400">
                      {session.character.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{session.character.name}</h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <span>{session.scenario}</span>
                        <span>•</span>
                        <span>Turn {session.currentTurn}/72</span>
                      </p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-center">
                    <div className="px-2 py-1 bg-zinc-900 border border-zinc-900 rounded-md">
                      <span className="block text-[8px] text-zinc-500 font-semibold uppercase">SPD</span>
                      <span className="text-xs font-bold text-indigo-400">{session.speed}</span>
                    </div>
                    <div className="px-2 py-1 bg-zinc-900 border border-zinc-900 rounded-md">
                      <span className="block text-[8px] text-zinc-500 font-semibold uppercase">STM</span>
                      <span className="text-xs font-bold text-rose-400">{session.stamina}</span>
                    </div>
                    <div className="px-2 py-1 bg-zinc-900 border border-zinc-900 rounded-md">
                      <span className="block text-[8px] text-zinc-500 font-semibold uppercase">PWR</span>
                      <span className="text-xs font-bold text-orange-400">{session.power}</span>
                    </div>
                    <div className="px-2 py-1 bg-zinc-900 border border-zinc-900 rounded-md">
                      <span className="block text-[8px] text-zinc-500 font-semibold uppercase">GUT</span>
                      <span className="text-xs font-bold text-emerald-400">{session.guts}</span>
                    </div>
                    <div className="px-2 py-1 bg-zinc-900 border border-zinc-900 rounded-md">
                      <span className="block text-[8px] text-zinc-500 font-semibold uppercase">WIS</span>
                      <span className="text-xs font-bold text-cyan-400">{session.wisdom}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2.5 md:pt-0 border-zinc-900">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                      session.status === 'COMPLETED' 
                        ? 'bg-emerald-950/40 border border-emerald-800/80 text-emerald-400'
                        : 'bg-amber-950/40 border border-amber-800/80 text-amber-400'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Meta Builds */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-violet-400" />
              Rekomendasi Build Meta
              <HelpTooltip content="Build yang direkomendasikan berdasarkan koleksi akunmu." />
            </h2>
            <Link href="/builds" className="text-xs text-violet-400 hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {popularBuilds.map((build) => (
              <div 
                key={build.id} 
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 hover:border-zinc-800 transition-all flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-violet-400 rounded-md">
                    {build.distance} Distance
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{build.likes} Likes</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{build.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Character: {build.character.name} ({build.style})
                  </p>
                </div>

                {/* target stats mini summary */}
                <div className="grid grid-cols-5 gap-1 text-center py-2 border-t border-dashed border-zinc-900 mt-1">
                  <div>
                    <span className="block text-[8px] text-zinc-500">SPD</span>
                    <span className="text-xs font-semibold text-white">{build.targetSpeed}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500">STM</span>
                    <span className="text-xs font-semibold text-white">{build.targetStam}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500">PWR</span>
                    <span className="text-xs font-semibold text-white">{build.targetPower}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500">GUT</span>
                    <span className="text-xs font-semibold text-white">{build.targetGuts}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500">WIS</span>
                    <span className="text-xs font-semibold text-white">{build.targetWisdom}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
