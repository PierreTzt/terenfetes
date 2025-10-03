import Link from 'next/link'
import Image from 'next/image'
import { EventPublicDTO } from '@/types'
import { formatEventDate, formatPrice, isNewEvent } from '@/utils/format'

interface EventCardProps {
  event: EventPublicDTO
  isNew?: boolean
}

export default function EventCard({ event, isNew }: EventCardProps) {
  const maxBadges = 2
  const visibleCategories = event.category.slice(0, maxBadges)
  const remainingCount = event.category.length - maxBadges

  return (
    <Link
      href={`/evenement/${event.slug}`}
      className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`Voir l'événement ${event.title}`}
    >
      {/* Image with 16:9 ratio */}
      <div className="relative w-full aspect-video bg-gray-200">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <svg
              className="w-16 h-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* New badge */}
        {isNew && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-lg">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Nouveau
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title - clamp to 2 lines */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
          {event.title}
        </h3>

        {/* Date */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg
            className="w-4 h-4 mr-2 flex-shrink-0"
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
          <time dateTime={event.startAt} className="line-clamp-1">
            {formatEventDate(event.startAt)}
          </time>
        </div>

        {/* Venue */}
        {event.venue && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg
              className="w-4 h-4 mr-2 flex-shrink-0"
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
            <span className="line-clamp-1">
              {event.venue.name}
              {event.venue.city && `, ${event.venue.city}`}
            </span>
          </div>
        )}

        {/* Categories - limit to 3, show +X for remaining */}
        {event.category.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {visibleCategories.map((cat) => (
              <span
                key={cat}
                className="inline-block px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200"
              >
                {cat}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-block px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 rounded-full border border-gray-200">
                +{remainingCount}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        {(event.price?.min !== undefined || event.price?.max !== undefined) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(event.price.min, event.price.max)}
              </span>
              <span className="text-xs text-blue-600 font-medium group-hover:underline">
                Voir détails →
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
