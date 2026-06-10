import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role === 'USER') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    const { rows, entityType } = await req.json()
    let userId = (session.user as any).id

    if (!userId && session.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      if (dbUser) {
        userId = dbUser.id
      }
    }

    if (!userId) {
      const firstUser = await prisma.user.findFirst()
      if (firstUser) {
        userId = firstUser.id
      }
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows to import.' }, { status: 400 })
    }

    let importedCount = 0

    // Sequential insertion into Draft Tables
    for (const row of rows) {
      if (entityType === 'Character') {
        await prisma.characterDraft.create({
          data: {
            contributorId: userId,
            status: 'PENDING_REVIEW', // directly submit validated CSV items to review
            name: row.name,
            japaneseName: row.japaneseName || '',
            alias: row.alias || '',
            cv: row.cv || '',
            rarity: parseInt(row.rarity) || 3,
            growthSpeed: parseInt(row.growthSpeed) || 0,
            growthStamina: parseInt(row.growthStamina) || 0,
            growthPower: parseInt(row.growthPower) || 0,
            growthGuts: parseInt(row.growthGuts) || 0,
            growthWisdom: parseInt(row.growthWisdom) || 0,
            sprint: row.sprint || 'G',
            mile: row.mile || 'G',
            medium: row.medium || 'G',
            long: row.long || 'G',
            front: row.front || 'G',
            leader: row.leader || 'G',
            betweener: row.betweener || 'G',
            chaser: row.chaser || 'G',
            imageThumbnail: row.imageThumbnail || '/characters/default-thumb.png',
            description: row.description || ''
          }
        })
        importedCount++
      } 
      
      else if (entityType === 'SupportCard') {
        await prisma.supportCardDraft.create({
          data: {
            contributorId: userId,
            status: 'PENDING_REVIEW',
            name: row.name,
            description: row.description || '',
            rarity: row.rarity || 'SSR',
            type: row.type || 'Speed',
            trainingBonus: parseInt(row.trainingBonus) || 0,
            friendshipBonus: parseInt(row.friendshipBonus) || 0,
            raceBonus: parseInt(row.raceBonus) || 0,
            fanBonus: parseInt(row.fanBonus) || 0,
            hintLevelBonus: parseInt(row.hintLevelBonus) || 0,
            initialBond: parseInt(row.initialBond) || 0,
            imageThumbnail: row.imageThumbnail || '/supports/default-thumb.png'
          }
        })
        importedCount++
      } 
      
      else if (entityType === 'Skill') {
        await prisma.skillDraft.create({
          data: {
            contributorId: userId,
            status: 'PENDING_REVIEW',
            name: row.name,
            description: row.description,
            cost: parseInt(row.cost) || 120,
            tier: row.tier || 'B',
            category: row.category || 'Speed',
            trigger: row.trigger || 'Any',
            distanceRequirement: row.distanceRequirement || 'Any',
            styleRequirement: row.styleRequirement || 'Any'
          }
        })
        importedCount++
      } 
      
      else if (entityType === 'Race') {
        await prisma.raceDraft.create({
          data: {
            contributorId: userId,
            status: 'PENDING_REVIEW',
            name: row.name,
            distance: parseInt(row.distance),
            groundType: row.groundType || 'Turf',
            season: row.season || 'Spring',
            grade: row.grade || 'G1',
            fanRequirement: parseInt(row.fanRequirement) || 0,
            direction: row.direction || 'Clockwise'
          }
        })
        importedCount++
      }
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'BULK_IMPORT',
        entity: entityType + 'Draft',
        entityId: 'bulk_import_' + Date.now(),
        before: null,
        after: JSON.stringify({ count: importedCount }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, count: importedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
