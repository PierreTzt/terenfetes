import { NextRequest, NextResponse } from 'next/server'
import { detectDuplicates } from '@/lib/deduplication'

/**
 * GET /api/admin/duplicates
 * Detect and return potential duplicate events
 */
export async function GET(request: NextRequest) {
  // Simple API key protection (for V1)
  // In production, replace with proper authentication (Supabase Auth + RLS)
  const apiKey = request.headers.get('x-api-key')

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const duplicates = await detectDuplicates()

    return NextResponse.json({
      duplicates,
      total: duplicates.length,
      message: duplicates.length === 0
        ? 'Aucun doublon détecté'
        : `${duplicates.length} doublons potentiels détectés`,
    })
  } catch (error) {
    console.error('Error in /api/admin/duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to detect duplicates' },
      { status: 500 }
    )
  }
}
