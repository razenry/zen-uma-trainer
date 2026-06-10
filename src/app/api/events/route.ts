import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // UPCOMING, ACTIVE, ENDED, or null for all
    const type = searchParams.get('type') // CHAMPION_MEETING, etc.

    const where: Record<string, string> = { status: 'ACTIVE' }
    if (status) where.eventStatus = status
    if (type) where.eventType = type

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('[API /events] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
