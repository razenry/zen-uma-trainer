import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const guides = await prisma.communityGuide.findMany({
      include: {
        user: {
          select: { name: true, avatar: true }
        }
      }
    })
    return NextResponse.json(guides)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 555 })
  }
}
