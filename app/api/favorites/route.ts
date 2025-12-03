import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/favorites?userId=xxx
 * Get user's favorites with event details
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    )
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            venue: true,
            organizer: {
              select: {
                id: true,
                name: true,
                verified: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const favoritesDTO = favorites.map((fav) => ({
      id: fav.id,
      userId: fav.userId,
      eventId: fav.eventId,
      createdAt: fav.createdAt.toISOString(),
      event: {
        id: fav.event.id,
        title: fav.event.title,
        slug: fav.event.slug,
        description: fav.event.description || undefined,
        startAt: fav.event.startAt.toISOString(),
        endAt: fav.event.endAt?.toISOString(),
        venue: fav.event.venue
          ? {
              name: fav.event.venue.name,
              address: fav.event.venue.address || undefined,
              city: fav.event.venue.city || undefined,
              lat: fav.event.venue.lat || undefined,
              lng: fav.event.venue.lng || undefined,
            }
          : undefined,
        price: {
          min: fav.event.priceMin
            ? parseFloat(fav.event.priceMin.toString())
            : undefined,
          max: fav.event.priceMax
            ? parseFloat(fav.event.priceMax.toString())
            : undefined,
        },
        category: fav.event.category,
        audience: fav.event.audience,
        imageUrl: fav.event.imageUrl || undefined,
        url: fav.event.url || undefined,
        city: fav.event.city || undefined,
        lat: fav.event.lat || undefined,
        lng: fav.event.lng || undefined,
        badges: fav.event.badges,
        organizer: fav.event.organizer
          ? {
              id: fav.event.organizer.id,
              name: fav.event.organizer.name,
              verified: fav.event.organizer.verified,
            }
          : undefined,
      },
    }))

    return NextResponse.json({ data: favoritesDTO })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/favorites
 * Add an event to favorites
 * Body: { userId: string, eventId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, eventId } = body

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'userId and eventId are required' },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_eventId: {
          userId,
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
        userId,
        eventId,
      },
    })

    return NextResponse.json(
      {
        data: {
          id: favorite.id,
          userId: favorite.userId,
          eventId: favorite.eventId,
          createdAt: favorite.createdAt.toISOString(),
        },
        message: 'Event added to favorites',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/favorites?userId=xxx&eventId=xxx
 * Remove an event from favorites
 */
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const eventId = searchParams.get('eventId')

  if (!userId || !eventId) {
    return NextResponse.json(
      { error: 'userId and eventId are required' },
      { status: 400 }
    )
  }

  try {
    await prisma.favorite.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Event removed from favorites',
    })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
