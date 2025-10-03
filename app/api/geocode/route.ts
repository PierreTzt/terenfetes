import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress } from '@/utils/geocode'

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = process.env.METRICS_API_KEY

    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { address } = body

    if (!address) {
      return NextResponse.json(
        { error: 'address is required' },
        { status: 400 }
      )
    }

    const result = await geocodeAddress(address)

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to geocode address' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error geocoding:', error)
    return NextResponse.json(
      { error: 'Failed to geocode' },
      { status: 500 }
    )
  }
}
