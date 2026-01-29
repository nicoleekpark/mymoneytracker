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
 */
export function scoreText(q: string, text: string, base: number): number {
  if (!q) return 0
  if (text.startsWith(q)) return base + 100
  if (text.includes(q)) return base + 50
  return 0
}
