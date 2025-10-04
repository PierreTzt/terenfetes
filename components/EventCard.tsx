'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, MapPin, Banknote, ChevronRight } from 'lucide-react'
import { EventPublicDTO } from '@/types'
import { formatEventDateShort, formatTime, formatPrice, isNewEvent } from '@/utils/format'
import Badge, { NewBadge } from './Badge'

interface EventCardProps {
  event: EventPublicDTO
}

export default function EventCard({ event }: EventCardProps) {
  const maxBadges = 2 // Limit to 2 badges per design system
  const visibleBadges = event.badges?.slice(0, maxBadges) || []
  const remainingBadgeCount = (event.badges?.length || 0) - maxBadges
  const showNewBadge = isNewEvent(event.startAt)

  return (
    <Link
      href={`/evenement/${event.slug}`}
      className="group flex flex-col bg-white border border-bg-1 overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-all duration-200 hover:shadow-[var(--shadow-hover)]"
      style={{
        borderRadius: 'var(--radius-card)'
      }}
      aria-label={`Voir l'événement ${event.title}${event.isSponsored ? ' (Sponsorisé)' : ''}`}
    >
      {/* Image 16:9 with filter */}
      <div className="relative w-full aspect-video overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover img-treated group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-50">
            {/* Uniform fallback */}
            <Calendar className="w-16 h-16 text-brand opacity-30" />
          </div>
        )}

        {/* New badge (< 72h) - top left corner, 12px */}
        {showNewBadge && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[12px] font-semibold bg-[#FFF4E0] text-[#B45309] border border-[#B45309]/20" style={{ borderRadius: 'var(--radius-badge)' }}>
              <span>✨</span>
              <span>Nouveau</span>
            </span>
          </div>
        )}

        {/* Top right corner - Sponsored badge or Chevron on hover */}
        {event.isSponsored ? (
          <div className="absolute top-2 right-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-brand-50 text-brand border border-brand/30"
              style={{ borderRadius: 'var(--radius-badge)' }}
            >
              ⭐ Sponsorisé
            </span>
          </div>
        ) : (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
              <ChevronRight className="w-5 h-5 text-brand" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Badges - categories, audience, options */}
        {(event.category?.length || event.audience?.length || event.indoor !== undefined || event.pmr) && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {/* Categories - max 2 */}
            {event.category?.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-brand text-white"
                style={{ borderRadius: 'var(--radius-badge)' }}
              >
                {cat}
              </span>
            ))}

            {/* Audience - first one only */}
            {event.audience?.[0] && (
              <span
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-success text-white"
                style={{ borderRadius: 'var(--radius-badge)' }}
              >
                {event.audience[0]}
              </span>
            )}

            {/* Indoor/Outdoor */}
            {event.indoor !== undefined && event.indoor !== null && (
              <span
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#E8EEFF] text-brand"
                style={{ borderRadius: 'var(--radius-badge)' }}
              >
                {event.indoor ? '🏠' : '🌳'}
              </span>
            )}

            {/* PMR */}
            {event.pmr && (
              <span
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium"
                style={{
                  borderRadius: 'var(--radius-badge)',
                  backgroundColor: 'var(--color-badge-accessible-bg)',
                  color: 'var(--color-badge-accessible-text)'
                }}
              >
                ♿
              </span>
            )}

            {/* System badges (free, etc.) - max 1 */}
            {visibleBadges.slice(0, 1).map((badge) => (
              <Badge key={badge} badge={badge} size="sm" />
            ))}
          </div>
        )}

        {/* Title - clamp to 2 lines */}
        <h3 className="text-lg font-semibold text-ink mb-1.5 line-clamp-2 leading-tight min-h-[3rem]">
          {event.title}
        </h3>

        {/* Metadata - single line: ville · date · heure · prix */}
        <div className="flex items-center gap-2 text-xs text-muted-700 mb-auto">
          {/* City */}
          {event.city && (
            <>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-[18px] h-[18px] flex-shrink-0" style={{ color: '#3A4253' }} />
                <span className="truncate">{event.city}</span>
              </span>
              <span className="text-muted-400">·</span>
            </>
          )}

          {/* Date */}
          <time dateTime={event.startAt} className="flex items-center gap-1">
            <Calendar className="w-[18px] h-[18px]" style={{ color: '#3A4253' }} />
            <span>{formatEventDateShort(event.startAt)}</span>
          </time>

          {/* Time */}
          <span className="text-muted-400">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-[18px] h-[18px]" style={{ color: '#3A4253' }} />
            <span>{formatTime(event.startAt)}</span>
          </span>

          {/* Price */}
          {(event.price?.min !== undefined || event.price?.max !== undefined) && (
            <>
              <span className="text-muted-400">·</span>
              <span className="flex items-center gap-1 font-semibold text-ink">
                <Banknote className="w-[18px] h-[18px] flex-shrink-0" style={{ color: '#3A4253' }} />
                {formatPrice(event.price.min, event.price.max)}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
