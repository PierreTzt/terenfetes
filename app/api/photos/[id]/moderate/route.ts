import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/photos/[id]/moderate
 * Approve or reject a photo
 * Body: { action: 'approve' | 'reject', notes?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { action, notes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Check if photo exists
    const photo = await prisma.photo.findUnique({
      where: { id },
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Update photo based on action
    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: {
        ...(action === 'approve' && {
          approvedAt: new Date(),
          rejectedAt: null,
        }),
        ...(action === 'reject' && {
          rejectedAt: new Date(),
          approvedAt: null,
        }),
        ...(notes && { moderationNotes: notes }),
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({
      data: {
        id: updatedPhoto.id,
        url: updatedPhoto.url,
        caption: updatedPhoto.caption || undefined,
        eventId: updatedPhoto.eventId,
        event: {
          id: updatedPhoto.event.id,
          slug: updatedPhoto.event.slug,
          title: updatedPhoto.event.title,
        },
        uploader: {
          id: updatedPhoto.uploader.id,
          name: updatedPhoto.uploader.name || undefined,
          email: updatedPhoto.uploader.email,
        },
        uploadedBy: updatedPhoto.uploadedBy,
        approvedAt: updatedPhoto.approvedAt?.toISOString() || undefined,
        rejectedAt: updatedPhoto.rejectedAt?.toISOString() || undefined,
        moderationNotes: updatedPhoto.moderationNotes || undefined,
        createdAt: updatedPhoto.createdAt.toISOString(),
      },
      message: `Photo ${action}d successfully`,
    })
  } catch (error) {
    console.error('Error moderating photo:', error)
    return NextResponse.json(
      { error: 'Failed to moderate photo' },
      { status: 500 }
    )
  }
}
