import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/newsletter/confirm/[token]
 * Confirm newsletter subscription
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      )
    }

    // Find subscriber with this confirmation token
    const subscriber = await prisma.subscriber.findFirst({
      where: {
        confirmToken: token,
        confirmed: false,
      },
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Token invalide ou déjà utilisé' },
        { status: 400 }
      )
    }

    // Update subscriber as confirmed
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        confirmed: true,
        confirmToken: null, // Clear token after confirmation
        confirmedAt: new Date(),
      },
    })

    // Track confirmation
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('newsletter_subscribe_confirmed', {
        email: subscriber.email,
      })
    }

    // Redirect to confirmation page
    return NextResponse.redirect(
      new URL('/newsletter/confirmed', request.url)
    )
  } catch (error) {
    console.error('Error confirming subscription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation' },
      { status: 500 }
    )
  }
}
