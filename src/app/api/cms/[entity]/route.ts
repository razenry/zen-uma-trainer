import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ENTITY_METADATA } from '@/lib/cms-metadata'

export const dynamic = 'force-dynamic'

// Helper to filter valid schema fields and parse types
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
      // Ensure JSON validity if it's a JSON field
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

// Helper to create Version Snapshot
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

// GET: List Production Records
export async function GET(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params
    const metadata = ENTITY_METADATA[entity]
    if (!metadata) {
      return NextResponse.json({ error: `Entity type '${entity}' is invalid.` }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'ACTIVE'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'id'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const client = (prisma as any)[metadata.modelName]
    if (!client) {
      return NextResponse.json({ error: `Prisma client delegate '${metadata.modelName}' not found.` }, { status: 550 })
    }

    // Filters
    const where: any = {}
    if (status !== 'all') {
      where.status = status
    }

    if (search && metadata.searchFields.length > 0) {
      where.OR = metadata.searchFields.map((field) => ({
        [field]: { contains: search }
      }))
    }

    // Query
    const total = await client.count({ where })
    const records = await client.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({
      data: records,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create Production Record Directly
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
    const cleaned = cleanFields(entity, body)
    
    // Auto-generate UUID if id is missing and not specified in client
    if (!cleaned.id) {
      if (metadata.fields.find(f => f.key === 'id')?.readonly) {
        cleaned.id = undefined // Let database generate
      } else {
        cleaned.id = `${entity.slice(0, -1)}_${Date.now()}`
      }
    }

    const client = (prisma as any)[metadata.modelName]
    const created = await client.create({ data: cleaned })

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
        action: 'CREATE',
        entity: metadata.auditName,
        entityId: created.id,
        before: null,
        after: JSON.stringify(created),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    // Create Version Snapshot
    await createVersion(metadata, created.id, created, 'Initial production publishing')

    return NextResponse.json({ success: true, data: created })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update Production Record
export async function PUT(
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
      return NextResponse.json({ error: 'Missing record ID for update.' }, { status: 400 })
    }

    const client = (prisma as any)[metadata.modelName]
    const beforeRecord = await client.findUnique({ where: { id } })
    if (!beforeRecord) {
      return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
    }

    const cleaned = cleanFields(entity, body)
    // Make sure we don't try to change the primary key
    delete cleaned.id

    const updated = await client.update({
      where: { id },
      data: cleaned
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
        action: 'UPDATE',
        entity: metadata.auditName,
        entityId: id,
        before: JSON.stringify(beforeRecord),
        after: JSON.stringify(updated),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    // Create Version Snapshot
    await createVersion(metadata, id, updated, body.versionComment || 'Production record updated')

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Soft Delete Record (Set status = ARCHIVED)
export async function DELETE(
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing record ID for deletion.' }, { status: 400 })
    }

    const client = (prisma as any)[metadata.modelName]
    const beforeRecord = await client.findUnique({ where: { id } })
    if (!beforeRecord) {
      return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
    }

    // Soft delete: status = ARCHIVED
    const updated = await client.update({
      where: { id },
      data: { status: 'ARCHIVED' }
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
        action: 'DELETE',
        entity: metadata.auditName,
        entityId: id,
        before: JSON.stringify(beforeRecord),
        after: JSON.stringify(updated),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    // Create Version Snapshot
    await createVersion(metadata, id, updated, 'Record archived (soft deleted)')

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
