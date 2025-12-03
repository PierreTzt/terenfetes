'use client'

import { useState, useEffect } from 'react'

interface Partner {
  id: string
  name: string
  description?: string
  logo?: string
  address?: string
  city?: string
  category: string[]
  offer: string
  stampsRequired: number
}

export default function RewardsPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [userStamps, setUserStamps] = useState(0)

  useEffect(() => {
    fetchPartners()
    fetchUserStamps()
  }, [])

  const fetchPartners = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/partners')
      if (res.ok) {
        const data = await res.json()
        setPartners(data.data)
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStamps = async () => {
    const userId = localStorage.getItem('passport_user_id')
    if (userId) {
      try {
        const res = await fetch(`/api/passport?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setUserStamps(data.data.totalStamps)
        }
      } catch (error) {
        console.error('Error fetching user stamps:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Récompenses & Partenaires
          </h1>
          <p className="mt-2 text-gray-600">
            Échangez vos tampons contre des réductions et offres exclusives
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User stamps display */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900">
                Vous avez {userStamps} tampon{userStamps !== 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-blue-700 mt-1">
                Visitez des événements pour en collecter plus !
              </p>
            </div>
            <a
              href="/passeport"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Voir mon passeport
            </a>
          </div>
        </div>

        {/* Partners list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Chargement des partenaires...</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <p className="text-gray-500">
              Aucun partenaire disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => {
              const isEligible = userStamps >= partner.stampsRequired

              return (
                <div
                  key={partner.id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                    isEligible ? 'ring-2 ring-green-400' : ''
                  }`}
                >
                  {/* Logo */}
                  {partner.logo && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {partner.name}
                      </h3>
                      {isEligible && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Disponible
                        </span>
                      )}
                    </div>

                    {partner.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {partner.description}
                      </p>
                    )}

                    {/* Offer */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-900">
                          {partner.offer}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    {(partner.address || partner.city) && (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          {partner.address && partner.address}
                          {partner.city && `, ${partner.city}`}
                        </span>
                      </div>
                    )}

                    {/* Categories */}
                    {partner.category.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {partner.category.slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          {partner.stampsRequired} tampon{partner.stampsRequired !== 1 ? 's' : ''} requis
                        </span>
                        <button
                          disabled={!isEligible}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isEligible
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isEligible ? 'Échanger' : 'Indisponible'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
