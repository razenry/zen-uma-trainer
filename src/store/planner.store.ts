import { create } from 'zustand'
import { Stats } from './simulator.store'

interface PlannerState {
  characterId: string
  distance: "Sprint" | "Mile" | "Medium" | "Long"
  style: "Runner" | "Leader" | "Betweener" | "Chaser"
  targetStats: Stats
  selectedSkills: string[] // skill IDs

  // Actions
  setCharacter: (id: string) => void
  setDistance: (distance: "Sprint" | "Mile" | "Medium" | "Long") => void
  setStyle: (style: "Runner" | "Leader" | "Betweener" | "Chaser") => void
  updateTargetStats: (stats: Partial<Stats>) => void
  toggleSkill: (skillId: string) => void
  setSelectedSkills: (skillIds: string[]) => void
  reset: () => void
}

const DEFAULT_STATE = {
  characterId: "char_special_week",
  distance: "Medium" as const,
  style: "Leader" as const,
  targetStats: {
    speed: 1200,
    stamina: 800,
    power: 1000,
    guts: 450,
    wisdom: 800
  },
  selectedSkills: ["skill_corner_maestro", "skill_emperors_pride"]
}

export const usePlannerStore = create<PlannerState>((set) => ({
  ...DEFAULT_STATE,

  setCharacter: (id) => set({ characterId: id }),
  setDistance: (distance) => set({ distance }),
  setStyle: (style) => set({ style }),
  updateTargetStats: (stats) => set((state) => ({
    targetStats: {
      speed: Math.max(1, (stats.speed ?? state.targetStats.speed)),
      stamina: Math.max(1, (stats.stamina ?? state.targetStats.stamina)),
      power: Math.max(1, (stats.power ?? state.targetStats.power)),
      guts: Math.max(1, (stats.guts ?? state.targetStats.guts)),
      wisdom: Math.max(1, (stats.wisdom ?? state.targetStats.wisdom)),
    }
  })),
  toggleSkill: (skillId) => set((state) => ({
    selectedSkills: state.selectedSkills.includes(skillId)
      ? state.selectedSkills.filter(id => id !== skillId)
      : [...state.selectedSkills, skillId]
  })),
  setSelectedSkills: (selectedSkills) => set({ selectedSkills }),
  reset: () => set(DEFAULT_STATE)
}))
