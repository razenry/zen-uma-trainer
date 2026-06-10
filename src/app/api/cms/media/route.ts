import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory mock media database for the prototype
let MOCK_MEDIA = [
  { id: "m1", name: "special-week-thumb.webp", url: "/characters/special_week.png", size: "45 KB", type: "image/webp", tags: ["character", "thumbnail"] },
  { id: "m2", name: "silence-suzuka-thumb.webp", url: "/characters/silence_suzuka.png", size: "48 KB", type: "image/webp", tags: ["character", "thumbnail"] },
  { id: "m3", name: "kitasan-black-ssr.webp", url: "/supports/kitasan.png", size: "128 KB", type: "image/webp", tags: ["support", "artwork"] },
  { id: "m4", name: "maestro-skill-icon.webp", url: "/skills/maestro.png", size: "12 KB", type: "image/webp", tags: ["skill", "icon"] }
]

export async function GET() {
  return NextResponse.json(MOCK_MEDIA)
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role === 'USER') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    const { name, size, type, tags } = await req.json()

    const newMedia = {
      id: `m${Date.now()}`,
      name: name || "new-file.webp",
      url: `/uploads/${name || "new-file.webp"}`,
      size: size || "65 KB",
      type: type || "image/webp",
      tags: tags || ["upload"]
    }

    MOCK_MEDIA = [newMedia, ...MOCK_MEDIA]

    return NextResponse.json({ success: true, file: newMedia })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin role required to delete media.' }, { status: 403 })
    }

    const { id } = await req.json()
    MOCK_MEDIA = MOCK_MEDIA.filter(m => m.id !== id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
