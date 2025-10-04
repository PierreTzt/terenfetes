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
  isSponsored?: boolean
  organizer?: {
    id: string
    name: string
    verified: boolean
  }
  badges?: string[]
  duration?: number
  indoor?: boolean
  pmr?: boolean
  weatherDependent?: boolean
  capacityTotal?: number
  capacityRemaining?: number
  isFavorite?: boolean
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

// User & Personalization types

export interface UserDTO {
  id: string
  email: string
  name?: string
  avatar?: string
  onboarded: boolean
  defaultCity?: string
  interests: string[]
  createdAt: string
}

export interface UserProfileDTO {
  id: string
  userId: string
  savedFilters?: any
  preferences?: any
  followedVenues: string[]
  followedCategories: string[]
  followedCities: string[]
}

export interface FavoriteDTO {
  id: string
  userId: string
  eventId: string
  event?: EventPublicDTO
  createdAt: string
}

export interface ReminderDTO {
  id: string
  userId: string
  eventId: string
  event?: EventPublicDTO
  type: 'email' | 'push' | 'sms'
  scheduledFor: string
  sent: boolean
}

export interface ItineraryDTO {
  id: string
  userId: string
  name: string
  eventIds: string[]
  events?: EventPublicDTO[]
  optimized?: {
    route: string[]
    distance: number
    duration: number
  }
  public: boolean
  createdAt: string
}

export interface CollaborativeListDTO {
  id: string
  userId: string
  userName?: string
  title: string
  description?: string
  public: boolean
  events?: EventPublicDTO[]
  itemCount?: number
  createdAt: string
}

export interface PhotoDTO {
  id: string
  eventId: string
  userId?: string
  userName?: string
  imageUrl: string
  moderated: boolean
  approved: boolean
  createdAt: string
}

export interface BadgeType {
  id: string
  label: string
  icon: string
  color: string
}

export const BADGE_TYPES: BadgeType[] = [
  { id: 'FREE', label: 'Gratuit', icon: '🎁', color: 'green' },
  { id: 'KIDS', label: 'Kids-friendly', icon: '👶', color: 'blue' },
  { id: 'PMR', label: 'PMR', icon: '♿', color: 'purple' },
  { id: 'DOG', label: 'Chien OK', icon: '🐕', color: 'orange' },
  { id: 'INDOOR', label: 'Intérieur', icon: '🏠', color: 'gray' },
  { id: 'OUTDOOR', label: 'Extérieur', icon: '🌳', color: 'green' },
  { id: 'STROLLER', label: 'Poussette', icon: '🍼', color: 'pink' },
  { id: 'CHANGING_TABLE', label: 'Table à langer', icon: '🚼', color: 'pink' },
  { id: 'QUIET_ZONE', label: 'Zone calme', icon: '🤫', color: 'blue' },
]
