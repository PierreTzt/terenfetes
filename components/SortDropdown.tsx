'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SortDropdown() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'default'
  const [isOpen, setIsOpen] = useState(false)

  const sortOptions = [
    { id: 'default', label: 'Date (plus proche)', icon: '📅' },
    { id: 'new', label: 'Nouveaux', icon: '✨' },
    { id: 'trending', label: 'Populaires', icon: '🔥' },
    { id: 'filling_fast', label: 'Bientôt complets', icon: '⚡' },
    { id: 'nearby', label: 'À proximité', icon: '📍' },
  ]

  const currentOption = sortOptions.find((opt) => opt.id === currentSort) || sortOptions[0]

  const handleSortChange = (sortId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (sortId === 'default') {
      params.delete('sort')
    } else {
      params.set('sort', sortId)
    }

    // Reset to page 1 when changing sort
    params.delete('page')

    router.push(`/?${params.toString()}`)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 text-sm leading-5 font-medium text-muted-700 bg-white border border-[#DDE3ED] hover:bg-[#F1F5FF] hover:border-[#C9D3FF] hover:text-[#264CFF] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#264CFF] focus:ring-offset-0"
        style={{ borderRadius: '14px' }}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>Trier</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="#3A4253"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 z-20 w-56 mt-2 bg-white border border-bg-2 overflow-hidden" style={{ borderRadius: 'var(--radius-input)', boxShadow: 'var(--shadow-hover)' }}>
            <div className="py-1" role="menu">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSortChange(option.id)}
                  className={`flex items-center w-full px-4 py-2.5 text-sm text-left transition-colors ${
                    currentSort === option.id
                      ? 'bg-brand-50 text-brand font-medium'
                      : 'text-muted-700 hover:bg-brand-50'
                  }`}
                  role="menuitem"
                >
                  <span className="mr-3">{option.icon}</span>
                  <span>{option.label}</span>
                  {currentSort === option.id && (
                    <svg className="w-4 h-4 ml-auto text-brand" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
