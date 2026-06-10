import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role === 'USER') {
      return NextResponse.json({ error: 'Unauthorized. Staff role required.' }, { status: 403 })
    }

    const { text, entityType } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided.' }, { status: 400 })
    }

    // Heuristik parsing menggunakan REGEX & Kata Kunci
    const lowerText = text.toLowerCase()
    const result: any = {}

    // 1. Ekstrak Nama
    const nameMatch = text.match(/(?:Name|Nama)\s*:\s*([^\n\r]+)/i) || text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
    if (nameMatch) {
      result.name = nameMatch[1].trim()
    } else {
      result.name = 'Oguri Cap' // fallback demo
    }

    // 2. Ekstrak Japanese Name
    const jpMatch = text.match(/(?:Japanese Name|Nama Jepang)\s*:\s*([^\n\r]+)/i) || text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/)
    if (jpMatch) {
      result.japaneseName = jpMatch[0].trim()
    }

    // 3. Ekstrak Rarity
    const rarityMatch = text.match(/(?:Rarity|Bintang)\s*:\s*(\d)/i) || text.match(/(\d)\s*\*/)
    if (rarityMatch) {
      result.rarity = parseInt(rarityMatch[1])
    } else {
      result.rarity = 3
    }

    // 4. Ekstrak CV / Voice actor
    const cvMatch = text.match(/(?:CV|Voice Actor|Voice)\s*:\s*([^\n\r]+)/i)
    if (cvMatch) {
      result.cv = cvMatch[1].trim()
    }

    // 5. Ekstrak Deskripsi
    const descMatch = text.match(/(?:Description|Deskripsi)\s*:\s*([^\n\r]+)/i)
    if (descMatch) {
      result.description = descMatch[1].trim()
    }

    // 6. Ekstrak Growth Bonus
    // Cari angka persentase diikuti kata kunci stat
    const speedBonus = text.match(/(\d+)%\s*(?:Speed|Kecepatan)/i) || text.match(/(?:Speed|Kecepatan)\s*\+*(\d+)%/i)
    const stamBonus = text.match(/(\d+)%\s*(?:Stamina|Daya Tahan)/i) || text.match(/(?:Stamina|Daya Tahan)\s*\+*(\d+)%/i)
    const powerBonus = text.match(/(\d+)%\s*(?:Power|Kekuatan)/i) || text.match(/(?:Power|Kekuatan)\s*\+*(\d+)%/i)
    const gutsBonus = text.match(/(\d+)%\s*(?:Guts|Determinasi)/i) || text.match(/(?:Guts|Determinasi)\s*\+*(\d+)%/i)
    const wisdomBonus = text.match(/(\d+)%\s*(?:Wisdom|Inteligensia)/i) || text.match(/(?:Wisdom|Inteligensia)\s*\+*(\d+)%/i)

    result.growthSpeed = speedBonus ? parseInt(speedBonus[1]) : 0
    result.growthStamina = stamBonus ? parseInt(stamBonus[1]) : 0
    result.growthPower = powerBonus ? parseInt(powerBonus[1]) : 0
    result.growthGuts = gutsBonus ? parseInt(gutsBonus[1]) : 0
    result.growthWisdom = wisdomBonus ? parseInt(wisdomBonus[1]) : 0

    // 7. Ekstrak Aptitude Rankings (S, A, B, C, D, E, F, G)
    const sptMatch = text.match(/(?:Sprint|Jarak Pendek)\s*:\s*([A-G])/i)
    if (sptMatch) result.sprint = sptMatch[1].toUpperCase()
    
    const mileMatch = text.match(/(?:Mile|Mil)\s*:\s*([A-G])/i)
    if (mileMatch) result.mile = mileMatch[1].toUpperCase()

    const medMatch = text.match(/(?:Medium|Jarak Menengah)\s*:\s*([A-G])/i)
    if (medMatch) result.medium = medMatch[1].toUpperCase()

    const longMatch = text.match(/(?:Long|Jarak Jauh)\s*:\s*([A-G])/i)
    if (longMatch) result.long = longMatch[1].toUpperCase()

    return NextResponse.json({
      success: true,
      extractedData: result,
      entityType
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
