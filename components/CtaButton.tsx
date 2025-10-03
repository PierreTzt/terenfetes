'use client'

import { useState } from 'react'
import { trackCtaClick } from '@/lib/tracking'

interface CtaButtonProps {
  eventId: string
  url: string
  label?: string
  className?: string
}

export default function CtaButton({ eventId, url, label = 'Infos / Billetterie', className = '' }: CtaButtonProps) {
  const [isTracking, setIsTracking] = useState(false)

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isTracking) return

    setIsTracking(true)

    // Track the click
    await trackCtaClick(eventId)

    setIsTracking(false)
    // Let the default link behavior continue
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${className}`}
      aria-label={label}
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
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {label}
      <svg
        className="w-4 h-4 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  )
}
