import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventStatus } from '@prisma/client'

/**
 * POST /api/events/[slug]/moderate
 * Moderate an event (publish or reject)
 * Body: { action: 'publish' | 'reject', reason?: string }
 * Note: The slug parameter is treated as an event ID for moderation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Simple API key protection (for V1)
  const apiKey = request.headers.get('x-api-key')

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { slug: id } = await params
    const { action, reason } = await request.json()

    if (!action || !['publish', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "publish" or "reject"' },
        { status: 400 }
      )
    }

    // Find event
    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only PENDING events can be moderated' },
        { status: 400 }
      )
    }

    // Update event status
    const newStatus: EventStatus = action === 'publish' ? 'PUBLISHED' : 'REJECTED'

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status: newStatus,
        moderationReason: reason || undefined,
        moderatedAt: new Date(),
      },
    })

    // Track moderation action
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('admin_moderate_event', {
        eventId: id,
        action,
        previousStatus: event.status,
        newStatus,
      })
    }

    return NextResponse.json({
      success: true,
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        status: updatedEvent.status,
      },
      message: action === 'publish'
        ? `Événement "${updatedEvent.title}" publié avec succès`
        : `Événement "${updatedEvent.title}" rejeté`,
    })
  } catch (error) {
    console.error('Error moderating event:', error)
    return NextResponse.json(
      { error: 'Failed to moderate event' },
      { status: 500 }
    )
  }
}
