'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  History, 
  Search, 
  Terminal, 
  Calendar, 
  Globe, 
  Plus, 
  Minus, 
  User, 
  Eye, 
  EyeOff,
  Loader2 
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  before?: string
  after?: string
  ipAddress?: string
  timestamp: string
  user: {
    name: string
    email: string
    avatar: string
  }
}

export default function CMSAuditPage() {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Query audit logs
  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: () => fetch('/api/cms/audit').then(res => res.json())
  })

  // Filter logs
  const filteredLogs = logs.filter(log => {
    return (
      log.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase())
    )
  })

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Format JSON values
  const formatJson = (val?: string) => {
    if (!val) return 'None'
    try {
      return JSON.stringify(JSON.parse(val), null, 2)
    } catch {
      return val
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2">
          <History className="w-6 h-6 text-violet-500" />
          System Audit Logs
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Daftar kronologis perubahan data di platform, memantau siapa yang mengubah, IP Address, dan perubahan status Sebelum vs Sesudah.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari logs berdasarkan user/action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-550 outline-none transition-all"
          />
        </div>
      </div>

      {/* Logs timeline list */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-12 text-center text-zinc-500 text-sm">
          Tidak ada data log aktivitas saat ini.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id
            return (
              <div 
                key={log.id} 
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 hover:border-zinc-850 transition-all flex flex-col gap-3"
              >
                {/* Header info row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={log.user?.avatar || '/avatars/default.png'}
                      alt={log.user?.name || ''}
                      className="w-8 h-8 rounded bg-zinc-800"
                    />
                    <div>
                      <span className="font-bold text-white text-xs block leading-none">{log.user?.name}</span>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        IP: {log.ipAddress || 'Unknown'} • {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions Details */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                      log.action === 'PUBLISH' ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' :
                      log.action === 'REJECT' ? 'bg-red-950/40 border-red-900 text-red-400' :
                      'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                      {log.entity}
                    </span>
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="p-1 hover:bg-zinc-900 rounded text-zinc-400 hover:text-white cursor-pointer transition-colors"
                      title="Lihat Detail Diff"
                    >
                      {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded State Diff viewer */}
                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-900 pt-4 mt-1 font-mono text-[10px] leading-relaxed">
                    {/* Before state */}
                    <div className="space-y-1.5 p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-lg">
                      <span className="block text-[8px] font-extrabold uppercase text-red-400 tracking-wider flex items-center gap-1">
                        <Minus className="w-3 h-3 text-red-500" /> STATE SEBELUM (BEFORE)
                      </span>
                      <pre className="text-red-400/90 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {formatJson(log.before)}
                      </pre>
                    </div>

                    {/* After state */}
                    <div className="space-y-1.5 p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-lg">
                      <span className="block text-[8px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                        <Plus className="w-3 h-3 text-emerald-500" /> STATE SESUDAH (AFTER)
                      </span>
                      <pre className="text-emerald-400/90 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {formatJson(log.after)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
