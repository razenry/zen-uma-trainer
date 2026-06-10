export interface Stats {
  speed: number
  stamina: number
  power: number
  guts: number
  wisdom: number
}

export interface AdvisorInput {
  turn: number // 1 to 72
  energy: number // 0 to 100
  motivation: string // "Worst" | "Bad" | "Normal" | "Good" | "Perfect"
  speed: number
  stamina: number
  power: number
  guts: number
  wisdom: number
  scenario?: string // Scenario name e.g. "Project L'Arc", "UAF", "URA Realistic Training"
  targetStats?: Stats
  growthBonus?: {
    speed?: number
    stamina?: number
    power?: number
    guts?: number
    wisdom?: number
  }
}

/**
 * Returns scenario-specific stat priority multipliers.
 * These reflect the gameplay mechanics of each training scenario.
 */
export function getScenarioMultipliers(scenario?: string): Partial<Record<keyof Stats, number>> {
  const s = (scenario || '').toLowerCase()

  if (s.includes("l'arc") || s.includes("larc") || s.includes("arc de triomphe")) {
    // Project L'Arc: Heavy emphasis on Stamina & Speed for 2400m international race
    return { speed: 1.3, stamina: 1.4, power: 1.1, guts: 0.9, wisdom: 1.0 }
  }
  if (s.includes('uaf') || s.includes('u.a.f')) {
    // UAF: Speed/Power dominant across 15 athletic trial categories
    return { speed: 1.3, stamina: 1.0, power: 1.3, guts: 1.1, wisdom: 0.9 }
  }
  if (s.includes('aoharu') || s.includes('aoharu cup')) {
    // Aoharu: Balanced with slight team/guts synergy
    return { speed: 1.1, stamina: 1.1, power: 1.1, guts: 1.2, wisdom: 1.1 }
  }
  if (s.includes('grand live')) {
    // Grand Live: Speed and Wisdom for performing scenarios
    return { speed: 1.2, stamina: 0.9, power: 1.0, guts: 0.9, wisdom: 1.4 }
  }
  if (s.includes('grand masters')) {
    // Grand Masters: Very balanced, slight guts/wisdom advantage
    return { speed: 1.1, stamina: 1.1, power: 1.1, guts: 1.2, wisdom: 1.2 }
  }
  if (s.includes('mecha') || s.includes('meka')) {
    // Mecha Uma: Power-focused mechanical scenario
    return { speed: 1.1, stamina: 1.0, power: 1.4, guts: 1.1, wisdom: 1.0 }
  }
  if (s.includes('harvest') || s.includes('twinkle') || s.includes('legends')) {
    // Seasonal event scenarios: Slightly balanced toward speed
    return { speed: 1.2, stamina: 1.1, power: 1.0, guts: 1.0, wisdom: 1.1 }
  }
  // URA Finals or default: Balanced standard training
  return { speed: 1.0, stamina: 1.0, power: 1.0, guts: 1.0, wisdom: 1.0 }
}

export interface RecommendedAction {
  name: string // "Speed Training" | "Stamina Training" | "Power Training" | "Guts Training" | "Wisdom Training" | "Rest"
  score: number
  predictedGain: Partial<Stats> & { energy?: number }
  riskScore: number
  reason: string
}

export interface AdvisorOutput {
  bestAction: string
  actions: RecommendedAction[]
  riskAnalysis: {
    level: "Low" | "Medium" | "High" | "Critical"
    score: number
    description: string
  }
  longTermImpact: {
    status: "On Track" | "Ahead" | "Behind"
    description: string
    estimatedFinalStats: Stats
  }
}

// Convert motivation string to a multiplier for training gains and risk mitigation
const MOTIVATION_MULTIPLIERS: Record<string, number> = {
  "Worst": 0.8,
  "Bad": 0.9,
  "Normal": 1.0,
  "Good": 1.1,
  "Perfect": 1.2
}

/**
 * Calculates a priority factor (0.0 - 2.5) for each stat.
 * Higher priority is given to stats that are further from their target compared to remaining turns.
 */
export function calculateStatPriority(current: Stats, target: Stats, remainingTurns: number): Record<keyof Stats, number> {
  const priorities: Record<keyof Stats, number> = {
    speed: 1.0,
    stamina: 1.0,
    power: 1.0,
    guts: 1.0,
    wisdom: 1.0
  }

  const keys = Object.keys(current) as Array<keyof Stats>
  
  for (const key of keys) {
    const diff = Math.max(0, target[key] - current[key])
    if (diff === 0) {
      priorities[key] = 0.2 // Stat target already met, low priority
      continue
    }

    if (remainingTurns <= 0) {
      priorities[key] = 2.0
      continue
    }

    // Required average gain per turn to reach the target
    const requiredPerTurn = diff / remainingTurns
    
    // Scale priority based on how urgent the stat needs to be raised
    if (requiredPerTurn > 25) {
      priorities[key] = 2.5 // Extremely urgent
    } else if (requiredPerTurn > 15) {
      priorities[key] = 1.8 // High urgency
    } else if (requiredPerTurn > 8) {
      priorities[key] = 1.2 // Medium urgency
    } else {
      priorities[key] = 0.8 // Low urgency
    }
  }

  return priorities
}

