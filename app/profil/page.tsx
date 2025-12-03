'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

const CITIES = [
  'Saint-Saulve',
  'Valenciennes',
  'Anzin',
  'Marly',
  'Aulnoy-lez-Valenciennes',
  'Bruay-sur-L\'Escaut',
  'Petite-Forêt',
  'Onnaing',
  'Trith-Saint-Léger',
  'Beuvrages',
]

const INTERESTS = [
  { id: 'music', label: 'Musique', icon: '🎵' },
  { id: 'art', label: 'Art & Culture', icon: '🎨' },
  { id: 'sport', label: 'Sport', icon: '⚽' },
  { id: 'food', label: 'Gastronomie', icon: '🍽️' },
  { id: 'nature', label: 'Nature', icon: '🌳' },
  { id: 'tech', label: 'Tech & Innovation', icon: '💻' },
  { id: 'family', label: 'Famille & Enfants', icon: '👨‍👩‍👧' },
  { id: 'nightlife', label: 'Vie nocturne', icon: '🌙' },
  { id: 'wellness', label: 'Bien-être', icon: '🧘' },
  { id: 'education', label: 'Éducation', icon: '📚' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // User data
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  // Profile preferences
  const [preferences, setPreferences] = useState({
    accessibility: false,
    family: false,
    indoor: false,
    outdoor: false,
    free: false,
  })

  useEffect(() => {
    const loadProfile = async () => {
      // Get user email
      const userEmail = localStorage.getItem('user_email')
      if (!userEmail) {
        router.push('/connexion')
        return
      }

      try {
        // Fetch user data
        const userRes = await fetch(`/api/users?email=${userEmail}`)
        if (!userRes.ok) {
          router.push('/onboarding')
          return
        }

        const userData = await userRes.json()
        const user = userData.data

        if (!user) {
          router.push('/connexion')
          return
        }

        if (!user.onboarded) {
          router.push('/onboarding')
          return
        }

        setUserId(user.id)
        setEmail(user.email)
        setName(user.name || '')
        setSelectedInterests(user.interests || [])

        // Handle city
        if (user.defaultCity) {
          if (CITIES.includes(user.defaultCity)) {
            setSelectedCity(user.defaultCity)
          } else {
            setCustomCity(user.defaultCity)
          }
        }

        // Load profile preferences
        if (user.profile) {
          setPreferences(user.profile.preferences || {
            accessibility: false,
            family: false,
            indoor: false,
            outdoor: false,
            free: false,
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        alert('Erreur lors du chargement du profil')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (!userId) return

    if (selectedInterests.length < 3) {
      alert('Veuillez sélectionner au moins 3 centres d\'intérêt')
      return
    }

    setSaving(true)

    try {
      // Update user info
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          defaultCity: customCity || selectedCity,
          interests: selectedInterests,
        }),
      })

      // Update profile preferences
      await fetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
        }),
      })

      alert('Profil mis à jour avec succès !')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
            <p className="text-gray-600">
              Gérez vos informations et préférences
            </p>
          </div>

          {/* Personal Info */}
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations personnelles
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom (optionnel)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* City */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ville principale
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city)
                      setCustomCity('')
                    }}
                    className={`p-4 rounded-lg border-2 font-medium transition-all ${
                      selectedCity === city
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou</span>
                </div>
              </div>

              <input
                type="text"
                value={customCity}
                onChange={(e) => {
                  setCustomCity(e.target.value)
                  setSelectedCity('')
                }}
                placeholder="Autre ville..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Interests */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Centres d'intérêt
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (minimum 3)
                </span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-lg border-2 font-medium transition-all ${
                      selectedInterests.includes(interest.id)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{interest.icon}</span>
                    {interest.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Préférences
              </h2>

              <div className="space-y-3">
                {[
                  { id: 'accessibility', label: 'Accessibilité PMR importante', icon: '♿' },
                  { id: 'family', label: 'Événements adaptés aux familles', icon: '👨‍👩‍👧' },
                  { id: 'indoor', label: 'Préférence pour les événements en intérieur', icon: '🏠' },
                  { id: 'outdoor', label: 'Préférence pour les événements en extérieur', icon: '🌳' },
                  { id: 'free', label: 'Événements gratuits prioritaires', icon: '🎁' },
                ].map((pref) => (
                  <label
                    key={pref.id}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={preferences[pref.id as keyof typeof preferences]}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          [pref.id]: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 flex items-center gap-2 font-medium text-gray-700">
                      <span className="text-xl">{pref.icon}</span>
                      {pref.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || selectedInterests.length < 3}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
