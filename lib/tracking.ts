/**
 * Client-side tracking utilities
 */

/**
 * Track event view
 */
export async function trackEventView(eventId: string) {
  try {
    await fetch('/api/metrics/view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId }),
    })
  } catch (error) {
    console.error('Failed to track view:', error)
  }
}

/**
 * Track CTA click
 */
export async function trackCtaClick(eventId: string) {
  try {
    await fetch('/api/metrics/cta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId }),
    })
  } catch (error) {
    console.error('Failed to track CTA click:', error)
  }
}

/**
 * Track share click
 */
export function trackShare(eventId: string, platform: string) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('share_click', {
      eventId,
      platform,
    })
  }
}

/**
 * Track submit attempt
 */
export function trackSubmitAttempt() {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('submit_attempt')
  }
}

/**
 * Track submit success
 */
export function trackSubmitSuccess(eventId: string) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('submit_success', {
      eventId,
    })
  }
}

/**
 * Add UTM parameters to URL
 */
export function addUtmParams(url: string, source: string, medium: string, campaign: string): string {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('utm_source', source)
    urlObj.searchParams.set('utm_medium', medium)
    urlObj.searchParams.set('utm_campaign', campaign)
    return urlObj.toString()
  } catch {
    return url
  }
}

// Extend window type for PostHog
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void
    }
  }
}
