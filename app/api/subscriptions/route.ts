import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SubscriptionTier } from '@prisma/client'

/**
 * GET /api/subscriptions
 * List subscriptions with optional filters
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const organizerId = searchParams.get('organizerId')
  const status = searchParams.get('status')

  try {
    const where: any = {}

    if (organizerId) {
      where.organizerId = organizerId
    }

    if (status) {
      where.status = status
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ data: subscriptions })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscriptions
 * Create a new subscription or upgrade existing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizerId, tier, stripeId } = body

    if (!organizerId || !tier) {
      return NextResponse.json(
        { error: 'organizerId and tier are required' },
        { status: 400 }
      )
    }

    // Validate tier
    if (!['FREE', 'PRO'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be FREE or PRO' },
        { status: 400 }
      )
    }

    // Check if organizer exists
    const organizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
    })

    if (!organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      )
    }

    // Cancel any active subscriptions
    await prisma.subscription.updateMany({
      where: {
        organizerId,
        status: 'active',
      },
      data: {
        status: 'cancelled',
        endDate: new Date(),
      },
    })

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        organizerId,
        tier: tier as SubscriptionTier,
        stripeId,
        status: 'active',
      },
    })

    // Update organizer tier
    await prisma.organizer.update({
      where: { id: organizerId },
      data: {
        subscriptionTier: tier as SubscriptionTier,
      },
    })

    // Track subscription action
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('subscription_created', {
        organizerId,
        tier,
      })
    }

    return NextResponse.json(
      {
        data: subscription,
        message: `Abonnement ${tier} créé avec succès`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
