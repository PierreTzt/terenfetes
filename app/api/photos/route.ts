import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/photos
 * Get photos, optionally filtered by eventId or userId
 * Query params: eventId, userId, status (optional)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const eventId = searchParams.get('eventId')
  const userId = searchParams.get('userId')
  const status = searchParams.get('status') // pending, approved, rejected

  try {
    const where: any = {}

    if (eventId) {
      where.eventId = eventId
    }

    if (userId) {
      where.uploadedBy = userId
    }

    if (status) {
      if (status === 'pending') {
        where.approvedAt = null
        where.rejectedAt = null
      } else if (status === 'approved') {
        where.approvedAt = { not: null }
      } else if (status === 'rejected') {
        where.rejectedAt = { not: null }
      }
    } else {
      // By default, only show approved photos
      where.approvedAt = { not: null }
    }

    const photos = await prisma.photo.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      data: photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption || undefined,
        eventId: photo.eventId,
        event: {
          id: photo.event.id,
          slug: photo.event.slug,
          title: photo.event.title,
        },
        uploader: {
          id: photo.uploader.id,
          name: photo.uploader.name || undefined,
          email: photo.uploader.email,
        },
        uploadedBy: photo.uploadedBy,
        approvedAt: photo.approvedAt?.toISOString() || undefined,
        rejectedAt: photo.rejectedAt?.toISOString() || undefined,
        moderationNotes: photo.moderationNotes || undefined,
        createdAt: photo.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/photos
 * Upload a new photo
 * Body: { url: string, caption?: string, eventId: string, uploadedBy: string }
 * Note: Actual file upload should be handled by a separate service (e.g., Cloudinary, S3)
 * This endpoint just creates the database record with the uploaded URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, caption, eventId, uploadedBy } = body

    if (!url || !eventId || !uploadedBy) {
      return NextResponse.json(
        { error: 'url, eventId, and uploadedBy are required' },
        { status: 400 }
      )
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: uploadedBy },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create photo (pending approval)
    const photo = await prisma.photo.create({
      data: {
        url,
        caption,
        eventId,
        uploadedBy,
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

    return NextResponse.json(
      {
        data: {
          id: photo.id,
          url: photo.url,
          caption: photo.caption || undefined,
          eventId: photo.eventId,
          event: {
            id: photo.event.id,
            slug: photo.event.slug,
            title: photo.event.title,
          },
          uploader: {
            id: photo.uploader.id,
            name: photo.uploader.name || undefined,
            email: photo.uploader.email,
          },
          uploadedBy: photo.uploadedBy,
          createdAt: photo.createdAt.toISOString(),
        },
        message: 'Photo uploaded successfully and is pending moderation',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
