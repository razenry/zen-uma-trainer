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

// POST: Batch status operations
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
    const { ids, action } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Missing ids list or it is empty.' }, { status: 400 })
    }

    if (!['archive', 'restore', 'publish'].includes(action)) {
      return NextResponse.json({ error: `Action '${action}' is not supported.` }, { status: 400 })
    }

    // Find User ID for logging
    let userId = (session.user as any).id
    if (!userId && session.user?.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }

    const client = (prisma as any)[metadata.modelName]

    if (action === 'archive') {
      // Soft Delete: status = ARCHIVED
      await client.updateMany({
        where: { id: { in: ids } },
        data: { status: 'ARCHIVED' }
      })

      // Add audit logs and version histories for each
      for (const id of ids) {
        const item = await client.findUnique({ where: { id } })
        if (item) {
          await prisma.auditLog.create({
            data: {
              userId: userId || 'system',
              action: 'BULK_ARCHIVE',
              entity: metadata.auditName,
              entityId: id,
              before: null,
              after: JSON.stringify(item),
              ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
            }
          })
          await createVersion(metadata, id, item, 'Bulk archived')
        }
      }
    } else if (action === 'restore') {
      // Restore: status = ACTIVE
      await client.updateMany({
        where: { id: { in: ids } },
        data: { status: 'ACTIVE' }
      })

      for (const id of ids) {
        const item = await client.findUnique({ where: { id } })
        if (item) {
          await prisma.auditLog.create({
            data: {
              userId: userId || 'system',
              action: 'BULK_RESTORE',
              entity: metadata.auditName,
              entityId: id,
              before: null,
              after: JSON.stringify(item),
              ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
            }
          })
          await createVersion(metadata, id, item, 'Bulk restored')
        }
      }
    } else if (action === 'publish') {
      // If promoting drafts
      if (!metadata.draftModelName) {
        return NextResponse.json({ error: `Entity '${entity}' does not support draft publication.` }, { status: 400 })
      }
      
      const draftClient = (prisma as any)[metadata.draftModelName]

      for (const id of ids) {
        const draft = await draftClient.findUnique({ where: { id } })
        if (draft && draft.status !== 'PUBLISHED') {
          // Promote draft to active record
          let targetLiveId = draft.liveId || draft.id
          if (!targetLiveId || targetLiveId.length > 30) {
            const nameSlug = (draft.name || 'new').toLowerCase().replace(/[^a-z0-9]+/g, '_')
            targetLiveId = `${entity.slice(0, -1)}_${nameSlug}`
          }

          // Fetch only clean fields
          const cleanData = {} as any
          for (const field of metadata.fields) {
            if (draft[field.key] !== undefined) {
              if (field.type === 'number') {
                cleanData[field.key] = Number(draft[field.key])
              } else if (field.type === 'boolean') {
                cleanData[field.key] = Boolean(draft[field.key])
              } else {
                cleanData[field.key] = draft[field.key]
              }
            }
          }
          cleanData.id = targetLiveId
          cleanData.status = 'ACTIVE'

          // Upsert in live
          const existing = await client.findUnique({ where: { id: targetLiveId } })
          let liveRecord
          if (existing) {
            liveRecord = await client.update({ where: { id: targetLiveId }, data: cleanData })
          } else {
            liveRecord = await client.create({ data: cleanData })
          }

          // Update draft
          await draftClient.update({
            where: { id },
            data: { status: 'PUBLISHED', liveId: targetLiveId }
          })

          // Audit
          await prisma.auditLog.create({
            data: {
              userId: userId || 'system',
              action: 'BULK_PUBLISH',
              entity: metadata.auditName,
              entityId: targetLiveId,
              before: JSON.stringify(draft),
              after: JSON.stringify(liveRecord),
              ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
            }
          })

          // Version
          await createVersion(metadata, targetLiveId, liveRecord, `Promoted in bulk publish`)
        }
      }
    }

    return NextResponse.json({ success: true, message: `Bulk action '${action}' completed successfully.` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
