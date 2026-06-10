import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role === 'USER') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    const characters = await prisma.characterDraft.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: { contributor: true }
    })

    const supportCards = await prisma.supportCardDraft.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: { contributor: true }
    })

    const skills = await prisma.skillDraft.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: { contributor: true }
    })

    const races = await prisma.raceDraft.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: { contributor: true }
    })

    return NextResponse.json({
      characters,
      supportCards,
      skills,
      races
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
