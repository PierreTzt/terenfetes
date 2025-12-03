'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface List {
  id: string
  name: string
  description?: string
  isPublic: boolean
  creator: {
    id: string
    name?: string
    email: string
  }
  eventCount: number
  createdAt: string
}

export default function ListsPage() {
  const router = useRouter()
  const [lists, setLists] = useState<List[]>([])
  const [myLists, setMyLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showMyLists, setShowMyLists] = useState(false)

  useEffect(() => {
    const loadLists = async () => {
      try {
        // Get user ID if logged in
        const storedUserId = localStorage.getItem('user_id')
        if (storedUserId) {
          setUserId(storedUserId)
          const userEmail = `${storedUserId}@temp.com`

          // Get actual user ID from database
          const userRes = await fetch(`/api/users?email=${userEmail}`)
          if (userRes.ok) {
            const userData = await userRes.json()
            const actualUserId = userData.data?.id

            if (actualUserId) {
              // Fetch user's lists
              const myListsRes = await fetch(`/api/lists?userId=${actualUserId}`)
              if (myListsRes.ok) {
                const myListsData = await myListsRes.json()
                setMyLists(myListsData.data)
              }
            }
          }
        }

        // Fetch public lists
        const res = await fetch('/api/lists')
        if (res.ok) {
          const data = await res.json()
          setLists(data.data)
        }
      } catch (error) {
        console.error('Error loading lists:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLists()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  const displayedLists = showMyLists ? myLists : lists

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Listes collaboratives
              </h1>
              <p className="mt-2 text-gray-600">
                Créez et partagez des sélections d'événements
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Retour
              </a>
              {userId && (
                <button
                  onClick={() => router.push('/listes/nouvelle')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  + Créer une liste
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userId && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setShowMyLists(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showMyLists
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Toutes les listes ({lists.length})
            </button>
            <button
              onClick={() => setShowMyLists(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showMyLists
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Mes listes ({myLists.length})
            </button>
          </div>
        )}

        {displayedLists.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {showMyLists ? 'Aucune liste créée' : 'Aucune liste publique'}
            </h2>
            <p className="text-gray-600 mb-6">
              {showMyLists
                ? 'Créez votre première liste pour organiser vos événements favoris'
                : 'Soyez le premier à créer et partager une liste d\'événements'}
            </p>
            {userId && (
              <button
                onClick={() => router.push('/listes/nouvelle')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Créer une liste
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedLists.map((list) => (
              <a
                key={list.id}
                href={`/listes/${list.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1">
                    {list.name}
                  </h3>
                  {list.isPublic ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Public
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      Privé
                    </span>
                  )}
                </div>

                {list.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {list.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>
                      {list.eventCount} événement{list.eventCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👤</span>
                    <span className="truncate max-w-[120px]">
                      {list.creator.name || list.creator.email.split('@')[0]}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
