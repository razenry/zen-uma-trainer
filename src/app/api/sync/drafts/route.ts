import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession as getSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { draftId, entityType, action, notes } = await req.json()
    const userRole = (session.user as any).role
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

    if (!draftId || !entityType || !action) {
      return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 })
    }

    // Role restrictions: Moderators and Admins only for reviews and publishing
    if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return NextResponse.json({ error: 'Unauthorized. Moderator or Admin role required.' }, { status: 403 })
    }

    // Workflow Engine State Machine
    if (action === 'REJECT') {
      let draft: any
      if (entityType === 'Character') {
        draft = await prisma.characterDraft.update({ where: { id: draftId }, data: { status: 'REJECTED', reviewNotes: notes } })
      } else if (entityType === 'SupportCard') {
        draft = await prisma.supportCardDraft.update({ where: { id: draftId }, data: { status: 'REJECTED', reviewNotes: notes } })
      } else if (entityType === 'Skill') {
        draft = await prisma.skillDraft.update({ where: { id: draftId }, data: { status: 'REJECTED', reviewNotes: notes } })
      } else if (entityType === 'Race') {
        draft = await prisma.raceDraft.update({ where: { id: draftId }, data: { status: 'REJECTED', reviewNotes: notes } })
      }

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'REJECT',
          entity: entityType + 'Draft',
          entityId: draftId,
          before: null,
          after: JSON.stringify({ reviewNotes: notes }),
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
        }
      })

      return NextResponse.json({ success: true, draft })
    }

    if (action === 'APPROVE') {
      let draft: any
      if (entityType === 'Character') {
        draft = await prisma.characterDraft.update({ where: { id: draftId }, data: { status: 'APPROVED', reviewNotes: notes } })
      } else if (entityType === 'SupportCard') {
        draft = await prisma.supportCardDraft.update({ where: { id: draftId }, data: { status: 'APPROVED', reviewNotes: notes } })
      } else if (entityType === 'Skill') {
        draft = await prisma.skillDraft.update({ where: { id: draftId }, data: { status: 'APPROVED', reviewNotes: notes } })
      } else if (entityType === 'Race') {
        draft = await prisma.raceDraft.update({ where: { id: draftId }, data: { status: 'APPROVED', reviewNotes: notes } })
      }

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'APPROVE',
          entity: entityType + 'Draft',
          entityId: draftId,
          before: null,
          after: JSON.stringify({ reviewNotes: notes }),
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
        }
      })

      return NextResponse.json({ success: true, draft })
    }

    if (action === 'PUBLISH') {
      // Only Admin can Publish (Moderator can only Approve/Reject)
      if (userRole !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized. Only Admins can publish drafts to production.' }, { status: 403 })
      }

      let liveRecord: any

      if (entityType === 'Character') {
        const draft = await prisma.characterDraft.findUnique({ where: { id: draftId } })
        if (!draft) return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })

        const liveId = draft.liveId || `char_${draft.name.toLowerCase().replace(/\s+/g, '_')}`

        // Check previous live state for audit trail
        const previousLive = await prisma.character.findUnique({ where: { id: liveId } })

        // Upsert into Character
        liveRecord = await prisma.character.upsert({
          where: { id: liveId },
          update: {
            name: draft.name,
            japaneseName: draft.japaneseName,
            alias: draft.alias,
            description: draft.description,
            birthday: draft.birthday,
            height: draft.height,
            weight: draft.weight,
            cv: draft.cv,
            rarity: draft.rarity,
            growthSpeed: draft.growthSpeed,
            growthStamina: draft.growthStamina,
            growthPower: draft.growthPower,
            growthGuts: draft.growthGuts,
            growthWisdom: draft.growthWisdom,
            sprint: draft.sprint,
            mile: draft.mile,
            medium: draft.medium,
            long: draft.long,
            front: draft.front,
            leader: draft.leader,
            betweener: draft.betweener,
            chaser: draft.chaser,
            imageThumbnail: draft.imageThumbnail,
            imageArtwork: draft.imageArtwork,
            imageIcon: draft.imageIcon,
            events: draft.events,
          },
          create: {
            id: liveId,
            name: draft.name,
            japaneseName: draft.japaneseName,
            alias: draft.alias,
            description: draft.description,
            birthday: draft.birthday,
            height: draft.height,
            weight: draft.weight,
            cv: draft.cv,
            rarity: draft.rarity,
            growthSpeed: draft.growthSpeed,
            growthStamina: draft.growthStamina,
            growthPower: draft.growthPower,
            growthGuts: draft.growthGuts,
            growthWisdom: draft.growthWisdom,
            sprint: draft.sprint,
            mile: draft.mile,
            medium: draft.medium,
            long: draft.long,
            front: draft.front,
            leader: draft.leader,
            betweener: draft.betweener,
            chaser: draft.chaser,
            imageThumbnail: draft.imageThumbnail,
            imageArtwork: draft.imageArtwork,
            imageIcon: draft.imageIcon,
            events: draft.events,
          }
        })

        // Update draft status
        await prisma.characterDraft.update({ where: { id: draftId }, data: { status: 'PUBLISHED', liveId } })

        // Create Version History Snapshot
        const existingVersionsCount = await prisma.versionHistory.count({ where: { entityType: 'Character', entityId: liveId } })
        await prisma.versionHistory.create({
          data: {
            entityType: 'Character',
            entityId: liveId,
            version: existingVersionsCount + 1,
            snapshot: JSON.stringify(liveRecord),
            comment: 'Published from draft review.',
            charId: liveId
          }
        })

        // Audit Log
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'PUBLISH',
            entity: 'Character',
            entityId: liveId,
            before: previousLive ? JSON.stringify(previousLive) : null,
            after: JSON.stringify(liveRecord),
            ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
          }
        })
      } 
      
      else if (entityType === 'SupportCard') {
        const draft = await prisma.supportCardDraft.findUnique({ where: { id: draftId } })
        if (!draft) return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })

        const liveId = draft.liveId || `card_${draft.name.toLowerCase().replace(/\s+/g, '_')}`
        const previousLive = await prisma.supportCard.findUnique({ where: { id: liveId } })

        liveRecord = await prisma.supportCard.upsert({
          where: { id: liveId },
          update: {
            name: draft.name,
            description: draft.description,
            rarity: draft.rarity,
            type: draft.type,
            trainingBonus: draft.trainingBonus,
            friendshipBonus: draft.friendshipBonus,
            raceBonus: draft.raceBonus,
            fanBonus: draft.fanBonus,
            hintLevelBonus: draft.hintLevelBonus,
            initialBond: draft.initialBond,
            effects: draft.effects,
            events: draft.events,
            imageThumbnail: draft.imageThumbnail,
            imageArtwork: draft.imageArtwork,
          },
          create: {
            id: liveId,
            name: draft.name,
            description: draft.description,
            rarity: draft.rarity,
            type: draft.type,
            trainingBonus: draft.trainingBonus,
            friendshipBonus: draft.friendshipBonus,
            raceBonus: draft.raceBonus,
            fanBonus: draft.fanBonus,
            hintLevelBonus: draft.hintLevelBonus,
            initialBond: draft.initialBond,
            effects: draft.effects,
            events: draft.events,
            imageThumbnail: draft.imageThumbnail,
            imageArtwork: draft.imageArtwork,
          }
        })

        await prisma.supportCardDraft.update({ where: { id: draftId }, data: { status: 'PUBLISHED', liveId } })

        const existingVersionsCount = await prisma.versionHistory.count({ where: { entityType: 'SupportCard', entityId: liveId } })
        await prisma.versionHistory.create({
          data: {
            entityType: 'SupportCard',
            entityId: liveId,
            version: existingVersionsCount + 1,
            snapshot: JSON.stringify(liveRecord),
            comment: 'Published from draft.',
            cardId: liveId
          }
        })

        await prisma.auditLog.create({
          data: {
            userId,
            action: 'PUBLISH',
            entity: 'SupportCard',
            entityId: liveId,
            before: previousLive ? JSON.stringify(previousLive) : null,
            after: JSON.stringify(liveRecord),
            ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
          }
        })
      } 
      
      else if (entityType === 'Skill') {
        const draft = await prisma.skillDraft.findUnique({ where: { id: draftId } })
        if (!draft) return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })

        const liveId = draft.liveId || `skill_${draft.name.toLowerCase().replace(/\s+/g, '_')}`
        const previousLive = await prisma.skill.findUnique({ where: { id: liveId } })

        liveRecord = await prisma.skill.upsert({
          where: { id: liveId },
          update: {
            name: draft.name,
            description: draft.description,
            cost: draft.cost,
            tier: draft.tier,
            category: draft.category,
            trigger: draft.trigger,
            distanceRequirement: draft.distanceRequirement,
            styleRequirement: draft.styleRequirement,
          },
          create: {
            id: liveId,
            name: draft.name,
            description: draft.description,
            cost: draft.cost,
            tier: draft.tier,
            category: draft.category,
            trigger: draft.trigger,
            distanceRequirement: draft.distanceRequirement,
            styleRequirement: draft.styleRequirement,
          }
        })

        await prisma.skillDraft.update({ where: { id: draftId }, data: { status: 'PUBLISHED', liveId } })

        const existingVersionsCount = await prisma.versionHistory.count({ where: { entityType: 'Skill', entityId: liveId } })
        await prisma.versionHistory.create({
          data: {
            entityType: 'Skill',
            entityId: liveId,
            version: existingVersionsCount + 1,
            snapshot: JSON.stringify(liveRecord),
            comment: 'Published skill.',
            skillId: liveId
          }
        })

        await prisma.auditLog.create({
          data: {
            userId,
            action: 'PUBLISH',
            entity: 'Skill',
            entityId: liveId,
            before: previousLive ? JSON.stringify(previousLive) : null,
            after: JSON.stringify(liveRecord),
            ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
          }
        })
      } 
      
      else if (entityType === 'Race') {
        const draft = await prisma.raceDraft.findUnique({ where: { id: draftId } })
        if (!draft) return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })

        const liveId = draft.liveId || `race_${draft.name.toLowerCase().replace(/\s+/g, '_')}`
        const previousLive = await prisma.race.findUnique({ where: { id: liveId } })

        liveRecord = await prisma.race.upsert({
          where: { id: liveId },
          update: {
            name: draft.name,
            distance: draft.distance,
            groundType: draft.groundType,
            season: draft.season,
            grade: draft.grade,
            fanRequirement: draft.fanRequirement,
            direction: draft.direction,
          },
          create: {
            id: liveId,
            name: draft.name,
            distance: draft.distance,
            groundType: draft.groundType,
            season: draft.season,
            grade: draft.grade,
            fanRequirement: draft.fanRequirement,
            direction: draft.direction,
          }
        })

        await prisma.raceDraft.update({ where: { id: draftId }, data: { status: 'PUBLISHED', liveId } })

        const existingVersionsCount = await prisma.versionHistory.count({ where: { entityType: 'Race', entityId: liveId } })
        await prisma.versionHistory.create({
          data: {
            entityType: 'Race',
            entityId: liveId,
            version: existingVersionsCount + 1,
            snapshot: JSON.stringify(liveRecord),
            comment: 'Published race.',
            raceId: liveId
          }
        })

        await prisma.auditLog.create({
          data: {
            userId,
            action: 'PUBLISH',
            entity: 'Race',
            entityId: liveId,
            before: previousLive ? JSON.stringify(previousLive) : null,
            after: JSON.stringify(liveRecord),
            ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
          }
        })
      }

      return NextResponse.json({ success: true, liveRecord })
    }

    return NextResponse.json({ error: 'Invalid Action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
