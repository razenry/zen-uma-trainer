'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BookOpen, 
  Search, 
  Heart, 
  Bookmark, 
  Filter,
  Loader2 
} from 'lucide-react'

interface Guide {
  id: string
  title: string
  content: string
  category: string
  likes: number
  bookmarks: number
  createdAt: string
  user: {
    name: string
    avatar: string
  }
}

export default function GuidesPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [likedList, setLikedList] = useState<string[]>([])
  const [bookmarkedList, setBookmarkedList] = useState<string[]>([])

  // Fetch guides
  const { data: guides = [], isLoading } = useQuery<Guide[]>({
    queryKey: ['communityGuides'],
    queryFn: () => fetch('/api/guides').then(res => {
      if (!res.ok) return []
      return res.json()
    })
  })

  const handleLike = (id: string) => {
    setLikedList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBookmark = (id: string) => {
    setBookmarkedList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filteredGuides = guides.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase()) || 
                          g.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Community Knowledge Base</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Kumpulan artikel panduan pelatihan taktis, trik skenario, dan rekomendasi kartu dari komunitas Uma Musume.
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari judul artikel atau topik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-550 outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end text-xs text-zinc-500 gap-1.5">
            <Filter className="w-3.5 h-3.5 text-violet-400" />
            <span>Found {filteredGuides.length} Guides</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-zinc-900/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider">Category:</span>
            <div className="flex items-center gap-1">
              {['All', 'Training', 'Build', 'Scenarios', 'Newbie'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-violet-600 border-violet-500 text-white font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guides List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-12 text-center text-zinc-500">
          Tidak ada panduan terdaftar saat ini.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGuides.map(guide => {
            const isLiked = likedList.includes(guide.id)
            const isBookmarked = bookmarkedList.includes(guide.id)
            const likesCount = isLiked ? guide.likes + 1 : guide.likes
            
            return (
              <div 
                key={guide.id} 
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 hover:border-zinc-850 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase">
                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-450 px-2 py-0.5 rounded">
                      {guide.category} Category
                    </span>
                    <span className="text-zinc-500 font-bold">
                      {new Date(guide.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">{guide.title}</h3>
                  <p className="text-xs text-zinc-450 leading-relaxed">{guide.content}</p>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center border-t border-zinc-900/60 pt-3 mt-1 text-xs">
                  <div className="flex items-center gap-3">
                    {/* Likes */}
                    <button
                      onClick={() => handleLike(guide.id)}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        isLiked ? 'text-pink-500' : 'text-zinc-500 hover:text-pink-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500' : ''}`} />
                      <span>{likesCount}</span>
                    </button>

                    {/* Bookmarks */}
                    <button
                      onClick={() => handleBookmark(guide.id)}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        isBookmarked ? 'text-violet-400' : 'text-zinc-500 hover:text-violet-400'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-violet-400' : ''}`} />
                      <span>{isBookmarked ? guide.bookmarks + 1 : guide.bookmarks}</span>
                    </button>
                  </div>

                  {/* Author detail */}
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold">
                    <img 
                      src={guide.user?.avatar || '/avatars/default.png'} 
                      alt="" 
                      className="w-5 h-5 rounded-full bg-zinc-800"
                    />
                    <span>Written by {guide.user?.name}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
