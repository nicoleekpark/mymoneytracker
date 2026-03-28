/**
 * Internal row types for transaction repository queries.
 * These map directly to SQLite query results.
 */

import type { UUID } from '@/core/domain/common/uuid'
import type { TransactionRow } from '../../mappers/transaction.mapper'

// ─────────────────────────────────────────────────────────────────────────────
// Aggregation Row Types
// ─────────────────────────────────────────────────────────────────────────────

export type MonthlyTotalRow = Readonly<{
  month: string
  total_cents: number
}>

export type DailyExpenseTotalRow = Readonly<{
  day: string
  total_cents: number
}>

export type CategoryTotalRow = Readonly<{
  category_id: UUID | null
  category_name: string | null
  total_cents: number
}>

// Alias for backwards compatibility (used in multiple places)
export type CategoryMonthlyTotalRow = CategoryTotalRow

export type DailyFlowTotalRow = Readonly<{
  day: string
  type: 'income' | 'expense'
  total_cents: number
  tx_count: number
}>

export type MonthlyFlowTotalRow = Readonly<{
  month: string
  type: 'income' | 'expense'
  total_cents: number
}>

export type YearlyFlowTotalRow = Readonly<{
  year: string
  type: 'income' | 'expense'
  total_cents: number
}>

export type YearTotalsRow = Readonly<{
  income_cents: number
  expense_cents: number
}>

// ─────────────────────────────────────────────────────────────────────────────
// Transaction with Tags (JOIN result)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extended row type that includes tags from GROUP_CONCAT join.
 * Used by optimized list queries to avoid N+1 tag lookups.
 */
export type TransactionRowWithTags = TransactionRow & Readonly<{
  tag_names: string | null
}>

// ─────────────────────────────────────────────────────────────────────────────
// Account Activity Row Types
// ─────────────────────────────────────────────────────────────────────────────

export type AccountActivityRow = Readonly<{
  account_id: string
  expense_cents: number
  income_cents: number
  transfer_out_cents: number
  transfer_in_cents: number
  tx_count: number
}>

export type AccountBalanceRow = Readonly<{
  income_cents: number
  expense_cents: number
  transfer_in_cents: number
  transfer_out_cents: number
}>
