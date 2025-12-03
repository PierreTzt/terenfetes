import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/users/[id]/favorites/[eventId] - Remove event from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  const { id, eventId } = await params

  try {
    // Check if favorite exists
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_eventId: {
          userId: id,
          eventId,
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      )
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: {
        userId_eventId: {
          userId: id,
          eventId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
