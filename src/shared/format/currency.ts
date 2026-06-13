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
 * Format a currency amount with 2 decimal places.
 * Negative amounts are shown in parentheses: ($ 123.45)
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '$ 0.00'

  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (amount < 0) {
    return `($ ${formatted})`
  }
  return `$ ${formatted}`
}

/**
 * Format a currency amount with smart decimals (hide .00).
 * Always shows absolute value: $ 123,456 or $ 5.80
 */
export function formatUsdInt(amount: number): string {
  return `$ ${smartFormat(amount)}`
}

/**
 * Format a currency amount with smart decimals and sign.
 * Positive: +$ 123 or +$ 5.80, Negative: -$ 123, Zero: $ 0
 */
export function formatSignedUsdInt(amount: number): string {
  const v = Number(amount) || 0
  if (Math.abs(v) < 0.005) return '$ 0' // Handle floating point near-zero
  return v > 0 ? `+$ ${smartFormat(v)}` : `-$ ${smartFormat(v)}`
}

/**
 * Format a currency amount in compact form for tight spaces.
 * < 1000: shows with smart decimals (e.g., "450", "5.80")
 * >= 1000: shows with K suffix (e.g., "1.2K", "25K")
 */
export function formatCompactUsd(amount: number): string {
  const abs = Math.abs(Number(amount) || 0)
  if (abs < 0.005) return '0'
  if (abs >= 1000) {
    const k = abs / 1000
    // >= 10K: show whole number (e.g., "25K")
    if (k >= 10) return `${Math.round(k)}K`
    // 1K-9.9K: show one decimal if not whole (e.g., "1.2K", "5K")
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`
  }
  // Smart format for amounts under 1000
  return smartFormat(abs)
}

/**
 * Format a signed currency amount in compact k format.
 * e.g., +$9.6k, -$1.5k, +$5.80, $0
 */
export function formatSignedUsdCompact(amount: number): string {
  const v = Number(amount) || 0
  if (Math.abs(v) < 0.005) return '$0'

  const abs = Math.abs(v)
  const sign = v > 0 ? '+' : '-'

  if (abs >= 1000) {
    const k = abs / 1000
    // Show one decimal
    const kStr = k >= 10 ? Math.round(k).toString() : k.toFixed(1)
    return `${sign}$${kStr}k`
  }

  return `${sign}$${smartFormat(abs)}`
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

