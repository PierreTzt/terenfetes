'use client'

import { useState } from 'react'
import { generateICS, downloadICS, getGoogleCalendarUrl, getOutlookCalendarUrl } from '@/utils/calendar'

interface AddToCalendarProps {
  event: {
    title: string
    description?: string
    startAt: string
    endAt?: string
    location?: string
    url?: string
  }
}

export default function AddToCalendar({ event }: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAppleCalendar = () => {
    const location = event.location || ''
    const icsContent = generateICS({
      title: event.title,
      description: event.description,
      startAt: event.startAt,
      endAt: event.endAt,
      location,
      url: event.url,
    })
    downloadICS(icsContent, `${event.title}.ics`)
    setIsOpen(false)
  }

  const handleGoogleCalendar = () => {
    const url = getGoogleCalendarUrl({
      title: event.title,
      description: event.description,
      startAt: event.startAt,
      endAt: event.endAt,
      location: event.location,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  const handleOutlookCalendar = () => {
    const url = getOutlookCalendarUrl({
      title: event.title,
      description: event.description,
      startAt: event.startAt,
      endAt: event.endAt,
      location: event.location,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        aria-label="Ajouter à mon agenda"
        aria-expanded={isOpen}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Ajouter à mon agenda
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute left-0 z-20 mt-2 w-64 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                onClick={handleGoogleCalendar}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                </svg>
                Google Calendar
              </button>

              <button
                onClick={handleOutlookCalendar}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 7.875v8.25A3.375 3.375 0 0120.625 19.5h-8.25v-4.125h3.188l.75-3.75h-3.938V9.375c0-.938.469-1.875 1.875-1.875h1.688V4.313s-1.5-.094-2.625-.094c-2.719 0-4.5 1.594-4.5 4.5v2.531H4.875v3.75h3.938V19.5H3.375A3.375 3.375 0 010 16.125v-8.25A3.375 3.375 0 013.375 4.5h17.25A3.375 3.375 0 0124 7.875z" />
                </svg>
                Outlook
              </button>

              <button
                onClick={handleAppleCalendar}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                role="menuitem"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple Calendar / iCal
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
