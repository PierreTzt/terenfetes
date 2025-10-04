import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Banknote, ArrowLeft } from 'lucide-react'
import { EventPublicDTO } from '@/types'
import { formatEventDateShort, formatTime, formatPrice } from '@/utils/format'
import TrackEventView from '@/components/TrackEventView'
import EventRecommendations from '@/components/EventRecommendations'
import EventActions from '@/components/EventActions'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Badge from '@/components/Badge'

async function getEvent(slug: string): Promise<EventPublicDTO | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const res = await fetch(`${baseUrl}/api/events/${slug}`, {
      next: { revalidate: 300 },
      cache: 'no-store'
    })

    if (!res.ok) {
      return null
    }

    return res.json()
  } catch (error) {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    return {
      title: 'Événement introuvable',
    }
  }

  return {
    title: `${event.title} | Territoire en Fête`,
    description: event.description || `Découvrez ${event.title} sur Territoire en Fête`,
    openGraph: {
      title: event.title,
      description: event.description || undefined,
      images: event.imageUrl ? [event.imageUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.description || undefined,
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  const startDate = new Date(event.startAt)
  const endDate = event.endAt ? new Date(event.endAt) : null

  const dateStr = formatEventDateShort(event.startAt)
  const timeStr = formatTime(event.startAt)
  const endTimeStr = endDate ? formatTime(endDate) : null

  // Prepare location for calendar
  const location = event.venue
    ? `${event.venue.name}${event.venue.address ? `, ${event.venue.address}` : ''}${event.venue.city ? `, ${event.venue.city}` : ''}`
    : event.city || ''

  return (
    <>
      <TrackEventView eventId={event.id} />

      <div className="min-h-screen flex flex-col bg-bg-0">
        <Navigation />

        <main className="flex-1">
          {/* Back button */}
          <div className="bg-white border-b border-bg-1">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-700 hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux événements
              </a>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <article>
              {/* Hero Image with border radius 20px */}
              {event.imageUrl && (
                <div className="relative w-full aspect-video overflow-hidden mb-8 shadow-lg" style={{ borderRadius: 'var(--radius-container)' }}>
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    sizes="896px"
                    className="object-cover img-treated"
                    priority
                  />
                </div>
              )}

              <div className="bg-white p-8 mb-8" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
                {/* Title */}
                <h1 className="h1 mb-6">
                  {event.title}
                </h1>

                {/* Categories, Audience & Options */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {/* Categories */}
                  {event.category && event.category.length > 0 && (
                    <>
                      {event.category.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-brand text-white"
                          style={{ borderRadius: 'var(--radius-badge)' }}
                        >
                          {cat}
                        </span>
                      ))}
                      {event.category.length > 3 && (
                        <span
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-brand text-white"
                          style={{ borderRadius: 'var(--radius-badge)' }}
                        >
                          +{event.category.length - 3}
                        </span>
                      )}
                    </>
                  )}

                  {/* Audience */}
                  {event.audience && event.audience.length > 0 && (
                    <span
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-success text-white"
                      style={{ borderRadius: 'var(--radius-badge)' }}
                    >
                      {event.audience[0]}
                    </span>
                  )}

                  {/* Indoor/Outdoor */}
                  {event.indoor !== undefined && event.indoor !== null && (
                    <span
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-[#E8EEFF] text-brand"
                      style={{ borderRadius: 'var(--radius-badge)' }}
                    >
                      {event.indoor ? '🏠 Intérieur' : '🌳 Plein air'}
                    </span>
                  )}

                  {/* PMR */}
                  {event.pmr && (
                    <span
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium"
                      style={{
                        borderRadius: 'var(--radius-badge)',
                        backgroundColor: 'var(--color-badge-accessible-bg)',
                        color: 'var(--color-badge-accessible-text)'
                      }}
                    >
                      ♿ Accessible PMR
                    </span>
                  )}

                  {/* System Badges (free, new, etc.) */}
                  {event.badges && event.badges.length > 0 && (
                    <>
                      {event.badges.slice(0, 2).map((badge) => (
                        <Badge key={badge} badge={badge} size="md" />
                      ))}
                    </>
                  )}
                </div>

                {/* Info blocks in 3 columns */}
                <div className="grid md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-bg-1">
                  {/* Date & Time */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <p className="small font-semibold text-muted-400 mb-1">Date et heure</p>
                      <p className="text-base font-semibold text-ink">{dateStr}</p>
                      <p className="text-sm text-muted-700">
                        {timeStr}
                        {endTimeStr && ` – ${endTimeStr}`}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {event.venue && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-teal" />
                      </div>
                      <div>
                        <p className="small font-semibold text-muted-400 mb-1">Lieu</p>
                        <p className="text-base font-semibold text-ink">{event.venue.name}</p>
                        {event.venue.address && <p className="text-sm text-muted-700">{event.venue.address}</p>}
                        {event.venue.city && <p className="text-sm text-muted-700">{event.venue.city}</p>}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  {(event.price?.min !== undefined || event.price?.max !== undefined) && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                        <Banknote className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="small font-semibold text-muted-400 mb-1">Tarif</p>
                        <p className="text-lg font-bold text-ink">
                          {formatPrice(event.price.min, event.price.max)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description - "À propos" */}
                {event.description && (
                  <div className="mb-8">
                    <h2 className="h3 mb-4">À propos</h2>
                    <div className="prose max-w-none">
                      <p className="text-base text-muted-700 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <EventActions event={event} />
              </div>

              {/* Recommendations - "Si vous aimez, vous aimerez aussi" */}
              <EventRecommendations eventSlug={slug} />
            </article>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
