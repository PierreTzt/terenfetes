'use client'

import { useState, useEffect } from 'react'
import { formatEventDate, formatPrice } from '@/utils/format'

interface Event {
  id: string
  title: string
  slug: string
  description?: string
  startAt: string
  venue?: {
    name: string
    city?: string
  }
  price?: {
    min?: number
    max?: number
  }
  category: string[]
  imageUrl?: string
  url?: string
  city?: string
  createdAt: string
}

export default function ModerationPage() {
  const [apiKey, setApiKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [geocodeCount, setGeocodeCount] = useState<number | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeMessage, setGeocodeMessage] = useState('')

  const handleAuth = async () => {
    if (!apiKey) {
      setError('Clé API requise')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Test API key by fetching events
      const res = await fetch('/api/events?status=PENDING&limit=100', {
        headers: {
          'x-api-key': apiKey,
        },
      })

      if (!res.ok) {
        throw new Error('Clé API invalide')
      }

      const data = await res.json()
      setEvents(data.data || [])
      setIsAuthenticated(true)

      // Store API key in sessionStorage
      sessionStorage.setItem('admin_api_key', apiKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'authentification')
    } finally {
      setLoading(false)
    }
  }

  const handleModerate = async (eventId: string, action: 'publish' | 'reject') => {
    const reason = action === 'reject' ? prompt('Raison du rejet (optionnel):') : undefined

    try {
      const res = await fetch(`/api/events/${eventId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ action, reason }),
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la modération')
      }

      // Remove event from list
      setEvents((prev) => prev.filter((e) => e.id !== eventId))

      alert(`Événement ${action === 'publish' ? 'publié' : 'rejeté'} avec succès`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur')
    }
  }

  const fetchGeocodeCount = async () => {
    try {
      const res = await fetch('/api/admin/geocode-events', {
        headers: {
          'x-api-key': apiKey,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setGeocodeCount(data.count)
      }
    } catch (err) {
      console.error('Error fetching geocode count:', err)
    }
  }

  const handleGeocode = async () => {
    if (!confirm('Voulez-vous géocoder les événements sans coordonnées ? Cela peut prendre quelques minutes.')) {
      return
    }

    setGeocoding(true)
    setGeocodeMessage('')

    try {
      const res = await fetch('/api/admin/geocode-events', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
      })

      if (!res.ok) {
        throw new Error('Erreur lors du géocodage')
      }

      const data = await res.json()
      setGeocodeMessage(data.message)

      // Refresh count after geocoding
      await fetchGeocodeCount()
    } catch (err) {
      setGeocodeMessage(err instanceof Error ? err.message : 'Erreur lors du géocodage')
    } finally {
      setGeocoding(false)
    }
  }

  // Try to restore session on mount
  useEffect(() => {
    const storedKey = sessionStorage.getItem('admin_api_key')
    if (storedKey) {
      setApiKey(storedKey)
      // Auto-authenticate
      setTimeout(() => {
        const button = document.getElementById('auth-button')
        button?.click()
      }, 100)
    }
  }, [])

  // Fetch geocode count when authenticated
  useEffect(() => {
    if (isAuthenticated && apiKey) {
      fetchGeocodeCount()
    }
  }, [isAuthenticated, apiKey])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔐 Administration
          </h1>

          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              Clé API Admin
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Entrez votre clé API"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            id="auth-button"
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Se connecter'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Modération des événements
          </h1>
          <button
            onClick={() => {
              setIsAuthenticated(false)
              setApiKey('')
              sessionStorage.removeItem('admin_api_key')
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Geocoding Tool */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                🗺️ Géocodage automatique
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Ajoutez automatiquement les coordonnées GPS (latitude/longitude) aux événements qui n'en ont pas.
              </p>
              {geocodeCount !== null && (
                <p className="text-sm font-medium text-gray-900">
                  {geocodeCount === 0 ? (
                    <span className="text-green-600">✓ Tous les événements ont des coordonnées</span>
                  ) : (
                    <span className="text-orange-600">
                      {geocodeCount} événement{geocodeCount > 1 ? 's' : ''} sans coordonnées
                    </span>
                  )}
                </p>
              )}
              {geocodeMessage && (
                <p className="text-sm mt-2 text-blue-600">
                  {geocodeMessage}
                </p>
              )}
            </div>
            <button
              onClick={handleGeocode}
              disabled={geocoding || geocodeCount === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {geocoding ? 'Géocodage...' : 'Géocoder maintenant'}
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 text-lg">Aucun événement en attente de modération</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {events.length} événement{events.length > 1 ? 's' : ''} en attente
              </p>
            </div>

            <div className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex gap-6">
                    {/* Image */}
                    {event.imageUrl && (
                      <div className="flex-shrink-0 w-48 h-32 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Date:</span>{' '}
                          <span className="text-gray-900 font-medium">
                            {formatEventDate(event.startAt)}
                          </span>
                        </div>

                        {event.venue && (
                          <div>
                            <span className="text-gray-500">Lieu:</span>{' '}
                            <span className="text-gray-900 font-medium">
                              {event.venue.name}
                              {event.venue.city && `, ${event.venue.city}`}
                            </span>
                          </div>
                        )}

                        {event.price && (event.price.min !== undefined || event.price.max !== undefined) && (
                          <div>
                            <span className="text-gray-500">Prix:</span>{' '}
                            <span className="text-gray-900 font-medium">
                              {formatPrice(event.price.min, event.price.max)}
                            </span>
                          </div>
                        )}

                        {event.category.length > 0 && (
                          <div>
                            <span className="text-gray-500">Catégories:</span>{' '}
                            <span className="text-gray-900 font-medium">
                              {event.category.slice(0, 3).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {event.url && (
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                        >
                          Voir le site externe →
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-col gap-3">
                      <button
                        onClick={() => handleModerate(event.id, 'publish')}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                      >
                        ✓ Publier
                      </button>
                      <button
                        onClick={() => handleModerate(event.id, 'reject')}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                      >
                        ✗ Rejeter
                      </button>
                      <a
                        href={`/evenement/${event.slug}`}
                        target="_blank"
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 text-center"
                      >
                        Prévisualiser
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
