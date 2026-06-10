import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role === 'USER') {
      return NextResponse.json({ error: 'Unauthorized. Staff role required.' }, { status: 403 })
    }

    const { rows, entityType } = await req.json()

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Missing or invalid rows array.' }, { status: 400 })
    }

    const summary = {
      total: rows.length,
      valid: 0,
      duplicate: 0,
      invalid: 0,
      errors: [] as { row: number; error: string }[]
    }

    const validRows: any[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 1

      // 1. Missing fields check
      if (!row.name) {
        summary.invalid++
        summary.errors.push({ row: rowNum, error: 'Kolom "name" wajib diisi.' })
        continue
      }

      // 2. Validate based on Entity Type
      if (entityType === 'Character') {
        const rarity = parseInt(row.rarity)
        if (isNaN(rarity) || rarity < 1 || rarity > 5) {
          summary.invalid++
          summary.errors.push({ row: rowNum, error: `Bintang (${row.rarity}) harus berupa angka 1-5.` })
          continue
        }

        const validRankings = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']
        const hasInvalidRank = 
          !validRankings.includes(row.sprint || 'A') ||
          !validRankings.includes(row.mile || 'A') ||
          !validRankings.includes(row.medium || 'A') ||
          !validRankings.includes(row.long || 'A')

        if (hasInvalidRank) {
          summary.invalid++
          summary.errors.push({ row: rowNum, error: 'Aptitude harus bernilai antara S hingga G.' })
          continue
        }

        // Duplicate Check in DB
        const exist = await prisma.character.findFirst({
          where: { name: { equals: row.name } }
        })

        if (exist) {
          summary.duplicate++
          summary.errors.push({ row: rowNum, error: `Duplikat: Karakter "${row.name}" sudah ada di database.` })
          continue
        }

        summary.valid++
        validRows.push(row)
      } 
      
      else if (entityType === 'SupportCard') {
        const initialBond = parseInt(row.initial_bond)
        if (isNaN(initialBond)) {
          summary.invalid++
          summary.errors.push({ row: rowNum, error: 'Initial bond harus berupa angka.' })
          continue
        }

        const exist = await prisma.supportCard.findFirst({
          where: { name: { equals: row.name } }
        })

        if (exist) {
          summary.duplicate++
          summary.errors.push({ row: rowNum, error: `Duplikat: Kartu support "${row.name}" sudah ada di database.` })
          continue
        }

        summary.valid++
        validRows.push(row)
      } 
      
      else if (entityType === 'Skill') {
        if (!row.category || !row.description) {
          summary.invalid++
          summary.errors.push({ row: rowNum, error: 'Kategori dan deskripsi skill wajib diisi.' })
          continue
        }

        const exist = await prisma.skill.findFirst({
          where: { name: { equals: row.name } }
        })

        if (exist) {
          summary.duplicate++
          summary.errors.push({ row: rowNum, error: `Duplikat: Skill "${row.name}" sudah ada di database.` })
          continue
        }

        summary.valid++
        validRows.push(row)
      } 
      
      else if (entityType === 'Race') {
        const dist = parseInt(row.distance)
        if (isNaN(dist) || dist < 400) {
          summary.invalid++
          summary.errors.push({ row: rowNum, error: 'Jarak balapan harus berupa angka lebih besar dari 400m.' })
          continue
        }

        const exist = await prisma.race.findFirst({
          where: { name: { equals: row.name } }
        })

        if (exist) {
          summary.duplicate++
          summary.errors.push({ row: rowNum, error: `Duplikat: Balapan "${row.name}" sudah ada di database.` })
          continue
        }

        summary.valid++
        validRows.push(row)
      }
    }

    return NextResponse.json({
      success: true,
      summary,
      validRows
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
