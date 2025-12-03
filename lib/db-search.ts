/**
 * Database search utilities with accent-insensitive support
 */

import { prisma } from './prisma'
import { normalizeString, expandQueryWithSynonyms } from './search'

/**
 * Check if PostgreSQL unaccent extension is available
 * Cache the result to avoid repeated queries
 */
let unaccentAvailable: boolean | null = null

async function isUnaccentAvailable(): Promise<boolean> {
  if (unaccentAvailable !== null) {
    return unaccentAvailable
  }

  try {
    // Try to use unaccent function
    await prisma.$queryRaw`SELECT unaccent('test')`
    unaccentAvailable = true
  } catch (error) {
    console.warn('PostgreSQL unaccent extension not available. Search will not be fully accent-insensitive.')
    unaccentAvailable = false
  }

  return unaccentAvailable
}

/**
 * Build search conditions for Prisma with synonym expansion
 * This will search for the original query + all synonym variations
 */
export function buildSearchConditions(query: string) {
  const expandedQueries = expandQueryWithSynonyms(query)

  // Create search conditions for each expanded query (original + synonyms)
  return expandedQueries.flatMap((q) => [
    { title: { contains: q, mode: 'insensitive' } },
    { description: { contains: q, mode: 'insensitive' } },
    { city: { contains: q, mode: 'insensitive' } },
  ])
}

/**
 * Search events with accent-insensitive support using PostgreSQL unaccent
 * Returns event IDs that match the search query
 * Only call this if you need raw SQL search (for maximum accent support)
 */
export async function searchEventsWithUnaccent(
  query: string,
  statusFilter: string = 'PUBLISHED'
): Promise<number[]> {
  const hasUnaccent = await isUnaccentAvailable()

  if (!hasUnaccent) {
    return []
  }

  try {
    // Normalize and expand query with synonyms
    const expandedQueries = expandQueryWithSynonyms(query)

    // Build conditions for each query variant
    const orConditions = expandedQueries
      .map((q) => {
        const searchPattern = `%${q}%`
        return `(
          unaccent(LOWER("title")) LIKE unaccent(LOWER('${searchPattern}')) OR
          unaccent(LOWER("description")) LIKE unaccent(LOWER('${searchPattern}')) OR
          unaccent(LOWER("city")) LIKE unaccent(LOWER('${searchPattern}'))
        )`
      })
      .join(' OR ')

    // Execute raw SQL query
    const results = await prisma.$queryRawUnsafe<{ id: number }[]>(
      `SELECT id FROM "Event" WHERE "status" = '${statusFilter}' AND (${orConditions})`
    )

    return results.map((r) => r.id)
  } catch (error) {
    console.error('Error in searchEventsWithUnaccent:', error)
    return []
  }
}
