import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const email = session.user.email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    let ownedCharacters: string[] = []
    let ownedSupports: string[] = []
    try {
      ownedCharacters = JSON.parse(user.ownedCharacters || '[]')
    } catch {}
    try {
      ownedSupports = JSON.parse(user.ownedSupports || '[]')
    } catch {}

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        ownedCharacters,
        ownedSupports,
        jewels: user.jewels,
        tickets: user.tickets,
        ssrTickets: user.ssrTickets
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const { 
      name, 
      avatar, 
      currentPassword, 
      newPassword,
      ownedCharacters,
      ownedSupports,
      jewels,
      tickets,
      ssrTickets
    } = await req.json()
    const email = session.user.email

    // Retrieve active user from DB
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (avatar !== undefined) updateData.avatar = avatar
    
    if (ownedCharacters !== undefined) updateData.ownedCharacters = JSON.stringify(ownedCharacters)
    if (ownedSupports !== undefined) updateData.ownedSupports = JSON.stringify(ownedSupports)
    if (jewels !== undefined) updateData.jewels = Math.max(0, parseInt(jewels) || 0)
    if (tickets !== undefined) updateData.tickets = Math.max(0, parseInt(tickets) || 0)
    if (ssrTickets !== undefined) updateData.ssrTickets = Math.max(0, parseInt(ssrTickets) || 0)

    // Password Update Logic
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, message: 'Current password is required to set a new password.' }, { status: 400 })
      }
      if (user.password !== currentPassword) {
        return NextResponse.json({ success: false, message: 'Current password is incorrect.' }, { status: 400 })
      }
      updateData.password = newPassword
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateData
    })

    let parsedChars: string[] = []
    let parsedSupports: string[] = []
    try {
      parsedChars = JSON.parse(updatedUser.ownedCharacters || '[]')
    } catch {}
    try {
      parsedSupports = JSON.parse(updatedUser.ownedSupports || '[]')
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        ownedCharacters: parsedChars,
        ownedSupports: parsedSupports,
        jewels: updatedUser.jewels,
        tickets: updatedUser.tickets,
        ssrTickets: updatedUser.ssrTickets
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
