import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ENTITY_METADATA } from '@/lib/cms-metadata'

export const dynamic = 'force-dynamic'

function cleanFields(entityKey: string, body: any) {
  const metadata = ENTITY_METADATA[entityKey]
  if (!metadata) return {}
  const cleaned: any = {}
  
  for (const field of metadata.fields) {
    const value = body[field.key]
    if (value === undefined) continue

    if (field.type === 'number') {
      cleaned[field.key] = value === '' || value === null ? 0 : Number(value)
    } else if (field.type === 'boolean') {
      cleaned[field.key] = Boolean(value)
    } else if (field.type === 'textarea' && (field.key === 'effects' || field.key === 'events' || field.key === 'skills')) {
      if (typeof value === 'object') {
        cleaned[field.key] = JSON.stringify(value)
      } else {
        cleaned[field.key] = value
      }
    } else {
      cleaned[field.key] = value
    }
  }
  return cleaned
}

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

// GET: List drafts
export async function GET(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params
    const metadata = ENTITY_METADATA[entity]
    if (!metadata || !metadata.draftModelName) {
      return NextResponse.json({ error: `Entity '${entity}' does not support drafts.` }, { status: 400 })
    }

    const draftClient = (prisma as any)[metadata.draftModelName]
    const drafts = await draftClient.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { contributor: { select: { id: true, name: true, email: true } } }
    })

    return NextResponse.json(drafts)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a draft
export async function POST(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params
    const metadata = ENTITY_METADATA[entity]
    if (!metadata || !metadata.draftModelName) {
      return NextResponse.json({ error: `Entity '${entity}' does not support drafts.` }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    let userId = (session.user as any).id

    if (!userId && session.user?.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }

    if (!userId) {
      const firstUser = await prisma.user.findFirst()
      if (firstUser) userId = firstUser.id
    }

    const cleaned = cleanFields(entity, body)
    
    // Set draft fields
    const draftData: any = {
      ...cleaned,
      contributorId: userId,
      status: 'DRAFT',
      liveId: body.liveId || null
    }

    // Since draft IDs are standard auto-generated strings in Prisma (uuid), we remove manual ID if it's new
    if (draftData.id && !body.liveId) {
      delete draftData.id
    }

    const draftClient = (prisma as any)[metadata.draftModelName]
    const newDraft = await draftClient.create({ data: draftData })

    // Log Audit
    await prisma.auditLog.create({
      data: {
        userId: userId || 'system',
        action: 'CREATE_DRAFT',
        entity: metadata.draftModelName,
        entityId: newDraft.id,
        before: null,
        after: JSON.stringify(newDraft),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, draft: newDraft })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update draft status or promote to production
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params
    const metadata = ENTITY_METADATA[entity]
    if (!metadata || !metadata.draftModelName) {
      return NextResponse.json({ error: `Entity '${entity}' does not support drafts.` }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { id, status, reviewNotes } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing draft ID.' }, { status: 400 })
    }

    const draftClient = (prisma as any)[metadata.draftModelName]
    const currentDraft = await draftClient.findUnique({ where: { id } })
    if (!currentDraft) {
      return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })
    }

    let userId = (session.user as any).id
    if (!userId && session.user?.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }

    const updateData: any = { status }
    if (reviewNotes !== undefined) {
      updateData.reviewNotes = reviewNotes
    }

    let resultRecord = null

    // Promotion to live production (PUBLISHED / APPROVED)
    if (status === 'PUBLISHED' || status === 'APPROVED') {
      const liveClient = (prisma as any)[metadata.modelName]
      const liveData = cleanFields(entity, currentDraft)

      // Determine the target live ID
      let targetLiveId = currentDraft.liveId || currentDraft.id

      // If the current draft ID is a UUID but this entity requires user-defined slug, check if the draft has ID field or slug
      if (liveData.id && liveData.id !== id) {
        targetLiveId = liveData.id
      } else if (!targetLiveId || targetLiveId.length > 30) {
        // If it's a UUID and the table expects custom short IDs (like Character/Skill), slugify name or make code
        const nameSlug = (currentDraft.name || 'new').toLowerCase().replace(/[^a-z0-9]+/g, '_')
        targetLiveId = `${entity.slice(0, -1)}_${nameSlug}`
      }

      liveData.id = targetLiveId
      liveData.status = 'ACTIVE'

      // Check if it exists in live table
      const existing = await liveClient.findUnique({ where: { id: targetLiveId } })
      let liveRecord
      if (existing) {
        liveRecord = await liveClient.update({
          where: { id: targetLiveId },
          data: liveData
        })
      } else {
        liveRecord = await liveClient.create({ data: liveData })
      }

      // Update draft status and associate liveId
      updateData.liveId = targetLiveId
      updateData.status = 'PUBLISHED'

      resultRecord = liveRecord

      // Create Version History for the live record
      await createVersion(metadata, targetLiveId, liveRecord, `Promoted from draft: ${currentDraft.name}`)

      // Log Audit Log for publishing
      await prisma.auditLog.create({
        data: {
          userId: userId || 'system',
          action: 'PUBLISH',
          entity: metadata.auditName,
          entityId: targetLiveId,
          before: JSON.stringify(currentDraft),
          after: JSON.stringify(liveRecord),
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
        }
      })
    }

    const updatedDraft = await draftClient.update({
      where: { id },
      data: updateData
    })

    // Log Audit Log for draft update
    await prisma.auditLog.create({
      data: {
        userId: userId || 'system',
        action: 'UPDATE_DRAFT',
        entity: metadata.draftModelName,
        entityId: id,
        before: JSON.stringify(currentDraft),
        after: JSON.stringify(updatedDraft),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, draft: updatedDraft, liveRecord: resultRecord })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
