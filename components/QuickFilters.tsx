'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function QuickFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get('filter')

  const handleFilterClick = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (currentFilter === filter) {
      // Toggle off if clicking the same filter
      params.delete('filter')
    } else {
      params.set('filter', filter)
    }

    // Reset to page 1 when applying filters
    params.delete('page')

    router.push(`/?${params.toString()}`)
  }

  const filters = [
    {
      id: 'week',
      label: 'Cette semaine',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'weekend',
      label: 'Ce week-end',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'free',
      label: 'Gratuit',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <span className="text-sm font-medium text-gray-700 flex items-center">
        Filtres rapides :
      </span>
      {filters.map((filter) => {
        const isActive = currentFilter === filter.id
        return (
          <button
            key={filter.id}
            onClick={() => handleFilterClick(filter.id)}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            aria-pressed={isActive}
            aria-label={`Filtrer par ${filter.label}`}
          >
            <span className="mr-2">{filter.icon}</span>
            {filter.label}
            {isActive && (
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
