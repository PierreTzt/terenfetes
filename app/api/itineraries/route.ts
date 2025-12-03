import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/itineraries?userId=xxx
 * Get user's itineraries
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const publicOnly = searchParams.get('public') === 'true'

  const where: any = {}

  if (userId) {
    where.userId = userId
  }

  if (publicOnly) {
    where.public = true
  }

  try {
    const itineraries = await prisma.itinerary.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Fetch events for each itinerary
    const itinerariesWithEvents = await Promise.all(
      itineraries.map(async (itinerary) => {
        const events = await prisma.event.findMany({
          where: {
            id: { in: itinerary.eventIds },
          },
          include: {
            venue: true,
          },
        })

        return {
          id: itinerary.id,
          userId: itinerary.userId,
          name: itinerary.name,
          eventIds: itinerary.eventIds,
          events: events.map((event) => ({
            id: event.id,
            title: event.title,
            slug: event.slug,
            startAt: event.startAt.toISOString(),
            imageUrl: event.imageUrl || undefined,
            city: event.city || undefined,
            lat: event.lat || undefined,
            lng: event.lng || undefined,
            venue: event.venue
              ? {
                  name: event.venue.name,
                  city: event.venue.city || undefined,
                  lat: event.venue.lat || undefined,
                  lng: event.venue.lng || undefined,
                }
              : undefined,
          })),
          optimized: itinerary.optimized || undefined,
          public: itinerary.public,
          createdAt: itinerary.createdAt.toISOString(),
        }
      })
    )

    return NextResponse.json({ data: itinerariesWithEvents })
  } catch (error) {
    console.error('Error fetching itineraries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch itineraries' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/itineraries
 * Create a new itinerary
 * Body: { userId: string, name: string, eventIds: string[], public?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, eventIds, public: isPublic = false } = body

    if (!userId || !name || !eventIds || !Array.isArray(eventIds)) {
      return NextResponse.json(
        { error: 'userId, name, and eventIds array are required' },
        { status: 400 }
      )
    }

    // Create itinerary
    const itinerary = await prisma.itinerary.create({
      data: {
        userId,
        name,
        eventIds,
        public: isPublic,
      },
    })

    return NextResponse.json(
      {
        data: {
          id: itinerary.id,
          userId: itinerary.userId,
          name: itinerary.name,
          eventIds: itinerary.eventIds,
          public: itinerary.public,
          createdAt: itinerary.createdAt.toISOString(),
        },
        message: 'Itinerary created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating itinerary:', error)
    return NextResponse.json(
      { error: 'Failed to create itinerary' },
      { status: 500 }
    )
  }
}
