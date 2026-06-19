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
 * Negative amounts are shown in parentheses: ($ 123.45)
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '$ 0'

  const abs = Math.abs(amount)
  const formatted = smartFormat(abs)
  if (amount < 0) {
    return `($ ${formatted})`
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

