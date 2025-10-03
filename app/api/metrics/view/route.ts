import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get or create today's metric record
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingMetric = await prisma.metricsEvent.findFirst({
      where: {
        eventId,
        metricDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    let metric
    if (existingMetric) {
      metric = await prisma.metricsEvent.update({
        where: { id: existingMetric.id },
        data: { views: { increment: 1 } }
      })
    } else {
      metric = await prisma.metricsEvent.create({
        data: {
          eventId,
          metricDate: today,
          views: 1
        }
      })
    }

    return NextResponse.json({ success: true, metric })
  } catch (error) {
    console.error('Error recording view:', error)
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    )
  }
}
