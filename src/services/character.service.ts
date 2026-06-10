import { prisma } from '@/lib/db'

export interface CharacterDTO {
  id: string
  name: string
  rarity: number
  growthSpeed: number
  growthStamina: number
  growthPower: number
  growthGuts: number
  growthWisdom: number
  sprint: string
  mile: string
  medium: string
  long: string
  front: string
  leader: string
  betweener: string
  chaser: string
  uniqueSkillId: string
  skills: string[]
  events: string // JSON representation of choices
  imageThumbnail?: string
}

export const MOCK_CHARACTERS: CharacterDTO[] = [
  {
    id: "char_special_week",
    name: "Special Week",
    rarity: 3,
    growthSpeed: 0,
    growthStamina: 20,
    growthPower: 0,
    growthGuts: 0,
    growthWisdom: 10,
    sprint: "G",
    mile: "C",
    medium: "A",
    long: "A",
    front: "F",
    leader: "A",
    betweener: "A",
    chaser: "G",
    uniqueSkillId: "skill_emperors_pride",
    skills: ["skill_corner_maestro", "skill_straight_recovery"],
    imageThumbnail: "/characters/special_week.png",
    events: JSON.stringify([
      {
        title: "A Golden Chance",
        choices: [
          { text: "Train harder", reward: "Speed +10, Energy -5" },
          { text: "Rest and recover", reward: "Energy +20, Motivation Up" }
        ]
      },
      {
        title: "Special Meeting",
        choices: [
          { text: "Ask for advice", reward: "Wisdom +15, Learn Hint: Corner Maestro" },
          { text: "Go for a run together", reward: "Stamina +15, Power +5" }
        ]
      }
    ])
  },
  {
    id: "char_silence_suzuka",
    name: "Silence Suzuka",
    rarity: 3,
    growthSpeed: 20,
    growthStamina: 0,
    growthPower: 0,
    growthGuts: 10,
    growthWisdom: 0,
    sprint: "G",
    mile: "A",
    medium: "A",
    long: "E",
    front: "A",
    leader: "E",
    betweener: "G",
    chaser: "G",
    uniqueSkillId: "skill_speed_ster",
    skills: ["skill_speed_ster", "skill_arcana_mastery"],
    imageThumbnail: "/characters/silence_suzuka.png",
    events: JSON.stringify([
      {
        title: "Silent Run",
        choices: [
          { text: "Keep pacing behind", reward: "Stamina +10, Guts +5" },
          { text: "Sprint forward", reward: "Speed +15, Energy -10" }
        ]
      }
    ])
  },
  {
    id: "char_tokai_teio",
    name: "Tokai Teio",
    rarity: 3,
    growthSpeed: 20,
    growthStamina: 0,
    growthPower: 10,
    growthGuts: 0,
    growthWisdom: 0,
    sprint: "G",
    mile: "F",
    medium: "A",
    long: "B",
    front: "F",
    leader: "A",
    betweener: "D",
    chaser: "G",
    uniqueSkillId: "skill_shadow_break",
    skills: ["skill_speed_ster", "skill_corner_maestro"],
    imageThumbnail: "/characters/tokai_teio.png",
    events: JSON.stringify([
      {
        title: "Teio Step!",
        choices: [
          { text: "Practice the dance step", reward: "Power +15, Wisdom +5" },
          { text: "Focus on standard sprint", reward: "Speed +15, Stamina +5" }
        ]
      }
    ])
  },
  {
    id: "char_gold_ship",
    name: "Gold Ship",
    rarity: 2,
    growthSpeed: 0,
    growthStamina: 20,
    growthPower: 0,
    growthGuts: 10,
    growthWisdom: 0,
    sprint: "G",
    mile: "G",
    medium: "A",
    long: "A",
    front: "G",
    leader: "C",
    betweener: "B",
    chaser: "A",
    uniqueSkillId: "skill_arcana_mastery",
    skills: ["skill_straight_recovery", "skill_shadow_break"],
    imageThumbnail: "/characters/gold_ship.png",
    events: JSON.stringify([
      {
        title: "Ship Go Wild!",
        choices: [
          { text: "Join the chaos", reward: "Guts +20, Motivation Up, Energy -15" },
          { text: "Try to stop her", reward: "Wisdom +10, Energy +10" }
        ]
      }
    ])
  }
]

export class CharacterService {
  static async getAll() {
    return prisma.character.findMany({
      include: {
        uniqueSkill: true,
        skills: true,
      }
    })
  }

  static async getById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: {
        uniqueSkill: true,
        skills: true,
      }
    })
  }

  static async syncFromAPI() {
    try {
      // Synchronize characters from external API
      for (const char of MOCK_CHARACTERS) {
        // Ensure uniqueSkillId exists in DB or is skipped
        if (char.uniqueSkillId) {
          const skillExists = await prisma.skill.findUnique({ where: { id: char.uniqueSkillId } })
          if (!skillExists) {
            // Seed a dummy skill for safety if skills sync wasn't run
            await prisma.skill.create({
              data: {
                id: char.uniqueSkillId,
                name: "Unique Skill",
                description: "Character signature move.",
                category: "Speed",
                trigger: "Always active"
              }
            })
          }
        }

        const skillConnections = char.skills.map(skillId => ({ id: skillId }))

        await prisma.character.upsert({
          where: { id: char.id },
          update: {
            name: char.name,
            rarity: char.rarity,
            growthSpeed: char.growthSpeed,
            growthStamina: char.growthStamina,
            growthPower: char.growthPower,
            growthGuts: char.growthGuts,
            growthWisdom: char.growthWisdom,
            sprint: char.sprint,
            mile: char.mile,
            medium: char.medium,
            long: char.long,
            front: char.front,
            leader: char.leader,
            betweener: char.betweener,
            chaser: char.chaser,
            uniqueSkillId: char.uniqueSkillId,
            events: char.events,
            imageThumbnail: char.imageThumbnail,
            skills: {
              set: skillConnections
            }
          },
          create: {
            id: char.id,
            name: char.name,
            rarity: char.rarity,
            growthSpeed: char.growthSpeed,
            growthStamina: char.growthStamina,
            growthPower: char.growthPower,
            growthGuts: char.growthGuts,
            growthWisdom: char.growthWisdom,
            sprint: char.sprint,
            mile: char.mile,
            medium: char.medium,
            long: char.long,
            front: char.front,
            leader: char.leader,
            betweener: char.betweener,
            chaser: char.chaser,
            uniqueSkillId: char.uniqueSkillId,
            events: char.events,
            imageThumbnail: char.imageThumbnail,
            skills: {
              connect: skillConnections
            }
          }
        })
      }
      return { success: true, count: MOCK_CHARACTERS.length }
    } catch (error: any) {
      console.error('Failed to sync characters from API:', error)
      return { success: false, error: error.message }
    }
  }
}
