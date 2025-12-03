'use client'

import { useEffect, useState } from 'react'
import EventCard from './EventCard'

interface RecommendedEvent {
  id: string
  slug: string
  title: string
  startAt: string
  city?: string
  imageUrl?: string
  priceMin?: string
  priceMax?: string
  category: string[]
  badges?: string[]
  isSponsored?: boolean
  organizer?: {
    name: string
    verified: boolean
  }
  similarityScore: number
}

interface EventRecommendationsProps {
  eventSlug: string
  limit?: number
}

export default function EventRecommendations({
  eventSlug,
  limit = 6,
}: EventRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const res = await fetch(`/api/events/${eventSlug}/recommendations?limit=${limit}`)
        if (res.ok) {
          const data = await res.json()
          setRecommendations(data.data)
        }
      } catch (error) {
        console.error('Error loading recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [eventSlug, limit])

  if (loading) {
    return (
      <div className="mt-12 pt-12 border-t border-gray-200">
        <div className="text-center text-gray-500">Chargement des recommandations...</div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-white p-8" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
      <div className="mb-6">
        <h2 className="h2 mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Si vous aimez, vous aimerez aussi</span>
        </h2>
        <p className="text-muted-700">
          Événements similaires qui pourraient vous intéresser
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((event) => (
          <EventCard
            key={event.id}
            event={{
              id: event.id,
              slug: event.slug,
              title: event.title,
              startAt: event.startAt,
              city: event.city,
              imageUrl: event.imageUrl,
              priceMin: event.priceMin ? parseFloat(event.priceMin) : undefined,
              priceMax: event.priceMax ? parseFloat(event.priceMax) : undefined,
              category: event.category,
              badges: event.badges,
              isSponsored: event.isSponsored,
              organizer: event.organizer,
            }}
          />
        ))}
      </div>
    </div>
  )
}
