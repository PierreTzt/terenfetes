import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventIngestDTO } from '@/types'
import { generateEventSlug, generateUniqueSlug } from '@/utils/slug'
import { geocodeAddress } from '@/utils/geocode'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  const { sourceId } = await params

  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.WEBHOOK_SECRET

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const events: EventIngestDTO[] = Array.isArray(body) ? body : [body]

    // Verify source exists
    const source = await prisma.source.findUnique({
      where: { id: sourceId }
    })

    if (!source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      )
    }

    const results = []

    for (const eventData of events) {
      try {
        // Find or create venue if venueName provided
        let venueId: string | undefined

        if (eventData.venueName) {
          const venue = await prisma.venue.upsert({
            where: {
              name_city: {
                name: eventData.venueName,
                city: eventData.city || ''
              }
            },
            update: {},
            create: {
              name: eventData.venueName,
              address: eventData.address,
              city: eventData.city,
              lat: eventData.lat,
              lng: eventData.lng,
            }
          })
          venueId = venue.id
        }

        // Geocode if no coordinates provided
        let lat = eventData.lat
        let lng = eventData.lng

        if (!lat || !lng) {
          const address = eventData.address || `${eventData.venueName || ''}, ${eventData.city || ''}`
          if (address.trim()) {
            const geocoded = await geocodeAddress(address)
            if (geocoded) {
              lat = geocoded.lat
              lng = geocoded.lng
            }
          }
        }

        // Generate slug
        const baseSlug = generateEventSlug(
          eventData.title,
          eventData.city,
          eventData.startAt
        )

        // Check for existing slugs to ensure uniqueness
        const existingSlugs = await prisma.event.findMany({
          where: {
            slug: { startsWith: baseSlug }
          },
          select: { slug: true }
        })

        const slug = generateUniqueSlug(baseSlug, existingSlugs.map(e => e.slug))

        // Upsert event (by sourceUid if provided, otherwise create new)
        const eventPayload = {
          title: eventData.title,
          slug,
          description: eventData.description,
          startAt: new Date(eventData.startAt),
          endAt: eventData.endAt ? new Date(eventData.endAt) : null,
          venueId,
          address: eventData.address,
          city: eventData.city,
          lat,
          lng,
          priceMin: eventData.priceMin,
          priceMax: eventData.priceMax,
          category: eventData.category || [],
          audience: eventData.audience || [],
          imageUrl: eventData.imageUrl,
          sourceId,
          sourceUid: eventData.sourceUid,
          url: eventData.url,
          status: 'PENDING' as const,
        }

        let event
        if (eventData.sourceUid) {
          event = await prisma.event.upsert({
            where: { sourceUid: eventData.sourceUid },
            update: eventPayload,
            create: eventPayload
          })
        } else {
          event = await prisma.event.create({
            data: eventPayload
          })
        }

        results.push({ success: true, eventId: event.id, slug: event.slug })
      } catch (error) {
        console.error('Error ingesting event:', error)
        results.push({ success: false, error: String(error), data: eventData })
      }
    }

    // Update source lastRunAt
    await prisma.source.update({
      where: { id: sourceId },
      data: { lastRunAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    })
  } catch (error) {
    console.error('Error in webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
