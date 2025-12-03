'use client'

import { useState } from 'react'
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

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Email
  const [email, setEmail] = useState('')

  // Step 2: City
  const [selectedCity, setSelectedCity] = useState('')
  const [customCity, setCustomCity] = useState('')

  // Step 3: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  // Step 4: Preferences
  const [preferences, setPreferences] = useState({
    accessibility: false,
    family: false,
    indoor: false,
    outdoor: false,
    free: false,
  })

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleComplete = async () => {
    setLoading(true)

    try {
      // Create user with email
      let userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      let userData
      if (!userResponse.ok) {
        // User might already exist, fetch it
        const fetchRes = await fetch(`/api/users?email=${email}`)
        userData = await fetchRes.json()
      } else {
        userData = await userResponse.json()
      }

      const userId = userData.data?.id

      if (!userId) {
        throw new Error('Failed to create or fetch user')
      }

      // Complete onboarding
      await fetch(`/api/users/${userId}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultCity: customCity || selectedCity,
          interests: selectedInterests,
          preferences,
        }),
      })

      // Store email in localStorage for authentication
      localStorage.setItem('user_email', email)

      // Redirect to home
      router.push('/')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Erreur lors de la finalisation. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Étape {step} sur 4
            </span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenue !
              </h2>
              <p className="text-gray-600">
                Quelle est votre adresse email ?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                Utilisez cet email pour vous reconnecter à votre compte
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <a href="/connexion" className="text-blue-600 font-semibold hover:underline">
                  Se connecter
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: City Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Votre ville
              </h2>
              <p className="text-gray-600">
                Quelle est votre ville principale ?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
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

            <div className="relative">
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

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedCity && !customCity}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Vos centres d'intérêt
              </h2>
              <p className="text-gray-600">
                Sélectionnez au moins 3 thèmes qui vous intéressent
              </p>
            </div>

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

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={selectedInterests.length < 3}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Vos préférences
              </h2>
              <p className="text-gray-600">
                Aidez-nous à personnaliser votre expérience
              </p>
            </div>

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

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? 'Finalisation...' : 'Terminer'}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
