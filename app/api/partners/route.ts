import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/partners
 * List all active partners
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get('city')

  try {
    const where: any = {
      active: true,
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    const partners = await prisma.partner.findMany({
      where,
      orderBy: {
        stampsRequired: 'asc',
      },
    })

    return NextResponse.json({ data: partners })
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/partners
 * Create a new partner (admin only)
 */
export async function POST(request: NextRequest) {
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
    const {
      name,
      description,
      logo,
      address,
      city,
      category,
      offer,
      stampsRequired = 5,
    } = body

    if (!name || !offer) {
      return NextResponse.json(
        { error: 'name and offer are required' },
        { status: 400 }
      )
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        description,
        logo,
        address,
        city,
        category: category || [],
        offer,
        stampsRequired,
      },
    })

    return NextResponse.json(
      { data: partner },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    )
  }
}
