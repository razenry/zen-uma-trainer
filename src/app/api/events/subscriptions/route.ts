import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const subscriptions = await prisma.eventSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('[API /events/subscriptions GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, subscriptionType, eventId, remindBefore } = body

    if (!userId || !subscriptionType || !remindBefore) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const subscription = await prisma.eventSubscription.create({
      data: {
        userId,
        subscriptionType,
        eventId: eventId || null,
        remindBefore: Number(remindBefore)
      }
    })

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error('[API /events/subscriptions POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Subscription id is required' }, { status: 400 })
    }

    await prisma.eventSubscription.delete({ where: { id } })

    return NextResponse.json({ message: 'Subscription deleted' })
  } catch (error) {
    console.error('[API /events/subscriptions DELETE] Error:', error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}
