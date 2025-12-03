import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * Generate unsubscribe token from email
 * This is a simple HMAC-based approach for V1
 */
function generateUnsubscribeToken(email: string): string {
  const secret = process.env.WEBHOOK_SECRET || 'default-secret'
  return crypto
    .createHmac('sha256', secret)
    .update(email.toLowerCase())
    .digest('hex')
    .slice(0, 32)
}

/**
 * GET /api/newsletter/unsubscribe/[token]
 * Unsubscribe from newsletter (one-click)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const email = request.nextUrl.searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token et email requis' },
        { status: 400 }
      )
    }

    // Verify token matches email
    const expectedToken = generateUnsubscribeToken(email)

    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 400 }
      )
    }

    // Find subscriber
    const subscriber = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Abonnement introuvable' },
        { status: 404 }
      )
    }

    // Delete subscriber (hard delete for GDPR compliance)
    await prisma.subscriber.delete({
      where: { id: subscriber.id },
    })

    // Track unsubscribe
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('newsletter_unsubscribe', {
        email: subscriber.email,
      })
    }

    // Redirect to unsubscribe confirmation page
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed', request.url)
    )
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la désinscription' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to generate unsubscribe URL
 */
export function getUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}/api/newsletter/unsubscribe/${token}?email=${encodeURIComponent(email)}`
}
