// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN SCHEMA: Transaction
// Zod schemas for runtime validation at system boundaries (DB, API, etc.)
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─── Enum Schemas ───────────────────────────────────────────────────────────

export const TransactionTypeSchema = z.enum(['income', 'expense', 'transfer'])

// ─── Value Object Schemas ───────────────────────────────────────────────────

export const MoneySchema = z.object({
  amount: z.number(),
  currency: z.string(),
})

// ─── DB Row Schema (for mapper validation) ──────────────────────────────────

export const TransactionRowSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  occurred_at: z.string(),
  type: z.string(),
  item: z.string().nullable(),
  amount_cents: z.number(),
  currency: z.string(),
  account_id: z.string().uuid().nullable(),
  from_account_id: z.string().uuid().nullable(),
  to_account_id: z.string().uuid().nullable(),
  category_id: z.string().uuid().nullable(),
  merchant: z.string().nullable(),
  note: z.string().nullable(),
  member_id: z.string().uuid().nullable(),
  is_estimated: z.number(),
})

// ─── Parse Functions ────────────────────────────────────────────────────────

/**
 * Parse and validate transaction type from unknown input.
 * Returns validated value or falls back to 'expense'.
 */
export function parseTransactionType(value: unknown): z.infer<typeof TransactionTypeSchema> {
  const result = TransactionTypeSchema.safeParse(value)
  if (result.success) return result.data
  return 'expense' // Safe fallback
}

/**
 * Validate a DB row before converting to domain model.
 * Throws ZodError if validation fails.
 */
export function validateTransactionRow(row: unknown): z.infer<typeof TransactionRowSchema> {
  return TransactionRowSchema.parse(row)
}
