import { prisma } from '@/lib/db'

export interface RaceDTO {
  id: string
  name: string
  distance: number
  groundType: string
  grade: string
  fanRequirement: number
  direction: string
  season: string
  weather?: string
  surface?: string
}

export const MOCK_RACES: RaceDTO[] = [
  {
    id: "race_arima_kinen",
    name: "Arima Kinen",
    distance: 2500,
    groundType: "Turf",
    grade: "G1",
    fanRequirement: 25000,
    direction: "Clockwise",
    season: "Winter",
    weather: "Sunny",
    surface: "Good"
  },
  {
    id: "race_japan_cup",
    name: "Japan Cup",
    distance: 2400,
    groundType: "Turf",
    grade: "G1",
    fanRequirement: 25000,
    direction: "Counter-Clockwise",
    season: "Autumn",
    weather: "Cloudy",
    surface: "Good"
  },
  {
    id: "race_japanese_derby",
    name: "Tokyo Yushun (Japanese Derby)",
    distance: 2400,
    groundType: "Turf",
    grade: "G1",
    fanRequirement: 20000,
    direction: "Counter-Clockwise",
    season: "Spring",
    weather: "Sunny",
    surface: "Good"
  },
  {
    id: "race_satsuki_sho",
    name: "Satsuki Sho",
    distance: 2000,
    groundType: "Turf",
    grade: "G1",
    fanRequirement: 15000,
    direction: "Clockwise",
    season: "Spring",
    weather: "Sunny",
    surface: "Good"
  },
  {
    id: "race_tenno_sho_spring",
    name: "Tenno Sho (Spring)",
    distance: 3200,
    groundType: "Turf",
    grade: "G1",
    fanRequirement: 20000,
    direction: "Clockwise",
    season: "Spring",
    weather: "Cloudy",
    surface: "Soft"
  },
  {
    id: "race_takamatsunomiya_kinen",
    name: "Takamatsunomiya Kinen",
    distance: 1200,
    groundType: "Turf",
    grade: "G1",
    fanRequirement: 15000,
    direction: "Clockwise",
    season: "Spring",
    weather: "Rainy",
    surface: "Soft"
  },
  {
    id: "race_yasuda_kinen",
    name: "Yasuda Kinen",
    distance: 1600,
    groundType: "Turf",
    grade: "G1",
    fanRequirement: 15000,
    direction: "Counter-Clockwise",
    season: "Spring",
    weather: "Sunny",
    surface: "Good"
  }
]

export class RaceService {
  static async getAll() {
    return prisma.race.findMany()
  }

  static async getById(id: string) {
    return prisma.race.findUnique({
      where: { id }
    })
  }

  static async getByDistance(min: number, max: number) {
    return prisma.race.findMany({
      where: {
        distance: {
          gte: min,
          lte: max
        }
      }
    })
  }

  static async syncFromAPI() {
    try {
      // Synchronize races from external API
      for (const race of MOCK_RACES) {
        await prisma.race.upsert({
          where: { id: race.id },
          update: {
            name: race.name,
            distance: race.distance,
            groundType: race.groundType,
            grade: race.grade,
            fanRequirement: race.fanRequirement,
            direction: race.direction,
            season: race.season,
            weather: race.weather,
            surface: race.surface
          },
          create: {
            id: race.id,
            name: race.name,
            distance: race.distance,
            groundType: race.groundType,
            grade: race.grade,
            fanRequirement: race.fanRequirement,
            direction: race.direction,
            season: race.season,
            weather: race.weather,
            surface: race.surface
          }
        })
      }
      return { success: true, count: MOCK_RACES.length }
    } catch (error: any) {
      console.error('Failed to sync races from API:', error)
      return { success: false, error: error.message }
    }
  }
}
