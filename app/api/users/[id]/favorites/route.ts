import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id]/favorites - Get user's favorites
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: id },
      include: {
        event: {
          include: {
            venue: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      data: favorites,
      meta: {
        total: favorites.length,
      },
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST /api/users/[id]/favorites - Add event to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_eventId: {
          userId: id,
          eventId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Event already in favorites' },
        { status: 409 }
      )
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: id,
        eventId,
      },
      include: {
        event: true,
      },
    })

    return NextResponse.json({ data: favorite })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}
