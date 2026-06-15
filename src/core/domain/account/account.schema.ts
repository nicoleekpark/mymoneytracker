// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN SCHEMA: Account
// Zod schemas for runtime validation at system boundaries (DB, API, etc.)
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─── Enum Schemas ───────────────────────────────────────────────────────────

export const AccountNatureSchema = z.enum(['asset', 'liability'])

export const AccountCategorySchema = z.enum(['spending', 'investment', 'liability'])

export const AccountKindSchema = z.enum([
  // Spending
  'cash',
  'checking',
  'savings',
  // Investment & Retirement
  'hsa',
  '401k',
  'ira',
  'roth_ira',
  '403b',
  'brokerage',
  'investment',
  // Liabilities
  'credit_card',
  'loan',
  'mortgage',
  // Custom
  'other',
])

// ─── Entity Schema ──────────────────────────────────────────────────────────

export const AccountSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  name: z.string().min(1),
  nature: AccountNatureSchema,
  kind: AccountKindSchema,
  category: AccountCategorySchema,
  customKindName: z.string().optional(),
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
 *
 * Fallback Strategy: Returns 'asset' on invalid input.
 * Rationale: Most accounts are assets (checking, savings, cash).
 * Liability accounts (credit cards, loans) are less common.
 */
export function parseAccountNature(value: unknown): z.infer<typeof AccountNatureSchema> {
  const result = AccountNatureSchema.safeParse(value)
  if (result.success) return result.data
  return 'asset'
}

/**
 * Parse and validate account kind from unknown input.
 *
 * Fallback Strategy: Returns 'other' on invalid input.
 * Rationale: 'other' is the most generic kind, making no assumptions
 * about the account's behavior or features.
 */
export function parseAccountKind(value: unknown): z.infer<typeof AccountKindSchema> {
  const result = AccountKindSchema.safeParse(value)
  if (result.success) return result.data
  return 'other'
}

/**
 * Parse and validate account category from unknown input.
 *
 * Fallback Strategy: Returns 'spending' on invalid input.
 * Rationale: Most accounts are spending accounts (checking, savings).
 */
export function parseAccountCategory(value: unknown): z.infer<typeof AccountCategorySchema> {
  const result = AccountCategorySchema.safeParse(value)
  if (result.success) return result.data
  return 'spending'
}

/**
 * Validate a DB row before converting to domain model.
 * Throws ZodError if validation fails.
 */
export function validateAccountRow(row: unknown): z.infer<typeof AccountRowSchema> {
  return AccountRowSchema.parse(row)
}
