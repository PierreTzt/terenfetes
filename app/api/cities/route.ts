import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/cities
 * Returns top 10 cities by event count
 */
export async function GET() {
  try {
    // Get cities with their event counts from published, future events
    const cityGroups = await prisma.event.groupBy({
      by: ['city'],
      where: {
        status: 'PUBLISHED',
        city: { not: null },
        startAt: { gte: new Date() }, // Only future events
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    // Format response
    const cities = cityGroups
      .filter((group) => group.city !== null)
      .map((group) => ({
        name: group.city as string,
        eventCount: group._count.id,
      }))

    return NextResponse.json({
      data: cities,
    })
  } catch (error) {
    console.error('Error fetching top cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
