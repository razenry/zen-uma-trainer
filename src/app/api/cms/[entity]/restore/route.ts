import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ENTITY_METADATA } from '@/lib/cms-metadata'

export const dynamic = 'force-dynamic'

async function createVersion(metadata: any, recordId: string, recordData: any, comment: string) {
  try {
    const lastVersion = await prisma.versionHistory.findFirst({
      where: { entityType: metadata.auditName, entityId: recordId },
      orderBy: { version: 'desc' }
    })
    const nextVersion = lastVersion ? lastVersion.version + 1 : 1

    const versionData: any = {
      entityType: metadata.auditName,
      entityId: recordId,
      version: nextVersion,
      snapshot: JSON.stringify(recordData),
      comment
    }

    if (metadata.modelName === 'character') versionData.charId = recordId
    else if (metadata.modelName === 'supportCard') versionData.cardId = recordId
    else if (metadata.modelName === 'skill') versionData.skillId = recordId
    else if (metadata.modelName === 'race') versionData.raceId = recordId
    else if (metadata.modelName === 'scenario') versionData.scenarioId = recordId
    else if (metadata.modelName === 'tag') versionData.tagId = recordId
    else if (metadata.modelName === 'category') versionData.categoryId = recordId

    await prisma.versionHistory.create({ data: versionData })
  } catch (err) {
    console.error('Failed to create version history snapshot:', err)
  }
}

// POST: Restore an archived record
export async function POST(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params
    const metadata = ENTITY_METADATA[entity]
    if (!metadata) {
      return NextResponse.json({ error: `Entity '${entity}' is invalid.` }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { id } = body
    if (!id) {
      return NextResponse.json({ error: 'Missing record ID.' }, { status: 400 })
    }

    const client = (prisma as any)[metadata.modelName]
    const beforeRecord = await client.findUnique({ where: { id } })
    if (!beforeRecord) {
      return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
    }

    // Set status to ACTIVE
    const restored = await client.update({
      where: { id },
      data: { status: 'ACTIVE' }
    })

    // Find User ID for logging
    let userId = (session.user as any).id
    if (!userId && session.user?.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: userId || 'system',
        action: 'RESTORE',
        entity: metadata.auditName,
        entityId: id,
        before: JSON.stringify(beforeRecord),
        after: JSON.stringify(restored),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    // Create Version Snapshot
    await createVersion(metadata, id, restored, 'Record restored from archive')

    return NextResponse.json({ success: true, data: restored })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
