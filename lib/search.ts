/**
 * Search utilities for accent-insensitive and synonym-aware search
 */

/**
 * Normalize a string by removing accents and converting to lowercase
 * "Théâtre" → "theatre"
 * "Fête" → "fete"
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
}

/**
 * Synonym mappings for common search terms
 * Key: normalized search term
 * Value: array of synonyms (will be normalized internally)
 */
const SYNONYM_MAP: Record<string, string[]> = {
  // Events
  'spectacle': ['show', 'representation', 'piece'],
  'concert': ['musique', 'live'],
  'expo': ['exposition', 'galerie'],
  'atelier': ['workshop', 'cours', 'stage'],
  'conference': ['talk', 'seminaire'],
  'festival': ['fest'],
  'marche': ['market', 'brocante'],
  'cinema': ['film', 'seance'],
  'theatre': ['piece', 'comedie', 'tragedie'],
  'danse': ['ballet', 'chorégraphie', 'choregraphie'],
  'sport': ['match', 'competition'],

  // Reverse mappings
  'show': ['spectacle'],
  'workshop': ['atelier'],
  'talk': ['conference', 'conférence'],
  'film': ['cinema', 'cinéma'],
  'market': ['marche', 'marché'],

  // Audiences
  'enfant': ['kids', 'enfants', 'jeune', 'famille'],
  'famille': ['enfant', 'kids', 'tout public'],
  'adulte': ['adultes'],

  // Other
  'gratuit': ['free', 'libre'],
  'free': ['gratuit'],
}

/**
 * Get all synonyms for a given search term (normalized)
 * Returns the original term + all its synonyms
 */
export function getSynonyms(term: string): string[] {
  const normalized = normalizeString(term)
  const synonyms = SYNONYM_MAP[normalized] || []

  // Return original + synonyms, all normalized
  return [normalized, ...synonyms.map(normalizeString)]
}

/**
 * Expand a search query with synonyms
 * "spectacle paris" → ["spectacle paris", "show paris", "representation paris"]
 */
export function expandQueryWithSynonyms(query: string): string[] {
  const normalized = normalizeString(query)
  const words = normalized.split(/\s+/)

  // For each word, get its synonyms
  const expandedQueries: Set<string> = new Set([normalized])

  words.forEach((word) => {
    const synonyms = getSynonyms(word)

    // Replace the word with each synonym in the original query
    synonyms.forEach((synonym) => {
      if (synonym !== word) {
        const expandedQuery = normalized.replace(
          new RegExp(`\\b${word}\\b`, 'g'),
          synonym
        )
        expandedQueries.add(expandedQuery)
      }
    })
  })

  return Array.from(expandedQueries)
}

/**
 * Check if a string matches a search term (accent-insensitive, with synonyms)
 */
export function matchesSearch(text: string, searchTerm: string): boolean {
  const normalizedText = normalizeString(text)
  const expandedQueries = expandQueryWithSynonyms(searchTerm)

  return expandedQueries.some((query) => normalizedText.includes(query))
}
