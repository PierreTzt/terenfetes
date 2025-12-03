import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/organizers/[id]/verify
 * Verify or unverify an organizer (admin only)
 */
export async function POST(
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
    const body = await request.json()
    const { verified } = body

    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'verified must be a boolean' },
        { status: 400 }
      )
    }

    const organizer = await prisma.organizer.update({
      where: { id },
      data: {
        verified,
      },
    })

    // Track verification action
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('admin_verify_organizer', {
        organizerId: id,
        verified,
      })
    }

    return NextResponse.json({
      success: true,
      data: organizer,
      message: verified
        ? `Organisateur "${organizer.name}" vérifié avec succès`
        : `Vérification de "${organizer.name}" révoquée`,
    })
  } catch (error) {
    console.error('Error verifying organizer:', error)
    return NextResponse.json(
      { error: 'Failed to verify organizer' },
      { status: 500 }
    )
  }
}
