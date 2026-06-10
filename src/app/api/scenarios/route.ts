import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const scenarios = await prisma.scenario.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ scenarios })
  } catch (error) {
    console.error('[API /scenarios] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 })
  }
}
