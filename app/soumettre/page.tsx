'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
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
  const [imagePreview, setImagePreview] = useState<string>('')
  const [cityQuery, setCityQuery] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [titleLength, setTitleLength] = useState(0)
  const [descriptionLength, setDescriptionLength] = useState(0)

  // Honeypot field (hidden from users, bots will fill it)
  const [honeypot, setHoneypot] = useState('')

  // Filter cities based on query
  const filteredCities = cityQuery
    ? FRENCH_CITIES.filter(city =>
        city.toLowerCase().includes(cityQuery.toLowerCase())
      ).slice(0, 10)
    : []

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category)
      }
      // Limit to 2 categories
      if (prev.length >= 2) {
        return prev
      }
      return [...prev, category]
    })
  }

  const handleAudienceToggle = (audience: string) => {
    setSelectedAudiences(prev => {
      if (prev.includes(audience)) {
        return prev.filter(a => a !== audience)
      }
      // Only one audience can be selected
      return [audience]
    })
  }

  const setQuickDate = (type: 'today' | 'weekend') => {
    const today = new Date()

    if (type === 'today') {
      const todayStr = today.toISOString().slice(0, 16)
      const startInput = document.getElementById('startAt') as HTMLInputElement
      if (startInput) startInput.value = todayStr
    } else if (type === 'weekend') {
      const dayOfWeek = today.getDay()
      const daysUntilSaturday = dayOfWeek === 0 ? 6 : (6 - dayOfWeek)

      const saturday = new Date(today)
      saturday.setDate(today.getDate() + daysUntilSaturday)
      saturday.setHours(10, 0, 0, 0)

      const startInput = document.getElementById('startAt') as HTMLInputElement
      if (startInput) startInput.value = saturday.toISOString().slice(0, 16)
    }
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

      // Get indoor/outdoor value
      const indoorValue = formData.get('indoor')
      const indoor = indoorValue === 'indoor' ? true : indoorValue === 'outdoor' ? false : undefined

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
        indoor,
        pmr: formData.get('pmr') === '1',
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

      // Validate image dimensions
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)

        if (img.width < 1600 || img.height < 900) {
          setError('L\'image doit faire au minimum 1600×900 pixels')
          return
        }

        setImageFile(file)
        setImageUrl('')
        setImagePreview(URL.createObjectURL(file))
        setError('')
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        setError('Impossible de lire l\'image')
      }

      img.src = objectUrl
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-bg-0 pt-12 pb-6">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white px-6 py-5" style={{ borderRadius: '16px', boxShadow: '0 1px 5px rgba(20, 30, 55, 0.03)' }}>
              <h1 className="h1 mb-4 line-clamp-2" style={{ lineHeight: '1.15' }}>
                Soumettre un événement
              </h1>
              <p className="text-base leading-6 mb-0 max-w-[80ch] mx-auto" style={{ color: '#3A4253' }}>
                Partagez votre événement avec la communauté. Il sera examiné par notre équipe avant publication.
              </p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <div className="bg-bg-0">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white p-8 md:p-10" style={{ borderRadius: '16px', boxShadow: '0 1px 5px rgba(20, 30, 55, 0.08)' }}>
              <div className="mb-8 p-4 bg-[#E8EEFF] border border-[#C9D3FF]" style={{ borderRadius: '12px' }}>
                <p className="text-sm leading-5" style={{ color: '#0B1020' }}>
                  <strong>📋 Critères de publication :</strong> Votre événement doit être public, se dérouler sur le territoire, et respecter nos conditions d&apos;utilisation.
                </p>
              </div>

          {success ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="w-20 h-20 mx-auto text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h2 className="h2 mb-4">
                ✅ Événement soumis avec succès !
              </h2>

              <p className="text-base leading-6 mb-8 max-w-2xl mx-auto" style={{ color: '#3A4253' }}>
                Merci pour votre contribution. Votre événement a été enregistré et sera examiné par notre équipe avant publication.
              </p>

              <div className="bg-[#E8EEFF] border-2 border-[#C9D3FF] p-6 max-w-2xl mx-auto mb-8" style={{ borderRadius: '14px' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm font-semibold text-ink mb-1">ID de soumission</p>
                    <p className="text-sm text-muted-700 font-mono bg-white px-3 py-1" style={{ borderRadius: '8px' }}>{submittedEventId.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink mb-1">Statut</p>
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-[#FFF4E0] text-[#B45309]" style={{ borderRadius: '10px' }}>
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      En cours de modération
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#C9D3FF]">
                  <p className="text-sm text-ink">
                    <strong>⏱️ Délai de traitement :</strong> 24 à 48 heures en moyenne
                  </p>
                  <p className="text-sm text-muted-700 mt-2">
                    Vous recevrez une notification dès que votre événement sera publié.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-[#DDE3ED] text-base font-semibold text-muted-700 bg-white hover:bg-[#F1F5FF] hover:border-[#C9D3FF] hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors"
                  style={{ borderRadius: '12px' }}
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
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-brand hover:bg-[#1a3dd1] focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors"
                  style={{ borderRadius: '12px' }}
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
                <div className="bg-[#FEE2E2] border-2 border-alert p-4" style={{ borderRadius: '12px' }}>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-alert mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-alert text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-6">
                <h2 className="h3 pb-3 border-b-2 border-bg-1">
                  Informations générales
                </h2>

                <div>
                  <label htmlFor="title" className="block text-sm leading-5 font-semibold text-ink mb-2">
                    Titre de l&apos;événement <span className="text-alert">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    maxLength={100}
                    value={titleLength > 0 ? undefined : ''}
                    onChange={(e) => setTitleLength(e.target.value.length)}
                    className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors"
                    style={{ borderRadius: '12px' }}
                    placeholder="Ex: Concert de jazz sous les étoiles"
                  />
                  <p className="mt-1 text-xs text-muted-400 flex justify-between">
                    <span>Maximum 100 caractères</span>
                    <span className={titleLength > 100 ? 'text-alert' : ''}>{titleLength}/100</span>
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm leading-5 font-semibold text-ink mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    maxLength={2000}
                    onChange={(e) => setDescriptionLength(e.target.value.length)}
                    className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors"
                    style={{ borderRadius: '12px' }}
                    placeholder="Décrivez votre événement : programme, artistes, ambiance..."
                  />
                  <div className="mt-1 text-xs text-muted-400 flex justify-between">
                    <span>Décrivez le programme, les artistes, l'ambiance • 600-800 caractères conseillés</span>
                    <span className={descriptionLength > 2000 ? 'text-alert' : ''}>{descriptionLength}/2000</span>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm leading-5 font-semibold text-ink mb-3">
                    Catégories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_CATEGORIES.slice(0, 12).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryToggle(cat)}
                        disabled={!selectedCategories.includes(cat) && selectedCategories.length >= 2}
                        className={`px-4 py-2 text-sm font-medium transition-all ${
                          selectedCategories.includes(cat)
                            ? 'bg-brand text-white'
                            : selectedCategories.length >= 2
                            ? 'bg-bg-0 text-muted-400 cursor-not-allowed opacity-60'
                            : 'bg-bg-0 text-muted-700 hover:bg-bg-1'
                        }`}
                        style={{ borderRadius: '14px' }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-400">
                    {selectedCategories.length === 0 && 'Sélectionnez jusqu\'à 2 catégories'}
                    {selectedCategories.length === 1 && 'Vous pouvez sélectionner 1 catégorie supplémentaire'}
                    {selectedCategories.length === 2 && (
                      <span className="text-success font-medium">✓ Maximum atteint (2/2)</span>
                    )}
                  </p>
                </div>

                {/* Audiences */}
                <div>
                  <label className="block text-sm leading-5 font-semibold text-ink mb-3">
                    Public cible
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_AUDIENCES.map((aud) => (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => handleAudienceToggle(aud)}
                        className={`px-4 py-2 text-sm font-medium transition-all ${
                          selectedAudiences.includes(aud)
                            ? 'bg-success text-white'
                            : 'bg-bg-0 text-muted-700 hover:bg-bg-1'
                        }`}
                        style={{ borderRadius: '14px' }}
                      >
                        {aud}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-400">
                    {selectedAudiences.length === 0 && 'Sélectionnez le public principal (1 choix)'}
                    {selectedAudiences.length === 1 && (
                      <span className="text-success font-medium">✓ Sélectionné : {selectedAudiences[0]}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-6">
                <h2 className="h3 pb-3 border-b-2 border-bg-1">
                  Options
                </h2>

                {/* Indoor/Outdoor */}
                <div>
                  <label className="block text-sm leading-5 font-semibold text-ink mb-3">
                    Lieu de l&apos;événement
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 px-4 py-3 bg-bg-0 border-2 border-bg-1 cursor-pointer hover:bg-brand-50 hover:border-brand transition-all has-[:checked]:bg-brand-50 has-[:checked]:border-brand" style={{ borderRadius: '12px' }}>
                      <input
                        type="radio"
                        name="indoor"
                        value="indoor"
                        className="w-4 h-4 text-brand border-2 border-[#E6EAF0] focus:ring-2 focus:ring-brand"
                      />
                      <span className="text-sm font-medium text-ink">🏠 Intérieur</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-3 bg-bg-0 border-2 border-bg-1 cursor-pointer hover:bg-brand-50 hover:border-brand transition-all has-[:checked]:bg-brand-50 has-[:checked]:border-brand" style={{ borderRadius: '12px' }}>
                      <input
                        type="radio"
                        name="indoor"
                        value="outdoor"
                        className="w-4 h-4 text-brand border-2 border-[#E6EAF0] focus:ring-2 focus:ring-brand"
                      />
                      <span className="text-sm font-medium text-ink">🌳 Plein air</span>
                    </label>
                  </div>
                </div>

                {/* Accessibility option */}
                <div>
                  <label className="block text-sm leading-5 font-semibold text-ink mb-3">
                    Accessibilité
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 bg-bg-0 border-2 border-bg-1 cursor-pointer hover:bg-brand-50 hover:border-brand transition-all has-[:checked]:bg-brand-50 has-[:checked]:border-brand" style={{ borderRadius: '12px' }}>
                    <input
                      type="checkbox"
                      name="pmr"
                      value="1"
                      className="w-5 h-5 text-brand border-2 border-[#E6EAF0] focus:ring-2 focus:ring-brand"
                      style={{ borderRadius: '6px' }}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-ink block">♿ Accessible PMR</span>
                      <span className="text-xs text-muted-400">Accessible aux personnes à mobilité réduite</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-6">
                <h2 className="h3 pb-3 border-b-2 border-bg-1">
                  Date et horaires
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startAt" className="block text-sm leading-5 font-semibold text-ink mb-2">
                      Date et heure de début <span className="text-alert">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="startAt"
                      name="startAt"
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors"
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="endAt" className="block text-sm leading-5 font-semibold text-ink mb-2">
                      Date et heure de fin
                    </label>
                    <input
                      type="datetime-local"
                      id="endAt"
                      name="endAt"
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors"
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                </div>

                {/* Quick date buttons */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-700 font-medium">Raccourcis :</span>
                  <button
                    type="button"
                    onClick={() => setQuickDate('today')}
                    className="px-3 py-1.5 text-sm font-medium bg-bg-0 text-muted-700 hover:bg-brand-50 hover:text-brand transition-colors"
                    style={{ borderRadius: '10px' }}
                  >
                    Aujourd&apos;hui
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate('weekend')}
                    className="px-3 py-1.5 text-sm font-medium bg-bg-0 text-muted-700 hover:bg-brand-50 hover:text-brand transition-colors"
                    style={{ borderRadius: '10px' }}
                  >
                    Ce week-end
                  </button>
                </div>

                <p className="text-xs text-muted-400">
                  🕐 Heure locale (Europe/Paris) • Les dates passées ne sont pas autorisées
                </p>
              </div>

              {/* Location */}
              <div className="space-y-6">
                <h2 className="h3 pb-3 border-b-2 border-bg-1">
                  Lieu
                </h2>

                <div>
                  <label htmlFor="venueName" className="block text-sm leading-5 font-semibold text-ink mb-2">
                    Nom du lieu <span className="text-alert">*</span>
                  </label>
                  <input
                    type="text"
                    id="venueName"
                    name="venueName"
                    required
                    maxLength={200}
                    className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors"
                    style={{ borderRadius: '12px' }}
                    placeholder="Ex: Salle des fêtes, Parc municipal..."
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm leading-5 font-semibold text-ink mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    maxLength={300}
                    className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors"
                    style={{ borderRadius: '12px' }}
                    placeholder="Ex: 1 Place de la Mairie"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="city" className="block text-sm leading-5 font-semibold text-ink mb-2">
                    Ville <span className="text-alert">*</span>
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
                    className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors"
                    style={{ borderRadius: '12px' }}
                    placeholder="Ex: Paris"
                  />
                  {showCitySuggestions && filteredCities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-bg-1 shadow-lg max-h-60 overflow-y-auto" style={{ borderRadius: '12px' }}>
                      {filteredCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setCityQuery(city)
                            setShowCitySuggestions(false)
                          }}
                          className="w-full px-4 py-3 text-left text-ink hover:bg-brand-50 transition-colors"
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
                <h2 className="h3 pb-3 border-b-2 border-bg-1">
                  Tarification
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="priceMin" className="block text-sm leading-5 font-semibold text-ink mb-2">
                      Prix minimum (€)
                    </label>
                    <input
                      type="number"
                      id="priceMin"
                      name="priceMin"
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors"
                      style={{ borderRadius: '12px' }}
                      placeholder="0 (gratuit)"
                    />
                  </div>

                  <div>
                    <label htmlFor="priceMax" className="block text-sm leading-5 font-semibold text-ink mb-2">
                      Prix maximum (€)
                    </label>
                    <input
                      type="number"
                      id="priceMax"
                      name="priceMax"
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors"
                      style={{ borderRadius: '12px' }}
                      placeholder="0 (gratuit)"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-400">
                  💡 Laissez vide ou indiquez 0 pour un événement gratuit • Prix en euros entiers
                </p>
              </div>

              {/* Image & URL */}
              <div className="space-y-6">
                <h2 className="h3 pb-3 border-b-2 border-bg-1">
                  Médias & liens
                </h2>

                <div>
                  <label htmlFor="imageFile" className="block text-sm leading-5 font-semibold text-ink mb-2">
                    Image de l&apos;événement
                  </label>
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand hover:file:bg-[#E8EEFF]"
                    style={{ borderRadius: '12px' }}
                  />
                  <p className="mt-1 text-xs text-muted-400">JPG, PNG ou WebP • Maximum 5 MB • Dimensions minimales 1600×900 pixels</p>

                  {/* Image preview */}
                  {imagePreview && (
                    <div className="mt-4">
                      <div className="relative w-full overflow-hidden bg-bg-0" style={{ borderRadius: '12px', maxWidth: '400px' }}>
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="w-full h-auto"
                          style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-success flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Aperçu (ratio 16:9)
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <label htmlFor="imageUrl" className="block text-sm leading-5 font-medium text-muted-700 mb-2">
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
                      className="w-full px-4 py-2 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors disabled:bg-bg-0 disabled:cursor-not-allowed"
                      style={{ borderRadius: '12px' }}
                      placeholder="https://exemple.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="url" className="block text-sm leading-5 font-semibold text-ink mb-2">
                    Lien vers plus d&apos;infos / billetterie
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    className="w-full px-4 py-3 border border-[#E6EAF0] focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-0 outline-none transition-colors"
                    style={{ borderRadius: '12px' }}
                    placeholder="https://exemple.com"
                  />
                  <p className="mt-1 text-xs text-muted-400">
                    Lien vers la billetterie ou page officielle de l&apos;événement (http/https uniquement)
                  </p>
                </div>
              </div>

              {/* Consents */}
              <div className="space-y-4 pt-4 border-t-2 border-bg-1">
                {(imageFile || imageUrl) && (
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="imageRights"
                      name="imageRights"
                      required
                      className="mt-1 h-5 w-5 text-brand border-2 border-[#E6EAF0] focus:ring-2 focus:ring-brand"
                      style={{ borderRadius: '6px' }}
                    />
                    <label htmlFor="imageRights" className="ml-3 text-sm text-ink">
                      J&apos;atteste détenir les droits de diffusion de cette image <span className="text-alert">*</span>
                    </label>
                  </div>
                )}

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    required
                    className="mt-1 h-5 w-5 text-brand border-2 border-[#E6EAF0] focus:ring-2 focus:ring-brand"
                    style={{ borderRadius: '6px' }}
                  />
                  <label htmlFor="acceptTerms" className="ml-3 text-sm text-ink">
                    J&apos;accepte les <a href="/cgu" className="text-brand hover:underline font-medium" target="_blank">conditions générales d&apos;utilisation</a> et confirme que cet événement est public <span className="text-alert">*</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-white px-8 py-4 text-lg font-semibold hover:bg-[#1a3dd1] focus:outline-none focus:ring-4 focus:ring-brand focus:ring-offset-2 transition-all disabled:bg-muted-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  style={{ borderRadius: '12px' }}
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
                <p className="mt-3 text-center text-sm text-muted-400">
                  Vous recevrez un email de confirmation une fois votre événement examiné
                </p>
              </div>
            </form>
          )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
