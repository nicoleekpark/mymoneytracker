/**
 * Format number with thousands separator (e.g., 200000 => 200,000)
 */
function withCommas(n: number): string {
  return n.toLocaleString('en-US')
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
 * Format a currency amount as an integer (rounded).
 * Always shows absolute value: $ 123,456
 */
export function formatUsdInt(amount: number): string {
  const v = Math.round(Math.abs(Number(amount) || 0))
  return `$ ${withCommas(v)}`
}

/**
 * Format a currency amount as an integer with sign.
 * Positive: +$ 123, Negative: -$ 123, Zero: $ 0
 */
export function formatSignedUsdInt(amount: number): string {
  const v = Math.round(Number(amount) || 0)
  if (v === 0) return '$ 0'
  const abs = Math.abs(v)
  return v > 0 ? `+$ ${withCommas(abs)}` : `-$ ${withCommas(abs)}`
}

/**
 * Format a currency amount in compact form for tight spaces.
 * < 1000: shows as integer (e.g., "450")
 * >= 1000: shows with K suffix (e.g., "1.2K")
 * >= 10000: caps at "10K+"
 */
export function formatCompactUsd(amount: number): string {
  const v = Math.round(Math.abs(Number(amount) || 0))
  if (v === 0) return '0'
  if (v >= 10000) return '10K+'
  if (v >= 1000) {
    const k = v / 1000
    // Show one decimal if not a whole number
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`
  }
  return String(v)
}

/**
 * Format a signed currency amount in compact k format.
 * e.g., +$9.6k, -$1.5k, $0
 */
export function formatSignedUsdCompact(amount: number): string {
  const v = Math.round(Number(amount) || 0)
  if (v === 0) return '$0'

  const abs = Math.abs(v)
  const sign = v > 0 ? '+' : '-'

  if (abs >= 1000) {
    const k = abs / 1000
    // Show one decimal
    const kStr = k >= 10 ? Math.round(k).toString() : k.toFixed(1)
    return `${sign}$${kStr}k`
  }

  return `${sign}$${abs}`
}

