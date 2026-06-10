'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Award, 
  Sparkles, 
  Layers, 
  Check, 
  Info, 
  AlertCircle,
  Loader2 
} from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'

interface Skill {
  id: string
  name: string
  description: string
  category: string
  trigger: string
}

export default function SkillsPage() {
  const [selectedChar, setSelectedChar] = useState('char_special_week')
  const [distance, setDistance] = useState<'Sprint' | 'Mile' | 'Medium' | 'Long'>('Medium')
  const [style, setStyle] = useState<'Runner' | 'Leader' | 'Betweener' | 'Chaser'>('Leader')

  // Fetch characters and skills
  const { data: characters = [], isLoading: charsLoading } = useQuery<any[]>({
    queryKey: ['characters'],
    queryFn: () => fetch('/api/characters').then(res => res.json())
  })

  const { data: skills = [], isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: () => fetch('/api/skills').then(res => res.json())
  })

  const activeChar = characters.find(c => c.id === selectedChar)

  // Dynamic Rule for Tier Allocations
  const getOptimizedTiers = () => {
    const sTier: { skill: Skill; reason: string }[] = []
    const aTier: { skill: Skill; reason: string }[] = []
    const bTier: { skill: Skill; reason: string }[] = []

    skills.forEach(skill => {
      // 1. Corner Maestro
      if (skill.id === 'skill_corner_maestro') {
        if (distance === 'Long' || distance === 'Medium') {
          sTier.push({
            skill,
            reason: `Stamina recovery yang luar biasa untuk rute ${distance}. Menghindari kehabisan stamina di belokan akhir.`
          })
        } else {
          bTier.push({
            skill,
            reason: `Balapan ${distance} memiliki jarak pendek sehingga pemulihan stamina Corner Maestro kurang berguna.`
          })
        }
      }
      // 2. Emperor's Pride
      else if (skill.id === 'skill_emperors_pride') {
        if (style === 'Leader' || style === 'Betweener') {
          sTier.push({
            skill,
            reason: `Sangat cocok dengan gaya ${style} yang membutuhkan akselerasi menyalip di tikungan akhir.`
          })
        } else if (style === 'Runner') {
          bTier.push({
            skill,
            reason: `Karakter Runner memimpin di depan dan jarang menyalip lawan, sehingga pemicu skill ini sulit aktif.`
          })
        } else {
          aTier.push({
            skill,
            reason: `Bagus untuk menyalip dari belakang, namun pemicu posisinya bergantung pada kepadatan lintasan.`
          })
        }
      }
      // 3. Shadow Break
      else if (skill.id === 'skill_shadow_break') {
        if (style === 'Runner' || style === 'Leader') {
          sTier.push({
            skill,
            reason: `Akselerasi instan ketika memimpin di pack depan lintasan saat memasuki tikungan akhir.`
          })
        } else {
          aTier.push({
            skill,
            reason: `Meningkatkan kecepatan di belokan akhir untuk menyusul baris depan.`
          })
        }
      }
      // 4. Arcana Mastery
      else if (skill.id === 'skill_arcana_mastery') {
        sTier.push({
          skill,
          reason: `Kecepatan akhir yang sangat besar pada sisa 200m. Wajib dimiliki untuk semua jenis build.`
        })
      }
      // 5. Straight Recovery
      else if (skill.id === 'skill_straight_recovery') {
        if (distance === 'Long') {
          aTier.push({
            skill,
            reason: `Pemulihan sekunder yang baik pada trek lurus yang panjang.`
          })
        } else {
          bTier.push({
            skill,
            reason: `Jarak tempuh ${distance} terlalu pendek untuk memprioritaskan pemulihan sekunder.`
          })
        }
      }
      // 6. Speedster
      else if (skill.id === 'skill_speed_ster') {
        if (style === 'Leader' || style === 'Runner') {
          sTier.push({
            skill,
            reason: `Meningkatkan akselerasi belokan pada leg terakhir balapan. Sangat krusial untuk mengunci posisi terdepan.`
          })
        } else {
          aTier.push({
            skill,
            reason: `Membantu mengejar ketertinggalan di tikungan terakhir sebelum stretch lurus.`
          })
        }
      }
      // Default fallbacks for unsorted skills
      else {
        aTier.push({
          skill,
          reason: "Skill situasional yang memberikan statistik tambahan secara umum."
        })
      }
    })

    return { sTier, aTier, bTier }
  }

  const { sTier, aTier, bTier } = getOptimizedTiers()

  if (charsLoading || skillsLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Skill Optimizer</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Dapatkan rekomendasi daftar tingkat (Tier List) skill terbaik berdasarkan kombinasi Uma Musume, jarak balapan, dan gaya berlari.
        </p>
      </div>

      {/* Selectors Panel */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Character Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              Pilih Uma Musume
              <HelpTooltip content="Pilih karakter untuk melihat kecocokan skill." />
            </label>
            <select
              value={selectedChar}
              onChange={(e) => setSelectedChar(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-all"
            >
              {characters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              Jarak Balapan
              <HelpTooltip content="Pilih target jarak race." />
            </label>
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value as any)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-all"
            >
              <option value="Sprint">Sprint (Jarak Pendek)</option>
              <option value="Mile">Mile (Jarak Menengah-Pendek)</option>
              <option value="Medium">Medium (Jarak Menengah)</option>
              <option value="Long">Long (Jarak Jauh)</option>
            </select>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              Gaya Berlari (Running Style)
              <HelpTooltip content="Strategi lari yang digunakan karakter." />
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-200 outline-none focus:border-violet-500 transition-all"
            >
              <option value="Runner">Runner (Memimpin Depan)</option>
              <option value="Leader">Leader (Pack Depan)</option>
              <option value="Betweener">Betweener (Pack Tengah)</option>
              <option value="Chaser">Chaser (Menyusul Akhir)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tier Lists Output */}
      <div className="space-y-6">
        {/* S-Tier (God Tier) */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <h2 className="text-md font-extrabold text-amber-400 flex items-center gap-2 font-display uppercase tracking-wider">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            S-Tier (Essential / Core Skills)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sTier.map(({ skill, reason }) => (
              <div key={skill.id} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-sm text-white">{skill.name}</span>
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-zinc-850 border border-zinc-850 text-zinc-400 rounded-md">
                      {skill.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{skill.description}</p>
                </div>
                <div className="p-3 bg-violet-950/20 border border-violet-900/30 rounded-lg text-xs text-violet-300 flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* A-Tier (Strong Tier) */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <h2 className="text-md font-extrabold text-violet-400 flex items-center gap-2 font-display uppercase tracking-wider">
            <Award className="w-5 h-5 text-violet-400" />
            A-Tier (Recommended / Tech Skills)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aTier.map(({ skill, reason }) => (
              <div key={skill.id} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-sm text-white">{skill.name}</span>
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-zinc-850 border border-zinc-850 text-zinc-400 rounded-md">
                      {skill.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{skill.description}</p>
                </div>
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs text-zinc-400 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* B-Tier (Average / Low Priority) */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <h2 className="text-md font-extrabold text-zinc-500 flex items-center gap-2 font-display uppercase tracking-wider">
            <Layers className="w-5 h-5 text-zinc-600" />
            B-Tier (Situational / Low Value)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bTier.map(({ skill, reason }) => (
              <div key={skill.id} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-sm text-white">{skill.name}</span>
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-zinc-850 border border-zinc-850 text-zinc-400 rounded-md">
                      {skill.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{skill.description}</p>
                </div>
                <div className="p-3 bg-red-950/20 border border-red-900/20 rounded-lg text-xs text-red-400/80 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
