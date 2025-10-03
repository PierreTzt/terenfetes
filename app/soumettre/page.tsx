'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FRENCH_CITIES, EVENT_CATEGORIES, EVENT_AUDIENCES } from '@/data/cities'
import { trackSubmitAttempt, trackSubmitSuccess } from '@/lib/tracking'

export default function SubmitEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submittedEventId, setSubmittedEventId] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])

  // Honeypot field (hidden from users, bots will fill it)
  const [honeypot, setHoneypot] = useState('')

  // Filter cities based on query
  const filteredCities = cityQuery
    ? FRENCH_CITIES.filter(city =>
        city.toLowerCase().includes(cityQuery.toLowerCase())
      ).slice(0, 10)
    : []

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleAudienceToggle = (audience: string) => {
    setSelectedAudiences(prev =>
      prev.includes(audience)
        ? prev.filter(a => a !== audience)
        : [...prev, audience]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Honeypot check (if filled, it's a bot)
    if (honeypot) {
      console.log('Bot detected')
      return
    }

    trackSubmitAttempt()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    // Validate dates
    const startAt = formData.get('startAt') as string
    const endAt = formData.get('endAt') as string

    if (endAt && new Date(endAt) < new Date(startAt)) {
      setError('La date de fin doit être après la date de début')
      setLoading(false)
      return
    }

    // Validate prices
    const priceMin = formData.get('priceMin') ? parseFloat(formData.get('priceMin') as string) : undefined
    const priceMax = formData.get('priceMax') ? parseFloat(formData.get('priceMax') as string) : undefined

    if (priceMin !== undefined && priceMax !== undefined && priceMax < priceMin) {
      setError('Le prix maximum doit être supérieur ou égal au prix minimum')
      setLoading(false)
      return
    }

    // Check consents
    const imageRights = formData.get('imageRights')
    const acceptTerms = formData.get('acceptTerms')

    if ((imageFile || imageUrl) && !imageRights) {
      setError('Vous devez attester détenir les droits de l\'image')
      setLoading(false)
      return
    }

    if (!acceptTerms) {
      setError('Vous devez accepter les conditions générales')
      setLoading(false)
      return
    }

    try {
      let uploadedImageUrl = imageUrl

      // Upload image file if provided
      if (imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageFile)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          uploadedImageUrl = uploadData.url
        }
      }

      const eventData = {
        title: formData.get('title'),
        description: formData.get('description'),
        startAt,
        endAt: endAt || undefined,
        venueName: formData.get('venueName'),
        address: formData.get('address'),
        city: formData.get('city'),
        url: formData.get('url') || undefined,
        imageUrl: uploadedImageUrl || undefined,
        priceMin,
        priceMax,
        category: selectedCategories,
        audience: selectedAudiences,
        sourceKind: 'FORM',
      }

      const res = await fetch('/api/events/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Échec de la soumission')
      }

      trackSubmitSuccess(data.eventId)
      setSubmittedEventId(data.eventId)
      setSuccess(true)

      // Reset form
      e.currentTarget.reset()
      setImageFile(null)
      setImageUrl('')
      setSelectedCategories([])
      setSelectedAudiences([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image est trop volumineuse (max 5 MB)')
        return
      }
      setImageFile(file)
      setImageUrl('') // Clear URL if file is selected
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux événements
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Soumettre un événement
            </h1>
            <p className="text-gray-600 text-lg">
              Partagez votre événement avec la communauté. Il sera examiné par notre équipe avant publication.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>📋 Critères de publication :</strong> Votre événement doit être public, se dérouler sur le territoire, et respecter nos conditions d&apos;utilisation.
              </p>
            </div>
          </div>

          {success ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="w-20 h-20 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ✅ Événement soumis avec succès !
              </h2>

              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Merci pour votre contribution. Votre événement a été enregistré et sera examiné par notre équipe avant publication.
              </p>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-2xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">ID de soumission</p>
                    <p className="text-sm text-blue-800 font-mono bg-white px-3 py-1 rounded">{submittedEventId.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Statut</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      En cours de modération
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>⏱️ Délai de traitement :</strong> 24 à 48 heures en moyenne
                  </p>
                  <p className="text-sm text-blue-800 mt-2">
                    Vous recevrez une notification dès que votre événement sera publié.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Retour à l&apos;accueil
                </a>
                <button
                  onClick={() => {
                    setSuccess(false)
                    setSubmittedEventId('')
                    setError('')
                  }}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Soumettre un autre événement
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Honeypot field - hidden from users */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] w-0 h-0"
                aria-hidden="true"
              />

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 pb-3 border-b-2 border-gray-200">
                  Informations générales
                </h2>

                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Titre de l&apos;événement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    maxLength={200}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: Concert de jazz sous les étoiles"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    maxLength={2000}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Décrivez votre événement : programme, artistes, ambiance..."
                  />
                  <p className="mt-1 text-xs text-gray-500">Maximum 2000 caractères</p>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Catégories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_CATEGORIES.slice(0, 12).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryToggle(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedCategories.includes(cat)
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audiences */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Public cible
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_AUDIENCES.map((aud) => (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => handleAudienceToggle(aud)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedAudiences.includes(aud)
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {aud}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 pb-3 border-b-2 border-gray-200">
                  Date et horaires
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startAt" className="block text-sm font-semibold text-gray-700 mb-2">
                      Date et heure de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="startAt"
                      name="startAt"
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="endAt" className="block text-sm font-semibold text-gray-700 mb-2">
                      Date et heure de fin
                    </label>
                    <input
                      type="datetime-local"
                      id="endAt"
                      name="endAt"
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 pb-3 border-b-2 border-gray-200">
                  Lieu
                </h2>

                <div>
                  <label htmlFor="venueName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du lieu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="venueName"
                    name="venueName"
                    required
                    maxLength={200}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: Salle des fêtes, Parc municipal..."
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    maxLength={300}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: 1 Place de la Mairie"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value)
                      setShowCitySuggestions(true)
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    autoComplete="off"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: Paris"
                  />
                  {showCitySuggestions && filteredCities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setCityQuery(city)
                            setShowCitySuggestions(false)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 pb-3 border-b-2 border-gray-200">
                  Tarification
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="priceMin" className="block text-sm font-semibold text-gray-700 mb-2">
                      Prix minimum (€)
                    </label>
                    <input
                      type="number"
                      id="priceMin"
                      name="priceMin"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0 (gratuit)"
                    />
                  </div>

                  <div>
                    <label htmlFor="priceMax" className="block text-sm font-semibold text-gray-700 mb-2">
                      Prix maximum (€)
                    </label>
                    <input
                      type="number"
                      id="priceMax"
                      name="priceMax"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0 (gratuit)"
                    />
                  </div>
                </div>
              </div>

              {/* Image & URL */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 pb-3 border-b-2 border-gray-200">
                  Médias & liens
                </h2>

                <div>
                  <label htmlFor="imageFile" className="block text-sm font-semibold text-gray-700 mb-2">
                    Image de l&apos;événement
                  </label>
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG ou WebP • Maximum 5 MB</p>

                  <div className="mt-3">
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-600 mb-2">
                      Ou URL de l&apos;image
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value)
                        setImageFile(null)
                      }}
                      disabled={!!imageFile}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="https://exemple.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
                    Lien vers plus d&apos;infos / billetterie
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://exemple.com"
                  />
                </div>
              </div>

              {/* Consents */}
              <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                {(imageFile || imageUrl) && (
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="imageRights"
                      name="imageRights"
                      required
                      className="mt-1 h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="imageRights" className="ml-3 text-sm text-gray-700">
                      J&apos;atteste détenir les droits de diffusion de cette image <span className="text-red-500">*</span>
                    </label>
                  </div>
                )}

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    required
                    className="mt-1 h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-700">
                    J&apos;accepte les <a href="/cgu" className="text-blue-600 hover:underline" target="_blank">conditions générales d&apos;utilisation</a> et confirme que cet événement est public <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    'Soumettre l\'événement'
                  )}
                </button>
                <p className="mt-3 text-center text-sm text-gray-500">
                  Vous recevrez un email de confirmation une fois votre événement examiné
                </p>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
