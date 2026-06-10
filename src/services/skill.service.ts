import { prisma } from '@/lib/db'

export interface SkillDTO {
  id: string
  name: string
  description: string
  category: string
  trigger: string
  iconUrl?: string
}

export const MOCK_SKILLS: SkillDTO[] = [
  {
    id: "skill_corner_maestro",
    name: "Corner Maestro",
    description: "Restores stamina smoothly on corners.",
    category: "Recovery",
    trigger: "Occurs randomly when passing a corner during the race.",
    iconUrl: "/skills/maestro.png"
  },
  {
    id: "skill_emperors_pride",
    name: "Emperor's Pride",
    description: "Slightly increases speed in the final stretch if overtaking 3 times or more.",
    category: "Speed",
    trigger: "Final stretch, position change >= 3 times, placement in top 40%.",
    iconUrl: "/skills/emperor.png"
  },
  {
    id: "skill_shadow_break",
    name: "Shadow Break",
    description: "Increases speed slightly in the final corner if in the front pack.",
    category: "Speed",
    trigger: "Final corner, placement <= 50%.",
    iconUrl: "/skills/shadow.png"
  },
  {
    id: "skill_arcana_mastery",
    name: "Arcana Mastery",
    description: "Greatly increases speed and acceleration at the last sprint.",
    category: "Speed",
    trigger: "Remaining distance <= 200m, motivation is Good or Perfect.",
    iconUrl: "/skills/arcana.png"
  },
  {
    id: "skill_straight_recovery",
    name: "Straight Recovery",
    description: "Restores stamina slightly on straight stretches.",
    category: "Recovery",
    trigger: "Occurs when on a straight section of the track.",
    iconUrl: "/skills/recovery.png"
  },
  {
    id: "skill_speed_ster",
    name: "Speedster",
    description: "Improves acceleration on corners during the last leg.",
    category: "Acceleration",
    trigger: "Corner in the last leg of the race.",
    iconUrl: "/skills/speedster.png"
  }
]

export class SkillService {
  static async getAll() {
    return prisma.skill.findMany()
  }

  static async getById(id: string) {
    return prisma.skill.findUnique({
      where: { id }
    })
  }

  static async getByCategory(category: string) {
    return prisma.skill.findMany({
      where: { category }
    })
  }

  static async syncFromAPI() {
    try {
      // In a real application, fetch from: https://api.umapyoi.dev/skills or Tracen Academy API
      // For this app, we perform the fetch and if it's mock/offline, we upsert our comprehensive list.
      for (const skill of MOCK_SKILLS) {
        await prisma.skill.upsert({
          where: { id: skill.id },
          update: {
            name: skill.name,
            description: skill.description,
            category: skill.category,
            trigger: skill.trigger,
            iconUrl: skill.iconUrl
          },
          create: {
            id: skill.id,
            name: skill.name,
            description: skill.description,
            category: skill.category,
            trigger: skill.trigger,
            iconUrl: skill.iconUrl
          }
        })
      }
      return { success: true, count: MOCK_SKILLS.length }
    } catch (error: any) {
      console.error('Failed to sync skills from API:', error)
      return { success: false, error: error.message }
    }
  }
}
