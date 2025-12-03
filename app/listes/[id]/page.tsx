'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import EventCard from '@/components/EventCard'

interface ListItem {
  id: string
  eventId: string
  order: number
  notes?: string
  event: {
    id: string
    slug: string
    title: string
    description?: string
    startAt: string
    endAt?: string
    city?: string
    address?: string
    imageUrl?: string
    priceMin?: string
    priceMax?: string
    category: string[]
    badges?: string[]
  }
}

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
  collaborators: string[]
  items: ListItem[]
  createdAt: string
  updatedAt: string
}

export default function ListDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [list, setList] = useState<List | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const loadList = async () => {
      try {
        // Get user ID if logged in
        const storedUserId = localStorage.getItem('user_id')
        if (storedUserId) {
          const userEmail = `${storedUserId}@temp.com`
          const userRes = await fetch(`/api/users?email=${userEmail}`)
          if (userRes.ok) {
            const userData = await userRes.json()
            const actualUserId = userData.data?.id
            setUserId(actualUserId)
          }
        }

        // Fetch list
        const res = await fetch(`/api/lists/${id}`)
        if (res.ok) {
          const data = await res.json()
          setList(data.data)

          // Check if user is the owner
          if (userId && data.data.creator.id === userId) {
            setIsOwner(true)
          }
        } else {
          router.push('/listes')
        }
      } catch (error) {
        console.error('Error loading list:', error)
        router.push('/listes')
      } finally {
        setLoading(false)
      }
    }

    loadList()
  }, [id, router, userId])

  const handleDeleteList = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
      return
    }

    try {
      const res = await fetch(`/api/lists/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/listes')
      } else {
        alert('Erreur lors de la suppression de la liste')
      }
    } catch (error) {
      console.error('Error deleting list:', error)
      alert('Erreur lors de la suppression de la liste')
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet événement de la liste ?')) {
      return
    }

    try {
      const res = await fetch(`/api/lists/${id}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok && list) {
        setList({
          ...list,
          items: list.items.filter((item) => item.id !== itemId),
        })
      } else {
        alert('Erreur lors du retrait de l\'événement')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Erreur lors du retrait de l\'événement')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  if (!list) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {list.name}
                </h1>
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
                <p className="text-gray-600 mt-2">{list.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>👤</span>
                  <span>
                    Par {list.creator.name || list.creator.email.split('@')[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>
                    {list.items.length} événement{list.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/listes"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Retour
              </a>
              {isOwner && (
                <button
                  onClick={handleDeleteList}
                  className="px-4 py-2 border-2 border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {list.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Liste vide
            </h2>
            <p className="text-gray-600 mb-6">
              Cette liste ne contient pas encore d'événements
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Parcourir les événements
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.items.map((item) => (
              <div key={item.id} className="relative">
                <EventCard
                  event={{
                    id: item.event.id,
                    slug: item.event.slug,
                    title: item.event.title,
                    startAt: item.event.startAt,
                    city: item.event.city,
                    imageUrl: item.event.imageUrl,
                    priceMin: item.event.priceMin ? parseFloat(item.event.priceMin) : undefined,
                    priceMax: item.event.priceMax ? parseFloat(item.event.priceMax) : undefined,
                    category: item.event.category,
                    badges: item.event.badges,
                  }}
                />
                {isOwner && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg z-10"
                    title="Retirer de la liste"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                {item.notes && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-gray-700">{item.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
