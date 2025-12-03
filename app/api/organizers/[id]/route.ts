import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/organizers/[id]
 * Get a specific organizer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const organizer = await prisma.organizer.findUnique({
      where: { id },
      include: {
        events: {
          where: {
            status: 'PUBLISHED',
          },
          orderBy: {
            startAt: 'desc',
          },
          take: 10,
        },
        subscriptions: {
          where: {
            status: 'active',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    })

    if (!organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: organizer })
  } catch (error) {
    console.error('Error fetching organizer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizer' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/organizers/[id]
 * Update an organizer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { name, description, logo, website, phone } = body

    const organizer = await prisma.organizer.update({
      where: { id },
      data: {
        name,
        description,
        logo,
        website,
        phone,
      },
    })

    return NextResponse.json({ data: organizer })
  } catch (error) {
    console.error('Error updating organizer:', error)
    return NextResponse.json(
      { error: 'Failed to update organizer' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/organizers/[id]
 * Delete an organizer (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Check API key
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    await prisma.organizer.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting organizer:', error)
    return NextResponse.json(
      { error: 'Failed to delete organizer' },
      { status: 500 }
    )
  }
}
