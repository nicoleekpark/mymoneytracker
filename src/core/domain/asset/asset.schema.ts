// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN SCHEMA: Asset
// Zod schemas for runtime validation at system boundaries (DB, API, etc.)
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─── Enum Schemas ───────────────────────────────────────────────────────────

export const AssetFieldSchema = z.enum(['fixed_assets', 'current_assets', 'liabilities'])

export const AssetCategorySchema = z.enum([
  // Fixed Assets
  'real_estate',
  'retirement_funds',
  // Current Assets
  'cash_savings',
  'investments',
  'kids',
  // Liabilities
  'credit_card',
  'loans',
  'other',
])

export const FamilyMemberRoleSchema = z.enum(['parent', 'child'])

// ─── Entity Schemas ─────────────────────────────────────────────────────────

export const FamilyMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  nickname: z.string(),
  role: FamilyMemberRoleSchema,
  sortOrder: z.number(),
  isActive: z.boolean(),
})

export const AssetItemSchema = z.object({
  id: z.string().uuid(),
  field: AssetFieldSchema,
  category: AssetCategorySchema,
  name: z.string(),
  memberId: z.string().uuid().nullable(),
  isLiquidifiable: z.boolean(),
  sortOrder: z.number(),
  isArchived: z.boolean(),
})

// ─── Parse Functions ────────────────────────────────────────────────────────

/**
 * Parse and validate asset field from unknown input.
 * Returns validated value or falls back to 'current_assets'.
 */
export function parseAssetField(value: unknown): z.infer<typeof AssetFieldSchema> {
  const result = AssetFieldSchema.safeParse(value)
  if (result.success) return result.data
  return 'current_assets' // Safe fallback
}

/**
 * Parse and validate asset category from unknown input.
 * Returns validated value or falls back to 'other'.
 */
export function parseAssetCategory(value: unknown): z.infer<typeof AssetCategorySchema> {
  const result = AssetCategorySchema.safeParse(value)
  if (result.success) return result.data
  return 'other' // Safe fallback
}

/**
 * Parse and validate family member role from unknown input.
 * Returns validated value or falls back to 'parent'.
 */
export function parseFamilyMemberRole(value: unknown): z.infer<typeof FamilyMemberRoleSchema> {
  const result = FamilyMemberRoleSchema.safeParse(value)
  if (result.success) return result.data
  return 'parent' // Safe fallback
}
