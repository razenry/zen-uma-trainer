import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const races = await prisma.race.findMany()
    return NextResponse.json(races)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch races', message: error.message },
      { status: 500 }
    )
  }
}
