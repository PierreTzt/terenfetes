import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { geocodeEvent } from '@/utils/geocode'

/**
 * POST /api/admin/geocode-events
 * Geocode all events without coordinates
 * Optional query param: limit (default: 50)
 */
export async function POST(request: NextRequest) {
  // Simple API key protection (for V1)
  const apiKey = request.headers.get('x-api-key')

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Find events without coordinates
    const eventsWithoutCoords = await prisma.event.findMany({
      where: {
        OR: [
          { lat: null },
          { lng: null }
        ],
        status: 'PUBLISHED' // Only geocode published events
      },
      select: {
        id: true,
        address: true,
        city: true,
        venue: {
          select: {
            name: true
          }
        },
        lat: true,
        lng: true
      },
      take: limit
    })

    if (eventsWithoutCoords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun événement à géocoder',
        geocoded: 0,
        failed: 0
      })
    }

    let geocodedCount = 0
    let failedCount = 0
    const results: Array<{ id: string; success: boolean; coordinates?: { lat: number; lng: number } }> = []

    // Geocode each event
    for (const event of eventsWithoutCoords) {
      try {
        const coordinates = await geocodeEvent({
          lat: event.lat,
          lng: event.lng,
          address: event.address,
          city: event.city,
          venueName: event.venue?.name
        })

        if (coordinates) {
          // Update event with coordinates
          await prisma.event.update({
            where: { id: event.id },
            data: {
              lat: coordinates.lat,
              lng: coordinates.lng
            }
          })

          geocodedCount++
          results.push({
            id: event.id,
            success: true,
            coordinates
          })
        } else {
          failedCount++
          results.push({
            id: event.id,
            success: false
          })
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error geocoding event ${event.id}:`, error)
        failedCount++
        results.push({
          id: event.id,
          success: false
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Géocodage terminé: ${geocodedCount} événements géocodés, ${failedCount} échecs`,
      geocoded: geocodedCount,
      failed: failedCount,
      total: eventsWithoutCoords.length,
      results
    })
  } catch (error) {
    console.error('Error in /api/admin/geocode-events:', error)
    return NextResponse.json(
      { error: 'Failed to geocode events' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/geocode-events
 * Count events without coordinates
 */
export async function GET(request: NextRequest) {
  // Simple API key protection (for V1)
  const apiKey = request.headers.get('x-api-key')

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const count = await prisma.event.count({
      where: {
        OR: [
          { lat: null },
          { lng: null }
        ],
        status: 'PUBLISHED'
      }
    })

    return NextResponse.json({
      count,
      message: count === 0
        ? 'Tous les événements ont des coordonnées'
        : `${count} événement(s) sans coordonnées`
    })
  } catch (error) {
    console.error('Error in /api/admin/geocode-events:', error)
    return NextResponse.json(
      { error: 'Failed to count events' },
      { status: 500 }
    )
  }
}
