import { EventStatus, SourceKind } from '@prisma/client'

export interface EventIngestDTO {
  title: string
  description?: string
  startAt: string | Date
  endAt?: string | Date
  address?: string
  city?: string
  lat?: number
  lng?: number
  venueName?: string
  priceMin?: number
  priceMax?: number
  category?: string[]
  audience?: string[]
  imageUrl?: string
  url?: string
  sourceKind: SourceKind
  sourceUid?: string
}

export interface EventPublicDTO {
  id: string
  title: string
  slug: string
  description?: string
  startAt: string
  endAt?: string
  venue?: {
    name: string
    address?: string
    city?: string
    lat?: number
    lng?: number
  }
  price?: {
    min?: number
    max?: number
  }
  category: string[]
  audience: string[]
  imageUrl?: string
  url?: string
  city?: string
  lat?: number
  lng?: number
}

export interface GeocodedLocation {
  lat: number
  lng: number
  formattedAddress?: string
}

export interface NewsletterEventDTO {
  id: string
  title: string
  slug: string
  startAt: string
  imageUrl?: string
  city?: string
  venue?: string
  category: string[]
}
