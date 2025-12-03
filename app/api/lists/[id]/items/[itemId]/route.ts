import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/lists/[id]/items/[itemId]
 * Remove an event from a list
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params

  try {
    // Verify the item belongs to this list
    const item = await prisma.listItem.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (item.listId !== id) {
      return NextResponse.json(
        { error: 'Item does not belong to this list' },
        { status: 400 }
      )
    }

    // Delete the item
    await prisma.listItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({
      success: true,
      message: 'Event removed from list successfully',
    })
  } catch (error) {
    console.error('Error removing event from list:', error)
    return NextResponse.json(
      { error: 'Failed to remove event from list' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/lists/[id]/items/[itemId]
 * Update item notes
 * Body: { notes?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params

  try {
    const body = await request.json()
    const { notes } = body

    // Verify the item belongs to this list
    const item = await prisma.listItem.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (item.listId !== id) {
      return NextResponse.json(
        { error: 'Item does not belong to this list' },
        { status: 400 }
      )
    }

    // Update the item
    const updatedItem = await prisma.listItem.update({
      where: { id: itemId },
      data: { notes },
    })

    return NextResponse.json({
      data: {
        id: updatedItem.id,
        notes: updatedItem.notes || undefined,
      },
      message: 'Item updated successfully',
    })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}