/**
 * Calculates the training failure rate (0 - 100) based on current energy, motivation, and type of training.
 */
export function calculateRiskScore(energy: number, motivation: string, isWisdom: boolean = false): number {
  if (isWisdom) {
    // Wisdom training recovers a little energy and has very low risk
    if (energy >= 30) return 0
    if (energy >= 15) return 2
    return 8
  }

  if (energy >= 70) return 0
  if (energy >= 50) {
    // Base 0 - 12% risk
    const base = ((70 - energy) / 20) * 12
    return Math.round(base * (1.3 - (MOTIVATION_MULTIPLIERS[motivation] || 1.0) * 0.3))
  }
  if (energy >= 30) {
    // Base 12 - 35% risk
    const base = 12 + ((50 - energy) / 20) * 23
    return Math.round(base * (1.4 - (MOTIVATION_MULTIPLIERS[motivation] || 1.0) * 0.4))
  }
  
  // Critical low energy (under 30)
  const base = 35 + ((30 - energy) / 30) * 55
  return Math.round(base * (1.5 - (MOTIVATION_MULTIPLIERS[motivation] || 1.0) * 0.5))
}

/**
 * Core function that scores and ranks all possible training actions.
 */
export function calculateBestTraining(input: AdvisorInput): AdvisorOutput {
  const currentStats: Stats = {
    speed: input.speed,
    stamina: input.stamina,
    power: input.power,
    guts: input.guts,
    wisdom: input.wisdom
  }

  // Default target stats if none provided (balanced mid-tier target)
  const targetStats = input.targetStats || {
    speed: 1200,
    stamina: 800,
    power: 1000,
    guts: 450,
    wisdom: 800
  }

  const remainingTurns = Math.max(0, 72 - input.turn)
  const priorities = calculateStatPriority(currentStats, targetStats, remainingTurns)
  const motivationBonus = MOTIVATION_MULTIPLIERS[input.motivation] || 1.0

  // Apply scenario-specific multipliers to stat priorities
  const scenarioMults = getScenarioMultipliers(input.scenario)
  const scenarioKeys = ['speed', 'stamina', 'power', 'guts', 'wisdom'] as Array<keyof Stats>
  for (const key of scenarioKeys) {
    if (scenarioMults[key]) {
      priorities[key] = Math.min(2.5, priorities[key] * (scenarioMults[key] as number))
    }
  }

  // Standard training stats gain presets (pre-growth bonuses & motivation scaling)
  const baseTrainingGains: Record<string, Partial<Stats> & { energy: number }> = {
    "Speed Training": { speed: 20, power: 8, wisdom: 2, energy: -20 },
    "Stamina Training": { stamina: 18, guts: 6, power: 4, energy: -22 },
    "Power Training": { power: 18, stamina: 8, speed: 2, energy: -21 },
    "Guts Training": { guts: 16, speed: 4, power: 4, energy: -23 },
    "Wisdom Training": { wisdom: 18, speed: 4, energy: 5 } // wisdom training recovers +5 energy
  }

  const recommendedActions: RecommendedAction[] = []

  // 1. Evaluate Training Options
  for (const [actionName, baseGain] of Object.entries(baseTrainingGains)) {
    const isWisdom = actionName === "Wisdom Training"
    const risk = calculateRiskScore(input.energy, input.motivation, isWisdom)

    // Calculate actual stat gains after growth bonuses and motivation
    const actualGains: Partial<Stats> = {}
    let statScoreSum = 0

    const keys = ["speed", "stamina", "power", "guts", "wisdom"] as Array<keyof Stats>
    for (const key of keys) {
      if (baseGain[key]) {
        const growth = 1 + (input.growthBonus?.[key] || 0)
        const gain = Math.round((baseGain[key] || 0) * growth * motivationBonus)
        actualGains[key] = gain
        // Score is based on gain multiplied by priority
        statScoreSum += gain * priorities[key]
      }
    }

    // Rest/Energy penalty subtraction for scoring
    // If training has high risk, heavily penalize the score
    const riskPenalty = risk * 3.5
    const energyPenalty = input.energy < 30 && !isWisdom ? 50 : 0
    
    // Overall training option score
    let score = Math.max(1, Math.round(statScoreSum * 10 - riskPenalty - energyPenalty))
    
    // Low energy warning reason additions
    let reason = `Boosts ${Object.entries(actualGains).map(([k, v]) => `${k.toUpperCase()} (+${v})`).join(', ')}.`
    if (risk > 30) {
      reason += ` WARNING: Very high risk of failure (${risk}%).`
    } else if (risk > 10) {
      reason += ` Medium risk of failure (${risk}%).`
    }

    recommendedActions.push({
      name: actionName,
      score,
      predictedGain: { ...actualGains, energy: baseGain.energy },
      riskScore: risk,
      reason
    })
  }

  // 2. Evaluate Rest Action
  const restEnergyGain = input.energy >= 70 ? Math.min(100 - input.energy, 30) : 50
  const currentAvgPriority = Object.values(priorities).reduce((a, b) => a + b, 0) / 5
  
  // Rest score increases as current energy drops, and if stats aren't critically lagging
  let restScore = 0
  let restReason = ""

  if (input.energy >= 85) {
    restScore = 5
    restReason = "Energy is nearly full. Resting is a wasted turn."
  } else if (input.energy >= 60) {
    restScore = 30
    restReason = "Resting now is okay but training is still highly recommended."
  } else if (input.energy >= 35) {
    // Rest becomes a strong option
    restScore = Math.round(65 * currentAvgPriority)
    restReason = "Good time to rest and recover energy for high-intensity training turns."
  } else {
    // Critical recovery needed
    restScore = Math.round(110 * currentAvgPriority)
    restReason = "CRITICAL: Recover energy immediately to avoid high training failure rates."
  }

  recommendedActions.push({
    name: "Rest",
    score: restScore,
    predictedGain: { energy: restEnergyGain },
    riskScore: 0,
    reason: restReason
  })

  // Sort actions by score descending
  const sortedActions = [...recommendedActions].sort((a, b) => b.score - a.score)
  const bestAction = sortedActions[0].name

  // Risk Analysis
  const highestRisk = Math.max(...recommendedActions.map(a => a.riskScore))
  let riskLevel: "Low" | "Medium" | "High" | "Critical" = "Low"
  let riskDesc = "Current training options are safe."

  if (highestRisk >= 50) {
    riskLevel = "Critical"
    riskDesc = "Extremely high failure risk. You are highly advised to Rest or perform Wisdom training."
  } else if (highestRisk >= 25) {
    riskLevel = "High"
    riskDesc = "Significant risk of failure. Consider resting unless critical stats are needed."
  } else if (highestRisk > 5) {
    riskLevel = "Medium"
    riskDesc = "Minor risk of failure. Manage energy levels carefully."
  }

  // Long-Term Impact & Estimations
  // Estimate what the stats will look like at turn 72 if the player trains average stats
  const estimatedFinalStats = { ...currentStats }
  let totalMissing = 0
  let totalTarget = 0
  
  const keys = ["speed", "stamina", "power", "guts", "wisdom"] as Array<keyof Stats>
  for (const key of keys) {
    const diff = Math.max(0, targetStats[key] - currentStats[key])
    totalMissing += diff
    totalTarget += targetStats[key]

    // Estimate based on remaining turns and average gain per turn (approx 12 points per turn average in scenarios)
    // We assume 50% of remaining turns are training that stats, and 15% are rests.
    const averageGainPerTurn = 13 * (1 + (input.growthBonus?.[key] || 0) * 0.5)
    const activeTurnsForThisStat = remainingTurns * 0.22 // 22% of turns spent on this stat
    estimatedFinalStats[key] = Math.min(
      Math.max(currentStats[key], targetStats[key] + 100), 
      Math.round(currentStats[key] + activeTurnsForThisStat * averageGainPerTurn)
    )
  }

  // Evaluate on-track status
  const currentPercentage = Math.round(
    (Object.values(currentStats).reduce((a, b) => a + b, 0) /
     Object.values(targetStats).reduce((a, b) => a + b, 0)) * 100
  )
  const expectedPercentage = Math.round((input.turn / 72) * 100)
  
  let status: "On Track" | "Ahead" | "Behind" = "On Track"
  let statusDesc = "You are pacing well to reach all target stats."

  if (currentPercentage < expectedPercentage - 12) {
    status = "Behind"
    statusDesc = "Pacing behind target stats. Prioritize high-gain training sessions and avoid injuries."
  } else if (currentPercentage > expectedPercentage + 12) {
    status = "Ahead"
    statusDesc = "You are ahead of schedule! Consider prioritizing skill hints or rare events."
  }

  return {
    bestAction,
    actions: sortedActions,
    riskAnalysis: {
      level: riskLevel,
      score: highestRisk,
      description: riskDesc
    },
    longTermImpact: {
      status,
      description: statusDesc,
      estimatedFinalStats
    }
  }
}
