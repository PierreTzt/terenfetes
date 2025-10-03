/**
 * Generate .ics file content for an event
 */
export function generateICS(event: {
  title: string
  description?: string
  startAt: string | Date
  endAt?: string | Date
  location?: string
  url?: string
}): string {
  const start = typeof event.startAt === 'string' ? new Date(event.startAt) : event.startAt
  const end = event.endAt
    ? typeof event.endAt === 'string'
      ? new Date(event.endAt)
      : event.endAt
    : new Date(start.getTime() + 2 * 60 * 60 * 1000) // Default: 2 hours

  // Format dates as YYYYMMDDTHHMMSSZ
  const formatDate = (date: Date): string => {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  }

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Territoire en Fête//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@territoireenfete.fr
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || event.title}${event.url ? `\\n\\nPlus d'infos: ${event.url}` : ''}
LOCATION:${event.location || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

  return icsContent
}

/**
 * Download ICS file
 */
export function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generate Google Calendar URL
 */
export function getGoogleCalendarUrl(event: {
  title: string
  description?: string
  startAt: string | Date
  endAt?: string | Date
  location?: string
}): string {
  const start = typeof event.startAt === 'string' ? new Date(event.startAt) : event.startAt
  const end = event.endAt
    ? typeof event.endAt === 'string'
      ? new Date(event.endAt)
      : event.endAt
    : new Date(start.getTime() + 2 * 60 * 60 * 1000)

  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details: event.description || '',
    location: event.location || '',
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate Outlook Calendar URL
 */
export function getOutlookCalendarUrl(event: {
  title: string
  description?: string
  startAt: string | Date
  endAt?: string | Date
  location?: string
}): string {
  const start = typeof event.startAt === 'string' ? new Date(event.startAt) : event.startAt
  const end = event.endAt
    ? typeof event.endAt === 'string'
      ? new Date(event.endAt)
      : event.endAt
    : new Date(start.getTime() + 2 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description || '',
    location: event.location || '',
    startdt: start.toISOString(),
    enddt: end.toISOString(),
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}
