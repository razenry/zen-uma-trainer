import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const builds = await prisma.savedBuild.findMany({
      include: {
        character: true,
      },
    })
    return NextResponse.json(builds)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch builds', message: error.message },
      { status: 500 }
    )
  }
}
