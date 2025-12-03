'use client'

import { useState, useEffect } from 'react'
import { formatEventDate } from '@/utils/format'

interface CheckIn {
  id: string
  checkInDate: string
  verified: boolean
  event: {
    id: string
    title: string
    slug: string
    startAt: string
    imageUrl?: string
    venue?: {
      name: string
      city?: string
    }
    city?: string
  }
}

interface Partner {
  id: string
  name: string
  description?: string
  logo?: string
  offer: string
  stampsRequired: number
}

export default function PassportPage() {
  const [userId, setUserId] = useState('')
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [totalStamps, setTotalStamps] = useState(0)
  const [eligiblePartners, setEligiblePartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get or create userId from localStorage
    let storedUserId = localStorage.getItem('passport_user_id')
    if (!storedUserId) {
      storedUserId = `user_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem('passport_user_id', storedUserId)
    }
    setUserId(storedUserId)
    fetchPassport(storedUserId)
  }, [])

  const fetchPassport = async (uid: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/passport?userId=${uid}`)
      if (res.ok) {
        const data = await res.json()
        setCheckIns(data.data.checkIns)
        setTotalStamps(data.data.totalStamps)
        setEligiblePartners(data.data.eligiblePartners)
      }
    } catch (error) {
      console.error('Error fetching passport:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Mon Passeport Découverte Locale
          </h1>
          <p className="mt-2 text-gray-600">
            Collectez des tampons en participant à des événements locaux
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stamps counter */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Mes tampons</h2>
              <p className="text-blue-100">
                Collectez 5 tampons pour débloquer une récompense !
              </p>
            </div>
            <div className="text-6xl font-bold">
              {totalStamps}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="w-full bg-white/20 rounded-full h-4">
              <div
                className="bg-white rounded-full h-4 transition-all duration-500"
                style={{ width: `${Math.min((totalStamps / 5) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-blue-100 mt-2">
              {Math.max(5 - totalStamps, 0)} tampon{Math.max(5 - totalStamps, 0) !== 1 ? 's' : ''} restant{Math.max(5 - totalStamps, 0) !== 1 ? 's' : ''} avant la prochaine récompense
            </p>
          </div>
        </div>

        {/* Eligible partners */}
        {eligiblePartners.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Récompenses disponibles !
            </h2>
            <div className="space-y-3">
              {eligiblePartners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-lg p-4 flex items-start gap-4">
                  {partner.logo && (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{partner.offer}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      {partner.stampsRequired} tampons requis
                    </span>
                  </div>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                    Échanger
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check-ins list */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Mes événements ({checkIns.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Chargement...</p>
            </div>
          ) : checkIns.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">
                Aucun tampon pour le moment. Participez à des événements pour commencer !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checkIns.map((checkIn) => (
                <div key={checkIn.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {checkIn.event.title}
                    </h3>
                    {checkIn.verified && (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {checkIn.event.venue && (
                    <p className="text-sm text-gray-600 mb-2">
                      {checkIn.event.venue.name}
                    </p>
                  )}

                  <p className="text-xs text-gray-500">
                    Check-in: {new Date(checkIn.checkInDate).toLocaleDateString('fr-FR')}
                  </p>

                  <a
                    href={`/evenement/${checkIn.event.slug}`}
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Voir l'événement →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
