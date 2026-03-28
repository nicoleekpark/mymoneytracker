// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN SCHEMA: Account
// Zod schemas for runtime validation at system boundaries (DB, API, etc.)
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─── Enum Schemas ───────────────────────────────────────────────────────────

export const AccountNatureSchema = z.enum(['asset', 'liability'])

export const AccountKindSchema = z.enum([
  'cash',
  'checking',
  'savings',
  'credit_card',
  'loan',
  'investment',
  'other',
])

// ─── Entity Schema ──────────────────────────────────────────────────────────

export const AccountSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  name: z.string().min(1),
  nature: AccountNatureSchema,
  kind: AccountKindSchema,
  currency: z.string().optional(),
  sortOrder: z.number().optional(),
  isSystem: z.boolean().optional(),
  isArchived: z.boolean().optional(),
})

// ─── DB Row Schema (for mapper validation) ──────────────────────────────────

export const AccountRowSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  nature: z.string(),
  kind: z.string(),
})

// ─── Parse Functions ────────────────────────────────────────────────────────

/**
 * Parse and validate account nature from unknown input.
 * Returns validated value or falls back to 'asset'.
 */
export function parseAccountNature(value: unknown): z.infer<typeof AccountNatureSchema> {
  const result = AccountNatureSchema.safeParse(value)
  if (result.success) return result.data
  return 'asset' // Safe fallback
}

/**
 * Parse and validate account kind from unknown input.
 * Returns validated value or falls back to 'other'.
 */
export function parseAccountKind(value: unknown): z.infer<typeof AccountKindSchema> {
  const result = AccountKindSchema.safeParse(value)
  if (result.success) return result.data
  return 'other' // Safe fallback
}

/**
 * Validate a DB row before converting to domain model.
 * Throws ZodError if validation fails.
 */
export function validateAccountRow(row: unknown): z.infer<typeof AccountRowSchema> {
  return AccountRowSchema.parse(row)
}
