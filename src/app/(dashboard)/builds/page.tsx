'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Flame, 
  Heart, 
  Bookmark, 
  Share2, 
  Sparkles, 
  Search, 
  Check, 
  Filter,
  Loader2 
} from 'lucide-react'

interface Build {
  id: string
  title: string
  distance: string
  style: string
  targetSpeed: number
  targetStam: number
  targetPower: number
  targetGuts: number
  targetWisdom: number
  likes: number
  skills: string // stringified JSON
  character: {
    name: string
  }
}

export default function BuildsPage() {
  const [activeTab, setActiveTab] = useState<'meta' | 'community' | 'popular'>('meta')
  const [search, setSearch] = useState('')
  
  // Like and Bookmark states
  const [likedBuilds, setLikedBuilds] = useState<string[]>([])
  const [bookmarkedBuilds, setBookmarkedBuilds] = useState<string[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch builds
  const { data: builds = [], isLoading } = useQuery<Build[]>({
    queryKey: ['builds'],
    queryFn: async () => {
      // Fetch characters/builds. To make it simple, we can fetch from a route or just dashboard data.
      // Let's call /api/sync first to ensure seeded builds exist, then query them.
      // But wait! We seeded the database in prisma/seed-db.js. So the builds already exist in the database!
      // Let's fetch from `/api/builds` which we will create next. That is very robust.
      const res = await fetch('/api/builds')
      if (!res.ok) throw new Error('Failed to load builds')
      return res.json()
    }
  })

  // Filtering
  const filteredBuilds = builds.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.character.name.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const handleLike = (id: string) => {
    if (likedBuilds.includes(id)) {
      setLikedBuilds(likedBuilds.filter(bId => bId !== id))
    } else {
      setLikedBuilds([...likedBuilds, id])
    }
  }

  const handleBookmark = (id: string) => {
    if (bookmarkedBuilds.includes(id)) {
      setBookmarkedBuilds(bookmarkedBuilds.filter(bId => bId !== id))
    } else {
      setBookmarkedBuilds([...bookmarkedBuilds, id])
    }
  }

  const handleShare = (id: string) => {
    const shareUrl = `${window.location.origin}/builds?id=${id}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const parseSkills = (skillsJson: string): string[] => {
    try {
      return JSON.parse(skillsJson)
    } catch {
      return []
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Meta Build Library</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Jelajahi rekomendasi build teratas dari komunitas dan meta gaming saat ini untuk menyusun strategi latihan optimal.
          </p>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-3">
        {/* Navigation Tabs */}
        <div className="flex gap-4 text-sm font-semibold">
          {[
            { id: 'meta', label: 'Meta Builds' },
            { id: 'popular', label: 'Popular Builds' },
            { id: 'community', label: 'Community Builds' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 border-b-2 cursor-pointer transition-all ${
                activeTab === tab.id 
                  ? 'border-violet-500 text-violet-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari build atau karakter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Builds Grid */}
      {filteredBuilds.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-12 text-center text-zinc-500">
          Tidak ada build yang cocok ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBuilds.map((build) => {
            const isLiked = likedBuilds.includes(build.id)
            const isBookmarked = bookmarkedBuilds.includes(build.id)
            const isCopied = copiedId === build.id
            const skillList = parseSkills(build.skills)

            // Adjust popular mock tab counts
            const likesCount = isLiked ? build.likes + 1 : build.likes

            return (
              <div 
                key={build.id}
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-all flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                {/* Card Top */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-violet-400 rounded-md">
                      {build.distance} • {build.style}
                    </span>
                    
                    {/* Share / Bookmark / Like quick control bar */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(build.id)}
                        className="p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-white rounded transition-colors cursor-pointer"
                        title="Copy Share Link"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleBookmark(build.id)}
                        className={`p-1.5 hover:bg-zinc-900 rounded transition-colors cursor-pointer ${
                          isBookmarked ? 'text-violet-400' : 'text-zinc-500 hover:text-white'
                        }`}
                        title="Save to Library"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-violet-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-md tracking-tight leading-snug">{build.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Character: {build.character.name}</p>
                  </div>

                  {/* Skills tags list */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skillList.map(skillId => (
                      <span key={skillId} className="text-[9px] font-semibold bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-900/60">
                        {skillId.replace('skill_', '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Target Stats grid */}
                <div className="grid grid-cols-5 gap-1.5 text-center py-2.5 border-t border-b border-zinc-900 border-dashed bg-zinc-900/10 rounded-lg">
                  <div>
                    <span className="block text-[8px] text-zinc-500 font-bold uppercase">SPD</span>
                    <span className="text-xs font-bold text-indigo-400">{build.targetSpeed}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500 font-bold uppercase">STM</span>
                    <span className="text-xs font-bold text-rose-400">{build.targetStam}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500 font-bold uppercase">PWR</span>
                    <span className="text-xs font-bold text-orange-400">{build.targetPower}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500 font-bold uppercase">GUT</span>
                    <span className="text-xs font-bold text-emerald-400">{build.targetGuts}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500 font-bold uppercase">WIS</span>
                    <span className="text-xs font-bold text-cyan-400">{build.targetWisdom}</span>
                  </div>
                </div>

                {/* Footer Likes Counter */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => handleLike(build.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                      isLiked ? 'text-pink-500' : 'text-zinc-500 hover:text-pink-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500' : ''}`} />
                    <span>{likesCount} Likes</span>
                  </button>
                  <span className="text-[10px] text-zinc-500 font-medium">Community Build</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
