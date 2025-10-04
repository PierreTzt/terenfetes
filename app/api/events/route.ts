import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventStatus } from '@prisma/client'
import { EventPublicDTO } from '@/types'
import { buildSearchConditions } from '@/lib/db-search'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const status = searchParams.get('status') as EventStatus || 'PUBLISHED'
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const city = searchParams.get('city')
  const category = searchParams.get('category')
  const badge = searchParams.get('badge')
  const indoor = searchParams.get('indoor')
  const q = searchParams.get('q')
  const priceMax = searchParams.get('priceMax')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const sort = searchParams.get('sort') // nearby, new, trending, filling_fast

  // Advanced filters (new URL param names)
  const pmr = searchParams.get('pmr')
  const kids = searchParams.get('kids')
  const indoor_param = searchParams.get('indoor')
  const outdoor_param = searchParams.get('outdoor')
  const dur_lt = searchParams.get('dur_lt')
  const price_max = searchParams.get('price_max')

  try {
    const where: any = {
      status,
    }

    if (from) {
      where.startAt = { ...where.startAt, gte: new Date(from) }
    }

    if (to) {
      where.startAt = { ...where.startAt, lte: new Date(to) }
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    if (category) {
      where.category = { has: category }
    }

    if (badge) {
      where.badges = { has: badge }
    }

    if (priceMax !== null) {
      const maxPrice = parseFloat(priceMax || '0')
      where.OR = [
        { priceMin: { lte: maxPrice } },
        { priceMax: { lte: maxPrice } },
        { priceMin: null, priceMax: null }, // Free events with no price set
      ]
    }

    // Advanced filters with new param names
    if (pmr === '1') {
      where.pmr = true
    }

    if (kids === '1') {
      where.audience = { hasSome: ['Enfants', 'Familles'] }
    }

    if (indoor_param === '1') {
      where.indoor = true
    }

    if (outdoor_param === '1') {
      where.indoor = false
    }

    if (dur_lt) {
      const maxDuration = parseInt(dur_lt)
      where.duration = { lte: maxDuration }
    }

    if (price_max) {
      const maxPrice = parseFloat(price_max)
      // Don't override existing OR condition from priceMax
      if (!where.OR) {
        where.OR = []
      }
      where.OR = [
        { priceMin: { lte: maxPrice } },
        { priceMax: { lte: maxPrice } },
        { priceMin: null, priceMax: null },
      ]
    }

    if (q) {
      // Build search conditions with synonym expansion
      // This normalizes the query and searches for all variations
      const searchConditions = buildSearchConditions(q)

      where.AND = where.OR ? [{ OR: where.OR }] : []
      where.AND.push({ OR: searchConditions })
      delete where.OR
    }

    // Geolocation filter: require lat/lng to be set
    if (lat && lng) {
      where.lat = { not: null }
      where.lng = { not: null }
    }

    // Fetch sponsored events separately (max 2 per page)
    const sponsoredEvents = await prisma.event.findMany({
      where: {
        ...where,
        isSponsored: true,
        sponsoredUntil: {
          gte: new Date(), // Only active sponsored events
        },
      },
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
      orderBy: {
        sponsoredUntil: 'desc', // Most recently sponsored first
      },
      take: 2, // Max 2 sponsored per page
    })

    // Fetch regular events (excluding already fetched sponsored events)
    const sponsoredIds = sponsoredEvents.map((e) => e.id)
    const regularEventsCount = limit - sponsoredEvents.length

    // Determine orderBy based on sort parameter
    let orderBy: any = { startAt: 'asc' } // Default sort

    if (sort === 'new') {
      orderBy = { createdAt: 'desc' }
    } else if (sort === 'filling_fast') {
      orderBy = { capacityRemaining: 'asc' }
    }
    // For 'nearby' and 'trending', we'll sort after fetching

    let regularEvents = await prisma.event.findMany({
      where: {
        ...where,
        ...(sponsoredIds.length > 0 && { id: { notIn: sponsoredIds } }),
      },
      include: {
        venue: true,
        organizer: {
          select: {
            id: true,
            name: true,
            verified: true,
          },
        },
        metrics: sort === 'trending' ? {
          select: {
            views: true,
          },
        } : false,
      },
      orderBy,
      // Fetch more than needed for geolocation filtering or trending
      skip: (lat && lng) || sort === 'trending' ? 0 : (page - 1) * limit,
      take: (lat && lng) || sort === 'trending' ? 500 : regularEventsCount,
    })

    // Combine: sponsored first, then regular
    let events = [...sponsoredEvents, ...regularEvents]

    // Sort by trending (total views)
    if (sort === 'trending') {
      const eventsWithViews = events.map((event) => {
        const totalViews = event.metrics?.reduce((sum, m) => sum + m.views, 0) || 0
        return { ...event, totalViews }
      })
      eventsWithViews.sort((a, b) => b.totalViews - a.totalViews)
      events = eventsWithViews.slice((page - 1) * limit, page * limit)
    }

    // Filter by distance if geolocation is provided
    if (lat && lng && radius) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      const radiusKm = parseFloat(radius)

      // Calculate distance for each event (Haversine formula)
      const eventsWithDistance = events
        .filter((e) => e.lat !== null && e.lng !== null)
        .map((event) => {
          const eventLat = event.lat!
          const eventLng = event.lng!

          // Haversine formula
          const R = 6371 // Earth radius in km
          const dLat = ((eventLat - userLat) * Math.PI) / 180
          const dLng = ((eventLng - userLng) * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLat * Math.PI) / 180) *
              Math.cos((eventLat * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const distance = R * c

          return { ...event, distance }
        })
        .filter((e) => e.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance) // Sort by distance

      // Apply pagination after filtering
      events = eventsWithDistance.slice((page - 1) * limit, page * limit)
    }

    const total = await prisma.event.count({ where })

    const eventsDTO: EventPublicDTO[] = events.map(event => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description || undefined,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt?.toISOString(),
      venue: event.venue ? {
        name: event.venue.name,
        address: event.venue.address || undefined,
        city: event.venue.city || undefined,
        lat: event.venue.lat || undefined,
        lng: event.venue.lng || undefined,
      } : undefined,
      price: {
        min: event.priceMin ? parseFloat(event.priceMin.toString()) : undefined,
        max: event.priceMax ? parseFloat(event.priceMax.toString()) : undefined,
      },
      category: event.category,
      audience: event.audience,
      imageUrl: event.imageUrl || undefined,
      url: event.url || undefined,
      city: event.city || undefined,
      lat: event.lat || undefined,
      lng: event.lng || undefined,
      isSponsored: event.isSponsored || false,
      organizer: event.organizer ? {
        id: event.organizer.id,
        name: event.organizer.name,
        verified: event.organizer.verified,
      } : undefined,
      badges: event.badges || [],
      duration: event.duration || undefined,
      indoor: event.indoor ?? undefined,
      pmr: event.pmr ?? undefined,
      weatherDependent: event.weatherDependent || undefined,
      capacityTotal: event.capacityTotal || undefined,
      capacityRemaining: event.capacityRemaining || undefined,
    }))

    return NextResponse.json({
      data: eventsDTO,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
