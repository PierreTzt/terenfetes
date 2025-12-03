import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/lists
 * Get all lists (public) or user's lists (with userId param)
 * Query params: userId (optional)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  try {
    const where: any = {}

    if (userId) {
      // Get user's lists (both public and private)
      where.OR = [
        { creatorId: userId },
        { collaborators: { has: userId } },
      ]
    } else {
      // Get only public lists
      where.isPublic = true
    }

    const lists = await prisma.collaborativeList.findMany({
      where,
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
                startAt: true,
                city: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      data: lists.map((list) => ({
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
        eventCount: list._count.items,
        items: list.items.map((item) => ({
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
        })),
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching lists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/lists
 * Create a new collaborative list
 * Body: { name: string, description?: string, isPublic?: boolean, creatorId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, isPublic, creatorId } = body

    if (!name || !creatorId) {
      return NextResponse.json(
        { error: 'name and creatorId are required' },
        { status: 400 }
      )
    }

    const list = await prisma.collaborativeList.create({
      data: {
        name,
        description,
        isPublic: isPublic ?? true,
        creatorId,
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

    return NextResponse.json(
      {
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
          eventCount: 0,
          items: [],
          createdAt: list.createdAt.toISOString(),
          updatedAt: list.updatedAt.toISOString(),
        },
        message: 'List created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating list:', error)
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    )
  }
}
