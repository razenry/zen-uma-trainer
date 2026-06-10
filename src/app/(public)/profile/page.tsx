'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  ShieldAlert, 
  Calendar, 
  Save,
  Key,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Compass,
  Trophy,
  Flame,
  Star,
  Settings,
  Bell,
  Heart,
  BookMarked,
  Link2
} from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'

// Tab definitions
type ActiveTab = 'overview' | 'builds' | 'account' | 'security' | 'notifications'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  // Profile Form State
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Notification settings State
  const [notifPreferences, setNotifPreferences] = useState({
    buildUpdates: true,
    activityAlerts: false,
    newsletters: true,
    cmsModeration: true
  })

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setAvatar((session.user as any).avatar || '/avatars/default.png')
    }
  }, [session])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar })
      })
      const data = await res.json()
      if (data.success) {
        setProfileMessage({ type: 'success', text: data.message || 'Profile updated successfully!' })
        await update({ name, avatar })
      } else {
        setProfileMessage({ type: 'error', text: data.message || 'Failed to update profile.' })
      }
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'A system error occurred.' })
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Confirm password does not match.' })
      setPasswordSaving(false)
      return
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (data.success) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMessage({ type: 'error', text: data.message || 'Failed to update password.' })
      }
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'A system error occurred.' })
    } finally {
      setPasswordSaving(false)
    }
  }

  const toggleNotif = (key: keyof typeof notifPreferences) => {
    setNotifPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const userName = session?.user?.name || 'Guest Trainer'
  const userEmail = session?.user?.email || 'guest@zenuma.com'
  const userRole = (session?.user as any)?.role || 'USER'
  const userAvatar = (session?.user as any)?.avatar || '/avatars/default.png'

  // Mock static sub-data
  const mockActivities = [
    { text: 'Optimized stamina for Oguri Cap build', time: '2 hours ago', icon: Trophy, color: 'text-violet-400 bg-violet-650/10 border-violet-900/40' },
    { text: 'Saved a new Mile focus build', time: '1 day ago', icon: Flame, color: 'text-amber-400 bg-amber-650/10 border-amber-900/40' },
    { text: 'Created Character Draft in CMS', time: '3 days ago', icon: User, color: 'text-emerald-400 bg-emerald-650/10 border-emerald-900/40' }
  ]

  const mockSavedBuilds = [
    { id: 'b1', title: 'Oguri Cap (Mile / Leader)', speed: 1200, stam: 600, pow: 1000, date: '2026-06-05' },
    { id: 'b2', title: 'Gold Ship (Long / Chaser)', speed: 1100, stam: 900, pow: 950, date: '2026-06-03' }
  ]

  const mockFavorites = [
    { id: 'c1', name: 'Oguri Cap', rarity: 3, distance: 'Mile / Medium', style: 'Leader' },
    { id: 'c2', name: 'Gold Ship', rarity: 2, distance: 'Medium / Long', style: 'Chaser' }
  ]

  const mockBookmarks = [
    { id: 'g1', title: 'Aura Speed Optimization & Hints', author: 'ZenTrainer', category: 'Training' },
    { id: 'g2', title: 'Grand Live Scenario Walkthrough', author: 'UmaPro', category: 'Scenarios' }
  ]

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Trainer Profile</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Review your account parameters, activities, saved configurations, and authorization details.
        </p>
      </div>

      {/* Main Grid: Info card on left, tab content on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: User Information Card */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mx-auto overflow-hidden flex items-center justify-center relative">
              <img 
                src={userAvatar} 
                alt={userName} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatars/default.png'
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight font-display">{userName}</h2>
              <span className="inline-block mt-1.5 text-[9px] font-extrabold tracking-wider bg-violet-600/10 border border-violet-900/50 text-violet-650 dark:text-violet-400 rounded-md px-2.5 py-0.5 uppercase">
                {userRole} ACCESS
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] mx-auto leading-normal">
              Official trainer registered at Tracen Academy assistant dashboard.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-5 space-y-4 shadow-xl">
            <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Session Specifications</span>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-zinc-650 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
                  <ShieldAlert className="w-3.5 h-3.5" /> Authority:
                </span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold uppercase">{userRole}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-650 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
                  <Mail className="w-3.5 h-3.5" /> Registered Email:
                </span>
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate max-w-[140px]">{userEmail}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-650 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
                  <Calendar className="w-3.5 h-3.5" /> Join Date:
                </span>
                <span className="text-zinc-800 dark:text-zinc-250 font-medium">08 June 2026</span>
              </div>
              <div className="flex justify-between items-center text-zinc-650 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
                  <Link2 className="w-3.5 h-3.5" /> Sign-in Provider:
                </span>
                {(session?.user as any)?.provider === 'google' ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-800 rounded-full px-2.5 py-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-zinc-400 bg-zinc-800 rounded-full px-2.5 py-0.5">
                    Credentials
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tab Bar & Tab Content Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs Navigation Bar */}
          <div className="flex overflow-x-auto space-x-1 bg-zinc-200 dark:bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-900">
            {[
              { id: 'overview', label: 'Overview', icon: Compass },
              { id: 'builds', label: 'Saved Builds', icon: Flame, tooltip: 'Build yang telah disimpan.' },
              { id: 'account', label: 'Account', icon: Settings },
              { id: 'security', label: 'Security', icon: Key, tooltip: 'Pengaturan keamanan akun.' },
              { id: 'notifications', label: 'Alerts', icon: Bell }
            ].map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <div key={tab.id} className="flex items-center gap-0.5">
                  <button
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`flex items-center gap-1.5 px-4.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                      active 
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-300 dark:hover:bg-zinc-900/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                  {tab.tooltip && <HelpTooltip content={tab.tooltip} className="mr-1" />}
                </div>
              )
            })}
          </div>

          {/* Tab Screen rendering */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-xl min-h-[350px]">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  {/* Overview Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-xl text-center">
                      <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Builds</span>
                      <span className="block text-2xl font-extrabold text-violet-650 dark:text-violet-400 font-display mt-1">
                        {mockSavedBuilds.length}
                      </span>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-xl text-center">
                      <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Favorites</span>
                      <span className="block text-2xl font-extrabold text-violet-650 dark:text-violet-400 font-display mt-1">
                        {mockFavorites.length}
                      </span>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-xl text-center">
                      <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Bookmarks</span>
                      <span className="block text-2xl font-extrabold text-violet-650 dark:text-violet-400 font-display mt-1">
                        {mockBookmarks.length}
                      </span>
                    </div>
                  </div>

                  {/* Recent Activities Feed */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-violet-400" />
                      Recent Activities
                    </h3>
                    <div className="space-y-2">
                      {mockActivities.map((act, i) => {
                        const Icon = act.icon
                        return (
                          <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-xl text-xs gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 rounded-lg border shrink-0 ${act.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate leading-tight">
                                {act.text}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{act.time}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Favorite Characters Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Favorites Box */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-violet-400" />
                        Favorite Characters
                        <HelpTooltip content="Karakter yang ditandai favorit." />
                      </h3>
                      <div className="space-y-2">
                        {mockFavorites.map(c => (
                          <div key={c.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-xl flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-zinc-800 dark:text-white leading-tight">{c.name}</p>
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block mt-1">{c.distance}</span>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {Array.from({ length: c.rarity }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bookmarked Guides */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookMarked className="w-3.5 h-3.5 text-violet-400" />
                        Bookmarked Guides
                        <HelpTooltip content="Panduan yang disimpan." />
                      </h3>
                      <div className="space-y-2">
                        {mockBookmarks.map(b => (
                          <div key={b.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-xl flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-zinc-800 dark:text-white leading-tight truncate max-w-[160px]">{b.title}</p>
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block mt-1">By {b.author}</span>
                            </div>
                            <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-violet-650/10 border border-violet-900/50 text-violet-650 dark:text-violet-400 rounded-md uppercase shrink-0">
                              {b.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* Tab 2: Saved Builds */}
              {activeTab === 'builds' && (
                <motion.div
                  key="builds"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-white font-display">My Saved Builds</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockSavedBuilds.map(b => (
                      <div key={b.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-900 rounded-xl space-y-3 shadow-sm hover:border-zinc-800 transition-colors">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-sm text-zinc-800 dark:text-white leading-snug">{b.title}</p>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono whitespace-nowrap">{b.date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px] text-zinc-500">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-400">Speed</span>
                            <span className="font-bold text-zinc-700 dark:text-zinc-200">{b.speed}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-400">Stamina</span>
                            <span className="font-bold text-zinc-700 dark:text-zinc-200">{b.stam}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-400">Power</span>
                            <span className="font-bold text-zinc-700 dark:text-zinc-200">{b.pow}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Account Settings */}
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
                      <h3 className="text-sm font-bold text-zinc-800 dark:text-white font-display">Update Account Details</h3>
                      <p className="text-[11px] text-zinc-550 dark:text-zinc-500 mt-0.5">Edit your trainer display identity and avatar URL.</p>
                    </div>

                    {profileMessage && (
                      <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                        profileMessage.type === 'success' 
                          ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400' 
                          : 'bg-red-950/20 border-red-900 text-red-400'
                      }`}>
                        {profileMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                        <span>{profileMessage.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Trainer Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg py-2 px-3 text-xs text-zinc-800 dark:text-white outline-none focus:border-violet-500 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Avatar URL</label>
                        <input
                          type="text"
                          required
                          value={avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg py-2 px-3 text-xs text-zinc-800 dark:text-white outline-none focus:border-violet-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-900">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-violet-600 hover:bg-violet-550 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/10 cursor-pointer transition-colors"
                      >
                        {profileSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Tab 4: Security Settings */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
                      <h3 className="text-sm font-bold text-zinc-800 dark:text-white font-display">Manage Security</h3>
                      <p className="text-[11px] text-zinc-550 dark:text-zinc-500 mt-0.5">Ensure your account uses a strong credentials password.</p>
                    </div>

                    {passwordMessage && (
                      <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                        passwordMessage.type === 'success' 
                          ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400' 
                          : 'bg-red-950/20 border-red-900 text-red-400'
                      }`}>
                        {passwordMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                        <span>{passwordMessage.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Current Password</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg py-2 px-3 text-xs text-zinc-800 dark:text-white outline-none focus:border-violet-500 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg py-2 px-3 text-xs text-zinc-800 dark:text-white outline-none focus:border-violet-500 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg py-2 px-3 text-xs text-zinc-800 dark:text-white outline-none focus:border-violet-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-900">
                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-violet-600 hover:bg-violet-550 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/10 cursor-pointer transition-colors"
                      >
                        {passwordSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Key className="w-3.5 h-3.5" /> Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Tab 5: Notification Toggles */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-5"
                >
                  <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-white font-display">Notification Preferences</h3>
                    <p className="text-[11px] text-zinc-550 dark:text-zinc-500 mt-0.5">Configure which system events trigger notifications.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Toggle 1 */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-xl">
                      <div>
                        <span className="block font-bold text-xs text-zinc-800 dark:text-white leading-tight">Meta Build Updates</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">Receive alerts when top ranking trainers share new builds.</span>
                      </div>
                      <button
                        onClick={() => toggleNotif('buildUpdates')}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 ${
                          notifPreferences.buildUpdates ? 'bg-violet-600' : 'bg-zinc-350 dark:bg-zinc-800'
                        }`}
                      >
                        <motion.div 
                          layout 
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ x: notifPreferences.buildUpdates ? 16 : 0 }}
                        />
                      </button>
                    </div>

                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-xl">
                      <div>
                        <span className="block font-bold text-xs text-zinc-800 dark:text-white leading-tight">Activity Alerts</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">Notify when other users interact with your comments or guides.</span>
                      </div>
                      <button
                        onClick={() => toggleNotif('activityAlerts')}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 ${
                          notifPreferences.activityAlerts ? 'bg-violet-600' : 'bg-zinc-350 dark:bg-zinc-800'
                        }`}
                      >
                        <motion.div 
                          layout 
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ x: notifPreferences.activityAlerts ? 16 : 0 }}
                        />
                      </button>
                    </div>

                    {/* Toggle 3 */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-xl">
                      <div>
                        <span className="block font-bold text-xs text-zinc-800 dark:text-white leading-tight">Newsletters & Tips</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">Receive bi-weekly digests on patch changes and meta guides.</span>
                      </div>
                      <button
                        onClick={() => toggleNotif('newsletters')}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 ${
                          notifPreferences.newsletters ? 'bg-violet-600' : 'bg-zinc-350 dark:bg-zinc-800'
                        }`}
                      >
                        <motion.div 
                          layout 
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ x: notifPreferences.newsletters ? 16 : 0 }}
                        />
                      </button>
                    </div>

                    {/* Toggle 4 */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-xl">
                      <div>
                        <span className="block font-bold text-xs text-zinc-800 dark:text-white leading-tight">CMS Moderation Logs</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">Receive emails when drafts you submitted are approved or require revisions.</span>
                      </div>
                      <button
                        onClick={() => toggleNotif('cmsModeration')}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 ${
                          notifPreferences.cmsModeration ? 'bg-violet-600' : 'bg-zinc-350 dark:bg-zinc-800'
                        }`}
                      >
                        <motion.div 
                          layout 
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ x: notifPreferences.cmsModeration ? 16 : 0 }}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}
