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
  Settings, 
  LogOut, 
  ShieldCheck, 
  Home, 
  ChevronRight,
  Info
} from 'lucide-react'
import Sidebar from '@/components/shared/sidebar'
import GlobalHelp from '@/components/shared/global-help'
import OnboardingTour from '@/components/shared/onboarding-tour'

interface NotificationItem {
  id: string
  text: string
  time: string
  unread: boolean
}

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  
  // Header Dropdowns
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', text: 'New Meta Build shared: Oguri Cap Mile Setup', time: '1h ago', unread: true },
    { id: '2', text: 'CSV Seeder sync completed successfully', time: '5h ago', unread: true },
    { id: '3', text: 'Welcome to Zen Uma Trainer Portal!', time: '1d ago', unread: false }
  ])

  const notifRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on click outside
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

  // Sync theme with document element
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

  // Dynamic Breadcrumb system
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(x => x)
    const breadcrumbs = [{ label: 'Home', href: '/dashboard' }]

    if (segments.length === 0 || segments[0] === 'dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard' }]
    }

    segments.forEach((seg, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      
      // Map segments to professional labels
      let label = seg.charAt(0).toUpperCase() + seg.slice(1)
      if (seg === 'characters') label = 'Characters'
      if (seg === 'supports') label = 'Support Cards'
      if (seg === 'skills') label = 'Skills'
      if (seg === 'races') label = 'Races'
      if (seg === 'explorer') label = 'Explorer'
      if (seg === 'simulator') label = 'Training Simulator'
      if (seg === 'advisor') label = 'AI Advisor'
      if (seg === 'planner') label = 'Build Planner'
      if (seg === 'builds') label = 'Meta Builds'
      if (seg === 'guides') label = 'Guides'
      if (seg === 'profile') label = 'User Profile'
      
      breadcrumbs.push({ label, href })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()
  const unreadCount = notifications.filter(n => n.unread).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  const isStaff = session?.user && ['ADMIN', 'MODERATOR', 'DATA_ENTRY'].includes((session.user as any).role)
  const userAvatar = (session?.user as any)?.avatar || '/avatars/default.png'
  const userName = session?.user?.name || 'Guest Trainer'

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-950 dark:bg-black text-zinc-800 dark:text-zinc-100 transition-colors duration-250">
      
      {/* Shared Portal Sidebar */}
      <Sidebar />

      {/* Main content flow */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Unified Portal Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          
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

          {/* Action buttons on the right */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle Button */}
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
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-xl overflow-hidden z-50 text-xs"
                  >
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/50">
                      <span className="font-bold text-zinc-800 dark:text-white">Notifications</span>
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

            {/* Profile User Dropdown Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all cursor-pointer"
              >
                <img
                  src={userAvatar}
                  alt={userName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/default.png'
                  }}
                  className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-850 object-cover border border-zinc-200 dark:border-zinc-800"
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
                        {session?.user?.email || 'guest@zenuma.com'}
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
                      
                      {isStaff && (
                        <Link
                          href="/cms"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-violet-650 dark:text-violet-400 transition-colors w-full text-left font-semibold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          CMS Portal
                        </Link>
                      )}
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

        {/* Dynamic page contents wrapped in uniform styling */}
        <main className="flex-1 p-5 md:p-7 lg:p-9">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>

      <OnboardingTour />
      <GlobalHelp />
    </div>
  )
}
