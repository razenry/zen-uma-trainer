import { create } from 'zustand'

export interface Stats {
  speed: number
  stamina: number
  power: number
  guts: number
  wisdom: number
}

interface SimulatorState {
  characterId: string
  scenario: string
  currentTurn: number
  motivation: "Worst" | "Bad" | "Normal" | "Good" | "Perfect"
  energy: number
  speed: number
  stamina: number
  power: number
  guts: number
  wisdom: number
  deck: string[] // IDs of support cards

  // Actions
  setCharacter: (id: string) => void
  setScenario: (scenario: string) => void
  setTurn: (turn: number) => void
  setMotivation: (motivation: "Worst" | "Bad" | "Normal" | "Good" | "Perfect") => void
  setEnergy: (energy: number) => void
  updateStats: (stats: Partial<Stats>) => void
  setDeck: (cardIds: string[]) => void
  reset: () => void
  performTraining: (actionName: string, gains: Partial<Stats> & { energy?: number }) => void
}

const DEFAULT_STATE = {
  characterId: "char_special_week",
  scenario: "URA Scenario",
  currentTurn: 1,
  motivation: "Normal" as const,
  energy: 100,
  speed: 120,
  stamina: 120,
  power: 120,
  guts: 120,
  wisdom: 120,
  deck: ["card_kitasan_black", "card_fine_motion", "card_super_creek"]
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  ...DEFAULT_STATE,

  setCharacter: (id) => set({ characterId: id }),
  setScenario: (scenario) => set({ scenario }),
  setTurn: (turn) => set({ currentTurn: turn }),
  setMotivation: (motivation) => set({ motivation }),
  setEnergy: (energy) => set({ energy: Math.max(0, Math.min(100, energy)) }),
  updateStats: (stats) => set((state) => ({
    speed: Math.max(1, (stats.speed ?? state.speed)),
    stamina: Math.max(1, (stats.stamina ?? state.stamina)),
    power: Math.max(1, (stats.power ?? state.power)),
    guts: Math.max(1, (stats.guts ?? state.guts)),
    wisdom: Math.max(1, (stats.wisdom ?? state.wisdom)),
  })),
  setDeck: (deck) => set({ deck }),
  reset: () => set(DEFAULT_STATE),
  performTraining: (actionName, gains) => set((state) => {
    if (state.currentTurn >= 72) return {} // Simulator finished

    const energyGain = gains.energy ?? 0
    const newEnergy = Math.max(0, Math.min(100, state.energy + energyGain))

    // If resting, motivation has a random chance to go up
    let newMotivation = state.motivation
    if (actionName === "Rest" && Math.random() > 0.6) {
      const motivations: SimulatorState['motivation'][] = ["Worst", "Bad", "Normal", "Good", "Perfect"]
      const currentIndex = motivations.indexOf(state.motivation)
      if (currentIndex < motivations.length - 1) {
        newMotivation = motivations[currentIndex + 1]
      }
    }

    return {
      currentTurn: state.currentTurn + 1,
      energy: newEnergy,
      motivation: newMotivation,
      speed: Math.max(1, state.speed + (gains.speed ?? 0)),
      stamina: Math.max(1, state.stamina + (gains.stamina ?? 0)),
      power: Math.max(1, state.power + (gains.power ?? 0)),
      guts: Math.max(1, state.guts + (gains.guts ?? 0)),
      wisdom: Math.max(1, state.wisdom + (gains.wisdom ?? 0)),
    }
  })
}))
