import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/passport/checkin
 * Check-in to an event (add a stamp to user's passport)
 * Body: { userId: string, eventId: string, verified?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, eventId, verified = false } = body

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'userId and eventId are required' },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if user already checked in
    const existing = await prisma.userPassport.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already checked in to this event' },
        { status: 409 }
      )
    }

    // Create check-in
    const checkIn = await prisma.userPassport.create({
      data: {
        userId,
        eventId,
        verified,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startAt: true,
            venue: {
              select: {
                name: true,
                city: true,
              },
            },
          },
        },
      },
    })

    // Count total stamps for this user
    const totalStamps = await prisma.userPassport.count({
      where: { userId },
    })

    // Track check-in
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('passport_checkin', {
        userId,
        eventId,
        totalStamps,
      })
    }

    return NextResponse.json({
      success: true,
      data: checkIn,
      totalStamps,
      message: `Check-in effectué pour "${event.title}"`,
    })
  } catch (error) {
    console.error('Error checking in:', error)
    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    )
  }
}
