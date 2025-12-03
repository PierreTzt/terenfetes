import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/organizers
 * List all organizers with optional filters
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const verified = searchParams.get('verified')
  const tier = searchParams.get('tier')

  try {
    const where: any = {}

    if (verified !== null) {
      where.verified = verified === 'true'
    }

    if (tier) {
      where.subscriptionTier = tier
    }

    const organizers = await prisma.organizer.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        website: true,
        verified: true,
        subscriptionTier: true,
        createdAt: true,
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ data: organizers })
  } catch (error) {
    console.error('Error fetching organizers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizers' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizers
 * Create a new organizer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, description, logo, website, phone } = body

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Check if organizer already exists
    const existing = await prisma.organizer.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Organizer with this email already exists' },
        { status: 409 }
      )
    }

    const organizer = await prisma.organizer.create({
      data: {
        email,
        name,
        description,
        logo,
        website,
        phone,
      },
    })

    return NextResponse.json(
      { data: organizer },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating organizer:', error)
    return NextResponse.json(
      { error: 'Failed to create organizer' },
      { status: 500 }
    )
  }
}
