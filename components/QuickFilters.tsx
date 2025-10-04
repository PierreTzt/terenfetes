'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'

export default function QuickFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get('filter')
  const [showMore, setShowMore] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Local state for advanced filters
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set())

  // Local state for modal form
  const [cityQuery, setCityQuery] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Sync form state with URL params
  useEffect(() => {
    const filters = new Set<string>()
    // Advanced filters
    if (searchParams.get('pmr') === '1') filters.add('accessibility')
    if (searchParams.get('kids') === '1') filters.add('kids')
    if (searchParams.get('dur_lt') === '90') filters.add('short')
    if (searchParams.get('price_max') === '10') filters.add('cheap')
    if (searchParams.get('indoor') === '1') filters.add('indoor_adv')
    if (searchParams.get('outdoor') === '1') filters.add('outdoor_adv')
    setSelectedFilters(filters)

    // Form fields
    setCityQuery(searchParams.get('city') || '')
    setFromDate(searchParams.get('from') || '')
    setToDate(searchParams.get('to') || '')
  }, [searchParams])

  // Close menu on Escape key and handle focus trap
  useEffect(() => {
    if (!showMore) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMore(false)
        buttonRef.current?.focus()
      }
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = menuRef.current?.querySelectorAll(
        'input, button'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        // Shift+Tab: if on first element, go to last
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
    }
  }, [showMore])

  // Focus first input when modal opens and prevent body scroll
  useEffect(() => {
    if (showMore) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden'

      if (menuRef.current) {
        const firstInput = menuRef.current.querySelector('#city-input') as HTMLElement
        firstInput?.focus()
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [showMore])

  const handleFilterClick = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // For indoor/outdoor, map directly to URL params instead of using 'filter'
    if (filter === 'indoor') {
      if (searchParams.get('indoor') === '1') {
        params.delete('indoor')
      } else {
        params.set('indoor', '1')
        params.delete('outdoor')
      }
    } else if (filter === 'outdoor') {
      if (searchParams.get('outdoor') === '1') {
        params.delete('outdoor')
      } else {
        params.set('outdoor', '1')
        params.delete('indoor')
      }
    } else {
      // Standard quick filters
      if (currentFilter === filter) {
        // Toggle off if clicking the same filter
        params.delete('filter')
      } else {
        params.set('filter', filter)
      }
    }

    // Reset to page 1 when applying filters
    params.delete('page')

    router.push(`/?${params.toString()}`)
  }

  const handleAdvancedFilterToggle = (filterId: string) => {
    const newFilters = new Set(selectedFilters)

    // Handle mutually exclusive indoor/outdoor
    if (filterId === 'indoor_adv') {
      newFilters.delete('outdoor_adv')
    } else if (filterId === 'outdoor_adv') {
      newFilters.delete('indoor_adv')
    }

    if (newFilters.has(filterId)) {
      newFilters.delete(filterId)
    } else {
      newFilters.add(filterId)
    }
    setSelectedFilters(newFilters)
  }

  const handleApplyFilters = () => {
    const params = new URLSearchParams()

    // Keep existing main filters
    const currentMainFilter = searchParams.get('filter')
    if (currentMainFilter) {
      params.set('filter', currentMainFilter)
    }

    // Apply form fields
    if (cityQuery.trim()) params.set('city', cityQuery.trim())
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)

    // Apply advanced filters with new param names
    selectedFilters.forEach((filterId) => {
      if (filterId === 'accessibility') params.set('pmr', '1')
      if (filterId === 'kids') params.set('kids', '1')
      if (filterId === 'short') params.set('dur_lt', '90')
      if (filterId === 'cheap') params.set('price_max', '10')
      if (filterId === 'indoor_adv') params.set('indoor', '1')
      if (filterId === 'outdoor_adv') params.set('outdoor', '1')
    })

    router.push(`/?${params.toString()}`)
    setShowMore(false)
  }

  const handleResetFilters = () => {
    setSelectedFilters(new Set())
    setCityQuery('')
    setFromDate('')
    setToDate('')

    // Keep only main filter if any
    const params = new URLSearchParams()
    const currentMainFilter = searchParams.get('filter')
    if (currentMainFilter) {
      params.set('filter', currentMainFilter)
    }

    router.push(`/?${params.toString()}`)
    setShowMore(false)
  }

  // Main filters - including indoor/outdoor
  const mainFilters = [
    { id: 'tonight', label: 'Ce soir' },
    { id: 'tomorrow', label: 'Demain' },
    { id: 'weekend', label: 'Ce week-end' },
    { id: 'free', label: 'Gratuit' },
    { id: 'family', label: 'Famille' },
    { id: 'indoor', label: 'Intérieur' },
    { id: 'outdoor', label: 'Plein air' },
  ]

  // Advanced filters in "Plus" menu (grouped)
  const advancedFilters = [
    { id: 'kids', label: 'Enfants' },
    { id: 'accessibility', label: 'PMR' },
    { id: 'short', label: 'Durée < 90 min' },
    { id: 'cheap', label: 'Prix ≤ 10 €' },
    { id: 'indoor_adv', label: 'Intérieur' },
    { id: 'outdoor_adv', label: 'Plein air' },
  ]

  // Count active advanced filters from URL
  const countAdvancedFilters = () => {
    let count = 0
    if (searchParams.get('city')) count++
    if (searchParams.get('from')) count++
    if (searchParams.get('to')) count++
    if (searchParams.get('pmr') === '1') count++
    if (searchParams.get('kids') === '1') count++
    if (searchParams.get('dur_lt')) count++
    if (searchParams.get('price_max')) count++
    if (searchParams.get('indoor') === '1') count++
    if (searchParams.get('outdoor') === '1') count++
    return count
  }

  const advancedFilterCount = countAdvancedFilters()
  const hasMoreFilterActive = advancedFilterCount > 0

  return (
    <div className="flex-1">
      {/* Scrollable container - single line */}
      <div className="overflow-x-auto scrollbar-hide pr-2">
        <div className="flex items-center gap-2 min-w-max">
          {/* Main filters without icons */}
          {mainFilters.map((filter) => {
            // For indoor/outdoor, check URL params instead of filter param
            const isActive = filter.id === 'indoor'
              ? searchParams.get('indoor') === '1'
              : filter.id === 'outdoor'
              ? searchParams.get('outdoor') === '1'
              : currentFilter === filter.id

            return (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`inline-flex items-center h-8 px-2.5 text-sm leading-5 font-medium transition-all duration-200 flex-shrink-0
                  ${
                    isActive
                      ? 'bg-[#E8EEFF] text-[#264CFF] border border-[#264CFF]'
                      : 'bg-white text-muted-700 border border-[#DDE3ED] hover:bg-[#F1F5FF] hover:border-[#C9D3FF] hover:text-[#264CFF]'
                  } focus:outline-none focus:ring-2 focus:ring-[#264CFF] focus:ring-offset-0`}
                style={{ borderRadius: '14px' }}
                aria-pressed={isActive}
                aria-label={`Filtrer par ${filter.label}`}
              >
                <span className="whitespace-nowrap">{filter.label}</span>
              </button>
            )
          })}

          {/* Plus button with icon */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowMore(!showMore)}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 text-sm leading-5 font-medium transition-all duration-200 flex-shrink-0
                ${
                  showMore || hasMoreFilterActive
                    ? 'bg-[#E8EEFF] text-[#264CFF] border border-[#264CFF]'
                    : 'bg-white text-muted-700 border border-[#DDE3ED] hover:bg-[#F1F5FF] hover:border-[#C9D3FF] hover:text-[#264CFF]'
                } focus:outline-none focus:ring-2 focus:ring-[#264CFF] focus:ring-offset-0`}
              style={{ borderRadius: '14px' }}
              aria-expanded={showMore}
              aria-haspopup="dialog"
            >
              <MoreHorizontal className="w-4 h-4" style={{ color: '#3A4253' }} />
              <span className="whitespace-nowrap">Plus…</span>
              {hasMoreFilterActive && (
                <span>({advancedFilterCount})</span>
              )}
            </button>

            {/* Dropdown */}
            {showMore && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMore(false)}
                />

                {/* Modal Panel */}
                <div
                  className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="filters-modal-title"
                >
                  <div
                    ref={menuRef}
                    className="relative w-full sm:max-w-[860px] h-full sm:h-auto max-h-full sm:max-h-[90vh] bg-white overflow-y-auto"
                    style={{
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(20, 30, 55, 0.12)'
                    }}
                  >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-bg-1 z-10" style={{ padding: '20px 24px' }}>
                      <div className="flex items-center justify-between">
                        <h2 id="filters-modal-title" className="text-lg font-bold text-ink">Filtres</h2>
                        <button
                          onClick={() => setShowMore(false)}
                          className="flex items-center justify-center w-10 h-10 -mr-2 text-muted-400 hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-[#264CFF] rounded"
                          aria-label="Fermer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '20px 24px' }} className="space-y-6">
                      {/* Ville */}
                      <div>
                        <label htmlFor="city-input" className="block text-sm leading-5 font-medium text-ink mb-2">
                          Ville
                        </label>
                        <input
                          id="city-input"
                          type="text"
                          placeholder="Partout"
                          value={cityQuery}
                          onChange={(e) => setCityQuery(e.target.value)}
                          className="w-full px-3 py-2 text-base leading-6 border border-[#E6EAF0] focus:border-[#264CFF] focus:ring-2 focus:ring-[#264CFF] focus:ring-offset-0 outline-none transition-colors"
                          style={{ borderRadius: '12px' }}
                        />
                      </div>

                      {/* Période - Dates */}
                      <div>
                        <h3 className="text-sm leading-5 font-medium text-ink mb-3">Période</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="from-date" className="block text-sm leading-5 font-medium text-ink mb-2">
                              À partir du
                            </label>
                            <input
                              id="from-date"
                              type="date"
                              value={fromDate}
                              onChange={(e) => setFromDate(e.target.value)}
                              className="w-full px-3 py-2 text-base leading-6 border border-[#E6EAF0] focus:border-[#264CFF] focus:ring-2 focus:ring-[#264CFF] focus:ring-offset-0 outline-none transition-colors"
                              style={{ borderRadius: '12px' }}
                            />
                          </div>
                          <div>
                            <label htmlFor="to-date" className="block text-sm leading-5 font-medium text-ink mb-2">
                              Jusqu'au
                            </label>
                            <input
                              id="to-date"
                              type="date"
                              value={toDate}
                              onChange={(e) => setToDate(e.target.value)}
                              className="w-full px-3 py-2 text-base leading-6 border border-[#E6EAF0] focus:border-[#264CFF] focus:ring-2 focus:ring-[#264CFF] focus:ring-offset-0 outline-none transition-colors"
                              style={{ borderRadius: '12px' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Options switches */}
                      <div>
                        <h3 className="text-sm font-medium text-ink mb-3">Options</h3>
                        <div className="space-y-3">
                          {advancedFilters.map((filter) => {
                            const isChecked = selectedFilters.has(filter.id)
                            return (
                              <label
                                key={filter.id}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <span className="text-base text-muted-700">{filter.label}</span>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleAdvancedFilterToggle(filter.id)}
                                  className="w-11 h-6 rounded-full appearance-none cursor-pointer transition-colors focus:ring-2 focus:ring-[#264CFF] focus:ring-offset-2"
                                  style={{
                                    backgroundColor: isChecked ? '#264CFF' : '#E6EAF0',
                                    backgroundImage: isChecked
                                      ? 'radial-gradient(circle at 70% 50%, white 30%, transparent 30%)'
                                      : 'radial-gradient(circle at 30% 50%, white 30%, transparent 30%)'
                                  }}
                                />
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-bg-1 flex items-center justify-between gap-4" style={{ padding: '20px 24px' }}>
                      <button
                        onClick={handleResetFilters}
                        className="text-sm font-medium text-muted-400 hover:text-muted-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
                      >
                        Réinitialiser
                      </button>
                      <button
                        onClick={handleApplyFilters}
                        className="flex-1 sm:flex-initial sm:min-w-[200px] px-6 py-3 text-base font-semibold bg-[#264CFF] text-white hover:bg-[#1a3dd1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#264CFF] focus:ring-offset-2"
                        style={{ borderRadius: '12px' }}
                      >
                        Appliquer les filtres
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
