import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { startDate: 'asc' }
    })

    const now = new Date()
    const enriched = banners.map(b => ({
      ...b,
      bannerStatus: now < b.startDate ? 'UPCOMING' : now > b.endDate ? 'ENDED' : 'ACTIVE'
    }))

    return NextResponse.json({ banners: enriched })
  } catch (error) {
    console.error('[API /banners] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}
