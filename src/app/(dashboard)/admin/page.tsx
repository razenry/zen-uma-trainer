'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ShieldAlert, 
  RefreshCw, 
  Database, 
  Users, 
  Layers, 
  Award, 
  Trophy, 
  CheckCircle, 
  XCircle,
  Loader2 
} from 'lucide-react'

interface DBCounts {
  users: number
  characters: number
  supportCards: number
  skills: number
  races: number
  sessions: number
  builds: number
}

export default function AdminPage() {
  const queryClient = useQueryClient()
  const [syncResult, setSyncResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch db status
  const { data: counts, isLoading } = useQuery<DBCounts>({
    queryKey: ['adminCounts'],
    queryFn: async () => {
      // In a real app, query database model counts. We create a route `/api/admin/counts` for this!
      const res = await fetch('/api/admin/counts')
      if (!res.ok) throw new Error('Failed to load DB stats')
      return res.json()
    }
  })

  // Mutation to trigger sync API
  const syncMutation = useMutation({
    mutationFn: async () => {
      setError(null)
      setSyncResult(null)
      const res = await fetch('/api/sync', { method: 'POST' })
      if (!res.ok) throw new Error('Sync API failed')
      return res.json()
    },
    onSuccess: (data) => {
      setSyncResult(data)
      // Refetch stats
      queryClient.invalidateQueries({ queryKey: ['adminCounts'] })
      queryClient.invalidateQueries({ queryKey: ['characters'] })
      queryClient.invalidateQueries({ queryKey: ['supportCards'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      queryClient.invalidateQueries({ queryKey: ['races'] })
      queryClient.invalidateQueries({ queryKey: ['builds'] })
    },
    onError: (err: any) => {
      setError(err.message || 'Gagal menjalankan sinkronisasi.')
    }
  })

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-violet-500" />
          Admin Management Panel
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Kontrol sinkronisasi data master dari Umapyoi & Tracen Academy API, serta tinjau performa database lokal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Controls: Sync API */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">API Synchronization</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Menjalankan proses sinkronisasi untuk mengambil data karakter baru, support card tingkat SSR/SR, serta skill hint terbaru dari server pusat.
          </p>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-400 flex items-start gap-2">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {syncResult && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-xs text-emerald-400 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Sinkronisasi Berhasil!</span>
                <span className="block mt-1">Skills synced: {syncResult.results?.skills?.count || 0}</span>
                <span className="block">Characters synced: {syncResult.results?.characters?.count || 0}</span>
                <span className="block">Supports synced: {syncResult.results?.supports?.count || 0}</span>
                <span className="block">Races synced: {syncResult.results?.races?.count || 0}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg py-2.5 shadow transition-all cursor-pointer"
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synchronizing Database...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Sync Community API Data
              </>
            )}
          </button>
        </div>

        {/* Database overview card */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            Database Entity Overview
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Users */}
              <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center gap-3">
                <Users className="w-4 h-4 text-zinc-500" />
                <div>
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">Users Registered</span>
                  <span className="text-lg font-extrabold text-white">{counts?.users || 0}</span>
                </div>
              </div>

              {/* Characters */}
              <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center gap-3">
                <Users className="w-4 h-4 text-violet-400" />
                <div>
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">Characters</span>
                  <span className="text-lg font-extrabold text-white">{counts?.characters || 0}</span>
                </div>
              </div>

              {/* Support Cards */}
              <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center gap-3">
                <Layers className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">Support Cards</span>
                  <span className="text-lg font-extrabold text-white">{counts?.supportCards || 0}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center gap-3">
                <Award className="w-4 h-4 text-rose-400" />
                <div>
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">Skills Catalog</span>
                  <span className="text-lg font-extrabold text-white">{counts?.skills || 0}</span>
                </div>
              </div>

              {/* Races */}
              <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center gap-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">Races Synced</span>
                  <span className="text-lg font-extrabold text-white">{counts?.races || 0}</span>
                </div>
              </div>

              {/* Saved Builds */}
              <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center gap-3">
                <Database className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase">Meta Builds</span>
                  <span className="text-lg font-extrabold text-white">{counts?.builds || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
