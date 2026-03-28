// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN SCHEMA: Tag
// Zod schemas for runtime validation at system boundaries (DB, API, etc.)
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─── Enum Schemas ───────────────────────────────────────────────────────────

export const TagCategorySchema = z.enum(['quick', 'occurrence', 'amount', 'custom'])

// ─── Parse Functions ────────────────────────────────────────────────────────

/**
 * Parse and validate tag category from unknown input.
 * Returns validated value or falls back to 'custom'.
 */
export function parseTagCategory(value: unknown): z.infer<typeof TagCategorySchema> {
  const result = TagCategorySchema.safeParse(value)
  if (result.success) return result.data
  return 'custom' // Safe fallback
}
