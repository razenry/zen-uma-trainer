import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ENTITY_METADATA } from '@/lib/cms-metadata'

export const dynamic = 'force-dynamic'

// GET: Fetch version history for a record
export async function GET(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params
    const metadata = ENTITY_METADATA[entity]
    if (!metadata) {
      return NextResponse.json({ error: `Entity '${entity}' is invalid.` }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing record ID.' }, { status: 400 })
    }

    const versions = await prisma.versionHistory.findMany({
      where: {
        entityType: metadata.auditName,
        entityId: id
      },
      orderBy: { version: 'desc' }
    })

    return NextResponse.json(versions)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 })
  }
}

// POST: Rollback to a specific version snapshot
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
    const { id, versionId } = body
    if (!id || !versionId) {
      return NextResponse.json({ error: 'Missing record ID or version ID.' }, { status: 400 })
    }

    // Find the version history record
    const versionRecord = await prisma.versionHistory.findUnique({
      where: { id: versionId }
    })

    if (!versionRecord) {
      return NextResponse.json({ error: 'Version record not found.' }, { status: 404 })
    }

    const snapshotData = JSON.parse(versionRecord.snapshot)

    // Remove primary key or keep it depending on type
    const liveClient = (prisma as any)[metadata.modelName]
    const beforeRecord = await liveClient.findUnique({ where: { id } })
    if (!beforeRecord) {
      return NextResponse.json({ error: 'Live record not found to rollback.' }, { status: 404 })
    }

    // Prepare update data (excluding relations or metadata that shouldn't be overridden)
    const updateData = { ...snapshotData }
    delete updateData.id
    delete updateData.createdAt
    delete updateData.updatedAt

    const restoredRecord = await liveClient.update({
      where: { id },
      data: updateData
    })

    // Get current user details
    let userId = (session.user as any).id
    if (!userId && session.user?.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }

    // Create a new version representing the rollback
    const lastVersion = await prisma.versionHistory.findFirst({
      where: { entityType: metadata.auditName, entityId: id },
      orderBy: { version: 'desc' }
    })
    const nextVersion = lastVersion ? lastVersion.version + 1 : 1

    const newVersionData: any = {
      entityType: metadata.auditName,
      entityId: id,
      version: nextVersion,
      snapshot: JSON.stringify(restoredRecord),
      comment: `Rolled back to version v${versionRecord.version}`
    }

    if (metadata.modelName === 'character') newVersionData.charId = id
    else if (metadata.modelName === 'supportCard') newVersionData.cardId = id
    else if (metadata.modelName === 'skill') newVersionData.skillId = id
    else if (metadata.modelName === 'race') newVersionData.raceId = id
    else if (metadata.modelName === 'scenario') newVersionData.scenarioId = id
    else if (metadata.modelName === 'tag') newVersionData.tagId = id
    else if (metadata.modelName === 'category') newVersionData.categoryId = id

    await prisma.versionHistory.create({ data: newVersionData })

    // Log Audit
    await prisma.auditLog.create({
      data: {
        userId: userId || 'system',
        action: 'ROLLBACK',
        entity: metadata.auditName,
        entityId: id,
        before: JSON.stringify(beforeRecord),
        after: JSON.stringify(restoredRecord),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, data: restoredRecord })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
