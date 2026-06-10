'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  User, 
  LogOut, 
  ShieldAlert, 
  Home, 
  ChevronRight,
  Info,
  ArrowLeft,
  LayoutDashboard,
  Users as UsersIcon,
  Layers,
  Award,
  Trophy,
  BookOpen,
  Wrench,
  Compass,
  Tag as TagIcon,
  Grid,
  Image as ImageIcon,
  FileSpreadsheet,
  ClipboardCheck,
  History,
  UserCheck,
  Menu,
  X
} from 'lucide-react'
import GlobalHelp from '@/components/shared/global-help'
import CMSTour from '@/components/shared/cms-tour'

interface NotificationItem {
  id: string
  text: string
  time: string
  unread: boolean
}

const CMS_NAV_ITEMS = [
  { href: '/cms', label: 'CMS Dashboard', icon: LayoutDashboard },
  { href: '/cms/characters', label: 'Character Drafts', icon: UsersIcon },
  { href: '/cms/supports', label: 'Support Card Drafts', icon: Layers },
  { href: '/cms/skills', label: 'Skill Drafts', icon: Award },
  { href: '/cms/races', label: 'Race Drafts', icon: Trophy },
  { href: '/cms/scenarios', label: 'Scenarios', icon: BookOpen },
  { href: '/cms/metabuilds', label: 'Meta Builds', icon: Wrench },
  { href: '/cms/guides', label: 'Guides', icon: Compass },
  { href: '/cms/tags', label: 'Tags', icon: TagIcon },
  { href: '/cms/categories', label: 'Categories', icon: Grid },
  { href: '/cms/media', label: 'Media Library', icon: ImageIcon },
  { href: '/cms/import', label: 'Import Center', icon: FileSpreadsheet },
  { href: '/cms/review', label: 'Review Center', icon: ClipboardCheck },
  { href: '/cms/audit', label: 'Audit Logs', icon: History },
  { href: '/cms/users', label: 'User Roles', icon: UserCheck },
]

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  
  // Mobile sidebar and header dropdowns
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', text: 'New draft submitted for review: Twin Turbo', time: '1h ago', unread: true },
    { id: '2', text: 'Scenario CSV import processed successfully', time: '4h ago', unread: true },
    { id: '3', text: 'Welcome to CMS portal dashboard', time: '1d ago', unread: false }
  ])

  const notifRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
      updateThemeClasses(savedTheme)
    } else {
      updateThemeClasses('dark')
    }
  }, [])

  const updateThemeClasses = (t: 'dark' | 'light') => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    updateThemeClasses(nextTheme)
  }

  // Breadcrumbs System
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(x => x)
    const breadcrumbs = [{ label: 'CMS', href: '/cms' }]

    if (segments.length <= 1) {
      return [{ label: 'CMS Dashboard', href: '/cms' }]
    }

    segments.slice(1).forEach((seg, index) => {
      const href = '/cms/' + segments.slice(2, index + 2).join('/')
      let label = seg.charAt(0).toUpperCase() + seg.slice(1)
      if (seg === 'characters') label = 'Characters'
      if (seg === 'supports') label = 'Support Cards'
      if (seg === 'skills') label = 'Skills'
      if (seg === 'races') label = 'Races'
      if (seg === 'scenarios') label = 'Scenarios'
      if (seg === 'metabuilds') label = 'Meta Builds'
      if (seg === 'guides') label = 'Guides'
      if (seg === 'tags') label = 'Tags'
      if (seg === 'categories') label = 'Categories'
      if (seg === 'import') label = 'Import Center'
      if (seg === 'review') label = 'Review Center'
      if (seg === 'audit') label = 'Audit Logs'
      if (seg === 'users') label = 'User Roles'
      if (seg === 'media') label = 'Media Library'
      
      breadcrumbs.push({ label, href })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()
  const unreadCount = notifications.filter(n => n.unread).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  const role = (session?.user as any)?.role || 'DATA_ENTRY'
  const userAvatar = (session?.user as any)?.avatar || '/avatars/default.png'
  const userName = session?.user?.name || 'Guest Staff'

  const isActive = (href: string) => pathname === href

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-950 dark:bg-black text-zinc-800 dark:text-zinc-100 transition-colors duration-250">
      
      {/* Mobile CMS Header / Trigger */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50">
        <Link href="/cms" className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-violet-500" />
          <span className="font-bold text-white tracking-wide font-display">Uma CMS</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:sticky lg:h-screen'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Brand header */}
          <div className="hidden lg:flex items-center gap-2.5 p-6 border-b border-zinc-900">
            <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-violet-500 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-wide font-display block leading-none">
                Uma CMS Portal
              </span>
              <span className="text-[9px] text-zinc-500 font-semibold tracking-wider uppercase">
                Data Management
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg transition-colors mb-4 border border-zinc-900 hover:border-zinc-850"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali Ke Portal Trainer
            </Link>

            {CMS_NAV_ITEMS.map((item) => {
              // Hide review center if Data Entry
              if (item.href === '/cms/review' && role === 'DATA_ENTRY') return null
              // Hide audit logs and user management if not Admin
              if (item.href === '/cms/audit' && role !== 'ADMIN') return null
              if (item.href === '/cms/users' && role !== 'ADMIN') return null

              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                    active
                      ? 'bg-violet-650/15 border-l-2 border-violet-500 text-violet-400 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* CMS Role Badge Footer */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/80">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900 border border-zinc-900">
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-lg bg-zinc-800 object-cover border border-zinc-800"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-none">
                {userName}
              </p>
              <span className="inline-block mt-1 text-[8px] font-extrabold tracking-wider bg-violet-650/10 border border-violet-900/50 text-violet-400 rounded px-1.5 py-0.5 uppercase">
                {role} ACCESS
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Flow */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Unified CMS Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between sticky top-0 z-35">
          
          {/* Breadcrumb System */}
          <nav className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <Home className="w-3.5 h-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              return (
                <React.Fragment key={crumb.href + idx}>
                  <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700 shrink-0" />
                  {isLast ? (
                    <span className="text-zinc-800 dark:text-white font-bold truncate max-w-[120px] sm:max-w-[200px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link 
                      href={crumb.href}
                      className="hover:text-violet-650 dark:hover:text-violet-400 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              )
            })}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Center */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-xl overflow-hidden z-50 text-xs text-zinc-700 dark:text-zinc-300"
                  >
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/50">
                      <span className="font-bold text-zinc-800 dark:text-white">CMS Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] text-violet-600 dark:text-violet-400 font-bold hover:underline cursor-pointer"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-900 max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 transition-colors flex gap-2.5 items-start ${
                            n.unread ? 'bg-violet-600/5 dark:bg-violet-600/[0.02]' : ''
                          }`}
                        >
                          <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <p className="text-zinc-700 dark:text-zinc-300 leading-snug break-words">{n.text}</p>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all cursor-pointer"
              >
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-855 object-cover border border-zinc-200 dark:border-zinc-800"
                />
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-xl overflow-hidden z-50 text-xs text-zinc-700 dark:text-zinc-300"
                  >
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50">
                      <p className="font-bold text-zinc-800 dark:text-white truncate">{userName}</p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {session?.user?.email || 'staff@zenuma.com'}
                      </p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors w-full text-left"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        My Profile
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-900">
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          signOut({ callbackUrl: '/login' })
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors w-full text-left font-semibold cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-6xl mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
      <CMSTour />
      <GlobalHelp />
    </div>
  )
}
