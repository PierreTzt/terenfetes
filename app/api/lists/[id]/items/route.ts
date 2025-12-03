import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/lists/[id]/items
 * Add an event to a list
 * Body: { eventId: string, notes?: string, order?: number }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { eventId, notes, order } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
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

    // Check if list exists
    const list = await prisma.collaborativeList.findUnique({
      where: { id },
    })

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      )
    }

    // Check if event is already in the list
    const existing = await prisma.listItem.findFirst({
      where: {
        listId: id,
        eventId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Event is already in this list' },
        { status: 409 }
      )
    }

    // Get the current max order
    const maxOrderItem = await prisma.listItem.findFirst({
      where: { listId: id },
      orderBy: { order: 'desc' },
    })

    const newOrder = order ?? ((maxOrderItem?.order || 0) + 1)

    // Create the item
    const item = await prisma.listItem.create({
      data: {
        listId: id,
        eventId,
        notes,
        order: newOrder,
      },
      include: {
        event: {
          select: {
            id: true,
            slug: true,
            title: true,
            startAt: true,
            city: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        data: {
          id: item.id,
          eventId: item.eventId,
          order: item.order,
          notes: item.notes || undefined,
          event: {
            id: item.event.id,
            slug: item.event.slug,
            title: item.event.title,
            startAt: item.event.startAt.toISOString(),
            city: item.event.city || undefined,
            imageUrl: item.event.imageUrl || undefined,
          },
        },
        message: 'Event added to list successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding event to list:', error)
    return NextResponse.json(
      { error: 'Failed to add event to list' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/lists/[id]/items
 * Reorder items in a list
 * Body: { items: Array<{ id: string, order: number }> }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'items array is required' },
        { status: 400 }
      )
    }

    // Update each item's order
    await Promise.all(
      items.map((item: { id: string; order: number }) =>
        prisma.listItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Items reordered successfully',
    })
  } catch (error) {
    console.error('Error reordering items:', error)
    return NextResponse.json(
      { error: 'Failed to reorder items' },
      { status: 500 }
    )
  }
}
