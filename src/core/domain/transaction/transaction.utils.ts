import { uuid } from '@/shared/utils/uuid'
import type { Transaction, TransactionType } from './transaction.types'

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Type guard for expense transactions
 */
export function isExpense(tx: Transaction): boolean {
  return tx.type === 'expense'
}

/**
 * Type guard for income transactions
 */
export function isIncome(tx: Transaction): boolean {
  return tx.type === 'income'
}

/**
 * Type guard for transfer transactions
 */
export function isTransfer(tx: Transaction): boolean {
  return tx.type === 'transfer'
}

/**
 * Safely extract date from transaction.
 * Handles both Date objects and ISO string from DB.
 */
export function safeDate(tx: Transaction): Date {
  const d = tx.occurredAt instanceof Date
    ? tx.occurredAt
    : new Date(tx.occurredAt as unknown as string)
  return Number.isNaN(d.getTime()) ? new Date(0) : d
}

/**
 * Get the transaction amount (always positive)
 */
export function transactionAmount(tx: Transaction): number {
  return tx.money.amount
}

// ─────────────────────────────────────────────────────────────────────────────
// Date & Key Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current month in YYYY-MM format
 */
export function currentMonthYYYYMM(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/**
 * Convert string to URL-safe slug (lowercase, underscores, max 24 chars)
 */
export function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 24)
}

/**
 * Generate unique transaction key from metadata
 */
export function buildTxKey(args: {
  occurredAt: Date
  type: TransactionType
  item?: string
  merchant?: string
}): string {
  const ts = args.occurredAt.toISOString()
  const item = slugify(args.item || 'item')
  const merch = args.merchant ? slugify(args.merchant) : 'na'
  const suffix = uuid().replace(/-/g, '').slice(0, 8)
  return `tx:${ts}:${args.type}:${item}:${merch}:${suffix}`
}

/**
 * Get number of days in a month (handles leap years)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Calculate decimal months elapsed in a year for projections.
 * Returns completed months + fractional current month (e.g., 1.5 for mid-Feb).
 * Different from shared/format/date.ts:getMonthsElapsed which counts months between two dates.
 */
export function getYearProgressMonths(now: Date): number {
  const completedMonths = now.getMonth()
  const currentDay = now.getDate()
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth() + 1)
  return completedMonths + (currentDay / daysInMonth)
}
