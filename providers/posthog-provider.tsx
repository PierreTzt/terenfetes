'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog only once
    if (typeof window !== 'undefined') {
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

      if (posthogKey) {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              // Disable in development
              posthog.opt_out_capturing()
            }
          },
          capture_pageview: false, // We'll handle this manually
          capture_pageleave: true,
        })
      }
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}

/**
 * Track page views
 */
export function PostHogPageView(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && window.posthog) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + '?' + searchParams.toString()
      }

      window.posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return null
}
