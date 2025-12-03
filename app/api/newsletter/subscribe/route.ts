import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { checkRateLimit } from '@/lib/rate-limit'
import ConfirmSubscriptionEmail from '@/emails/ConfirmSubscription'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter with double opt-in
 * Body: { email: string, firstName?: string }
 */
export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  // Rate limiting: 3 subscriptions per hour per IP
  const rateLimit = checkRateLimit(`newsletter_subscribe:${clientIp}`, 3, 60 * 60 * 1000)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.',
        resetAt: rateLimit.resetAt,
      },
      { status: 429 }
    )
  }

  try {
    const { email, firstName } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email valide requis' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (existing.confirmed) {
        return NextResponse.json(
          { error: 'Cet email est déjà inscrit à la newsletter' },
          { status: 400 }
        )
      } else {
        // Re-send confirmation email
        const confirmToken = existing.confirmToken!
        const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/confirm/${confirmToken}`

        await resend.emails.send({
          from: 'Territoire en Fête <newsletter@territoireenfete.fr>',
          to: normalizedEmail,
          subject: 'Confirmez votre inscription à la newsletter',
          react: ConfirmSubscriptionEmail({ email: normalizedEmail, confirmUrl }),
        })

        return NextResponse.json({
          success: true,
          message: 'Email de confirmation renvoyé. Veuillez vérifier votre boîte de réception.',
        })
      }
    }

    // Generate confirmation token
    const confirmToken = crypto.randomBytes(32).toString('hex')

    // Create subscriber
    await prisma.subscriber.create({
      data: {
        email: normalizedEmail,
        firstName: firstName || undefined,
        confirmed: false,
        confirmToken,
      },
    })

    // Send confirmation email
    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/confirm/${confirmToken}`

    await resend.emails.send({
      from: 'Territoire en Fête <newsletter@territoireenfete.fr>',
      to: normalizedEmail,
      subject: 'Confirmez votre inscription à la newsletter',
      react: ConfirmSubscriptionEmail({ email: normalizedEmail, confirmUrl }),
    })

    // Track subscription
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('newsletter_subscribe_request', {
        email: normalizedEmail,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Email de confirmation envoyé. Veuillez vérifier votre boîte de réception.',
    })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
