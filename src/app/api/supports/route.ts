import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supportCards = await prisma.supportCard.findMany({
      include: {
        skills: true,
      },
    })
    return NextResponse.json(supportCards)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch support cards', message: error.message },
      { status: 500 }
    )
  }
}
