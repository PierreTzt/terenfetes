/**
 * Format a date in French format: lun. 6 oct. 2025 · 18:30
 */
export function formatEventDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const dateStr = d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const timeStr = d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${dateStr} · ${timeStr}`
}

/**
 * Format a date without time: lun. 6 oct. 2025
 */
export function formatEventDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format time only: 18:30
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format price with non-breaking space before €
 * Examples:
 * - (0, 0) => "Gratuit"
 * - (15, 15) => "15 €"
 * - (15, 25) => "15–25 €"
 */
export function formatPrice(min?: number, max?: number): string {
  if (min === undefined && max === undefined) {
    return ''
  }

  if (min === 0 && (max === undefined || max === 0)) {
    return 'Gratuit'
  }

  if (min !== undefined && max !== undefined && min === max) {
    return `${min}\u00A0€`
  }

  if (min !== undefined && max !== undefined && min !== max) {
    return `${min}–${max}\u00A0€`
  }

  if (min !== undefined) {
    return `À partir de ${min}\u00A0€`
  }

  if (max !== undefined) {
    return `Jusqu'à ${max}\u00A0€`
  }

  return ''
}

/**
 * Check if event is new (< 72h after publication)
 */
export function isNewEvent(createdAt: Date | string): boolean {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const now = new Date()
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
  return diffHours < 72
}

/**
 * Format relative time (e.g., "dans 3 jours", "dans 2 heures")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 1) {
    return `dans ${diffDays} jours`
  }

  if (diffDays === 1) {
    return 'demain'
  }

  if (diffDays === 0 && diffHours > 0) {
    return `dans ${diffHours}h`
  }

  if (diffHours === 0 && diffMinutes > 0) {
    return `dans ${diffMinutes}min`
  }

  if (diffMinutes <= 0) {
    return 'maintenant'
  }

  return ''
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength).trim() + '…'
}
