import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/lists/[id]
 * Get a specific list by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const list = await prisma.collaborativeList.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            event: {
              select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                startAt: true,
                endAt: true,
                city: true,
                address: true,
                imageUrl: true,
                priceMin: true,
                priceMax: true,
                category: true,
                badges: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        id: list.id,
        name: list.name,
        description: list.description || undefined,
        isPublic: list.isPublic,
        creator: {
          id: list.creator.id,
          name: list.creator.name || undefined,
          email: list.creator.email,
        },
        collaborators: list.collaborators,
        items: list.items.map((item) => ({
          id: item.id,
          eventId: item.eventId,
          order: item.order,
          notes: item.notes || undefined,
          event: {
            id: item.event.id,
            slug: item.event.slug,
            title: item.event.title,
            description: item.event.description || undefined,
            startAt: item.event.startAt.toISOString(),
            endAt: item.event.endAt?.toISOString() || undefined,
            city: item.event.city || undefined,
            address: item.event.address || undefined,
            imageUrl: item.event.imageUrl || undefined,
            priceMin: item.event.priceMin?.toString() || undefined,
            priceMax: item.event.priceMax?.toString() || undefined,
            category: item.event.category,
            badges: item.event.badges,
          },
        })),
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch list' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/lists/[id]
 * Update a list (name, description, isPublic, collaborators)
 * Body: { name?: string, description?: string, isPublic?: boolean, collaborators?: string[] }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { name, description, isPublic, collaborators } = body

    const list = await prisma.collaborativeList.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(collaborators !== undefined && { collaborators }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      data: {
        id: list.id,
        name: list.name,
        description: list.description || undefined,
        isPublic: list.isPublic,
        creator: {
          id: list.creator.id,
          name: list.creator.name || undefined,
          email: list.creator.email,
        },
        collaborators: list.collaborators,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
      },
      message: 'List updated successfully',
    })
  } catch (error) {
    console.error('Error updating list:', error)
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/lists/[id]
 * Delete a list
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await prisma.collaborativeList.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'List deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting list:', error)
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    )
  }
}
