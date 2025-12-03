'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Navigation2, ChevronDown } from 'lucide-react'

interface City {
  name: string
  eventCount: number
}

const STORAGE_KEY = 'terenfetes_selected_city'

export default function LocationFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Current filters from URL
  const currentCity = searchParams.get('city')
  const currentLat = searchParams.get('lat')
  const currentLng = searchParams.get('lng')

  // Determine current selection
  const isGeolocation = currentLat && currentLng
  const displayValue = isGeolocation
    ? 'Autour de moi'
    : currentCity
    ? currentCity
    : 'Partout'

  // Fetch top cities on mount
  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch('/api/cities')
        if (res.ok) {
          const data = await res.json()
          setCities(data.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err)
      }
    }

    fetchCities()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCitySelect = (city: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Clear existing location filters
    params.delete('lat')
    params.delete('lng')
    params.delete('radius')
    params.delete('city')
    params.delete('page')

    if (city !== 'all') {
      params.set('city', city)
      localStorage.setItem(STORAGE_KEY, city)
    } else {
      localStorage.setItem(STORAGE_KEY, 'all')
    }

    router.push(`/?${params.toString()}`)
    setIsOpen(false)
  }

  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur')
      return
    }

    setLoading(true)
    setError('')
    setIsOpen(false)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        const params = new URLSearchParams(searchParams.toString())
        params.delete('city')
        params.set('lat', latitude.toString())
        params.set('lng', longitude.toString())
        params.set('radius', '10') // Default 10km
        params.delete('page')

        router.push(`/?${params.toString()}`)
        setLoading(false)
        localStorage.setItem(STORAGE_KEY, 'geolocation')
      },
      (err) => {
        setError('Impossible d\'obtenir votre position. Veuillez autoriser l\'accès.')
        setLoading(false)
        console.error('Geolocation error:', err)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }

  return (
    <div className="relative">
      {/* Dropdown Button - style compact comme filtres */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 text-sm leading-5 font-medium bg-white border border-[#DDE3ED] text-muted-700 hover:bg-[#F1F5FF] hover:border-[#C9D3FF] hover:text-[#264CFF] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#264CFF] focus:ring-offset-0 ${
          loading ? 'opacity-50 cursor-wait' : ''
        }`}
        style={{ borderRadius: '14px' }}
        aria-label="Sélectionner une ville"
      >
        {isGeolocation ? (
          <Navigation2 className="w-4 h-4" style={{ color: '#3A4253' }} />
        ) : (
          <MapPin className="w-4 h-4" style={{ color: '#3A4253' }} />
        )}
        <span>
          {loading ? 'Localisation...' : displayValue}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#3A4253' }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className="absolute top-full left-0 mt-2 w-64 bg-white border border-bg-2 z-20 overflow-hidden"
            style={{
              borderRadius: 'var(--radius-input)',
              boxShadow: 'var(--shadow-hover)'
            }}
          >
            {/* All cities option */}
            <button
              onClick={() => handleCitySelect('all')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-50 transition-colors focus:outline-none focus:bg-brand-50"
            >
              <MapPin className="w-5 h-5 text-muted-400" />
              <span className="text-sm font-medium text-ink">Partout</span>
            </button>

            {/* Divider */}
            <div className="border-t border-bg-1" />

            {/* City options */}
            <div className="max-h-64 overflow-y-auto">
              {cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-brand-50 transition-colors focus:outline-none focus:bg-brand-50 ${
                    currentCity === city.name ? 'bg-brand-50' : ''
                  }`}
                >
                  <span className="text-sm font-medium text-ink">{city.name}</span>
                  <span className="text-xs text-muted-400">{city.eventCount}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-bg-1" />

            {/* Geolocation option */}
            <button
              onClick={handleGeolocation}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-50 transition-colors focus:outline-none focus:bg-brand-50"
            >
              <Navigation2 className="w-5 h-5 text-brand" />
              <span className="text-sm font-medium text-brand">Autour de moi</span>
            </button>
          </div>
        </>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-alert/10 border border-alert/20 text-alert text-sm w-64" style={{ borderRadius: 'var(--radius-input)' }}>
          {error}
        </div>
      )}
    </div>
  )
}
