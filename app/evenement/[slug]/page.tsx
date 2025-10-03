import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { EventPublicDTO } from '@/types'
import { formatEventDateShort, formatTime, formatPrice } from '@/utils/format'
import CtaButton from '@/components/CtaButton'
import AddToCalendar from '@/components/AddToCalendar'
import ShareButton from '@/components/ShareButton'
import TrackEventView from '@/components/TrackEventView'

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

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startAt,
    endDate: event.endAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: event.venue ? {
      '@type': 'Place',
      name: event.venue.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.venue.address,
        addressLocality: event.venue.city,
        addressCountry: 'FR',
      },
      geo: event.venue.lat && event.venue.lng ? {
        '@type': 'GeoCoordinates',
        latitude: event.venue.lat,
        longitude: event.venue.lng,
      } : undefined,
    } : undefined,
    image: event.imageUrl ? [event.imageUrl] : [],
    url: event.url,
    offers: event.price?.min !== undefined ? {
      '@type': 'Offer',
      price: event.price.min,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    } : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'Territoire en Fête',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <TrackEventView eventId={event.id} />

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <a
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux événements
            </a>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article>
            {/* Hero Image */}
            {event.imageUrl && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {event.title}
              </h1>

              {/* Categories */}
              {event.category.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {event.category.map((cat) => (
                    <span
                      key={cat}
                      className="inline-block px-4 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {/* Event Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                {/* Date & Time */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
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
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Date et heure</p>
                    <p className="text-gray-900 font-semibold">{dateStr}</p>
                    <p className="text-gray-700">
                      {timeStr}
                      {endTimeStr && ` – ${endTimeStr}`}
                    </p>
                  </div>
                </div>

                {/* Location */}
                {event.venue && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Lieu</p>
                      <p className="text-gray-900 font-semibold">{event.venue.name}</p>
                      {event.venue.address && <p className="text-gray-700">{event.venue.address}</p>}
                      {event.venue.city && <p className="text-gray-700">{event.venue.city}</p>}
                    </div>
                  </div>
                )}

                {/* Price */}
                {(event.price?.min !== undefined || event.price?.max !== undefined) && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Tarif</p>
                      <p className="text-gray-900 font-semibold text-lg">
                        {formatPrice(event.price.min, event.price.max)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {event.url && (
                  <CtaButton
                    eventId={event.id}
                    url={event.url}
                    label="Infos / Billetterie"
                    className="flex-1"
                  />
                )}
                <AddToCalendar
                  event={{
                    title: event.title,
                    description: event.description,
                    startAt: event.startAt,
                    endAt: event.endAt,
                    location,
                    url: event.url,
                  }}
                />
                <ShareButton
                  eventTitle={event.title}
                  eventUrl={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/evenement/${event.slug}`}
                  eventId={event.id}
                />
              </div>
            </div>
          </article>
        </main>
      </div>
    </>
  )
}
