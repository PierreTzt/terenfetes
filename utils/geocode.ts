import { GeocodedLocation } from '@/types'

export async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
  const provider = process.env.GEOCODE_PROVIDER || 'opencage'
  const apiKey = process.env.GEOCODE_API_KEY

  if (!apiKey) {
    console.error('GEOCODE_API_KEY is not set')
    return null
  }

  try {
    if (provider === 'opencage') {
      return await geocodeOpenCage(address, apiKey)
    } else if (provider === 'mapbox') {
      return await geocodeMapbox(address, apiKey)
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

async function geocodeOpenCage(address: string, apiKey: string): Promise<GeocodedLocation | null> {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}&language=fr&countrycode=fr`

  const response = await fetch(url)
  const data = await response.json()

  if (data.results && data.results.length > 0) {
    const result = data.results[0]
    return {
      lat: result.geometry.lat,
      lng: result.geometry.lng,
      formattedAddress: result.formatted
    }
  }

  return null
}

async function geocodeMapbox(address: string, apiKey: string): Promise<GeocodedLocation | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${apiKey}&country=fr&language=fr`

  const response = await fetch(url)
  const data = await response.json()

  if (data.features && data.features.length > 0) {
    const feature = data.features[0]
    return {
      lng: feature.center[0],
      lat: feature.center[1],
      formattedAddress: feature.place_name
    }
  }

  return null
}
