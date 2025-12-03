'use client'

import { useState, useEffect } from 'react'
import { formatEventDate, formatPrice } from '@/utils/format'

interface OrganizerStats {
  overview: {
    totalEvents: number
    publishedEvents: number
    pendingEvents: number
    totalViews: number
    totalClicksCta: number
    totalRsvpIntent: number
    totalTicketsSold: number
    totalRevenue: number
    avgConversionRate: string
  }
  topEvents: Array<{
    id: string
    title: string
    slug: string
    views: number
    clicks: number
    conversionRate: number
  }>
}

interface Organizer {
  id: string
  name: string
  email: string
  verified: boolean
  subscriptionTier: 'FREE' | 'PRO'
  featuredThisMonth: boolean
  featuredDate?: string
}

export default function OrganizerDashboard() {
  const [organizerId, setOrganizerId] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  const [stats, setStats] = useState<OrganizerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async () => {
    if (!organizerId) {
      setError('ID organisateur requis')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Fetch organizer data
      const orgRes = await fetch(`/api/organizers/${organizerId}`)
      if (!orgRes.ok) {
        throw new Error('Organisateur non trouvé')
      }
      const orgData = await orgRes.json()
      setOrganizer(orgData.data)

      // Fetch stats
      const statsRes = await fetch(`/api/organizers/${organizerId}/stats`)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      setIsAuthenticated(true)
      sessionStorage.setItem('organizer_id', organizerId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // Try to restore session
  useEffect(() => {
    const storedId = sessionStorage.getItem('organizer_id')
    if (storedId) {
      setOrganizerId(storedId)
      setTimeout(() => handleAuth(), 100)
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Dashboard Organisateur
          </h1>

          <div className="mb-4">
            <label htmlFor="organizerId" className="block text-sm font-medium text-gray-700 mb-2">
              ID Organisateur
            </label>
            <input
              type="text"
              id="organizerId"
              value={organizerId}
              onChange={(e) => setOrganizerId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Entrez votre ID"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Accéder au dashboard'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {organizer?.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${
                organizer?.subscriptionTier === 'PRO'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {organizer?.subscriptionTier}
              </span>
              {organizer?.verified && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Vérifié
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsAuthenticated(false)
              setOrganizerId('')
              sessionStorage.removeItem('organizer_id')
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-500 mb-2">Événements totaux</div>
                <div className="text-3xl font-bold text-gray-900">{stats.overview.totalEvents}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.overview.publishedEvents} publiés · {stats.overview.pendingEvents} en attente
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-500 mb-2">Vues totales</div>
                <div className="text-3xl font-bold text-gray-900">{stats.overview.totalViews.toLocaleString()}</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-500 mb-2">Clics CTA</div>
                <div className="text-3xl font-bold text-gray-900">{stats.overview.totalClicksCta}</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-500 mb-2">Taux de conversion</div>
                <div className="text-3xl font-bold text-gray-900">{stats.overview.avgConversionRate}%</div>
              </div>
            </div>

            {/* Top Events */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Top 5 événements
              </h2>

              {stats.topEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucune donnée disponible
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.topEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <a
                          href={`/evenement/${event.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Voir l'événement →
                        </a>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{event.views} vues</div>
                        <div className="text-sm text-gray-500">{event.clicks} clics · {event.conversionRate.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Upgrade CTA for FREE tier */}
        {organizer?.subscriptionTier === 'FREE' && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Passez à l'abonnement PRO
            </h2>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Badge "Organisateur Vérifié"
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Mise en avant 1x/mois
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Statistiques détaillées
              </li>
            </ul>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              En savoir plus
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
