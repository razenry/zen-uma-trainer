'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  UserCheck, 
  Search, 
  ShieldAlert, 
  Loader2,
  Ban,
  CheckCircle2,
  Clock,
  Filter,
  ChevronDown,
  Activity,
  X
} from 'lucide-react'

interface CMSUser {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  image: string | null
  googleId: string | null
  suspended: boolean
  lastLoginAt: string | null
  createdAt: string
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'text-violet-400 border-violet-900/50 bg-violet-600/5',
  MODERATOR: 'text-blue-400 border-blue-900/50 bg-blue-600/5',
  DATA_ENTRY: 'text-orange-400 border-orange-900/50 bg-orange-600/5',
  USER: 'text-zinc-400',
}

function GoogleBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-zinc-800 text-white px-2 py-0.5 rounded-full">
      <svg className="w-3 h-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Google
    </span>
  )
}

function CredentialsBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-zinc-800/60 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700/40">
      🔑 Email
    </span>
  )
}

export default function CMSUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [suspendedFilter, setSuspendedFilter] = useState('ALL')
  const [selectedUserForActivity, setSelectedUserForActivity] = useState<CMSUser | null>(null)

  const { data: users = [], isLoading } = useQuery<CMSUser[]>({
    queryKey: ['cmsUsers'],
    queryFn: () => fetch('/api/cms/users').then(res => res.json())
  })

  const updateRoleMutation = useMutation({
    mutationFn: async (payload: { userId: string; role: string }) => {
      const res = await fetch('/api/admin/rbac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Role update failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cmsUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminCounts'] })
    },
    onError: (err: any) => alert(err.message)
  })

  const suspendMutation = useMutation({
    mutationFn: async (payload: { userId: string; suspended: boolean }) => {
      const res = await fetch('/api/cms/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Suspend action failed')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cmsUsers'] }),
    onError: (err: any) => alert(err.message)
  })

  const filteredUsers = users.filter(u => {
    const nameMatch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const roleMatch = roleFilter === 'ALL' || u.role === roleFilter
    const suspendMatch = suspendedFilter === 'ALL' || (suspendedFilter === 'ACTIVE' ? !u.suspended : u.suspended)
    return nameMatch && roleMatch && suspendMatch
  })

  const handleRoleChange = (userId: string, newRole: string) => {
    if (confirm(`Change this user's role to ${newRole}?`)) {
      updateRoleMutation.mutate({ userId, role: newRole })
    }
  }

  const handleSuspendToggle = (userId: string, currentlySuspended: boolean) => {
    const action = currentlySuspended ? 'reactivate' : 'suspend'
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      suspendMutation.mutate({ userId, suspended: !currentlySuspended })
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-violet-500" />
          User Management
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage user roles, suspend accounts, and track sign-in providers.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length, color: 'text-white' },
          { label: 'Google Auth', value: users.filter(u => u.googleId).length, color: 'text-blue-400' },
          { label: 'Email Auth', value: users.filter(u => !u.googleId).length, color: 'text-zinc-400' },
          { label: 'Suspended', value: users.filter(u => u.suspended).length, color: 'text-red-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 focus:border-violet-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-550 outline-none transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MODERATOR">Moderator</option>
          <option value="DATA_ENTRY">Data Entry</option>
          <option value="USER">User</option>
        </select>
        <select
          value={suspendedFilter}
          onChange={e => setSuspendedFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            No users match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Last Login</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-zinc-900/40 transition-colors ${user.suspended ? 'opacity-50' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.image || user.avatar || '/avatars/default.png'}
                          alt={user.name || ''}
                          className="w-8 h-8 rounded-full bg-zinc-800 object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/avatars/default.png' }}
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{user.name || 'Anonymous'}</div>
                          <div className="text-[10px] text-zinc-500 truncate max-w-[180px]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.googleId ? <GoogleBadge /> : <CredentialsBadge />}
                    </td>
                    <td className="p-4 text-zinc-500">
                      {user.lastLoginAt
                        ? <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                        : <span className="text-zinc-700">Never</span>
                      }
                    </td>
                    <td className="p-4 text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`bg-zinc-900 border border-zinc-800 text-xs font-bold rounded px-2.5 py-1.5 outline-none transition-all cursor-pointer ${ROLE_COLORS[user.role] || 'text-zinc-400'}`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="DATA_ENTRY">DATA ENTRY</option>
                        <option value="USER">USER</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.suspended ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {user.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSuspendToggle(user.id, user.suspended)}
                          className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            user.suspended
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {user.suspended ? (
                            <><CheckCircle2 className="w-3 h-3" /> Reactivate</>
                          ) : (
                            <><Ban className="w-3 h-3" /> Suspend</>
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedUserForActivity(user)}
                          className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-850 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                        >
                          <Activity className="w-3 h-3 text-violet-400" /> Activity
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUserForActivity && (
        <UserActivityModal 
          user={selectedUserForActivity} 
          onClose={() => setSelectedUserForActivity(null)} 
        />
      )}
    </div>
  )
}

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  before: string | null
  after: string | null
  ipAddress: string | null
  timestamp: string
}

function UserActivityModal({ user, onClose }: { user: CMSUser; onClose: () => void }) {
  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['userActivity', user.id],
    queryFn: () => fetch(`/api/cms/audit?userId=${user.id}`).then(res => res.json())
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-full bg-zinc-950 border-l border-zinc-900 flex flex-col shadow-2xl p-6 relative animate-in slide-in-from-right duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-500" />
            User Activity Log
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Viewing activity for <span className="text-white font-semibold">{user.name || user.email}</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-zinc-550 text-xs">
              No recent activity recorded for this user.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-zinc-900/40 border border-zinc-900/60 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-violet-400 uppercase tracking-wider text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-zinc-300">
                    Entity: <span className="font-semibold text-zinc-100">{log.entity}</span> (ID: {log.entityId})
                  </div>
                  {log.ipAddress && (
                    <div className="text-[10px] text-zinc-500">
                      IP Address: {log.ipAddress}
                    </div>
                  )}
                  {(log.before || log.after) && (
                    <div className="bg-zinc-950/80 rounded border border-zinc-900 p-2 font-mono text-[10px] text-zinc-500 overflow-x-auto max-h-24">
                      {log.after && <div>After: {log.after}</div>}
                      {log.before && <div className="mt-1">Before: {log.before}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
