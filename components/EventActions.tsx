'use client'

import { useState, useEffect } from 'react'
import { CalendarPlus, Share2, Heart } from 'lucide-react'
import Button from './Button'
import { EventPublicDTO } from '@/types'

interface EventActionsProps {
  event: EventPublicDTO
}

export default function EventActions({ event }: EventActionsProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userEmail = localStorage.getItem('user_email')
    setIsLoggedIn(!!userEmail)

    if (userEmail) {
      checkIfFavorite()
    }
  }, [])

  const checkIfFavorite = async () => {
    const userEmail = localStorage.getItem('user_email')
    if (!userEmail) return

    try {
      // Get user
      const userRes = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`)
      const userData = await userRes.json()
      const userId = userData.data?.id

      if (!userId) return

      // Check if event is in favorites
      const favRes = await fetch(`/api/users/${userId}/favorites`)
      const favData = await favRes.json()

      if (favData.data) {
        const isFav = favData.data.some((fav: any) => fav.eventId === event.id)
        setIsFavorite(isFav)
      }
    } catch (error) {
      console.error('Error checking favorite:', error)
    }
  }

  const handleAddToCalendar = () => {
    // Create .ics file
    const startDate = new Date(event.startAt)
    const endDate = event.endAt ? new Date(event.endAt) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // Default 2h duration

    const formatDateForICS = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const location = event.venue
      ? `${event.venue.name}${event.venue.address ? `, ${event.venue.address}` : ''}${event.venue.city ? `, ${event.venue.city}` : ''}`
      : event.city || ''

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Territoire en Fête//Event//FR
BEGIN:VEVENT
UID:${event.id}@terenfetes.fr
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(startDate)}
DTEND:${formatDateForICS(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${location}
URL:${event.url || `${window.location.origin}/evenement/${event.slug}`}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${event.slug}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: event.description || `Découvrez ${event.title}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled or error, fallback to copy
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Lien copié dans le presse-papier !')
  }

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      alert('Vous devez être connecté pour ajouter aux favoris')
      window.location.href = '/connexion'
      return
    }

    setLoading(true)

    try {
      const userEmail = localStorage.getItem('user_email')
      const userRes = await fetch(`/api/users?email=${encodeURIComponent(userEmail!)}`)
      const userData = await userRes.json()
      const userId = userData.data?.id

      if (!userId) {
        alert('Erreur: utilisateur non trouvé')
        return
      }

      if (isFavorite) {
        // Remove from favorites
        await fetch(`/api/users/${userId}/favorites/${event.id}`, {
          method: 'DELETE',
        })
        setIsFavorite(false)
      } else {
        // Add to favorites
        await fetch(`/api/users/${userId}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: event.id }),
        })
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-bg-1">
      {event.url && (
        <Button
          variant="primary"
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          Infos / Billetterie
        </Button>
      )}

      <Button
        variant="ghost"
        icon={CalendarPlus}
        onClick={handleAddToCalendar}
      >
        Ajouter à mon agenda
      </Button>

      <Button
        variant="ghost"
        icon={Share2}
        onClick={handleShare}
      >
        Partager
      </Button>

      <Button
        variant={isFavorite ? 'primary' : 'ghost'}
        icon={Heart}
        onClick={handleToggleFavorite}
        disabled={loading}
        className={isFavorite ? 'bg-alert hover:bg-alert/90' : ''}
      >
        {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
      </Button>
    </div>
  )
}
