import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const characters = await prisma.character.findMany({
      include: {
        uniqueSkill: true,
        skills: true,
      },
    })
    return NextResponse.json(characters)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch characters', message: error.message },
      { status: 500 }
    )
  }
}
