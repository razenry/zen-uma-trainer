import React from 'react'
import { prisma } from '@/lib/db'
import { 
  Database, 
  Users, 
  Layers, 
  Award, 
  Trophy, 
  ClipboardCheck, 
  History, 
  Star,
  Activity
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CMSDashboardPage() {
  // Query counts from live tables
  const countLiveChars = await prisma.character.count()
  const countLiveCards = await prisma.supportCard.count()
  const countLiveSkills = await prisma.skill.count()
  const countLiveRaces = await prisma.race.count()

  // Query counts from drafts
  const countDraftChars = await prisma.characterDraft.count()
  const countDraftCards = await prisma.supportCardDraft.count()
  const countDraftSkills = await prisma.skillDraft.count()
  const countDraftRaces = await prisma.raceDraft.count()

  // Query counts of drafts pending review
  const pendingChars = await prisma.characterDraft.count({ where: { status: 'PENDING_REVIEW' } })
  const pendingCards = await prisma.supportCardDraft.count({ where: { status: 'PENDING_REVIEW' } })
  const pendingSkills = await prisma.skillDraft.count({ where: { status: 'PENDING_REVIEW' } })
  const pendingRaces = await prisma.raceDraft.count({ where: { status: 'PENDING_REVIEW' } })

  const totalPending = pendingChars + pendingCards + pendingSkills + pendingRaces

  // Calculate Contributor Leaderboard
  // Since GroupBy is specific, we can query drafts count for each staff user manually
  const staff = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'MODERATOR', 'DATA_ENTRY'] }
    },
    include: {
      charDrafts: true,
      supportDrafts: true,
      skillDrafts: true,
      raceDrafts: true
    }
  })

  const leaderboard = staff.map(u => {
    const totalEntries = 
      u.charDrafts.length + 
      u.supportDrafts.length + 
      u.skillDrafts.length + 
      u.raceDrafts.length
    return {
      name: u.name || 'Anonymous',
      role: u.role,
      avatar: u.avatar || '/avatars/default.png',
      count: totalEntries
    }
  }).sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">CMS Control Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Pantau statistik draf konten, verifikasi persetujuan data, dan kontribusi entri data operator.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pending Review Card */}
        <div className="bg-zinc-900/60 border border-violet-500/20 rounded-xl p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-full bg-linear-to-l from-violet-600/5 to-transparent pointer-events-none" />
          <div className="p-3 rounded-lg bg-violet-600/10 border border-violet-500/30 text-violet-400">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending Review</span>
            <span className="text-2xl font-black text-white">{totalPending} Items</span>
          </div>
        </div>

        {/* Total Characters */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Characters</span>
            <span className="text-sm text-zinc-400 mt-1">
              Live: <strong className="text-white">{countLiveChars}</strong> • Draft: <strong className="text-zinc-500">{countDraftChars}</strong>
            </span>
          </div>
        </div>

        {/* Total Cards */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-rose-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Support Cards</span>
            <span className="text-sm text-zinc-400 mt-1">
              Live: <strong className="text-white">{countLiveCards}</strong> • Draft: <strong className="text-zinc-500">{countDraftCards}</strong>
            </span>
          </div>
        </div>

        {/* Total Skills */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Skills Catalog</span>
            <span className="text-sm text-zinc-400 mt-1">
              Live: <strong className="text-white">{countLiveSkills}</strong> • Draft: <strong className="text-zinc-500">{countDraftSkills}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Review items list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-violet-400" />
              Konten Menunggu Review ({totalPending})
            </h2>
            {totalPending > 0 && (
              <Link href="/cms/review" className="text-xs text-violet-400 hover:underline">
                Buka Review Center →
              </Link>
            )}
          </div>

          <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden divide-y divide-zinc-900">
            {pendingChars > 0 && (
              <div className="p-4 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300 font-medium">Character Drafts</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-600/10 border border-violet-900/50 text-violet-400 text-xs font-bold">
                  {pendingChars} Pending
                </span>
              </div>
            )}
            {pendingCards > 0 && (
              <div className="p-4 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300 font-medium">Support Card Drafts</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-600/10 border border-violet-900/50 text-violet-400 text-xs font-bold">
                  {pendingCards} Pending
                </span>
              </div>
            )}
            {pendingSkills > 0 && (
              <div className="p-4 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300 font-medium">Skill Drafts</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-600/10 border border-violet-900/50 text-violet-400 text-xs font-bold">
                  {pendingSkills} Pending
                </span>
              </div>
            )}
            {pendingRaces > 0 && (
              <div className="p-4 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300 font-medium">Race Drafts</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-600/10 border border-violet-900/50 text-violet-400 text-xs font-bold">
                  {pendingRaces} Pending
                </span>
              </div>
            )}
            {totalPending === 0 && (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Semua draf konten telah ditinjau! Tidak ada tugas review tertunda.
              </div>
            )}
          </div>
        </div>

        {/* Contributor Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            Top Contributors
          </h2>

          <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4 space-y-4">
            {leaderboard.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-500 w-4">{idx + 1}.</span>
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-7 h-7 rounded bg-zinc-800"
                  />
                  <div>
                    <span className="font-bold text-white block leading-tight">{item.name}</span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{item.role}</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-violet-400 bg-violet-600/10 px-2 py-0.5 rounded border border-violet-900/40">
                  {item.count} Entries
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
