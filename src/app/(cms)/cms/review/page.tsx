'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { 
  ClipboardCheck, 
  Check, 
  X, 
  Send, 
  AlertCircle, 
  Users, 
  Layers, 
  Award, 
  Trophy, 
  Globe,
  Loader2 
} from 'lucide-react'

export default function CMSReviewPage() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role

  const isAdmin = userRole === 'ADMIN'

  // Tab state
  const [activeTab, setActiveTab] = useState<'characters' | 'supportCards' | 'skills' | 'races'>('characters')
  
  // Rejection notes dialog state
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectId, setRejectId] = useState('')
  const [rejectEntityType, setRejectEntityType] = useState('')
  const [notes, setNotes] = useState('')

  // Query pending reviews
  const { data: reviews = { characters: [], supportCards: [], skills: [], races: [] }, isLoading } = useQuery<any>({
    queryKey: ['pendingReviews'],
    queryFn: () => fetch('/api/cms/review/pending').then(res => res.json())
  })

  // Mutation to handle draft action
  const reviewMutation = useMutation({
    mutationFn: async (payload: { draftId: string; entityType: string; action: string; notes?: string }) => {
      const res = await fetch('/api/sync/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Review operation failed')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingReviews'] })
      queryClient.invalidateQueries({ queryKey: ['charDrafts'] })
      queryClient.invalidateQueries({ queryKey: ['adminCounts'] })
      setRejectOpen(false)
      setNotes('')
    },
    onError: (err: any) => {
      alert(err.message)
    }
  })

  const openRejectDialog = (id: string, entityType: string) => {
    setRejectId(id)
    setRejectEntityType(entityType)
    setRejectOpen(true)
  }

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    reviewMutation.mutate({
      draftId: rejectId,
      entityType: rejectEntityType,
      action: 'REJECT',
      notes
    })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-violet-500" />
          Review Center
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Daftar antrean draf konten yang dikirim oleh Operator. Moderator dapat melakukan Approve/Reject, dan Admin dapat mempublikasikannya langsung ke produksi.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-zinc-900 gap-4 text-sm font-semibold">
        {[
          { id: 'characters', label: 'Character Drafts', count: reviews.characters?.length || 0, icon: Users },
          { id: 'supportCards', label: 'Support Cards', count: reviews.supportCards?.length || 0, icon: Layers },
          { id: 'skills', label: 'Skills Catalog', count: reviews.skills?.length || 0, icon: Award },
          { id: 'races', label: 'Race Details', count: reviews.races?.length || 0, icon: Trophy }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                isActive ? 'border-violet-500 text-violet-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-violet-600/10 border border-violet-900/50 text-violet-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Reviews List */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : reviews[activeTab]?.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            Tidak ada draf dalam antrean review untuk kategori ini.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900 text-xs">
            {reviews[activeTab]?.map((item: any) => (
              <div key={item.id} className="p-5 hover:bg-zinc-900/10 transition-colors space-y-4">
                
                {/* Draft Card Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <span className="block text-[10px] text-zinc-500 mt-1">
                      Submitted by: {item.contributor?.name || 'Unknown'} • Date: {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Approve */}
                    <button
                      onClick={() => reviewMutation.mutate({ draftId: item.id, entityType: activeTab === 'characters' ? 'Character' : activeTab === 'supportCards' ? 'SupportCard' : activeTab === 'skills' ? 'Skill' : 'Race', action: 'APPROVE' })}
                      className="p-1.5 bg-emerald-950/40 border border-emerald-900 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg cursor-pointer transition-colors"
                      title="Approve Draft"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    {/* Reject */}
                    <button
                      onClick={() => openRejectDialog(item.id, activeTab === 'characters' ? 'Character' : activeTab === 'supportCards' ? 'SupportCard' : activeTab === 'skills' ? 'Skill' : 'Race')}
                      className="p-1.5 bg-red-950/40 border border-red-900 text-red-400 hover:bg-red-650 hover:text-white rounded-lg cursor-pointer transition-colors"
                      title="Reject Draft"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* Publish (Admin only) */}
                    {isAdmin && (
                      <button
                        onClick={() => reviewMutation.mutate({ draftId: item.id, entityType: activeTab === 'characters' ? 'Character' : activeTab === 'supportCards' ? 'SupportCard' : activeTab === 'skills' ? 'Skill' : 'Race', action: 'PUBLISH' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-650 hover:bg-violet-550 text-white rounded-lg cursor-pointer font-bold transition-all shadow-md shadow-violet-600/10"
                        title="Publish Live"
                      >
                        <Globe className="w-3.5 h-3.5" /> Publish Production
                      </button>
                    )}
                  </div>
                </div>

                {/* Draft Parameters Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/30 p-3 rounded-lg border border-zinc-900 text-[11px] text-zinc-400">
                  {activeTab === 'characters' && (
                    <>
                      <div>Rarity: <strong className="text-zinc-200">{item.rarity}★</strong></div>
                      <div>CV: <strong className="text-zinc-200">{item.cv || '-'}</strong></div>
                      <div>Bonuses: <strong className="text-violet-400">SPD+{item.growthSpeed}%, STM+{item.growthStamina}%</strong></div>
                      <div>Distance: <strong className="text-zinc-200">{item.medium} (Medium)</strong></div>
                    </>
                  )}
                  {activeTab === 'supportCards' && (
                    <>
                      <div>Type: <strong className="text-zinc-200">{item.type}</strong></div>
                      <div>Rarity: <strong className="text-zinc-200">{item.rarity}</strong></div>
                      <div>Friendship: <strong className="text-violet-400">{item.friendshipBonus}%</strong></div>
                      <div>Initial Bond: <strong className="text-zinc-200">{item.initialBond}</strong></div>
                    </>
                  )}
                  {activeTab === 'skills' && (
                    <>
                      <div>Category: <strong className="text-zinc-200">{item.category}</strong></div>
                      <div>Tier: <strong className="text-violet-400">{item.tier}</strong></div>
                      <div>Cost: <strong className="text-zinc-200">{item.cost}</strong></div>
                      <div>Trigger: <strong className="text-zinc-200 truncate block max-w-[100px]">{item.trigger}</strong></div>
                    </>
                  )}
                  {activeTab === 'races' && (
                    <>
                      <div>Distance: <strong className="text-zinc-200">{item.distance}m</strong></div>
                      <div>Ground: <strong className="text-zinc-200">{item.groundType}</strong></div>
                      <div>Season: <strong className="text-zinc-200">{item.season}</strong></div>
                      <div>Grade: <strong className="text-violet-400">{item.grade}</strong></div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject revision note Dialog */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form 
            onSubmit={handleRejectSubmit} 
            className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Draft Rejection notes
              </h2>
              <button 
                type="button" 
                onClick={() => setRejectOpen(false)} 
                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">REVISION COMMENTS (MANDATORY)</label>
              <textarea
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jelaskan alasan penolakan draf ini... e.g. Statistik bonus kecepatan keliru..."
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-850 focus:border-red-500 rounded-lg p-3 text-xs text-white placeholder-zinc-650 outline-none resize-none transition-all"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={reviewMutation.isPending || !notes}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Reject Draft
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
