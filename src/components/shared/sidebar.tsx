'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  Layers,
  PlayCircle,
  BrainCircuit,
  Compass,
  Trophy,
  Award,
  Flame,
  Settings,
  LogOut,
  Gamepad2,
  Menu,
  X,
  Swords,
  BookOpen,
  User,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  Target,
  Map,
  Zap,
  Radio,
  Coins
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { href: '/characters', label: 'Character Explorer', icon: Users, group: 'main' },
  { href: '/supports', label: 'Support Cards', icon: Layers, group: 'main' },
  { href: '/skills/explorer', label: 'Skill Explorer', icon: Award, group: 'main' },
  { href: '/skills', label: 'Skill Optimizer', icon: Swords, group: 'main' },
  { href: '/races/explorer', label: 'Race Explorer', icon: Trophy, group: 'main' },
  { href: '/races', label: 'Race Analyzer', icon: ShieldCheck, group: 'main' },
  { href: '/simulator', label: 'Training Simulator', icon: PlayCircle, group: 'main' },
  { href: '/advisor', label: 'AI Advisor', icon: BrainCircuit, group: 'main' },
  { href: '/planner', label: 'Build Planner', icon: Compass, group: 'main' },
  { href: '/builds', label: 'Meta Builds', icon: Flame, group: 'main' },
  { href: '/guides', label: 'Community Guides', icon: BookOpen, group: 'main' },
  // Custom Enterprise Assistant Tools
  { href: '/team-builder', label: 'Team Builder', icon: Swords, group: 'main' },
  { href: '/deck-optimizer', label: 'Deck Optimizer', icon: Layers, group: 'main' },
  { href: '/ownership', label: 'Ownership Tracker', icon: ShieldCheck, group: 'main' },
  { href: '/resource-planner', label: 'Resource Planner', icon: Coins, group: 'main' },
  // Live Events & Meta System
  { href: '/events', label: 'Event Center', icon: Radio, group: 'events' },
  { href: '/events/champion-meeting', label: 'CM Analyzer', icon: Trophy, group: 'events' },
  { href: '/preparation', label: 'Event Prep', icon: Target, group: 'events' },
  { href: '/gacha', label: 'Gacha Planner', icon: Sparkles, group: 'events' },
  { href: '/scenarios', label: 'Scenario Guides', icon: Map, group: 'events' },
  { href: '/calendar', label: 'Event Calendar', icon: CalendarDays, group: 'events' },
  { href: '/profile', label: 'My Profile', icon: User, group: 'account' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = React.useState(false)

  const isStaff = session?.user && ['ADMIN', 'MODERATOR', 'DATA_ENTRY'].includes((session.user as any).role)
  const userAvatar = (session?.user as any)?.avatar || '/avatars/default.png'
  const userName = session?.user?.name || 'Guest Trainer'
  const userEmail = session?.user?.email || 'guest@zenuma.com'

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Menu Trigger */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-violet-500" />
          <span className="font-bold text-white tracking-wide font-display">Zen Uma</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:sticky lg:h-screen'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Header */}
          <div className="hidden lg:flex items-center gap-2.5 p-6 border-b border-zinc-900">
            <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
              <Gamepad2 className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-wide font-display block leading-none">
                Zen Uma Trainer
              </span>
              <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">
                Global Assistant
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              {NAV_ITEMS.filter(i => i.group !== 'events' && i.group !== 'account').map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                      active
                        ? 'bg-violet-600/10 border-l-2 border-violet-500 text-violet-400 font-semibold'
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
            </div>

            {/* Live Events Section */}
            <div className="mt-5 pt-4 border-t border-zinc-900">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-2">Live Events & Meta</p>
              <div className="space-y-1">
                {NAV_ITEMS.filter(i => i.group === 'events').map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                        active
                          ? 'bg-amber-600/10 border-l-2 border-amber-500 text-amber-400 font-semibold'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          active ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                        }`}
                      />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Account Section */}
            <div className="mt-4 space-y-1">
              {NAV_ITEMS.filter(i => i.group === 'account').map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                      active
                        ? 'bg-violet-600/10 border-l-2 border-violet-500 text-violet-400 font-semibold'
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
            </div>

            {/* CMS portal link */}
            {isStaff && (
              <Link
                href="/cms"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group mt-6 border border-dashed border-zinc-800 cursor-pointer ${
                  isActive('/cms')
                    ? 'bg-violet-600/10 text-violet-400 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <Settings className="w-4 h-4 text-violet-400" />
                CMS Portal
              </Link>
            )}
          </nav>
        </div>

        {/* User Footer Account Overview */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/40 border border-zinc-900 mb-3">
            <img
              src={userAvatar}
              alt={userName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/avatars/default.png'
              }}
              className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-800"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {userName}
              </p>
              <p className="text-[10px] text-zinc-500 truncate leading-none mt-1">
                {(session?.user as any)?.role || 'TRAINER'}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-zinc-500 hover:text-red-400 bg-zinc-900 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/30 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  )
}
