import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventStatus } from '@prisma/client'
import { EventPublicDTO } from '@/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const status = searchParams.get('status') as EventStatus || 'PUBLISHED'
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const city = searchParams.get('city')
  const category = searchParams.get('category')
  const q = searchParams.get('q')
  const priceMax = searchParams.get('priceMax')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

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

    if (priceMax !== null) {
      const maxPrice = parseFloat(priceMax || '0')
      where.OR = [
        { priceMin: { lte: maxPrice } },
        { priceMax: { lte: maxPrice } },
        { priceMin: null, priceMax: null }, // Free events with no price set
      ]
    }

    if (q) {
      where.AND = where.OR ? [{ OR: where.OR }] : []
      where.AND.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } }
        ]
      })
      delete where.OR
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          venue: true,
        },
        orderBy: {
          startAt: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where })
    ])

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
