'use client'

import { useEffect } from 'react'
import { trackEventView } from '@/lib/tracking'

interface TrackEventViewProps {
  eventId: string
}

export default function TrackEventView({ eventId }: TrackEventViewProps) {
  useEffect(() => {
    // Track view when component mounts
    trackEventView(eventId)
  }, [eventId])

  return null // This component doesn't render anything
}
