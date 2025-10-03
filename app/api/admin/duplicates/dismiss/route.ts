import { NextRequest, NextResponse } from 'next/server'
import { markNotDuplicate } from '@/lib/deduplication'

/**
 * POST /api/admin/duplicates/dismiss
 * Mark two events as NOT duplicates (false positive)
 * Body: { event1Id: string, event2Id: string }
 */
export async function POST(request: NextRequest) {
  // Simple API key protection (for V1)
  const apiKey = request.headers.get('x-api-key')

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { event1Id, event2Id } = await request.json()

    if (!event1Id || !event2Id) {
      return NextResponse.json(
        { error: 'event1Id and event2Id are required' },
        { status: 400 }
      )
    }

    const result = await markNotDuplicate(event1Id, event2Id)

    // Track dismiss event
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('admin_dismiss_duplicate', {
        event1Id,
        event2Id,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Paire marquée comme non-doublon',
      result,
    })
  } catch (error) {
    console.error('Error dismissing duplicate:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss duplicate' },
      { status: 500 }
    )
  }
}
