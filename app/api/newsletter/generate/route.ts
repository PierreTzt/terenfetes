import { NextRequest, NextResponse } from 'next/server'
import { buildWeeklyNewsletter } from '@/lib/newsletter'

/**
 * GET /api/newsletter/generate
 * Generate and preview the weekly newsletter content
 * Protected with ADMIN_API_KEY
 */
export async function GET(request: NextRequest) {
  // Simple API key protection
  const apiKey = request.headers.get('x-api-key')

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { events, subject } = await buildWeeklyNewsletter()

    return NextResponse.json({
      success: true,
      subject,
      eventCount: events.length,
      events,
      message: `Newsletter générée avec ${events.length} événements`,
    })
  } catch (error) {
    console.error('Error generating newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to generate newsletter' },
      { status: 500 }
    )
  }
}
