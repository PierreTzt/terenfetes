'use client'

import { useEffect, useState } from 'react'
import EventCard from './EventCard'

interface Event {
  id: string
  title: string
  slug: string
  startAt: string
  city?: string
  imageUrl?: string
  priceMin?: number
  priceMax?: number
  category: string[]
  badges?: string[]
  isSponsored?: boolean
  organizer?: {
    name: string
    verified: boolean
  }
}

export default function PersonalizedSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [hasUser, setHasUser] = useState(false)

  useEffect(() => {
    const loadPersonalizedEvents = async () => {
      // Check if user is logged in
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        setLoading(false)
        return
      }

      const userEmail = `${userId}@temp.com`

      try {
        // Fetch user data to get interests
        const userRes = await fetch(`/api/users?email=${userEmail}`)
        if (!userRes.ok) {
          setLoading(false)
          return
        }

        const userData = await userRes.json()
        const user = userData.data

        if (!user.onboarded || !user.interests || user.interests.length === 0) {
          setLoading(false)
          return
        }

        setHasUser(true)

        // Fetch events matching user interests
        // We'll fetch events for each interest and combine them
        const allEvents: Event[] = []
        const eventIds = new Set<string>()

        for (const interest of user.interests) {
          const params = new URLSearchParams({
            status: 'PUBLISHED',
            from: new Date().toISOString().split('T')[0],
            category: interest,
            limit: '5',
          })

          // Add indoor preference if set
          if (user.profile?.preferences?.indoor) {
            params.append('indoor', 'true')
          } else if (user.profile?.preferences?.outdoor) {
            params.append('indoor', 'false')
          }

          // Add free filter if set
          if (user.profile?.preferences?.free) {
            params.append('priceMax', '0')
          }

          // Add family badge if set
          if (user.profile?.preferences?.family) {
            params.append('badge', 'KIDS')
          }

          // Add city filter if set
          if (user.defaultCity) {
            params.append('city', user.defaultCity)
          }

          const res = await fetch(`/api/events?${params.toString()}`)
          if (res.ok) {
            const data = await res.json()
            // Add unique events only
            for (const event of data.data) {
              if (!eventIds.has(event.id)) {
                eventIds.add(event.id)
                allEvents.push(event)
              }
            }
          }
        }

        // Sort by date and limit to 6 events
        allEvents.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
        setEvents(allEvents.slice(0, 6))
      } catch (error) {
        console.error('Error loading personalized events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPersonalizedEvents()
  }, [])

  if (loading) {
    return null // Don't show anything while loading
  }

  if (!hasUser || events.length === 0) {
    return null // Don't show section if no personalized content
  }

  return (
    <div className="mb-12 pb-8 border-b border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>✨</span>
            <span>Pour vous</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Recommandations basées sur vos centres d'intérêt
          </p>
        </div>
        <a
          href="/profil"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Modifier mes préférences →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Événements recommandés pour vous">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
