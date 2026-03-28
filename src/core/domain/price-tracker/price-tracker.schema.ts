// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN SCHEMA: Price Tracker
// Zod schemas for runtime validation at system boundaries (DB, API, etc.)
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─── Enum Schemas ───────────────────────────────────────────────────────────

export const StoreCategorySchema = z.enum([
  'grocery',
  'coffee',
  'pharmacy',
  'restaurant',
  'general',
])

export const ItemCategorySchema = z.enum([
  'produce',
  'dairy',
  'meat',
  'bakery',
  'pantry',
  'beverage',
  'coffee',
  'household',
  'general',
])

// ─── Parse Functions ────────────────────────────────────────────────────────

/**
 * Parse and validate store category from unknown input.
 * Returns validated value or falls back to 'general'.
 */
export function parseStoreCategory(value: unknown): z.infer<typeof StoreCategorySchema> {
  const result = StoreCategorySchema.safeParse(value)
  if (result.success) return result.data
  return 'general' // Safe fallback
}

/**
 * Parse and validate item category from unknown input.
 * Returns validated value or falls back to 'general'.
 */
export function parseItemCategory(value: unknown): z.infer<typeof ItemCategorySchema> {
  const result = ItemCategorySchema.safeParse(value)
  if (result.success) return result.data
  return 'general' // Safe fallback
}
