import { prisma } from '@/lib/prisma'

/**
 * Detect potential duplicate events using similarity algorithm
 * Returns pairs of events that might be duplicates
 */
export async function detectDuplicates() {
  // SQL query to find potential duplicates using:
  // 1. Title similarity (pg_trgm extension)
  // 2. Same date
  // 3. Distance < 300m OR same venue
  const query = `
    SELECT
      e1.id as event1_id,
      e1.title as event1_title,
      e1."startAt" as event1_date,
      e1.city as event1_city,
      e2.id as event2_id,
      e2.title as event2_title,
      e2."startAt" as event2_date,
      e2.city as event2_city,
      similarity(unaccent(lower(e1.title)), unaccent(lower(e2.title))) as title_similarity,
      CASE
        WHEN e1."venueId" = e2."venueId" AND e1."venueId" IS NOT NULL THEN true
        WHEN e1.lat IS NOT NULL AND e1.lng IS NOT NULL AND e2.lat IS NOT NULL AND e2.lng IS NOT NULL
          THEN earth_distance(ll_to_earth(e1.lat, e1.lng), ll_to_earth(e2.lat, e2.lng)) < 300
        ELSE false
      END as location_match
    FROM "Event" e1
    JOIN "Event" e2 ON e1.id < e2.id
    WHERE
      -- Same date (day)
      date_trunc('day', e1."startAt") = date_trunc('day', e2."startAt")
      -- Title similarity threshold
      AND similarity(unaccent(lower(e1.title)), unaccent(lower(e2.title))) > 0.75
      -- Both should be PUBLISHED or PENDING (not already rejected/archived)
      AND e1.status IN ('PUBLISHED', 'PENDING')
      AND e2.status IN ('PUBLISHED', 'PENDING')
    ORDER BY title_similarity DESC
    LIMIT 100;
  `

  try {
    const duplicates = await prisma.$queryRawUnsafe<Array<{
      event1_id: string
      event1_title: string
      event1_date: Date
      event1_city: string | null
      event2_id: string
      event2_title: string
      event2_date: Date
      event2_city: string | null
      title_similarity: number
      location_match: boolean
    }>>(query)

    return duplicates.map(dup => ({
      event1: {
        id: dup.event1_id,
        title: dup.event1_title,
        startAt: dup.event1_date,
        city: dup.event1_city,
      },
      event2: {
        id: dup.event2_id,
        title: dup.event2_title,
        startAt: dup.event2_date,
        city: dup.event2_city,
      },
      similarity: Number(dup.title_similarity),
      locationMatch: dup.location_match,
      score: calculateDuplicateScore(Number(dup.title_similarity), dup.location_match),
    }))
  } catch (error) {
    console.error('Error detecting duplicates:', error)
    return []
  }
}

/**
 * Calculate duplicate confidence score (0-100)
 */
function calculateDuplicateScore(titleSimilarity: number, locationMatch: boolean): number {
  let score = titleSimilarity * 70 // Title is 70% of the score

  if (locationMatch) {
    score += 30 // Location match is 30%
  }

  return Math.round(score * 100)
}

/**
 * Merge two duplicate events
 * Keep the primary event, merge data from secondary, and archive secondary
 */
export async function mergeEvents(primaryId: string, secondaryId: string) {
  try {
    // Get both events
    const [primary, secondary] = await Promise.all([
      prisma.event.findUnique({
        where: { id: primaryId },
        include: { venue: true },
      }),
      prisma.event.findUnique({
        where: { id: secondaryId },
        include: { venue: true },
      }),
    ])

    if (!primary || !secondary) {
      throw new Error('One or both events not found')
    }

    // Merge metrics: sum views and CTA clicks
    await prisma.$executeRaw`
      INSERT INTO "MetricsEvent" ("eventId", "metricDate", "views", "cta_clicks")
      SELECT
        ${primaryId} as "eventId",
        "metricDate",
        SUM("views") as "views",
        SUM("cta_clicks") as "cta_clicks"
      FROM "MetricsEvent"
      WHERE "eventId" IN (${primaryId}, ${secondaryId})
      GROUP BY "metricDate"
      ON CONFLICT ("eventId", "metricDate")
      DO UPDATE SET
        "views" = "MetricsEvent"."views" + EXCLUDED."views",
        "cta_clicks" = "MetricsEvent"."cta_clicks" + EXCLUDED."cta_clicks";
    `

    // Delete old metrics for secondary event
    await prisma.metricsEvent.deleteMany({
      where: { eventId: secondaryId },
    })

    // Update primary event with enriched data from secondary if missing
    const updateData: any = {}

    if (!primary.description && secondary.description) {
      updateData.description = secondary.description
    }

    if (!primary.imageUrl && secondary.imageUrl) {
      updateData.imageUrl = secondary.imageUrl
    }

    if (!primary.url && secondary.url) {
      updateData.url = secondary.url
    }

    // Merge categories and audiences (union)
    const mergedCategories = Array.from(new Set([...primary.category, ...secondary.category]))
    const mergedAudiences = Array.from(new Set([...primary.audience, ...secondary.audience]))

    updateData.category = mergedCategories
    updateData.audience = mergedAudiences

    // Update primary event
    if (Object.keys(updateData).length > 0) {
      await prisma.event.update({
        where: { id: primaryId },
        data: updateData,
      })
    }

    // Archive secondary event
    await prisma.event.update({
      where: { id: secondaryId },
      data: {
        status: 'ARCHIVED',
        title: `[DUPLIQUÉ] ${secondary.title}`,
      },
    })

    return {
      success: true,
      primaryId,
      secondaryId,
      mergedData: updateData,
    }
  } catch (error) {
    console.error('Error merging events:', error)
    throw error
  }
}

/**
 * Mark two events as NOT duplicates (false positive)
 */
export async function markNotDuplicate(event1Id: string, event2Id: string) {
  // In a full implementation, we would store this in a "NotDuplicates" table
  // For V1, we just log it
  console.log(`Marked as NOT duplicates: ${event1Id} and ${event2Id}`)
  return { success: true }
}
