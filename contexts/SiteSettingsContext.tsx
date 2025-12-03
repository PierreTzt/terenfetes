'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SiteSettings {
  id: string
  siteName: string
  slogan: string
  logoUrl?: string | null
  faviconUrl?: string | null
}

interface SiteSettingsContextType {
  settings: SiteSettings | null
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
}

const defaultSettings: SiteSettings = {
  id: '',
  siteName: 'Territoire en Fête',
  slogan: 'Tout ce qui bouge près de chez vous.',
  logoUrl: null,
  faviconUrl: null,
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: false,
  error: null,
  refreshSettings: async () => {},
})

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/settings')

      if (res.ok) {
        const data = await res.json()
        setSettings(data.data)
        setError(null)
      } else {
        setError('Failed to fetch settings')
        setSettings(defaultSettings)
      }
    } catch (err) {
      console.error('Error fetching site settings:', err)
      setError('Failed to fetch settings')
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const refreshSettings = async () => {
    await fetchSettings()
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)

  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  }

  return context
}
