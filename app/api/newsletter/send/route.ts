import { NextRequest, NextResponse } from 'next/server'
import { buildWeeklyNewsletter, sendNewsletterToAllSubscribers } from '@/lib/newsletter'

/**
 * POST /api/newsletter/send
 * Generate and send the weekly newsletter to all confirmed subscribers
 * Protected with ADMIN_API_KEY
 */
export async function POST(request: NextRequest) {
  // Simple API key protection
  const apiKey = request.headers.get('x-api-key')

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Generate newsletter content
    const { events, subject } = await buildWeeklyNewsletter()

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'Aucun événement disponible pour la newsletter' },
        { status: 400 }
      )
    }

    // Send to all subscribers
    const results = await sendNewsletterToAllSubscribers(subject, events)

    // Track send
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('newsletter_sent', {
        subject,
        eventCount: events.length,
        recipientCount: results.successful,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter envoyée à ${results.successful} abonnés`,
      stats: {
        total: results.total,
        successful: results.successful,
        failed: results.failed,
        eventCount: events.length,
      },
      subject,
    })
  } catch (error) {
    console.error('Error sending newsletter:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send newsletter' },
      { status: 500 }
    )
  }
}
