'use client'

import { useState, useEffect } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import EventCard from '@/components/EventCard'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { EventPublicDTO } from '@/types'

interface Favorite {
  id: string
  userId: string
  eventId: string
  createdAt: string
  event: EventPublicDTO
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setLoading(true)

    // Check if user is logged in
    const userEmail = localStorage.getItem('user_email')
    if (!userEmail) {
      setIsLoggedIn(false)
      setLoading(false)
      return
    }

    setIsLoggedIn(true)

    try {
      // Get user ID from email
      const userRes = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`)
      const userData = await userRes.json()
      const uid = userData.data?.id

      if (!uid) {
        console.error('User not found')
        setLoading(false)
        return
      }

      setUserId(uid)

      // Fetch favorites
      const favRes = await fetch(`/api/users/${uid}/favorites`)
      if (favRes.ok) {
        const data = await favRes.json()
        setFavorites(data.data)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (eventId: string) => {
    if (!userId) return

    try {
      const res = await fetch(`/api/users/${userId}/favorites/${eventId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setFavorites((prev) => prev.filter((fav) => fav.eventId !== eventId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-0">
      <Navigation />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-bg-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-brand" />
              <h1 className="h1">Mes Favoris</h1>
            </div>
            <p className="text-muted-700">
              {favorites.length} événement{favorites.length !== 1 ? 's' : ''} sauvegardé{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-700">Chargement...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white p-12 text-center" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
              <div className="text-6xl mb-4">📋</div>
              <h2 className="h2 mb-2">
                Aucun favori pour le moment
              </h2>
              <p className="text-muted-700 mb-6">
                Ajoutez les événements qui vous intéressent pour les retrouver facilement.
              </p>
              <Button variant="primary" href="/">
                Découvrir les événements
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="relative">
                  <EventCard event={favorite.event} />
                  <button
                    onClick={() => handleRemoveFavorite(favorite.eventId)}
                    className="absolute top-4 right-4 z-10 p-2 bg-alert text-white rounded-full hover:bg-alert/90 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-alert focus:ring-offset-2"
                    aria-label="Retirer des favoris"
                    title="Retirer des favoris"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
