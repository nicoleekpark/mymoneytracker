// ═══════════════════════════════════════════════════════════════════════════
// PERIOD UTILITIES
// Pure functions for period/date manipulation. No side effects.
// ═══════════════════════════════════════════════════════════════════════════

import type { Period, Scope } from '../types'

// ─── Constants ───────────────────────────────────────────────────────────────

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const

export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const

// ─── Month Helpers ───────────────────────────────────────────────────────────

export function clampMonth(m: number): number {
  if (!Number.isFinite(m)) return 1
  if (m < 1) return 1
  if (m > 12) return 12
  return m
}

export function getMonthNameShort(month: number): string {
  return MONTH_NAMES_SHORT[clampMonth(month) - 1]
}

export function getMonthNameFull(month: number): string {
  return MONTH_NAMES_FULL[clampMonth(month) - 1]
}

// ─── Period Helpers ──────────────────────────────────────────────────────────

export function getMaxYearMonth(now = new Date()): { year: number; month: number } {
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

/** Convert year-month to a comparable index (for sorting/comparison) */
export function ymIndex(x: { year: number; month: number }): number {
  return x.year * 12 + (x.month - 1)
}

// ─── Period Formatting ───────────────────────────────────────────────────────

/**
 * Convert Period to YYYY-MM string format.
 * Always returns YYYY-MM regardless of whether period has month.
 * If no month, defaults to 01 (January).
 */
export function periodToYYYYMM(period: Period): string {
  if ('month' in period) {
    return `${period.year}-${String(period.month).padStart(2, '0')}`
  }
  return `${period.year}-01`
}

export function formatPeriodLabel(scope: Scope, period: Period): string {
  if (scope === 'all') return 'All time'
  if (scope === 'year') return `${period.year}`

  const month = 'month' in period ? clampMonth(period.month) : 1
  const mm = String(month).padStart(2, '0')
  return `${period.year}-${mm}`
}

export function formatPeriodLabelFull(scope: Scope, period: Period): string {
  if (scope === 'all') return 'All time'
  if (scope === 'year') return `${period.year}`

  const month = 'month' in period ? clampMonth(period.month) : 1
  return `${MONTH_NAMES_SHORT[month - 1]} ${period.year}`
}

// ─── Period Comparison ───────────────────────────────────────────────────────

export function isCurrentPeriod(scope: Scope, period: Period, now = new Date()): boolean {
  const current = getMaxYearMonth(now)
  if (scope === 'all') return true
  if (scope === 'year') return period.year === current.year
  const month = 'month' in period ? period.month : 1
  return period.year === current.year && month === current.month
}

// ─── YYYY-MM String Helpers ──────────────────────────────────────────────────
// These functions work with month strings in "YYYY-MM" format (e.g., "2024-03")

/**
 * Parse a YYYY-MM string into year and month numbers.
 * @example parseYYYYMM("2024-03") → { year: 2024, month: 3 }
 */
export function parseYYYYMM(monthYYYYMM: string): { year: number; month: number } {
  const [y, m] = monthYYYYMM.split('-').map(Number)
  return { year: y, month: m }
}

/**
 * Get the full month name from a YYYY-MM string.
 * @example getMonthNameFromYYYYMM("2024-03") → "March"
 */
export function getMonthNameFromYYYYMM(monthYYYYMM: string): string {
  const { month } = parseYYYYMM(monthYYYYMM)
  return MONTH_NAMES_FULL[month - 1] || ''
}

/**
 * Get the previous month as a YYYY-MM string.
 * Handles year boundary (January → December of previous year).
 * @example getPrevMonthYYYYMM("2024-01") → "2023-12"
 */
export function getPrevMonthYYYYMM(monthYYYYMM: string): string {
  const { year, month } = parseYYYYMM(monthYYYYMM)
  if (month === 1) {
    return `${year - 1}-12`
  }
  return `${year}-${String(month - 1).padStart(2, '0')}`
}

/**
 * Get the number of days in a month from a YYYY-MM string.
 * @example getDaysInMonthFromYYYYMM("2024-02") → 29 (leap year)
 */
export function getDaysInMonthFromYYYYMM(monthYYYYMM: string): number {
  const { year, month } = parseYYYYMM(monthYYYYMM)
  // Day 0 of next month = last day of this month
  return new Date(year, month, 0).getDate()
}

/**
 * Get the number of days elapsed in a month.
 * - Current month: returns today's date (1-31)
 * - Past/future months: returns total days in month
 * @example getDaysElapsedInMonth("2024-03") → 15 (if today is March 15)
 */
export function getDaysElapsedInMonth(monthYYYYMM: string, now = new Date()): number {
  const currentYYYYMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  if (monthYYYYMM !== currentYYYYMM) {
    // Past or future month - return all days
    return getDaysInMonthFromYYYYMM(monthYYYYMM)
  }

  // Current month - return today's date
  return now.getDate()
}

/**
 * Check if a YYYY-MM string represents the current month.
 * @example isCurrentMonthYYYYMM("2024-03") → true (if today is March 2024)
 */
export function isCurrentMonthYYYYMM(monthYYYYMM: string, now = new Date()): boolean {
  const currentYYYYMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return monthYYYYMM === currentYYYYMM
}

// ─── Period Navigation ───────────────────────────────────────────────────────

/**
 * Shift a period by delta months, clamped to max (current month).
 * Pure function - returns new period without mutating input.
 */
export function shiftMonth(period: Period, delta: -1 | 1, now = new Date()): Period {
  const year = period.year
  const month = 'month' in period ? clampMonth(period.month) : 1
  const newMonth = month + delta

  let result: Period
  if (newMonth < 1) {
    result = { year: year - 1, month: 12 }
  } else if (newMonth > 12) {
    result = { year: year + 1, month: 1 }
  } else {
    result = { year, month: newMonth }
  }

  // Clamp to max (can't go beyond current month)
  const max = getMaxYearMonth(now)
  const resultMonth = 'month' in result ? result.month : 1
  if (ymIndex({ year: result.year, month: resultMonth }) > ymIndex(max)) {
    return { year: max.year, month: max.month }
  }

  return result
}
