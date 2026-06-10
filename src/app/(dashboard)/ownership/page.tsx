'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Layers, Check, Trophy, Sparkles } from 'lucide-react'
import { EmptyState, LoadingState, ErrorState } from '@/components/shared/ui-states'

export default function OwnershipPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'characters' | 'supports'>('characters')
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  // Queries
  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery<any>({
    queryKey: ['profile'],
    queryFn: () => fetch('/api/profile').then(res => res.json())
  })

  const { data: characters = [], isLoading: charsLoading, error: charsError } = useQuery<any[]>({
    queryKey: ['characters'],
    queryFn: () => fetch('/api/characters').then(res => res.json())
  })

  const { data: supports = [], isLoading: supportsLoading, error: supportsError } = useQuery<any[]>({
    queryKey: ['supportCards'],
    queryFn: () => fetch('/api/supports').then(res => res.json())
  })

  // Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updatedFields: any) =>
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      }).then(res => res.json()),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(['profile'], (old: any) => ({
          ...old,
          user: {
            ...old.user,
            ...data.data
          }
        }))
        setSaveStatus('Ownership updated successfully!')
        setTimeout(() => setSaveStatus(null), 3000)
      }
    }
  })

  const user = profileData?.user
  const ownedCharacters = user?.ownedCharacters || []
  const ownedSupports = user?.ownedSupports || []

  const handleToggleCharacter = (charId: string) => {
    const isOwned = ownedCharacters.includes(charId)
    const nextOwned = isOwned
      ? ownedCharacters.filter((id: string) => id !== charId)
      : [...ownedCharacters, charId]
    updateProfileMutation.mutate({ ownedCharacters: nextOwned })
  }

  const handleToggleSupport = (supportId: string) => {
    const isOwned = ownedSupports.includes(supportId)
    const nextOwned = isOwned
      ? ownedSupports.filter((id: string) => id !== supportId)
      : [...ownedSupports, supportId]
    updateProfileMutation.mutate({ ownedSupports: nextOwned })
  }

  const isLoading = profileLoading || charsLoading || supportsLoading
  const error = profileError || charsError || supportsError

  if (isLoading) {
    return <LoadingState message="Loading your collection database..." />
  }

  if (error) {
    return <ErrorState message={error.message || 'Error loading records.'} onRetry={() => queryClient.invalidateQueries()} />
  }

  const charOwnedCount = characters.filter(c => ownedCharacters.includes(c.id)).length
  const supportOwnedCount = supports.filter(s => ownedSupports.includes(s.id)).length

  const charPercentage = characters.length ? Math.round((charOwnedCount / characters.length) * 100) : 0
  const supportPercentage = supports.length ? Math.round((supportOwnedCount / supports.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Ownership Tracker</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Lacak daftar Uma Musume dan Support Card yang Anda miliki untuk menyesuaikan rekomendasi gacha dan perencanaan build.
          </p>
        </div>

        {saveStatus && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-xs font-semibold animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            {saveStatus}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Character Ownership Card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-violet-600/5 to-transparent pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Uma Musume Owned</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-white">{charOwnedCount}</span>
              <span className="text-xs text-zinc-500">/ {characters.length}</span>
            </div>
            <div className="w-48 bg-zinc-900 border border-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-violet-500 h-full rounded-full" style={{ width: `${charPercentage}%` }} />
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-violet-400">{charPercentage}%</span>
            <span className="block text-[10px] text-zinc-500 font-semibold uppercase mt-1">Collection Rate</span>
          </div>
        </div>

        {/* Support Cards Ownership Card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-amber-600/5 to-transparent pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Support Cards Owned</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-white">{supportOwnedCount}</span>
              <span className="text-xs text-zinc-500">/ {supports.length}</span>
            </div>
            <div className="w-48 bg-zinc-900 border border-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${supportPercentage}%` }} />
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-amber-400">{supportPercentage}%</span>
            <span className="block text-[10px] text-zinc-500 font-semibold uppercase mt-1">Collection Rate</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900 gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('characters')}
          className={`pb-2.5 px-1 border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'characters' ? 'border-violet-500 text-violet-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Daftar Uma Musume
        </button>
        <button
          onClick={() => setActiveTab('supports')}
          className={`pb-2.5 px-1 border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'supports' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          Daftar Support Card
        </button>
      </div>

      {/* Roster Grid */}
      {activeTab === 'characters' ? (
        characters.length === 0 ? (
          <EmptyState
            title="No Characters Found"
            description="Tambahkan karakter pertama melalui: [ Add Character ] atau [ Import CSV ] di CMS portal."
            actionLabel={['ADMIN', 'MODERATOR', 'DATA_ENTRY'].includes(user?.role) ? "Go to CMS Import" : undefined}
            onAction={['ADMIN', 'MODERATOR', 'DATA_ENTRY'].includes(user?.role) ? () => window.location.href = '/cms/import' : undefined}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {characters.map(char => {
              const isOwned = ownedCharacters.includes(char.id)
              return (
                <button
                  key={char.id}
                  onClick={() => handleToggleCharacter(char.id)}
                  disabled={updateProfileMutation.isPending}
                  className={`relative flex flex-col items-center justify-between p-4 rounded-xl border transition-all text-center group cursor-pointer ${
                    isOwned
                      ? 'bg-violet-600/5 border-violet-500/30 hover:bg-violet-600/10'
                      : 'bg-zinc-950/40 border-zinc-900/60 hover:border-zinc-800 opacity-60 hover:opacity-80'
                  }`}
                >
                  {isOwned && (
                    <div className="absolute top-2.5 right-2.5 p-1 bg-violet-600 border border-violet-500 rounded-full text-white shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl mb-3 shadow-inner relative overflow-hidden group-hover:scale-105 transition-all">
                    {char.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-white group-hover:text-violet-400 transition-colors truncate">
                      {char.name}
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-semibold uppercase mt-1">
                      {char.distanceType?.split(', ')[0]} • {char.rarity}★
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )
      ) : (
        supports.length === 0 ? (
          <EmptyState
            title="No Support Cards Found"
            description="Tambahkan support card pertama Anda melalui: [ Add Support Card ] atau [ Import CSV ] di CMS portal."
            actionLabel={['ADMIN', 'MODERATOR', 'DATA_ENTRY'].includes(user?.role) ? "Go to CMS Import" : undefined}
            onAction={['ADMIN', 'MODERATOR', 'DATA_ENTRY'].includes(user?.role) ? () => window.location.href = '/cms/import' : undefined}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {supports.map(card => {
              const isOwned = ownedSupports.includes(card.id)
              return (
                <button
                  key={card.id}
                  onClick={() => handleToggleSupport(card.id)}
                  disabled={updateProfileMutation.isPending}
                  className={`relative flex flex-col items-center justify-between p-4 rounded-xl border transition-all text-center group cursor-pointer ${
                    isOwned
                      ? 'bg-amber-600/5 border-amber-500/30 hover:bg-amber-600/10'
                      : 'bg-zinc-950/40 border-zinc-900/60 hover:border-zinc-800 opacity-60 hover:opacity-80'
                  }`}
                >
                  {isOwned && (
                    <div className="absolute top-2.5 right-2.5 p-1 bg-amber-600 border border-amber-500 rounded-full text-white shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl mb-3 shadow-inner relative overflow-hidden group-hover:scale-105 transition-all">
                    🎴
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {card.name}
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-semibold uppercase mt-1">
                      {card.type} • {card.rarity}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
