import { NextRequest, NextResponse } from 'next/server'
import { mergeEvents } from '@/lib/deduplication'

/**
 * POST /api/admin/duplicates/merge
 * Merge two duplicate events
 * Body: { primaryId: string, secondaryId: string }
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
    const { primaryId, secondaryId } = await request.json()

    if (!primaryId || !secondaryId) {
      return NextResponse.json(
        { error: 'primaryId and secondaryId are required' },
        { status: 400 }
      )
    }

    if (primaryId === secondaryId) {
      return NextResponse.json(
        { error: 'Cannot merge an event with itself' },
        { status: 400 }
      )
    }

    const result = await mergeEvents(primaryId, secondaryId)

    // Track merge event
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('admin_merge_duplicates', {
        primaryId,
        secondaryId,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Événements fusionnés avec succès. L'événement ${secondaryId} a été archivé.`,
      result,
    })
  } catch (error) {
    console.error('Error merging events:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to merge events' },
      { status: 500 }
    )
  }
}
