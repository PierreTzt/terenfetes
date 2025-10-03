/**
 * Simple in-memory rate limiter
 * For production, use Redis or a database
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Check rate limit for an identifier (e.g., IP address)
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and retry info
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // No entry or expired entry
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitMap.set(identifier, newEntry)
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: newEntry.resetAt,
    }
  }

  // Entry exists and not expired
  if (entry.count < limit) {
    entry.count++
    return {
      allowed: true,
      remaining: limit - entry.count,
      resetAt: entry.resetAt,
    }
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
  }
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  // Try various headers
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-vercel-forwarded-for', // Vercel
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can be a comma-separated list
      const ip = value.split(',')[0].trim()
      if (ip) return ip
    }
  }

  return 'unknown'
}
