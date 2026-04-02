/**
 * Search scoring constants.
 * Higher values = better match quality.
 */
const SEARCH_SCORES = {
  /** Bonus for prefix match (query at start of text) */
  PREFIX_MATCH: 100,
  /** Bonus for substring match (query anywhere in text) */
  CONTAINS_MATCH: 50,
} as const

/**
 * Normalize string for search matching.
 * Removes emojis, special characters, and normalizes whitespace.
 */
export function normalizeForSearch(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Score text match for search ranking.
 * Higher score = better match.
 *
 * @param q - Normalized search query
 * @param text - Normalized text to search
 * @param base - Base score for this field (e.g., item=300, merchant=200)
 * @returns Score: base + PREFIX_MATCH for starts-with, base + CONTAINS_MATCH for includes, 0 for no match
 */
export function scoreText(q: string, text: string, base: number): number {
  if (!q) return 0
  if (text.startsWith(q)) return base + SEARCH_SCORES.PREFIX_MATCH
  if (text.includes(q)) return base + SEARCH_SCORES.CONTAINS_MATCH
  return 0
}
