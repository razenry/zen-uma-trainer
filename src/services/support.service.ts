import { prisma } from '@/lib/db'

export interface SupportCardDTO {
  id: string
  name: string
  rarity: string
  type: string
  effects: string // JSON representation
  events: string // JSON representation
  skills: string[]
  imageThumbnail?: string
}

export const MOCK_SUPPORT_CARDS: SupportCardDTO[] = [
  {
    id: "card_kitasan_black",
    name: "Kitasan Black (SSR)",
    rarity: "SSR",
    type: "Speed",
    imageThumbnail: "/supports/kitasan.png",
    effects: JSON.stringify({
      friendshipBonus: "30%",
      trainingEffect: "15%",
      raceBonus: "10%",
      speedBonus: "+1",
      initialBond: "35"
    }),
    events: JSON.stringify([
      {
        title: "A Road to the Peak",
        choices: [
          { text: "Train for sprint", reward: "Speed +20" },
          { text: "Train for endurance", reward: "Stamina +15, Power +5" }
        ]
      }
    ]),
    skills: ["skill_speed_ster"]
  },
  {
    id: "card_fine_motion",
    name: "Fine Motion (SSR)",
    rarity: "SSR",
    type: "Wisdom",
    imageThumbnail: "/supports/fine_motion.png",
    effects: JSON.stringify({
      friendshipBonus: "25%",
      trainingEffect: "10%",
      wisdomBonus: "+1",
      initialBond: "30",
      hintLevel: "Lv 2"
    }),
    events: JSON.stringify([
      {
        title: "Tea Party With Elegance",
        choices: [
          { text: "Eat the cake politely", reward: "Wisdom +15, Energy +15" },
          { text: "Ask about her training regime", reward: "Learn Hint: Corner Maestro" }
        ]
      }
    ]),
    skills: ["skill_corner_maestro"]
  },
  {
    id: "card_super_creek",
    name: "Super Creek (SSR)",
    rarity: "SSR",
    type: "Stamina",
    imageThumbnail: "/supports/super_creek.png",
    effects: JSON.stringify({
      friendshipBonus: "35%",
      trainingEffect: "10%",
      staminaBonus: "+1",
      initialBond: "20"
    }),
    events: JSON.stringify([
      {
        title: "Nurturing Heart",
        choices: [
          { text: "Let her pamper you", reward: "Stamina +20, Energy +10" },
          { text: "Insist on running alone", reward: "Power +15, Motivation Up" }
        ]
      }
    ]),
    skills: ["skill_corner_maestro", "skill_straight_recovery"]
  },
  {
    id: "card_el_condor_pasa",
    name: "El Condor Pasa (SSR)",
    rarity: "SSR",
    type: "Power",
    imageThumbnail: "/supports/el_condor_pasa.png",
    effects: JSON.stringify({
      friendshipBonus: "25%",
      trainingEffect: "15%",
      powerBonus: "+1",
      initialBond: "25"
    }),
    events: JSON.stringify([
      {
        title: "Masked Passion",
        choices: [
          { text: "Train in the ring", reward: "Power +20" },
          { text: "Study Spanish tactics", reward: "Wisdom +15, Learn Hint: Shadow Break" }
        ]
      }
    ]),
    skills: ["skill_shadow_break"]
  }
]

export class SupportCardService {
  static async getAll() {
    return prisma.supportCard.findMany({
      include: {
        skills: true
      }
    })
  }

  static async getById(id: string) {
    return prisma.supportCard.findUnique({
      where: { id },
      include: {
        skills: true
      }
    })
  }

  static async getByType(type: string) {
    return prisma.supportCard.findMany({
      where: { type },
      include: {
        skills: true
      }
    })
  }

  static async syncFromAPI() {
    try {
      // Synchronize support cards from external API
      for (const card of MOCK_SUPPORT_CARDS) {
        const skillConnections = card.skills.map(skillId => ({ id: skillId }))

        await prisma.supportCard.upsert({
          where: { id: card.id },
          update: {
            name: card.name,
            rarity: card.rarity,
            type: card.type,
            effects: card.effects,
            events: card.events,
            imageThumbnail: card.imageThumbnail,
            skills: {
              set: skillConnections
            }
          },
          create: {
            id: card.id,
            name: card.name,
            rarity: card.rarity,
            type: card.type,
            effects: card.effects,
            events: card.events,
            imageThumbnail: card.imageThumbnail,
            skills: {
              connect: skillConnections
            }
          }
        })
      }
      return { success: true, count: MOCK_SUPPORT_CARDS.length }
    } catch (error: any) {
      console.error('Failed to sync support cards from API:', error)
      return { success: false, error: error.message }
    }
  }
}
