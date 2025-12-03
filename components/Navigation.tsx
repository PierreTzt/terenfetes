'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { List, Map, Heart, User, Plus, LogOut, LogIn } from 'lucide-react'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { settings } = useSiteSettings()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userEmail = localStorage.getItem('user_email')
    setIsLoggedIn(!!userEmail)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('user_email')
    setIsLoggedIn(false)
    setShowUserMenu(false)
    router.push('/')
  }

  const navItems = [
    { href: '/', label: 'Événements', icon: List },
    { href: '/carte', label: 'Carte', icon: Map },
    { href: '/mes-favoris', label: 'Favoris', icon: Heart },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  // Split site name for display (e.g., "Territoire en Fête" → ["Territoire", "en Fête"])
  const siteName = settings?.siteName || 'Territoire en Fête'
  const siteNameParts = siteName.split(' ')
  const firstPart = siteNameParts.slice(0, Math.ceil(siteNameParts.length / 2)).join(' ')
  const secondPart = siteNameParts.slice(Math.ceil(siteNameParts.length / 2)).join(' ')

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-bg-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
          >
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={siteName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                <span className="text-white text-lg">📍</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-heading text-xl leading-tight text-ink group-hover:text-brand transition-colors">
                {firstPart}
              </span>
              {secondPart && (
                <span className="text-xs font-semibold text-muted-700 leading-none">
                  {secondPart}
                </span>
              )}
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium pb-1 border-b-2 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded
                    ${
                      active
                        ? 'border-brand text-brand'
                        : 'border-transparent text-muted-700 hover:text-brand'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${active ? '' : 'text-muted-400'}`} />
                  <span>{item.label}</span>
                </a>
              )
            })}

            {/* Divider */}
            <div className="w-px h-6 bg-bg-2" />

            {/* Soumettre button - accent style, plus petit */}
            <a
              href="/soumettre"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-accent text-ink hover:bg-accent/90 transition-colors
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              style={{ borderRadius: 'var(--radius-badge)' }}
            >
              <Plus className="w-4 h-4" />
              <span>Soumettre</span>
            </a>

            {/* User menu or login button */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand hover:bg-brand hover:text-white transition-colors
                    focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                  title="Mon profil"
                >
                  <User className="w-5 h-5" />
                </button>

                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />

                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-bg-2 shadow-lg z-20 overflow-hidden"
                      style={{ borderRadius: 'var(--radius-input)' }}
                    >
                      <a
                        href="/profil"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-ink hover:bg-brand-50 transition-colors"
                      >
                        <User className="w-5 h-5 text-brand" />
                        Mon profil
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-alert hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a
                href="/connexion"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand-50 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                style={{ borderRadius: 'var(--radius-badge)' }}
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
