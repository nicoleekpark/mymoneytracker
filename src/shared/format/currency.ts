/**
 * Format number with thousands separator (e.g., 200000 => 200,000)
 */
function withCommas(n: number): string {
  return n.toLocaleString('en-US')
}

/**
 * Format cents as display string with thousand separators.
 * Used by keypads and amount inputs.
 * e.g., 123456 cents => "1,234.56", 500 cents => "5.00"
 */
export function formatCentsForDisplay(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) return '0.00'
  const dollars = cents / 100
  return dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Smart format: show cents only when non-zero.
 * $5.80 → "5.80", $5.00 → "5", $1,234.56 → "1,234.56", $1,234.00 → "1,234"
 */
function smartFormat(amount: number): string {
  const abs = Math.abs(amount)
  const hasDecimal = abs % 1 !== 0

  if (hasDecimal) {
    // Show 2 decimal places with commas
    return abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  // Integer - no decimals, with commas
  return withCommas(Math.round(abs))
}

/**
 * Format a currency amount.
 * Shows 2 decimal places only if there are cents, otherwise whole number.
 * e.g., 1234.56 → "$ 1,234.56", 1234.00 → "$ 1,234"
 * Negative amounts are shown with minus sign: -$ 123.45
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '$ 0'

  const abs = Math.abs(amount)
  const formatted = smartFormat(abs)
  if (amount < 0) {
    return `-$ ${formatted}`
  }
  return `$ ${formatted}`
}

/**
 * Format a currency amount as integer (rounds decimals).
 * Always shows absolute value: $ 123,456 or $ 100
 */
export function formatUsdInt(amount: number): string {
  const rounded = Math.round(Math.abs(Number(amount) || 0))
  return `$ ${withCommas(rounded)}`
}

/**
 * Format a currency amount as integer with sign (rounds decimals).
 * Positive: +$ 123, Negative: -$ 123, Zero: $ 0
 */
export function formatSignedUsdInt(amount: number): string {
  const v = Number(amount) || 0
  const rounded = Math.round(Math.abs(v))
  if (rounded < 1) return '$ 0'
  return v > 0 ? `+$ ${withCommas(rounded)}` : `-$ ${withCommas(rounded)}`
}

/**
 * Format a currency amount in compact form for tight spaces.
 * Rounds to integer first, then formats.
 * < 1000: shows as integer (e.g., "450")
 * 1000-9999: shows with K suffix (e.g., "1.5K", "2K")
 * >= 10000: caps at "10K+"
 */
export function formatCompactUsd(amount: number): string {
  const rounded = Math.round(Math.abs(Number(amount) || 0))
  if (rounded < 1) return '0'
  if (rounded >= 10000) return '10K+'
  if (rounded >= 1000) {
    const k = rounded / 1000
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`
  }
  return withCommas(rounded)
}

/**
 * Format a signed currency amount in compact k format.
 * Rounds to integer first, then formats.
 * e.g., +$9.6k, -$1.5k, +$500, $0
 */
export function formatSignedUsdCompact(amount: number): string {
  const v = Number(amount) || 0
  const rounded = Math.round(Math.abs(v))
  if (rounded < 1) return '$0'

  const sign = v > 0 ? '+' : '-'

  if (rounded >= 1000) {
    const k = rounded / 1000
    const kStr = k >= 10 ? Math.round(k).toString() : k.toFixed(1)
    return `${sign}$${kStr}k`
  }

  return `${sign}$${rounded}`
}

/**
 * Format amount with K/M suffix for display.
 * Example: 1500000 -> "$ 1.5M", 15000 -> "$ 15K", 500 -> "$ 500", 5.80 -> "$ 5.80"
 */
export function formatCompactAmount(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000
    return `$ ${m >= 10 ? Math.round(m) : m.toFixed(1)}M`
  }
  if (abs >= 1000) {
    const k = abs / 1000
    return `$ ${k >= 10 ? Math.round(k) : k.toFixed(1)}K`
  }
  return `$ ${smartFormat(abs)}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Balance Change Formatting (for account activity breakdowns)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Type of balance change flow
 */
export type BalanceFlowType = 'in' | 'out'

/**
 * Formatted balance change with sign and sentiment
 */
export type FormattedBalanceChange = {
  /** Display text with sign, e.g., "+ $ 100" or "− $ 50" */
  text: string
  /** Whether this change is positive for the user (green) or negative (red) */
  isPositive: boolean
}

/**
 * Format a balance change amount for display in account breakdowns.
 *
 * Handles the sign inversion needed for liability accounts:
 * - Assets: money in = +, money out = −
 * - Liabilities: money in (payment) = − (reduces displayed debt), money out (charge) = + (increases debt)
 *
 * @param amount - The absolute amount (always positive)
 * @param flowType - 'in' for money coming in, 'out' for money going out
 * @param isLiability - Whether this is a liability account (debt)
 * @returns Formatted text and sentiment for coloring
 *
 * @example
 * // Asset account - money in
 * formatBalanceChange(100, 'in', false) // { text: '+ $ 100', isPositive: true }
 *
 * // Credit card - payment received (reduces debt)
 * formatBalanceChange(100, 'in', true)  // { text: '− $ 100', isPositive: true }
 *
 * // Credit card - charge (increases debt)
 * formatBalanceChange(50, 'out', true)  // { text: '+ $ 50', isPositive: false }
 */
export function formatBalanceChange(
  amount: number,
  flowType: BalanceFlowType,
  isLiability: boolean
): FormattedBalanceChange {
  const formatted = formatCurrency(amount)

  // For assets: in = positive (+), out = negative (−)
  // For liabilities: in = negative (−, reduces debt), out = positive (+, increases debt)
  const isInFlow = flowType === 'in'
  const showPlus = isLiability ? !isInFlow : isInFlow

  // Sentiment: money in is always good, money out is always bad
  // (regardless of how it's displayed)
  const isPositive = isInFlow

  const sign = showPlus ? '+' : '−'
  const text = `${sign} ${formatted}`

  return { text, isPositive }
}

