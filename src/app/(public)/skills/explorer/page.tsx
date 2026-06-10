'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Award, 
  Search, 
  Filter, 
  Zap,
  Info,
  X,
  Plus,
  Minus,
  CheckCircle,
  HelpCircle
} from 'lucide-react'
import { LoadingState, EmptyState } from '@/components/shared/ui-states'
import HelpTooltip from '@/components/shared/help-tooltip'

interface Skill {
  id: string
  name: string
  description: string
  cost: number
  tier: string
  category: string
  trigger: string
  distanceRequirement: string
  styleRequirement: string
}

export default function SkillExplorerPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTier, setSelectedTier] = useState('All')

  // Detailed Modal/Drawer State
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null)

  // Comparison State
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)

  // Fetch skills catalog
  const { data: skills = [], isLoading, error } = useQuery<Skill[]>({
    queryKey: ['skillsCatalog'],
    queryFn: async () => {
      const res = await fetch('/api/skills')
      if (!res.ok) throw new Error('Failed to load skills database')
      return res.json()
    }
  })

  // Filter skills
  const filteredSkills = skills.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory
    const matchesTier = selectedTier === 'All' || s.tier === selectedTier
    return matchesSearch && matchesCategory && matchesTier
  })

  // Handle comparison toggle
  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening detail modal
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 skills at once.')
          return prev
        }
        return [...prev, id]
      }
    })
  }

  // Get skills currently being compared
  const comparedSkills = skills.filter(s => compareIds.includes(s.id))

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Skill Explorer</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Browse skills details, costs, trigger conditions, category properties, and track requirements.
          </p>
        </div>

        {compareIds.length > 0 && (
          <button
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-650 hover:bg-violet-550 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/10 cursor-pointer transition-all hover:scale-[1.02] shrink-0"
          >
            <Award className="w-3.5 h-3.5" />
            Compare Selected ({compareIds.length})
          </button>
        )}
      </div>

      {/* Filters Dashboard */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-4 space-y-4 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-2 flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search skill name, trigger, or properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl py-2 pl-9 pr-10 text-xs text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-550 outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <HelpTooltip content="Cari skill berdasarkan nama." />
            </div>
          </div>

          <div className="flex items-center justify-end text-xs text-zinc-500 gap-1.5 font-medium">
            <Filter className="w-3.5 h-3.5 text-violet-400" />
            <span>Found {filteredSkills.length} Skills</span>
          </div>
        </div>

        {/* Quick buttons filter */}
        <div className="flex flex-col gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900/60 text-xs">
          
          {/* Categories */}
          <div className="flex items-start md:items-center gap-2 flex-col md:flex-row">
            <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] shrink-0 mt-1.5 md:mt-0">Category:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Speed', 'Stamina', 'Recovery', 'Start', 'Debuff', 'Passive'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-violet-600 border-violet-500 text-white font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tiers */}
          <div className="flex items-start md:items-center gap-2 flex-col md:flex-row">
            <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] shrink-0 mt-1.5 md:mt-0">Skill Tier:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'S', 'A', 'B', 'C', 'D'].map(tier => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedTier === tier
                      ? 'bg-violet-600 border-violet-500 text-white font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  {tier === 'All' ? 'All Tiers' : `${tier} Tier`}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Grid of Cards */}
      {isLoading ? (
        <LoadingState message="Fetching skills catalog database..." />
      ) : error ? (
        <div className="p-8 text-center text-red-400 border border-red-950/40 rounded-xl bg-red-950/5">
          Error: {error.message || 'Failed to fetch catalog.'}
        </div>
      ) : filteredSkills.length === 0 ? (
        <EmptyState 
          title="No Skills Found" 
          description="We couldn't find any skills matching your search and filter parameters. Try clearing the search query or changing active tags."
          actionLabel="Clear Filters"
          onAction={() => { setSearch(''); setSelectedCategory('All'); setSelectedTier('All'); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map(skill => {
            const isComparing = compareIds.includes(skill.id)
            return (
              <div 
                key={skill.id} 
                onClick={() => setActiveSkill(skill)}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4 group relative overflow-hidden"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                        skill.tier === 'S' ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60 text-amber-600 dark:text-amber-400' :
                        skill.tier === 'A' ? 'bg-violet-100 dark:bg-violet-950/40 border-violet-200 dark:border-violet-850 text-violet-650 dark:text-violet-400' :
                        'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {skill.tier} Tier
                      </span>
                      <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                        {skill.category}
                      </span>
                    </div>

                    {/* Compare Checkbox Trigger */}
                    <button
                      onClick={(e) => toggleCompare(skill.id, e)}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                        isComparing 
                          ? 'bg-violet-600 border-violet-500 text-white' 
                          : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                      title={isComparing ? 'Remove from comparison' : 'Add to comparison'}
                    >
                      {isComparing ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      Compare
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-zinc-800 dark:text-white text-base leading-snug group-hover:text-violet-650 dark:group-hover:text-violet-450 transition-colors">
                      {skill.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed line-clamp-2">
                      {skill.description}
                    </p>
                  </div>
                </div>

                {/* Requirement details */}
                <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 dark:border-zinc-900/60 pt-3.5 mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">
                  <div className="space-y-0.5">
                    <span className="block text-[8px] text-zinc-400">Cost</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-bold flex items-center gap-0.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      {skill.cost} Pt
                    </span>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <span className="block text-[8px] text-zinc-400">Conditions</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-bold truncate block" title={skill.trigger}>
                      {skill.trigger || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dynamic Detail Modal Drawer */}
      <AnimatePresence>
        {activeSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-violet-600/10 border border-violet-900/50 text-violet-650 dark:text-violet-400 rounded">
                      {activeSkill.category}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 text-zinc-550 rounded uppercase flex items-center gap-1">
                      {activeSkill.tier} TIER
                      <HelpTooltip content="Peringkat kekuatan skill berdasarkan meta." />
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-white font-display leading-tight">{activeSkill.name}</h2>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">ID: {activeSkill.id}</p>
                </div>
                <button
                  onClick={() => setActiveSkill(null)}
                  className="p-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-5 text-xs">
                
                {/* Description */}
                <div className="space-y-1">
                  <span className="block text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Skill Effect Description</span>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold bg-zinc-50 dark:bg-zinc-900/40 p-3 border border-zinc-100 dark:border-zinc-900 rounded-xl">
                    {activeSkill.description}
                  </p>
                </div>

                {/* Specific stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 space-y-1">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      Skill Cost
                      <HelpTooltip content="Jumlah skill point yang dibutuhkan." />
                    </span>
                    <span className="text-base font-extrabold text-amber-500 flex items-center gap-0.5">
                      <Zap className="w-4 h-4" /> {activeSkill.cost} Pt
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 space-y-1">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      Trigger Condition
                      <HelpTooltip content="Kondisi yang harus terpenuhi agar skill aktif." />
                    </span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block truncate" title={activeSkill.trigger}>
                      {activeSkill.trigger || 'Always Active'}
                    </span>
                  </div>
                </div>

                {/* Track Requirements */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 space-y-1">
                    <span className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Distance Restrictions</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      {activeSkill.distanceRequirement || 'Any Distance'}
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 space-y-1">
                    <span className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Running Style Req</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      {activeSkill.styleRequirement || 'Any Style'}
                    </span>
                  </div>
                </div>

                {/* Recommended Usage Section */}
                <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 space-y-1">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    Recommended Usage
                    <HelpTooltip content="Karakter dan kondisi yang cocok menggunakan skill ini." />
                  </span>
                  <p className="text-xs text-zinc-650 dark:text-zinc-450 leading-relaxed">
                    Sangat direkomendasikan untuk karakter bertipe <span className="text-violet-400 font-semibold">{activeSkill.styleRequirement || 'Semua Style'}</span> yang dijalankan pada lintasan <span className="text-violet-400 font-semibold">{activeSkill.distanceRequirement || 'Semua Jarak'}</span> untuk mengoptimalkan akselerasi/kecepatan akhir.
                  </p>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Side-by-Side Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-white font-display">Skill Comparison</h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Comparing up to 3 selected skills side by side.</p>
                </div>
                <button
                  onClick={() => setShowComparison(false)}
                  className="p-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comparison Matrix Table */}
              <div className="overflow-x-auto p-6">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-900 text-zinc-450 uppercase font-bold tracking-wider text-[10px]">
                      <th className="py-3 px-4 w-1/4">Metric</th>
                      {comparedSkills.map(s => (
                        <th key={s.id} className="py-3 px-4 w-1/4 text-zinc-800 dark:text-white font-bold font-display">
                          {s.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-zinc-650 dark:text-zinc-300">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[10px] uppercase text-zinc-400">Tier</td>
                      {comparedSkills.map(s => (
                        <td key={s.id} className="py-3.5 px-4 font-semibold">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${
                            s.tier === 'S' ? 'bg-amber-100 dark:bg-amber-955/20 border-amber-300 text-amber-600 dark:text-amber-400' :
                            s.tier === 'A' ? 'bg-violet-100 dark:bg-violet-955/20 border-violet-250 text-violet-650 dark:text-violet-400' :
                            'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 text-zinc-600 dark:text-zinc-450'
                          }`}>
                            {s.tier} Tier
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[10px] uppercase text-zinc-400">Category</td>
                      {comparedSkills.map(s => (
                        <td key={s.id} className="py-3.5 px-4 font-bold text-violet-650 dark:text-violet-400">
                          {s.category}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[10px] uppercase text-zinc-400">Skill Cost</td>
                      {comparedSkills.map(s => (
                        <td key={s.id} className="py-3.5 px-4 font-extrabold text-zinc-800 dark:text-white flex items-center gap-0.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {s.cost} Pt
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[10px] uppercase text-zinc-400">Trigger Conditions</td>
                      {comparedSkills.map(s => (
                        <td key={s.id} className="py-3.5 px-4 text-[11px] leading-relaxed">
                          {s.trigger || 'Always Active'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[10px] uppercase text-zinc-400">Track Restriction</td>
                      {comparedSkills.map(s => (
                        <td key={s.id} className="py-3.5 px-4 font-medium">
                          {s.distanceRequirement || 'Any Distance'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[10px] uppercase text-zinc-400">Running Style</td>
                      {comparedSkills.map(s => (
                        <td key={s.id} className="py-3.5 px-4 font-medium">
                          {s.styleRequirement || 'Any Style'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-[10px] uppercase text-zinc-400">Description</td>
                      {comparedSkills.map(s => (
                        <td key={s.id} className="py-3.5 px-4 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                          {s.description}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action footer */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/50">
                <button
                  onClick={() => { setCompareIds([]); setShowComparison(false); }}
                  className="px-4 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  onClick={() => setShowComparison(false)}
                  className="px-4 py-2 bg-violet-650 hover:bg-violet-550 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-colors"
                >
                  Close Matrix
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
