import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateEventSlug, generateUniqueSlug } from '@/utils/slug'
import { geocodeEvent } from '@/utils/geocode'
import { getClientIp, checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - max 5 submissions per 15 minutes per IP
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`submit:${clientIp}`, 5, 15 * 60 * 1000)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Trop de soumissions. Veuillez patienter avant de soumettre un nouvel événement.',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.startAt || !body.venueName || !body.city) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    // Validate dates
    const startAt = new Date(body.startAt)
    const endAt = body.endAt ? new Date(body.endAt) : null

    if (isNaN(startAt.getTime())) {
      return NextResponse.json(
        { error: 'Date de début invalide' },
        { status: 400 }
      )
    }

    if (endAt && endAt < startAt) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      )
    }

    // Validate prices
    if (
      body.priceMin !== undefined &&
      body.priceMax !== undefined &&
      body.priceMax < body.priceMin
    ) {
      return NextResponse.json(
        { error: 'Le prix maximum doit être supérieur ou égal au prix minimum' },
        { status: 400 }
      )
    }

    // Find or create venue
    let venueId: string | undefined

    if (body.venueName) {
      const venue = await prisma.venue.upsert({
        where: {
          name_city: {
            name: body.venueName,
            city: body.city || '',
          },
        },
        update: {},
        create: {
          name: body.venueName,
          address: body.address,
          city: body.city,
        },
      })
      venueId = venue.id
    }

    // Geocode address if no coordinates provided
    const coordinates = await geocodeEvent({
      lat: body.lat,
      lng: body.lng,
      address: body.address,
      city: body.city,
      venueName: body.venueName
    })

    const lat = coordinates?.lat ?? body.lat ?? null
    const lng = coordinates?.lng ?? body.lng ?? null

    // Generate unique slug
    const baseSlug = generateEventSlug(body.title, body.city, body.startAt)
    const existingSlugs = await prisma.event.findMany({
      where: {
        slug: { startsWith: baseSlug },
      },
      select: { slug: true },
    })
    const slug = generateUniqueSlug(baseSlug, existingSlugs.map((e) => e.slug))

    // Create event
    const event = await prisma.event.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        startAt,
        endAt,
        venueId,
        address: body.address,
        city: body.city,
        lat,
        lng,
        priceMin: body.priceMin,
        priceMax: body.priceMax,
        category: body.category || [],
        audience: body.audience || [],
        imageUrl: body.imageUrl,
        url: body.url,
        indoor: body.indoor,
        pmr: body.pmr || false,
        status: 'PENDING', // All form submissions start as PENDING
        tags: [],
      },
    })

    // TODO: Send confirmation email to submitter (if email field added)
    // TODO: Send notification to moderators

    return NextResponse.json({
      success: true,
      eventId: event.id,
      slug: event.slug,
      message: 'Événement soumis avec succès. Il sera examiné avant publication.',
    })
  } catch (error) {
    console.error('Error submitting event:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la soumission de l\'événement' },
      { status: 500 }
    )
  }
}
