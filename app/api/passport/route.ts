import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/passport?userId=xxx
 * Get user's passport (all check-ins/stamps)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    )
  }

  try {
    const checkIns = await prisma.userPassport.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startAt: true,
            imageUrl: true,
            venue: {
              select: {
                name: true,
                city: true,
              },
            },
            city: true,
          },
        },
      },
      orderBy: {
        checkInDate: 'desc',
      },
    })

    const totalStamps = checkIns.length
    const verifiedStamps = checkIns.filter((c) => c.verified).length

    // Get available partners and check eligibility
    const partners = await prisma.partner.findMany({
      where: {
        active: true,
        stampsRequired: {
          lte: totalStamps,
        },
      },
      orderBy: {
        stampsRequired: 'asc',
      },
    })

    return NextResponse.json({
      data: {
        checkIns: checkIns.map((c) => ({
          id: c.id,
          checkInDate: c.checkInDate.toISOString(),
          verified: c.verified,
          event: {
            id: c.event.id,
            title: c.event.title,
            slug: c.event.slug,
            startAt: c.event.startAt.toISOString(),
            imageUrl: c.event.imageUrl,
            venue: c.event.venue,
            city: c.event.city,
          },
        })),
        totalStamps,
        verifiedStamps,
        eligiblePartners: partners,
      },
    })
  } catch (error) {
    console.error('Error fetching passport:', error)
    return NextResponse.json(
      { error: 'Failed to fetch passport' },
      { status: 500 }
    )
  }
}
