import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventPublicDTO } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        venue: true,
      },
    })

    if (!event || event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const eventDTO: EventPublicDTO = {
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
      indoor: event.indoor ?? undefined,
      pmr: event.pmr ?? undefined,
    }

    return NextResponse.json(eventDTO)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
