import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/organizers/[id]/stats
 * Get statistics for an organizer's events
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  try {
    // Verify organizer exists
    const organizer = await prisma.organizer.findUnique({
      where: { id },
    })

    if (!organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      )
    }

    // Get all events for this organizer
    const events = await prisma.event.findMany({
      where: {
        organizerId: id,
      },
      include: {
        metrics: {
          where: {
            ...(from && { metricDate: { gte: new Date(from) } }),
            ...(to && { metricDate: { lte: new Date(to) } }),
          },
        },
      },
    })

    // Aggregate metrics
    const totalEvents = events.length
    const publishedEvents = events.filter((e) => e.status === 'PUBLISHED').length
    const pendingEvents = events.filter((e) => e.status === 'PENDING').length

    let totalViews = 0
    let totalClicksCta = 0
    let totalRsvpIntent = 0
    let totalTicketsSold = 0
    let totalRevenue = 0

    events.forEach((event) => {
      event.metrics.forEach((metric) => {
        totalViews += metric.views
        totalClicksCta += metric.clicksCta
        totalRsvpIntent += metric.rsvpIntent
        totalTicketsSold += metric.ticketsSold
        totalRevenue += metric.revenue ? parseFloat(metric.revenue.toString()) : 0
      })
    })

    // Get top performing events
    const topEvents = events
      .map((event) => {
        const views = event.metrics.reduce((sum, m) => sum + m.views, 0)
        const clicks = event.metrics.reduce((sum, m) => sum + m.clicksCta, 0)
        return {
          id: event.id,
          title: event.title,
          slug: event.slug,
          views,
          clicks,
          conversionRate: views > 0 ? (clicks / views) * 100 : 0,
        }
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    return NextResponse.json({
      data: {
        overview: {
          totalEvents,
          publishedEvents,
          pendingEvents,
          totalViews,
          totalClicksCta,
          totalRsvpIntent,
          totalTicketsSold,
          totalRevenue,
          avgConversionRate:
            totalViews > 0 ? ((totalClicksCta / totalViews) * 100).toFixed(2) : 0,
        },
        topEvents,
      },
    })
  } catch (error) {
    console.error('Error fetching organizer stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
