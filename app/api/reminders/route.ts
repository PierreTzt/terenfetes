import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/reminders?userId=xxx
 * Get user's reminders
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    )
  }

  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startAt: true,
            imageUrl: true,
            city: true,
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    })

    const remindersDTO = reminders.map((reminder) => ({
      id: reminder.id,
      userId: reminder.userId,
      eventId: reminder.eventId,
      type: reminder.type,
      scheduledFor: reminder.scheduledFor.toISOString(),
      sent: reminder.sent,
      event: {
        id: reminder.event.id,
        title: reminder.event.title,
        slug: reminder.event.slug,
        startAt: reminder.event.startAt.toISOString(),
        imageUrl: reminder.event.imageUrl || undefined,
        city: reminder.event.city || undefined,
      },
    }))

    return NextResponse.json({ data: remindersDTO })
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reminders
 * Create a reminder for an event
 * Body: { userId: string, eventId: string, type: 'email'|'push', scheduledFor: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, eventId, type = 'email', scheduledFor } = body

    if (!userId || !eventId || !scheduledFor) {
      return NextResponse.json(
        { error: 'userId, eventId, and scheduledFor are required' },
        { status: 400 }
      )
    }

    if (!['email', 'push', 'sms'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be email, push, or sms' },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Create reminder
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        eventId,
        type,
        scheduledFor: new Date(scheduledFor),
      },
    })

    return NextResponse.json(
      {
        data: {
          id: reminder.id,
          userId: reminder.userId,
          eventId: reminder.eventId,
          type: reminder.type,
          scheduledFor: reminder.scheduledFor.toISOString(),
          sent: reminder.sent,
        },
        message: 'Reminder created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/reminders/[id]
 * Delete a reminder
 */
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    await prisma.reminder.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Reminder deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    )
  }
}
