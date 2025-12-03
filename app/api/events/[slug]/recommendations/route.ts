import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/events/[slug]/recommendations
 * Get recommended events similar to this one
 * Query params: limit (default 6)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '6')

  try {
    // Get the source event
    const event = await prisma.event.findUnique({
      where: { slug },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Calculate similarity scores for all other published events
    const allEvents = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: event.id },
        startAt: { gte: new Date() }, // Only future events
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        startAt: true,
        endAt: true,
        venue: true,
        venueId: true,
        address: true,
        city: true,
        lat: true,
        lng: true,
        priceMin: true,
        priceMax: true,
        category: true,
        audience: true,
        imageUrl: true,
        url: true,
        tags: true,
        badges: true,
        duration: true,
        indoor: true,
        isSponsored: true,
        organizerId: true,
        organizer: {
          select: {
            id: true,
            name: true,
            verified: true,
          },
        },
      },
    })

    // Calculate similarity scores
    const eventsWithScores = allEvents.map((otherEvent) => {
      let score = 0

      // Category overlap (highest weight)
      const categoryOverlap = event.category.filter((cat) =>
        otherEvent.category.includes(cat)
      ).length
      score += categoryOverlap * 10

      // Tag overlap
      const tagOverlap = event.tags.filter((tag) =>
        otherEvent.tags.includes(tag)
      ).length
      score += tagOverlap * 5

      // Same city
      if (event.city && otherEvent.city && event.city === otherEvent.city) {
        score += 8
      }

      // Similar badges
      const badgeOverlap = (event.badges || []).filter((badge) =>
        (otherEvent.badges || []).includes(badge)
      ).length
      score += badgeOverlap * 3

      // Similar price range
      if (event.priceMin !== null && otherEvent.priceMin !== null) {
        const priceDiff = Math.abs(
          parseFloat(event.priceMin.toString()) - parseFloat(otherEvent.priceMin.toString())
        )
        if (priceDiff < 10) {
          score += 5
        } else if (priceDiff < 20) {
          score += 3
        }
      }

      // Free events
      if (
        (event.priceMin === null || event.priceMin.toString() === '0') &&
        (otherEvent.priceMin === null || otherEvent.priceMin.toString() === '0')
      ) {
        score += 4
      }

      // Indoor/outdoor match
      if (event.indoor !== null && otherEvent.indoor !== null && event.indoor === otherEvent.indoor) {
        score += 3
      }

      // Same organizer
      if (event.organizerId && otherEvent.organizerId && event.organizerId === otherEvent.organizerId) {
        score += 6
      }

      // Same venue
      if (event.venueId && otherEvent.venueId && event.venueId === otherEvent.venueId) {
        score += 7
      }

      // Geographic proximity (if both have coordinates)
      if (event.lat && event.lng && otherEvent.lat && otherEvent.lng) {
        const distance = calculateDistance(
          event.lat,
          event.lng,
          otherEvent.lat,
          otherEvent.lng
        )
        if (distance < 5) {
          // Within 5km
          score += 5
        } else if (distance < 10) {
          // Within 10km
          score += 3
        }
      }

      return {
        event: otherEvent,
        score,
      }
    })

    // Sort by score (descending) and take top results
    eventsWithScores.sort((a, b) => b.score - a.score)
    const topEvents = eventsWithScores.slice(0, limit)

    // Format response
    const recommendations = topEvents.map(({ event: recEvent, score }) => ({
      id: recEvent.id,
      slug: recEvent.slug,
      title: recEvent.title,
      description: recEvent.description || undefined,
      startAt: recEvent.startAt.toISOString(),
      endAt: recEvent.endAt?.toISOString() || undefined,
      venue: recEvent.venue
        ? {
            id: recEvent.venue.id,
            name: recEvent.venue.name,
            address: recEvent.venue.address || undefined,
            city: recEvent.venue.city || undefined,
          }
        : undefined,
      city: recEvent.city || undefined,
      address: recEvent.address || undefined,
      lat: recEvent.lat || undefined,
      lng: recEvent.lng || undefined,
      priceMin: recEvent.priceMin?.toString() || undefined,
      priceMax: recEvent.priceMax?.toString() || undefined,
      category: recEvent.category,
      audience: recEvent.audience,
      imageUrl: recEvent.imageUrl || undefined,
      url: recEvent.url || undefined,
      badges: recEvent.badges,
      duration: recEvent.duration || undefined,
      indoor: recEvent.indoor || undefined,
      isSponsored: recEvent.isSponsored,
      organizer: recEvent.organizer
        ? {
            id: recEvent.organizer.id,
            name: recEvent.organizer.name,
            verified: recEvent.organizer.verified,
          }
        : undefined,
      similarityScore: score,
    }))

    return NextResponse.json({
      data: recommendations,
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}
