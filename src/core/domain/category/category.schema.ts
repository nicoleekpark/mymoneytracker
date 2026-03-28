// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN SCHEMA: Category
// Zod schemas for runtime validation at system boundaries (DB, API, etc.)
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─── Enum Schemas ───────────────────────────────────────────────────────────

export const CategoryTypeSchema = z.enum(['expense', 'income', 'transfer'])

// ─── Parse Functions ────────────────────────────────────────────────────────

/**
 * Parse and validate category type from unknown input.
 * Returns validated value or falls back to 'expense'.
 */
export function parseCategoryType(value: unknown): z.infer<typeof CategoryTypeSchema> {
  const result = CategoryTypeSchema.safeParse(value)
  if (result.success) return result.data
  return 'expense' // Safe fallback
}
