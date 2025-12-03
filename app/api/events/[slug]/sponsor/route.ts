import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/events/[slug]/sponsor
 * Sponsor an event (make it appear at the top)
 * Body: { durationDays: number }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const body = await request.json()
    const { durationDays = 7 } = body

    if (!durationDays || durationDays < 1) {
      return NextResponse.json(
        { error: 'durationDays must be at least 1' },
        { status: 400 }
      )
    }

    // Find event by slug (could be ID or slug)
    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            subscriptionTier: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if event is already sponsored and active
    if (event.isSponsored && event.sponsoredUntil && event.sponsoredUntil > new Date()) {
      return NextResponse.json(
        {
          error: 'Event is already sponsored',
          sponsoredUntil: event.sponsoredUntil.toISOString(),
        },
        { status: 400 }
      )
    }

    // Calculate sponsored until date
    const sponsoredUntil = new Date()
    sponsoredUntil.setDate(sponsoredUntil.getDate() + durationDays)

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: {
        isSponsored: true,
        sponsoredUntil,
      },
    })

    // Track sponsorship action
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('event_sponsored', {
        eventId: event.id,
        durationDays,
        organizerId: event.organizerId,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        slug: updatedEvent.slug,
        isSponsored: updatedEvent.isSponsored,
        sponsoredUntil: updatedEvent.sponsoredUntil?.toISOString(),
      },
      message: `Événement "${updatedEvent.title}" sponsorisé jusqu'au ${updatedEvent.sponsoredUntil?.toLocaleDateString('fr-FR')}`,
    })
  } catch (error) {
    console.error('Error sponsoring event:', error)
    return NextResponse.json(
      { error: 'Failed to sponsor event' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/[slug]/sponsor
 * Remove sponsorship from an event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Check API key for admin operations
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Find event
    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Remove sponsorship
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: {
        isSponsored: false,
        sponsoredUntil: null,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEvent.id,
        title: updatedEvent.title,
      },
      message: `Sponsoring supprimé pour "${updatedEvent.title}"`,
    })
  } catch (error) {
    console.error('Error removing sponsorship:', error)
    return NextResponse.json(
      { error: 'Failed to remove sponsorship' },
      { status: 500 }
    )
  }
}
