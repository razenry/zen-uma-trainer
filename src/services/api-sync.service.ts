import { prisma } from '@/lib/db'
import { SkillService } from './skill.service'
import { CharacterService } from './character.service'
import { SupportCardService } from './support.service'
import { RaceService } from './race.service'

export class APISyncService {
  static async runFullSync() {
    console.log('Starting full Zen Uma API Sync...')
    const results = {
      skills: { success: false, count: 0, error: null as string | null },
      characters: { success: false, count: 0, error: null as string | null },
      supports: { success: false, count: 0, error: null as string | null },
      races: { success: false, count: 0, error: null as string | null },
      users: { success: false, count: 0 },
      builds: { success: false, count: 0 },
      sessions: { success: false, count: 0 },
    }

    try {
      // 1. Sync Skills first (since characters and supports reference skills)
      const skillRes = await SkillService.syncFromAPI()
      results.skills.success = skillRes.success
      results.skills.count = skillRes.count || 0
      results.skills.error = skillRes.error || null

      // 2. Sync Characters
      const charRes = await CharacterService.syncFromAPI()
      results.characters.success = charRes.success
      results.characters.count = charRes.count || 0
      results.characters.error = charRes.error || null

      // 3. Sync Support Cards
      const supportRes = await SupportCardService.syncFromAPI()
      results.supports.success = supportRes.success
      results.supports.count = supportRes.count || 0
      results.supports.error = supportRes.error || null

      // 4. Sync Races
      const raceRes = await RaceService.syncFromAPI()
      results.races.success = raceRes.success
      results.races.count = raceRes.count || 0
      results.races.error = raceRes.error || null

      // 5. Seed Default Users for authentication if empty
      const userCount = await prisma.user.count()
      if (userCount === 0) {
        // Seed default Admin
        const admin = await prisma.user.create({
          data: {
            name: "Admin Zen",
            email: "admin@zenuma.com",
            password: "adminpassword", // Plain text/simple hash for mock login
            role: "ADMIN",
            avatar: "/avatars/admin.png"
          }
        })

        // Seed default User
        const user = await prisma.user.create({
          data: {
            name: "Kafka Uma Trainer",
            email: "user@zenuma.com",
            password: "userpassword",
            role: "USER",
            avatar: "/avatars/user.png"
          }
        })

        results.users.success = true
        results.users.count = 2

        // Seed Sample Builds (Meta builds library)
        const build1 = await prisma.savedBuild.create({
          data: {
            userId: user.id,
            characterId: "char_special_week",
            title: "Arima Kinen Destroyer Build",
            distance: "Long",
            style: "Leader",
            targetSpeed: 1200,
            targetStam: 850,
            targetPower: 1000,
            targetGuts: 400,
            targetWisdom: 800,
            skills: JSON.stringify(["skill_corner_maestro", "skill_emperors_pride", "skill_straight_recovery"]),
            likes: 42,
            isPublic: true
          }
        })

        const build2 = await prisma.savedBuild.create({
          data: {
            userId: user.id,
            characterId: "char_silence_suzuka",
            title: "Speed Demon Mile Build",
            distance: "Mile",
            style: "Runner",
            targetSpeed: 1500,
            targetStam: 600,
            targetPower: 1100,
            targetGuts: 500,
            targetWisdom: 900,
            skills: JSON.stringify(["skill_speed_ster", "skill_arcana_mastery"]),
            likes: 128,
            isPublic: true
          }
        })

        results.builds.success = true
        results.builds.count = 2

        // Seed Training Sessions (Dashboard History)
        await prisma.trainingSession.create({
          data: {
            userId: user.id,
            characterId: "char_special_week",
            scenario: "URA Scenario",
            currentTurn: 72,
            motivation: "Perfect",
            energy: 80,
            speed: 1150,
            stamina: 820,
            power: 950,
            guts: 380,
            wisdom: 790,
            status: "COMPLETED"
          }
        })

        await prisma.trainingSession.create({
          data: {
            userId: user.id,
            characterId: "char_tokai_teio",
            scenario: "L'Arc Scenario",
            currentTurn: 72,
            motivation: "Good",
            energy: 60,
            speed: 1200,
            stamina: 700,
            power: 1000,
            guts: 450,
            wisdom: 850,
            status: "COMPLETED"
          }
        })

        await prisma.trainingSession.create({
          data: {
            userId: user.id,
            characterId: "char_gold_ship",
            scenario: "URA Scenario",
            currentTurn: 35,
            motivation: "Bad",
            energy: 45,
            speed: 550,
            stamina: 500,
            power: 480,
            guts: 310,
            wisdom: 290,
            status: "IN_PROGRESS"
          }
        })

        results.sessions.success = true
        results.sessions.count = 3
      } else {
        results.users.success = true
        results.builds.success = true
        results.sessions.success = true
      }

      console.log('Zen Uma API Sync completed successfully.', results)
      return { success: true, results }
    } catch (e: any) {
      console.error('API Sync crashed:', e)
      return { success: false, error: e.message, results }
    }
  }
}
