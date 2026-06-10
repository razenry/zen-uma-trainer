import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const counts = {
      users: await prisma.user.count(),
      characters: await prisma.character.count(),
      supportCards: await prisma.supportCard.count(),
      skills: await prisma.skill.count(),
      races: await prisma.race.count(),
      sessions: await prisma.trainingSession.count(),
      builds: await prisma.savedBuild.count(),
    }
    return NextResponse.json(counts)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to count DB stats', message: error.message },
      { status: 500 }
    )
  }
}
