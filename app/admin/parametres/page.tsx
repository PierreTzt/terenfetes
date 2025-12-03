'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { Settings, Save, Eye } from 'lucide-react'

interface SiteSettings {
  id: string
  siteName: string
  slogan: string
  logoUrl?: string | null
  faviconUrl?: string | null
}

export default function AdminParametresPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [siteName, setSiteName] = useState('')
  const [slogan, setSlogan] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')

  // Fetch current settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data.data)
          setSiteName(data.data.siteName)
          setSlogan(data.data.slogan)
          setLogoUrl(data.data.logoUrl || '')
          setFaviconUrl(data.data.faviconUrl || '')
        } else {
          setError('Impossible de charger les paramètres')
        }
      } catch (err) {
        setError('Erreur lors du chargement des paramètres')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteName,
          slogan,
          logoUrl: logoUrl || null,
          faviconUrl: faviconUrl || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(data.data)
        setSuccess(true)

        // Reload page after 1 second to reflect changes in navigation
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-0">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-700">Chargement...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-0">
      <Navigation />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b border-bg-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-brand" />
              <h1 className="h1">Paramètres du site</h1>
            </div>
            <p className="text-muted-700">
              Modifiez le nom, le slogan, le logo et le favicon de votre site.
            </p>
          </div>
        </section>

        {/* Settings Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white p-8" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Site Name */}
              <Input
                label="Nom du site"
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Territoire en Fête"
                required
              />

              {/* Slogan */}
              <Input
                label="Slogan"
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Tout ce qui bouge près de chez vous."
                required
              />

              {/* Logo URL */}
              <Input
                label="URL du logo (optionnel)"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />

              {/* Favicon URL */}
              <Input
                label="URL du favicon (optionnel)"
                type="url"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />

              {/* Preview Section */}
              <div className="border-t border-bg-1 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-muted-700" />
                  <h3 className="h3">Aperçu</h3>
                </div>
                <div className="bg-bg-0 p-6" style={{ borderRadius: 'var(--radius-card)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center">
                        <span className="text-white text-lg">📍</span>
                      </div>
                    )}
                    <div>
                      <div className="font-heading text-xl text-ink">
                        {siteName || 'Territoire en Fête'}
                      </div>
                      <div className="text-xs font-semibold text-muted-700">
                        {slogan || 'Tout ce qui bouge près de chez vous.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 bg-alert/10 border border-alert/20 text-alert text-sm" style={{ borderRadius: 'var(--radius-input)' }}>
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-success/10 border border-success/20 text-success text-sm" style={{ borderRadius: 'var(--radius-input)' }}>
                  Paramètres sauvegardés avec succès !
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  icon={Save}
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => window.location.href = '/admin'}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-brand-50 border border-brand/10 p-6" style={{ borderRadius: 'var(--radius-container)' }}>
            <h3 className="h3 mb-3">Instructions</h3>
            <ul className="space-y-2 text-sm text-muted-700">
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>Le nom du site apparaîtra dans la navigation et le titre des pages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>Le slogan sera affiché sur la page d'accueil et dans le footer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>Les images de logo et favicon doivent être hébergées en ligne (URL publique)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>Format recommandé pour le logo : PNG ou SVG (ratio 1:1, minimum 128×128px)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>Format recommandé pour le favicon : ICO ou PNG (32×32px)</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
