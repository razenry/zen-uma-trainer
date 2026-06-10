import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const skills = await prisma.skill.findMany()
    return NextResponse.json(skills)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch skills', message: error.message },
      { status: 500 }
    )
  }
}
